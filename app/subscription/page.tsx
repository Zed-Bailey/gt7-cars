"use client";

import { Client, Databases, Query } from 'appwrite';
import { useEffect, useState } from 'react';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Checkbox, CheckboxGroup, Input} from "@nextui-org/react";
import {SearchIcon} from '../icons/SearchIcon';

// todo: cleanup null coalescing
const databaseID = process.env.databaseID ?? "";
const carsCollectionID = process.env.carsCollectionID ?? "";
const manufacturerCollectionId = process.env.manufacturerCollectionId ?? "";

interface Car {
    id: number;
    shortname: string,
    manufacturer: number;
}

interface Manufacturer {
    id : number;
    name: string;
    country: number;
}


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
    }
]



export default function SubscriptionHome() {


    const [vehicles, setVehicles] = useState<Car[]>([]);

    const [manufacturer, setManufacturers] = useState<Map<number, Manufacturer>>();

    const [manufacturerFilter, setManufacturerFilter] = useState<string[]>([]);

    const [database, setDatabase] = useState<Databases>();
    
    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
        const client = new Client();

        client
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(process.env.projectId ?? "");
            
        let database = new Databases(client);
        setDatabase(database);

    }, []);
    


    async function loadVehicles() {
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

        let manufacturerArr: Map<number, Manufacturer> = new Map();
        manufacturerDocs?.forEach((value, index) => {
            manufacturerArr.set(value['id'], {
                id: value['id'],
                name: value['name'],
                country: value['country']
            });
        });

        setManufacturers(manufacturerArr);


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

        loadFilteredCars([ Query.equal('maker', manufacturerFilter) ]);

    }, [manufacturerFilter]);


    return (
        <main className="flex p-5">
            {/* Brand filters */}
            <div>
                <CheckboxGroup
                    label="Filter by manufacturer"
                    className="max-h-screen overflow-y-scroll py-5"
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


                <CheckboxGroup
                    label="Filter by country"
                >
                    <Checkbox value="buenos-aires">Buenos Aires</Checkbox>
                    <Checkbox value="buenos-aies">Buenos Aires</Checkbox>
                    <Checkbox value="buenos-aires">Buenos Aires</Checkbox>
                    <Checkbox value="buenosaires">Buenos Aires</Checkbox>
                    <Checkbox value="bueno-aires">Buenos Aires</Checkbox>
                    <Checkbox value="buenos-ares">Buenos Aires</Checkbox>
                </CheckboxGroup>

            </div>

            {/* cars */}
            <div className='w-full space-y-5'>
                <Input variant='flat' placeholder='Search for cars' isClearable 
                    startContent={
                        <SearchIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 fill-gray-300"/>
                    }
                    value={searchQuery}
                    onValueChange={(newValue) => {
                        setSearchQuery(newValue);
                        if(newValue == "") {
                            loadFilteredCars([]);
                        } else {
                            loadFilteredCars([Query.search('shortname', newValue)]);
                        }
                        
                    }}
                />

                <Table aria-label="" selectionMode='multiple' color='primary'>
                
                <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody emptyContent={"No cars to display"}>
                    {
                        vehicles?.map((value) => 
                            <TableRow key={value.id}>
                                <TableCell>{value.id}</TableCell>
                                <TableCell>{value.shortname}</TableCell>
                                <TableCell>{manufacturer?.get(value.manufacturer)?.name ?? 'null'}</TableCell>
                                
                            </TableRow>
                            
                        )
                    }
                </TableBody>
            </Table>
            
            </div>
            
        </main>
    );


}