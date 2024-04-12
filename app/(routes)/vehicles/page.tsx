"use client";

import { Client, Databases, Query } from 'appwrite';
import { useEffect, useMemo, useState } from 'react';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Checkbox, CheckboxGroup, Input, Spinner, Button} from "@nextui-org/react";
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



export default function SubscriptionHome() {


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
        let selected: Car[] = watchedCarIds.map((x) => { return {id: Number(x), name: "", Country: {name : "", code: ""}, Manufacturer: {name: ""}} });
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
        let keys = selectedCars?.filter((x) => x.id) ?? [];
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

        console.log(data);
        console.log(error);

    }

    async function loadNextPage() {
        setPageLoading(true);

        if(dataloader) {
            
            let data = await dataloader.loadcars(currentPage + 1, pageSize);
            setCurrentPage(currentPage + 1);
            setVehicles(vehicles.concat(data));
        }


        setPageLoading(false);
    }

    return (
        <main className="flex pl-5 pt-5 pr-5">
            
            
                {/* <Button size="lg" color="primary" variant='solid' className='absolute bottom-0 z-50 left-[50%] -translate-x-[50%]'
                    onClick={saveUserVehicles}>
                    Watch {selectedCars?.length ?? 0} cars
                </Button> */}
            
            


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
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText v-model="value1" placeholder="Search" />
                </IconField>


                {/* <Input variant='flat' placeholder='Search for cars' isClearable 
                    startContent={
                        <SearchIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 fill-gray-300"/>
                    }
                    // value={searchQuery}
                    onChange={debouncedResults}
                /> */}



                <VehicleTable cars={vehicles} selectedCars={selectedCars!} onSelectedChanged={setSelectedCars}/>

                {/* <Table aria-label="" selectionMode='multiple' color='primary'
                    isHeaderSticky
                    selectedKeys={selectedKeys}
                    onSelectionChange={(keys:any) => setSelectedKeys(keys) }
                    
                    classNames={{
                        base: "flex-1 overflow-scroll mb-10 h-full",
                        table: "min-h-[400px]",
                      }}
                      bottomContent={
                        <div className='flex w-full justify-center'>
                            <Button className='' onPress={loadNextPage}>
                                {pageLoading && <Spinner color="white" size="sm" />}
                                Load More
                            </Button>
                        </div>
                      }
                >
                
                    <TableHeader columns={columns}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>

                    <TableBody
                        isLoading={isLoading}
                        items={vehicles}
                        loadingContent={<Spinner color="white" />}
                    >
                        {
                            (value: any) => (
                                <TableRow key={value.id}>
                                    <TableCell>{value.id}</TableCell>
                                    <TableCell>{value.name}</TableCell>
                                    <TableCell>{manufacturer?.get(value.manufacturer)?.name ?? ''}</TableCell>
                                    <TableCell>
                                        <span className={`fi fi-${countries?.get(value.country)?.code}`}></span>
                                    </TableCell>
                                </TableRow>
                            )}
                    </TableBody>
                </Table> */}
            
            </div>
            
        </main>
    );


}