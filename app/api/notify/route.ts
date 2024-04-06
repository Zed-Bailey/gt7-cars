import GetSupabaseClient from "@/app/_helpers/client";


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
    let carIds = newCars.map((x) => x.carid);
    
    
    let client = GetSupabaseClient();
    
    const {data, error} =  await client
        .from('UserSubscriptions')
        .select();
    
    // filter users down to those who have at least one matching id
    // ideally this would be done as part of the SQL query but i cant figure that out
    let users = data?.filter((x) => x.watched_cars.some((j: string) => carIds.includes(j)));

    



    /*

    let messages = [];// generated messages
    let body = {
        Messages: messages
    }

    */


    return Response.json({error: error, data: users});
}



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

  

  

function BuildEmail(userVehicles: Car[], email: string) {


    return {
        From: {
            Email: "myemail@gmail.com",
            Name: "GT7 DealerSHip Notification"
        },
        To: {
            Email: email
        },
        Subject: "Your saved vehicles have been recently added to the dealership", // rename
        HTMLPart: `
        actual html email here, generate with mjml?
        `
    }
}



