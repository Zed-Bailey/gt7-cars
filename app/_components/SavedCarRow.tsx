import { Button } from "@nextui-org/react";
import { TrashIcon } from "../_icons/TrashIcon";
import Car from "../_models/Car";
import SavedCar from "../_models/SavedCar";


export default function SavedCarRow({ car, deleteClicked }: { car: SavedCar, deleteClicked: (id: string) => void }) {
    return (
        <div className="group flex w-full max-w-screen-sm items-center justify-between border border-gray-400 rounded-lg p-3">

            <div className="flex items-center gap-4">
                <div className="text-center min-w-20">
                    <span className={`fi fi-${car.Country.code}`}></span>
                    <p className="group-hover:opacity-100 opacity-0 text-xs transition-opacity duration-150">{car.Country.name}</p>
                </div>
                <div>
                    <h2 className="text-lg font-semibold">{car.name}</h2>
                    <p className="text-sm">{car.Manufacturer.name}</p>
                </div>
            </div>


            <div className="">
                <Button color="danger" variant="light" isIconOnly onClick={() => deleteClicked(car.id)}>
                    <TrashIcon className="fill-red-600" />
                </Button>
            </div>
        </div>
    );
}