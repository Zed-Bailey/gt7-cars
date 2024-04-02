"use client";

import { Client, Databases, Query } from 'appwrite';
import { useEffect, useMemo, useState } from 'react';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Checkbox, CheckboxGroup, Input} from "@nextui-org/react";
import {SearchIcon} from '../../_icons/SearchIcon';
import "/node_modules/flag-icons/css/flag-icons.min.css";
import debounce from "lodash.debounce";
import Car from '../../_models/Car';
import Manufacturer from '../../_models/Manufacturer';
import Country from '../../_models/Country';

// todo: cleanup null coalescing
const databaseID = process.env.databaseID ?? "";
const carsCollectionID = process.env.carsCollectionID ?? "";
const manufacturerCollectionId = process.env.manufacturerCollectionId ?? "";
const countryCollectionId = process.env.countryCollectionId ?? "";





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
    const [manufacturer, setManufacturers] = useState<Map<number, Manufacturer>>();
    const [countries, setCountries] = useState<Map<number, Country>>();

    const [manufacturerFilter, setManufacturerFilter] = useState<string[]>([]);

    const [database, setDatabase] = useState<Databases>();
    
    const [searchQuery, setSearchQuery] = useState("");


    const debouncedResults = useMemo(() => {
        return debounce(updateSearchQuery,300);
    }, []);


    useEffect(() => {
        const client = new Client();

        client
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(process.env.projectId ?? "");
            
        let database = new Databases(client);
        setDatabase(database);

        return () => {
            debouncedResults.cancel();
        }
    }, []);
    

    function updateSearchQuery(event: any) {
        let newValue = event.target.value;
        setSearchQuery(newValue);
        if(newValue == "") {
            loadFilteredCars([]);
        } else {
            loadFilteredCars([Query.search('shortname', newValue)]);
        }
    }


    async function loadVehicles() {
        
        // load documents from database
        let carDocs = await database?.listDocuments(
                databaseID,
                carsCollectionID,
                []
            ).then(r => r.documents);
        
        let manufacturerDocs = await database?.listDocuments(
                databaseID,
                manufacturerCollectionId,
                [ Query.orderAsc('name'), Query.limit(100) ]
            ).then(r => r.documents);

        let countryDocs = await database?.listDocuments(
            databaseID,
            countryCollectionId,
            [ Query.orderAsc('name'), Query.limit(25) ]
        ).then(r => r.documents);

        let manufacturerArr: Map<number, Manufacturer> = new Map();
        manufacturerDocs?.forEach((value, index) => {
            manufacturerArr.set(value['id'], {
                id: value['id'],
                name: value['name'],
                country: value['country']
            });
        });
        setManufacturers(manufacturerArr);

        // convert from Document to the interface type and update state

        let vehicleArr: Car[] = [];
        carDocs?.forEach((value) => {
            vehicleArr.push({
                id: value['id'],
                manufacturer: value['maker'],
                shortname: value['shortname']
            });
        });
        setVehicles(vehicleArr);


        let countryArr: Map<number, Country> = new Map();
        countryDocs?.forEach((value, index) => {
            countryArr.set(value['id'], {
                id: value['id'],
                code: value['code'],
                name: value['name']
            });
        });
        setCountries(countryArr);

        
    }

   

    useEffect(() => {
        loadVehicles();
    }, [database]);


    async function loadFilteredCars(queries: string[]) {
        setVehicles([]);

        let carDocs = await database?.listDocuments(
            databaseID,
            carsCollectionID,
            queries
        ).then(r => r.documents);
    

        let vehicleArr: Car[] = [];
        carDocs?.forEach((value) => {
            vehicleArr.push({
                id: value['id'],
                manufacturer: value['maker'],
                shortname: value['shortname']
            });
        });

        setVehicles(vehicleArr);
    }

    useEffect(() => {
        if(manufacturerFilter.length == 0) {
            return;
        }

        let n: number[] = [];
        manufacturerFilter.forEach((x) => n.push(Number(x)));
        loadFilteredCars([ Query.equal('maker', n) ]);

    }, [manufacturerFilter]);

    




    return (
        <main className="flex p-5">
            {/* Brand filters */}
            <div className='space-y-5'>
                <div>
                    <p className='font-bold'>Filter by manufacturer</p>
                    <CheckboxGroup
                        // label="Filter by manufacturer"
                        className="max-h-screen overflow-y-scroll overflow-x-hidden py-2 pr-2"
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
            

            </div>

            {/* cars */}
            <div className='w-full space-y-5'>
                <h1 className='text-3xl font-semibold'>Search for vehicles</h1>
                <Input variant='flat' placeholder='Search for cars' isClearable 
                    startContent={
                        <SearchIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 fill-gray-300"/>
                    }
                    // value={searchQuery}
                    onChange={debouncedResults}
                />

                <Table aria-label="" selectionMode='multiple' color='primary'>
                
                    <TableHeader columns={columns}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>

                    <TableBody emptyContent={"No cars to display"} onLoadMore={() => {console.log('LOAD MORE!')}}>
                        {
                            vehicles?.map((value) => {
                                let m = manufacturer?.get(value.manufacturer);
                                return (
                                    <TableRow key={value.id}>
                                        <TableCell>{value.id}</TableCell>
                                        <TableCell>{value.shortname}</TableCell>
                                        <TableCell>{m?.name ?? ''}</TableCell>
                                        <TableCell>
                                            <span className={`fi fi-${countries?.get(m!.country)?.code}`}></span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        }
                    </TableBody>
                </Table>
            
            </div>

            {

            }
            
        </main>
    );


}