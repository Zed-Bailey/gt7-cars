const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client();


console.log('Project ID : ' + process.env.APPWRITE_PROJECT_ID);
console.log('API Key    : ' + process.env.APPWRITE_API_KEY);


client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)
    .setSelfSigned();

const database = new sdk.Databases(client);
const databaseID = process.env.APPWRITE_DATABASE_ID;
const carsCollectionID = process.env.APPWRITE_CAR_COLLECTION_ID;
const manufacturerCollectionId = process.env.APPWRITE_MANUFACTURER_COLLECTION_ID;

/**
 * fetches the csv document and splits on the newline '\n'
 * @param {string} url the csv url to fetch
 * @returns an array of lines
 */
async function fetchCsv(url, hasHeader = true) {
    var document = await fetch(url).then(res => res.text());
    let lines = document.split('\n');
    
    return hasHeader ? lines.slice(1) : lines;
}



/**
 * 
 * @param {string[]} lines 
 */
async function seedCars(lines) {

    let cars = [];
    lines.forEach(line => {
        let sections = line.split(',');
        cars.push({
            id: sections[0],
            shortname: sections[1],
            maker: sections[2]
        });
    });    

    cars.forEach(async car => {
        
        let promise = database.createDocument(
            databaseID,
            carsCollectionID,
            sdk.ID.unique(),
            car
        );

        await promise.then(function (response) {
            console.log('inserted vehicle: ' + JSON.stringify(car));
        }, function (error) {
            console.log('failed to insert: ' + JSON.stringify(car) + '\n reason: ' + error);
        });

    })
}


async function seedMakers(lines) {
    let makers = [];
    lines.forEach(line => {
        let sections = line.split(',');
        makers.push({
            id: sections[0],
            name: sections[1],
            country: sections[2]
        });
    });    

    

    makers.forEach(async car => {
        

        let promise = database.createDocument(
            databaseID,
            manufacturerCollectionId,
            sdk.ID.unique(),
            car
        );

        await promise.then(function (response) {
            console.log('inserted maker: ' + JSON.stringify(car));
        }, function (error) {
            console.log('failed to insert: ' + JSON.stringify(car) + '\n reason: ' + error);
        });
        
    })
}

(async function fetchData() {
    const carsCsv = "https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/db/cars.csv";
    const countryCsv = "https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/db/country.csv";
    const makerCsv = "https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/db/maker.csv";

    
    let carsDocument = await fetchCsv(carsCsv);
    await seedCars(carsDocument);

    // let makersDocument = await fetchCsv(makerCsv);
    // await seedMakers(makersDocument);


})();


