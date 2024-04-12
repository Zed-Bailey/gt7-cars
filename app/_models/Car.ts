
export default interface Car {
    id: number;
    name: string,
    // manufacturer: number;
    // country: number;
    Country: {
        name: string;
        code: string;
    };
    Manufacturer: {
        name: string;
    };
}
