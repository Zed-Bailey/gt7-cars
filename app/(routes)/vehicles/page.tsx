"use client";

import { Client, Databases, Query } from 'appwrite';
import { useEffect, useMemo, useState } from 'react';
import {SearchIcon} from '../../_icons/SearchIcon';
import "/node_modules/flag-icons/css/flag-icons.min.css";
import debounce from "lodash.debounce";
import Car from '../../_models/Car';
import Manufacturer from '../../_models/Manufacturer';
import Country from '../../_models/Country';
import { useAsyncList } from '@react-stately/data';
import { useInfiniteScroll } from '@nextui-org/use-infinite-scroll';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import DataLoader from '@/app/_helpers/dataloader';
import VehicleTable from '@/app/_components/VehicleTable';
import CheckboxFilterGroup from '@/app/_components/CheckboxFilterGroup';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from "primereact/inputtext";
import {Button} from "primereact/button";
import SavedCarRow from '@/app/_components/SavedCarRow';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';



export default function SubscriptionHome() {

    const {push} = useRouter();

    const [vehicles, setVehicles] = useState<Car[]>([]);

    const [supabase, setSupabaseClient] = useState<SupabaseClient>();

    const [manufacturer, setManufacturers] = useState<Manufacturer[]>([]);
    const [countries, setCountries] = useState<Country[]>();

    const [manufacturerFilter, setManufacturerFilter] = useState<number[]>([]);
    const [countryFilter, setCountryFilter] = useState<number[]>([]);

    const [searchQuery, setSearchQuery] = useState("");

    const [selectedCars, setSelectedCars] = useState<Car[] | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);

    const pageSize = 50;
    const [currentPage, setCurrentPage] = useState(0);
    const [pageLoading, setPageLoading] = useState(false);

    const [dataloader, setDataLoader] = useState<DataLoader>();

    const debouncedResults = useMemo(() => {
        return debounce(updateSearchQuery,300);
    }, []);


    async function loadData() {
        if(!supabase) { return; }
        
        let loader = new DataLoader(supabase);
        setDataLoader(loader);

        let cars = await loader.loadcars(currentPage, pageSize);
        let countries = await loader.loadcountries();
        let makers = await loader.loadmanufacturers();

        setVehicles(cars);
        setCountries(countries);
        setManufacturers(makers);
        
        const uid = (await supabase!.auth.getSession()).data.session?.user.id;
        if(!uid) {
            console.log("ERROR: no user id");
            return;
        }

        var {data, error} = await supabase!
            .from('UserSubscriptions')
            .select()
            .eq('user_id', uid);

        if(error) {
            console.log(error);
        }

        console.log("data", data);
        
        
        let watchedCarIds: string[] = data![0].watched_cars;

        var {data, error} = await supabase
            .from('Car')
            .select(`
                *, 
                Country(name, code),
                Manufacturer(name)
            `)
            .in('id', watchedCarIds);
        

        let selected: Car[] = data as Car[];
        setSelectedCars(selected);


        setIsLoading(false);

    }

    


    useEffect(() => {
        if(supabase) {
            setIsLoading(true);
            loadData();
        }
        
    }, [supabase]);

    useEffect(() => {
        const supaClient = createClient(process.env.supabaseUrl ?? "", process.env.supabaseKey ?? "");
        setSupabaseClient(supaClient);

        return () => {
            debouncedResults.cancel();
        }
    }, []);
    

    function updateSearchQuery(event: any) {
        let newValue = event.target.value;
        
        async function filter() {
            if(!supabase) {
                setIsLoading(false);
                return;
            }

            const {data, error} = await supabase
                .from('Car')
                .select()
                .order('name')
                .ilike('name', `%${newValue}%`);

            if(error) throw error;

            let cars: Car[] = [];
            data.forEach((x) => {
                let car: Car = x;
                cars.push(car);
            });
            
            setVehicles(cars);
            setIsLoading(false);
        }
        
        setSearchQuery(newValue);
        setIsLoading(true);
        setVehicles([]);
        
        filter();
    }





   
    


    useEffect(() => {
        async function filter() {
            if(!supabase || !countries || !manufacturer) {
                setIsLoading(false);
                return;
            }
            
            let manuFilterConverted = manufacturerFilter;
            if(manuFilterConverted.length == 0) {
                manuFilterConverted = manufacturer.map((x) => x.id);
            }


            let conFilterConverted: number[] = countryFilter;
            if(conFilterConverted.length == 0) {
                conFilterConverted = countries.map((x) => x.id);
            }

            const { data, error } = await supabase
                .from('Car')
                .select(`
                    *, 
                    Country(name, code),
                    Manufacturer(name)
                `)
                .order('name')
                .in('manufacturer', manuFilterConverted)
                .in('country', conFilterConverted);

            if(error) throw error;

            let cars: Car[] = [];
            data.forEach((x) => {
                let car: Car = x;
                cars.push(car);
            });
            
            setVehicles(cars);
            setIsLoading(false);
        }

        setVehicles([]);
        setIsLoading(true);
        
        filter();

    }, [manufacturerFilter, countryFilter]);
    
    


    async function saveUserVehicles() {
        const uid = (await supabase!.auth.getSession()).data.session?.user.id;
        
        console.log(uid);
        let keys = selectedCars?.map((x) => x.id) ?? [];
        let row = {
            user_id: uid,
            watched_cars: keys
        };

        const {data, error} = await supabase!.from('UserSubscriptions')
            .upsert(row, {
                onConflict: "user_id",
                ignoreDuplicates: false
            })
            .select();

        if(error) {
            toast.error('Failed to save vehicles');
            return;
        }

        toast.success('Saved vehicles');

        push('/home');

    }


    return (
        
        <main className="flex pl-5 pt-5 pr-5">
            
            <div className='flex flex-col gap-5'>
                <div>
                    <p className='font-bold'>Filter Manufacturers</p>
                    <CheckboxFilterGroup items={manufacturer} onFilterChanged={(values) => setManufacturerFilter(values)}/>
                </div>
                <div>
                    <p className='font-bold'>Filter Countries</p>
                    <CheckboxFilterGroup items={Array.from(countries?.values() ?? [])} onFilterChanged={(values) => setCountryFilter(values)}/>
                </div>
            </div>
            

            {/* cars */}
            <div className='w-full h-screen flex flex-col gap-5'>
                <h1 className='text-3xl font-semibold'>Search for vehicles</h1>
                
                <div className='w-full'>
                    <IconField iconPosition='left' className='w-full'>
                        <InputIcon className="pi pi-search"> </InputIcon>
                        <InputText className='ps-14 w-full' onChange={debouncedResults} placeholder="Search" />
                    </IconField>
                </div>
                
                <VehicleTable cars={vehicles} selectedCars={selectedCars!} onSelectedChanged={setSelectedCars}/>
                
                <div className='flex justify-center mt-3'>
                    {
                        selectedCars && selectedCars.length > 0 ? <Button label={`Save ${selectedCars.length} vehicles`} onClick={saveUserVehicles}/> 
                        : null
                    }
                </div>
                
                <div className={`w-full ${selectedCars ? 'block' : 'none'} p-10`}>
                    <h1 className='text-2xl'>Selected Cars</h1>
                    <div className='w-full flex flex-col items-center gap-5'>
                        {
                            selectedCars?.map((x) => {
                                return (
                                    <SavedCarRow key={x.id} car={x} deleteClicked={(id) => { setSelectedCars(selectedCars.filter((x) => x.id !== id))}}/>
                                );
                            })
                        }
                    </div>
                </div>
            
            </div>
            
        </main>
    );


}