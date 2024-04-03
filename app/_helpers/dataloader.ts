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


    async loadcars() : Promise<Car[]> {

        const {data, error} = await this._client
            .from('Car')
            .select();
        
        if(error) throw error;

        let cars: Car[] = [];

        data.forEach((x) => {
            let car: Car = x;
            cars.push(car);
        });



        return cars;
    }



    async loadcountries() : Promise<Map<number, Country>> {
        const {data, error} = await this._client
            .from('Country')
            .select();
        
        if(error) throw error;

        let countries: Map<number, Country> = new Map<number, Country>();

        data.forEach((x) => {
            let c: Country = x;
            countries.set(c.id, c);
        });

        return countries;
    }


    async loadmanufacturers() : Promise<Map<number, Manufacturer>> {
        const {data, error} = await this._client
            .from('Manufacturer')
            .select();
        
        if(error) throw error;

        let manufacturer: Map<number, Manufacturer> = new Map<number, Manufacturer>();

        data.forEach((x) => {
            let c: Manufacturer = x;
            manufacturer.set(c.id, c);
        });

        return manufacturer;
    }
    

}