/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        projectId: process.env.APPWRITE_PROJECT_ID,
        databaseID: process.env.APPWRITE_DATABASE_ID,
        carsCollectionID: process.env.APPWRITE_CAR_COLLECTION_ID,
        manufacturerCollectionId: process.env.APPWRITE_MANUFACTURER_COLLECTION_ID,
        countryCollectionId: process.env.APPWRITE_COUNTRY_COLLECTION_ID,
    }
};

export default nextConfig;
