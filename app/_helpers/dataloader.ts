import { SupabaseClient } from "@supabase/supabase-js";
import Car from "../_models/Car";
import { promises } from "dns";
import Country from "../_models/Country";
import Manufacturer from "../_models/Manufacturer";


export default class DataLoader {
    _client: SupabaseClient;

    constructor(client: SupabaseClient) {
        this._client = client;
    }


    async loadcars(page: number, pageSize: number) : Promise<Car[]> {

        const {data, error} = await this._client
            .from('Car')
            // .select()
            .select(`
                *, 
                Country(name, code),
                Manufacturer(name)
            `)
            .order('name')
            // have to subtract one as the range is inclusive, will return records 1-50 rather then 1-49
            // returning 1-50 will cause duplicate elements,
            // i.e on the second page record 50 from the previous page and 1 from the current page are the same
            .range(page * pageSize, (page+1)*pageSize-1);
        
        if(error) throw error;

        let cars: Car[] = [];

        data.forEach((x) => {
            let car: Car = x;
            cars.push(car);
        });



        return cars;
    }



    async loadcountries() : Promise<Country[]> {
        const {data, error} = await this._client
            .from('Country')
            .select()
            .order('name');
        
        if(error) throw error;

        let countries: Country[] = [];

        data.forEach((x) => {
            let c: Country = x;
            countries.push( c);
        });

        return countries;
    }


    async loadmanufacturers() : Promise<Manufacturer[]> {
        const {data, error} = await this._client
            .from('Manufacturer')        
            .select()
            .order('name');
        
        if(error) throw error;

        // let manufacturer: Map<number, Manufacturer> = new Map<number, Manufacturer>();
        let manufacturer: Manufacturer[] = [];
        data.forEach((x) => {
            let c: Manufacturer = x;
            manufacturer.push(c);
        });

        return manufacturer;
    }
    

}