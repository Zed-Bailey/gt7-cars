
export default interface SavedCar {
    id: string;
    name: any;
    Country: {
        name: string;
        code: string;
    };
    Manufacturer: {
        name: string;
    };
}