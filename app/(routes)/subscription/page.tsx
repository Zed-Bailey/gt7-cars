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



const columns = [
    {
        key: 'id',
        label: 'Car ID'
    },
    {
        key: 'shortname',
        label: "Car Name"
    },
    {
        key: 'maker',
        label: 'Manufacturer'
    }, 
    {
        key: 'country',
        label: 'Country'
    }
]





export default function SubscriptionHome() {


    const [vehicles, setVehicles] = useState<Car[]>([]);

    const [supabase, setSupabaseClient] = useState<SupabaseClient>();

    const [manufacturer, setManufacturers] = useState<Map<number, Manufacturer>>();
    const [countries, setCountries] = useState<Map<number, Country>>();

    const [manufacturerFilter, setManufacturerFilter] = useState<string[]>([]);
    const [countryFilter, setCountryFilter] = useState<string[]>([]);

    const [searchQuery, setSearchQuery] = useState("");

    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set<string>());

    const [isLoading, setIsLoading] = useState(false);

    
    const debouncedResults = useMemo(() => {
        return debounce(updateSearchQuery,300);
    }, []);


    async function loadData() {

        let loader = new DataLoader(supabase);
        let cars = await loader.loadcars();
        let countries = await loader.loadcountries();
        let makers = await loader.loadmanufacturers();

        setVehicles(cars);
        setCountries(countries);
        setManufacturers(makers);
        
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
            

            
            let manuFilterConverted = manufacturerFilter.map(Number);
            if(manuFilterConverted.length == 0) {
                manuFilterConverted = Array.from(manufacturer!.values()).map((x) => x.id);
            }


            let conFilterConverted: number[] = countryFilter.map(Number);
            if(conFilterConverted.length == 0) {
                conFilterConverted = Array.from(countries!.values()).map((x) => x.id);
            }



            const { data, error } = await supabase
                .from('Car')
                .select()
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
    
    




    return (
        <main className="flex ps-5 pt-5 pr-5">
            {/* <div className='w-full h-full relative z-20'> */}
                <Button size="lg" color="primary" variant='solid' className='absolute bottom-5 z-50 left-[50%] -translate-x-[50%]'>
                    Watch {selectedKeys.size} cars
                </Button>
            {/* </div> */}
            
            {/* Brand filters */}
            <div className='gap-3'>
                <div>
                    <p className='font-bold'>Filter by manufacturer</p>
                    <CheckboxGroup
                        // label="Filter by manufacturer"
                        className="max-h-96 overflow-y-scroll overflow-x-hidden py-2 pr-2"
                        onValueChange={setManufacturerFilter}
                    >
                        {
                            manufacturer ? Array.from(manufacturer.values()).map((m) => {
                                return(
                                    <Checkbox key={m.id} value={m.id.toString()}>{m.name}</Checkbox>
                                );
                            }) : null
                        }
                    </CheckboxGroup>
                </div>
            
                <div>
                    <p className='font-bold'>Filter by Country</p>
                    <CheckboxGroup
                        // label="Filter by manufacturer"
                        className="max-h-96 overflow-y-scroll overflow-x-hidden py-2 pr-2"
                        onValueChange={setCountryFilter}
                    >
                        {
                            countries ? Array.from(countries.values()).map((m) => {
                                return(
                                    <Checkbox key={m.id} value={m.id.toString()}>{m.name}</Checkbox>
                                );
                            }) : null
                        }
                    </CheckboxGroup>
                </div>
            </div>

            {/* cars */}
            <div className='w-full h-screen flex flex-col gap-5'>
                <h1 className='text-3xl font-semibold'>Search for vehicles</h1>
                <Input variant='flat' placeholder='Search for cars' isClearable 
                    startContent={
                        <SearchIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 fill-gray-300"/>
                    }
                    // value={searchQuery}
                    onChange={debouncedResults}
                />

                <Table aria-label="" selectionMode='multiple' color='primary'
                    isHeaderSticky
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    
                    classNames={{
                        base: "flex-1 overflow-scroll mb-10",
                        table: "min-h-[400px]",
                      }}
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
                            (value: any) => {
                                let m = manufacturer?.get(value.manufacturer);
                                return (
                                    <TableRow key={value.id}>
                                        <TableCell>{value.id}</TableCell>
                                        <TableCell>{value.name}</TableCell>
                                        <TableCell>{m?.name ?? ''}</TableCell>
                                        <TableCell>
                                            <span className={`fi fi-${countries?.get(value.country)?.code}`}></span>
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                        }
                    </TableBody>
                </Table>
            
            </div>
            
        </main>
    );


}