import { SupabaseClient, createClient } from "@supabase/supabase-js";
import {Client} from "node-mailjet";

export interface Dealership {
    updatetimestamp: string
    used: UsedCars
    legend: LegendCars
}
  
export interface UsedCars {
    date: string
    cars: Car[]
}
export interface LegendCars {
    date: string
    cars: Car[]
}
  
export interface Car {
    carid: string
    manufacturer: string
    region: string
    name: string
    credits: number
    state: string
    estimatedays: number
    new: boolean
}


export async function GET(request: Request) {

    let res = await fetch('https://ddm999.github.io/gt7info/data.json')
        .then(r => r.json())
        .catch(() => null);

    if(res === null) {
        return new Response(JSON.stringify({msg : "failed to fetch data"}), {status: 400});
    }

    let latest: Dealership = res;

    // filter cars to fetch only the ones that are newly added
    let newLegend = latest.legend.cars.filter((x) => x.new);
    let newUsed = latest.used.cars.filter((x) => x.new);

    // these are all the newly added cars
    let newCars = [...newLegend, ...newUsed];
    
    // have to stringify the id so the string is wrapped in "" rather then ''
    // will not work if '' is used, i believe this is because '' is not valid json so the values
    // are never sent in the db request
    let carIds: string[] = newCars.map((x) => JSON.stringify(x.carid));
    
    // carIds = carIds.map((x) => JSON.stringify(x));
    //   carIds = ["1689"]
    if(carIds.length == 0) {
        return Response.json({msg: "No new cars recently added"});
    }
    
    console.log('new car ids', carIds);
    
    
    // let newUsed: Car[] = [];
    // let newLegend: Car[] = []
    // have to use service key as we need the admin functionality to get users
    let client = createClient(process.env.SUPABASE_URL ?? "", process.env.SUPABASE_SERVICE_KEY ?? "");
    
    const {data, error} =  await client
        .from('UserSubscriptions')
        .select()
        .overlaps('watched_cars', carIds);
        
    
    if(error) {
        return Response.json(error, {status : 400});
    }
    console.log('users watching cars', data);

    let allUsers = await getUsers(client);
    if(allUsers === null) {
        return Response.json({error : "Failed to get the users"}, {status: 400});
    }

    let emails: any[] = [];
    data.forEach((user) => {
        let userEmail = allUsers?.users.find((x) => x.id == user.user_id)?.email;
        console.log('email: ', userEmail);
        if(userEmail) {
            let used = newUsed.filter((c) => user.watched_cars.includes(c.carid));
            let legendary = newLegend.filter((c) => user.watched_cars.includes(c.carid));
            let email = BuildEmail(legendary, used, userEmail);
            emails.push(email);
        }
    });

    if(emails.length == 0) {
        return Response.json({"msg" : "No emails to send"});
    }
    // console.log(emails);


    await sendEmails(emails);


    return Response.json({users: allUsers});
}


async function sendEmails(emails: any[]) {
    const mailjet = new Client({
        apiKey: process.env.MAILJET_PUBLIC_KEY,
        apiSecret: process.env.MAILJET_PRIVATE_KEY
    });
    
    const request = mailjet
        .post("send", {'version': 'v3.1'})
        .request({
            "Messages" : emails,
            // "Sandbox" : true
        });

    request
        .then((result) => {
          console.log(result.body)
        })
        .catch((err) => {
          console.log(err)
        })
}


async function getUsers(client: SupabaseClient) {
    const {data, error} = await client.auth.admin.listUsers({ 
        page:1,
        perPage: 1000
    });
    if(error) {
        return null;
    }

    return data;
}




  

  

function BuildEmail(legendary: Car[], used: Car[], email: string) {


    return {
        "From": {
            "Email": "granturismo.car.notification@gmail.com",
            "Name": "GT7 Car Dealership Notification"
        },
        "To": {
            "Email": email
        },
        "Subject": "Your saved vehicles have been recently added to the dealership", // rename
        "HTMLPart": EmailBody(legendary, used)
    }
}



