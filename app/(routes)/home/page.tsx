'use client';

import GetSupabaseClient from "@/app/_helpers/client";
import Car from "@/app/_models/Car";
import { Button, select } from "@nextui-org/react";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import {TrashIcon} from "../../_icons/TrashIcon";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import SavedCar from "@/app/_models/SavedCar";
import SavedCarRow from "@/app/_components/SavedCarRow";
import {toast} from "react-toastify";




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

            let proper: any[] = data ?? [];
            
            return proper;
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
            toast.error('Failed to remove the vehicle');
            return;
        }

        console.log(data);

        // the new set of ids
        let carIds: number[] = data[0].watched_cars.map(Number);
        // remove vehicles
        let updated = vehicles!.filter((x) => carIds.includes(Number(x.id)));


        setVehicles(updated);
        setVehicleIds(carIds.map((x) => x.toString()));
        
        toast.success("Removed Vehicle");

    }


    return (
        <div className="flex justify-center">       
            <div className="p-5 w-full max-w-6xl">
                

                <h1 className="text-2xl font-semibold">My Saved Vehicles</h1>
                <hr className="mt-2 mb-4"/>
                <div className="flex flex-col gap-4 items-center">
                    {
                        vehicles ? vehicles.map((x) => 
                            <SavedCarRow key={x.id} car={x} deleteClicked={(id) => deleteVehicle(id)}/>
                        ) : null
                    }
                </div>
            </div>
        </div>
    );
}