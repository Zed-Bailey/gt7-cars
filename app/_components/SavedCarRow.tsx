
import { Button } from "primereact/button";
import { TrashIcon } from "../_icons/TrashIcon";
import Car from "../_models/Car";



export default function SavedCarRow({ car, deleteClicked }: { car: Car, deleteClicked: (id: number) => void }) {
    return (
        
        <div className="group flex w-full max-w-screen-sm items-center justify-between border border-gray-400 rounded-lg p-3">

            <div className="flex items-center gap-4">
                <div className="text-center min-w-20">
                    <div className="">
                        <span className={`fi fi-${car.Country.code} outline-1 outline-black`}></span>
                    </div>
                    <p className="group-hover:opacity-100 opacity-0 text-xs transition-opacity duration-150">{car.Country.name}</p>
                </div>
                <div>
                    <h2 className="text-lg font-semibold">{car.name}</h2>
                    <p className="text-sm font-light">{car.Manufacturer.name}</p>
                </div>
            </div>


            <Button icon="pi pi-trash" severity="danger" outlined onClick={() => deleteClicked(car.id)}/>
            
        </div>
    );
}