function Row(vehicle: Car) {
    return `
    <!-- START ROW -->
    <!--[if mso | IE]><tr><td class="" width="600px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
        <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
            <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:300px;" ><![endif]-->
            <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                <tbody>
                    <tr>
                    <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:17px;line-height:1;text-align:left;color:#000000;">${vehicle.name}</div>
                    </td>
                    </tr>
                    <tr>
                    <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;">${vehicle.manufacturer}</div>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>
            <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:300px;" ><![endif]-->
            <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                <tbody>
                    <tr>
                    <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:15px;line-height:1;text-align:left;color:#000000;">${vehicle.credits} credits</div>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>
            <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
        </tr>
        </tbody>
    </table>
    </div>
    <!--[if mso | IE]></td></tr></table></td></tr><![endif]-->
    <!-- END ROW -->
    `;
}





function Section(sectionName: string, rows: string) {

    return `
    <!-- START SECTION -->
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" width="600px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
              <div style="margin:0px auto;max-width:600px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                        <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                        <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                            <tbody>
                              <tr>
                                <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                  <div style="font-family:helvetica;font-size:20px;line-height:1;text-align:left;color:#F45E43;">${sectionName} Cars</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <!--[if mso | IE]></td></tr></table><![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table></td></tr><![endif]-->
              <!-- INSERT ROWS -->
              ${rows}
              <!--[if mso | IE]></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
    <!-- END SECTION -->
    `;
}



function EmailBody(legendary: Car[], used: Car[]) {
    let legendaryRows = '';
    let legendarySection = '';
    if(legendary.length > 0) {
        legendary.forEach((v) => legendaryRows += Row(v));
        legendarySection = Section('Legendary', legendaryRows);
    }
    

    let usedRows = '';
    let usedSection = '';
    if(used.length > 0) {
        used.forEach((v) => usedRows += Row(v));
        usedSection = Section('Used', usedRows);
    }
    
    

    
    

    return `
    <!doctype html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    
    <head>
      <title>
      </title>
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <!--<![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
        #outlook a {
          padding: 0;
        }
    
        body {
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
    
        table,
        td {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
    
        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
        }
    
        p {
          display: block;
          margin: 13px 0;
        }
      </style>
      <!--[if mso]>
            <noscript>
            <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml>
            </noscript>
            <![endif]-->
      <!--[if lte mso 11]>
            <style type="text/css">
              .mj-outlook-group-fix { width:100% !important; }
            </style>
            <![endif]-->
      <!--[if !mso]><!-->
      <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
      <style type="text/css">
        @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
      </style>
      <!--<![endif]-->
      <style type="text/css">
        @media only screen and (min-width:480px) {
          .mj-column-per-100 {
            width: 100% !important;
            max-width: 100%;
          }
    
          .mj-column-per-50 {
            width: 50% !important;
            max-width: 50%;
          }
        }
      </style>
      <style media="screen and (min-width:480px)">
        .moz-text-html .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
    
        .moz-text-html .mj-column-per-50 {
          width: 50% !important;
          max-width: 50%;
        }
      </style>
      <style type="text/css">
      </style>
    </head>
    
    <body style="word-spacing:normal;">
      <div style="">
        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
        <div style="margin:0px auto;max-width:600px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      <tbody>
                        <tr>
                          <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:25px;line-height:1;text-align:center;color:#000000;">GT7 Dealership Notification</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <p style="border-top:solid 4px #F45E43;font-size:1px;margin:0px auto;width:100%;">
                            </p>
                            <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 4px #F45E43;font-size:1px;margin:0px auto;width:550px;" role="presentation" width="550px" ><tr><td style="height:0;line-height:0;"> &nbsp;
    </td></tr></table><![endif]-->
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--[if mso | IE]></td></tr></table><![endif]-->
        
        ${usedSection}

        ${legendarySection}

        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
        <div style="margin:0px auto;max-width:600px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      <tbody>
                        <tr>
                          <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <p style="border-top:solid 4px #000000;font-size:1px;margin:0px auto;width:100%;">
                            </p>
                            <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 4px #000000;font-size:1px;margin:0px auto;width:550px;" role="presentation" width="550px" ><tr><td style="height:0;line-height:0;"> &nbsp;
    </td></tr></table><![endif]-->
                          </td>
                        </tr>
                        <tr>
                          <td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
                              <tr>
                                <td align="center" bgcolor="#414141" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#414141;" valign="middle">
                                  <a href="https://gt7-cars.vercel.app/home" style="display:inline-block;background:#414141;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;" target="_blank"> Manage my vehicles </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--[if mso | IE]></td></tr></table><![endif]-->
      </div>
    </body>
    
    </html>

    `;

}