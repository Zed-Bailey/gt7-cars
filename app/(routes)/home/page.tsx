'use client';

import GetSupabaseClient from "@/app/_helpers/client";
import Car from "@/app/_models/Car";
import { Button, select } from "@nextui-org/react";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import {TrashIcon} from "../../_icons/TrashIcon";
import "/node_modules/flag-icons/css/flag-icons.min.css";


interface SavedCar {
    id: any;
    name: any;
    Country: {
        name: any;
        code: any;
    };
    Manufacturer: {
        name: any;
    };
}


export default function Home() {


    const [supabase, setSupabase] = useState<SupabaseClient>();
    const [uid, setUid] = useState<string>();
    const [vehicles, setVehicles] = useState<SavedCar[] | null>([]);
    const [vehicleIds, setVehicleIds] = useState<string[]>([]);

    useEffect(() => {
        const client = GetSupabaseClient();
        setSupabase(client);
        

        async function getCars(ids: string[]) {
            const {data, error} = await client.from('Car')
            .select(`
                id, name, 
                Country(name, code),
                Manufacturer(name)
            `)
            .in('id', ids);
        
            if(error) {
                console.log(error);
            }

            console.log("car data", data);
            
            return data;
        }

        async function get() {
            let uuid = (await client.auth.getSession()).data.session?.user.id;
            if(!uuid) {
                console.log("ERROR: no user id");
                return;
            }
            setUid(uuid);

            var {data, error} = await client
                .from('UserSubscriptions')
                .select()
                .eq('user_id', uuid);

            if(error) {
                console.log(error);
            }

            console.log("data", data);
            
            
            let watchedCarIds: string[] = data![0].watched_cars;
            setVehicleIds(watchedCarIds);

            let cars = await getCars(watchedCarIds);
            setVehicles(cars);
        }

        get();

    }, []);


    async function deleteVehicle(id: string) {
        let removed = vehicleIds.filter((x) => x != id);
        console.log(removed, id);
        let row = {
            user_id: uid,
            watched_cars: removed
        };

        const {data, error} = await supabase!.from('UserSubscriptions')
            .upsert(row, {
                onConflict: "user_id",
                ignoreDuplicates: false
            })
            .select();


        if(error) {
            throw error;
        }

        console.log(data);

        // the new set of ids
        let carIds: number[] = data[0].watched_cars.map(Number);
        // remove vehicles
        let updated = vehicles!.filter((x) => carIds.includes(x.id));


        setVehicles(updated);
        setVehicleIds(carIds);
        

    }


    return (
        <div className="p-5">
            

            <h1 className="text-2xl font-semibold">My vehicles</h1>
            <hr className="mt-2 mb-4"/>
            <div className="flex flex-col gap-4">
                {
                    vehicles ? vehicles.map((x) => {
                        return (
                            <div key={x.id} className="group flex w-full max-w-screen-sm items-center justify-between border border-gray-400 rounded-lg p-3">

                                <div className="flex items-center gap-4">
                                    <div className="text-center min-w-20">
                                        <span className={`fi fi-${x.Country.code}`}></span>
                                        <p className="group-hover:opacity-100 opacity-0 text-xs transition-opacity duration-150">{x.Country.name}</p>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">{x.name}</h2>
                                        <p className="text-sm">{x.Manufacturer.name}</p>
                                    </div>
                                </div>
                                
                                
                                <div className="">
                                    <Button color="danger" variant="light" isIconOnly onClick={() => deleteVehicle(x.id)}>
                                        <TrashIcon className="fill-red-600"/>
                                    </Button>
                                </div>
                            </div>
                        );
                    }) : null
                }
            </div>
        </div>
    );
}