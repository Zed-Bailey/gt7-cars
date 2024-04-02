require('dotenv').config();

const supa = require('@supabase/supabase-js');


/**
 * fetches the csv document and splits on the newline '\n'
 * @param {string} url the csv url to fetch
 * @returns an array of lines
 */
async function fetchCsv(url, hasHeader = true) {
    var document = await fetch(url).then(res => res.text());
    let lines = document.split('\n');
    lines.pop();

    return hasHeader ? lines.slice(1) : lines;
}

const supabase_url = process.env.SUPABASE_URL;
const supabase_key = process.env.SUPABASE_SERVICE_KEY;
const supabase = supa.createClient(supabase_url, supabase_key);


/**
 * 
 * @param {string[]} cars array of csv lines
 * @param {string[]} makers array of csv lines
 * @param {string[]} countries array of csv lines
 */
async function insertData(cars, makers, countries) {

    let countriesParsed = [];

    countries.forEach((value) => {
        let split = value.split(',');
        console.log(split);
        if(parseInt(split[0]) !== null) {
            countriesParsed.push({
                id: parseInt(split[0]),
                name: split[1],
                code: split[2]
            });
        }
    });

    // bulk insert the country data
    // returns the count of countries
    var {data, error} = await supabase
        .from('Country')
        .upsert(countriesParsed)
        .select('*', { count: 'exact', head: true });

    console.log(data);
    if(error) {
        console.log('An error occurred: ', error);
    }


    let manufacturersParsed = [];

    makers.forEach((value) => {
        let split = value.split(',');
        console.log(split);
        if(parseInt(split[0]) !== null) {
            manufacturersParsed.push({
                id: parseInt(split[0]),
                name: split[1],
                country: parseInt(split[2])
            });
        }
    });

    // bulk insert the manufacturer data
    // returns the count of countries
    var {data, error} = await supabase
        .from('Manufacturer')
        .upsert(manufacturersParsed)
        .select('*', { count: 'exact', head: true });

    console.log(data);
    if(error) {
        console.log('An error occurred: ', error);
    }


    let carsParsed = [];

    for(var i = 0; i < cars.length; i++) {
        let split = cars[i].split(',');
        let car = {
            id: parseInt(split[0]),
            name: split[1],
            manufacturer: parseInt(split[2])
        }
        let m = manufacturersParsed.find((x) => x.id === car.manufacturer);
        if(!m) {
            console.log('failed to find manufacturer for car: ', split);
            continue;   
        }
        car.country = m.country;
        
        carsParsed.push(car);
    }

    // bulk insert car data
    var {data, error} = await supabase
        .from('Car')
        .upsert(carsParsed)
        .select('*', { count: 'exact', head: true });

    console.log(data);
    if(error) {
        console.log('An error occurred: ', error);
    }


}



(async function fetchData() {
    const carsCsv = "https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/db/cars.csv";
    const countryCsv = "https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/db/country.csv";
    const makerCsv = "https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/db/maker.csv";

    
    let carsDocument = await fetchCsv(carsCsv);
    let makersDocument = await fetchCsv(makerCsv);
    let countryDocument = await fetchCsv(countryCsv);
    console.log('fetched csv documents');

    await insertData(carsDocument, makersDocument, countryDocument);
    

})();


