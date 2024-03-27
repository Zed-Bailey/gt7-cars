const sdk = require('node-appwrite');

const client = new sdk.Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)
    .setSelfSigned();

(async function fetchData() {
    const carsCsv = "https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/db/cars.csv";
    const countryCsv = "https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/db/country.csv";
    const makerCsv = "https://raw.githubusercontent.com/ddm999/gt7info/web-new/_data/db/maker.csv";

    var document = await fetch(carsCsv).then(res => res.text());
    let lines = document.split('\n');


})();


