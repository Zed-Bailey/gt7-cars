import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Car from '../_models/Car';

export default function VehicleTable({ cars, selectedCars, onSelectedChanged} : {cars: Car[], selectedCars: Car[], onSelectedChanged: (value: Car[] | null) => void}){

    return (
        <div className="w-full h-full">
            
            <DataTable value={cars} scrollable scrollHeight="400px" selectionMode={'multiple'} dataKey='id' 
                virtualScrollerOptions={{ itemSize: 50 }} tableStyle={{ minWidth: '50rem', minHeight: '400px', height: '100%' }}
                onSelectionChange={(e) => onSelectedChanged(e.value)} selection={selectedCars}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="id" header="Id" style={{ width: '3rem' }}></Column>
                <Column field="Manufacturer.name" header="Manufacturer" style={{ width: '20%' }}></Column>
                <Column field="name" header="Name" style={{ width: '20%' }}></Column>
                <Column field="Country.name" header="Country" style={{ width: '20%' }}></Column>
        
            </DataTable>
            
        </div>
    );
}