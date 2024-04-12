import { useState } from "react";
import Country from "../_models/Country";
import Manufacturer from "../_models/Manufacturer";
import {Checkbox, CheckboxChangeEvent} from "primereact/checkbox";

export default function CheckboxFilterGroup({items, onFilterChanged} : {items: Manufacturer[] | Country[], onFilterChanged: (value: number[]) => void}) {
    
    const [selectedItems, setSelectedItemss] = useState<number[]>([]);

    const handleToggle = (e: CheckboxChangeEvent) => {
        let _selectedCategories = [...selectedItems];

        console.log(e);
        if (e.checked)
            _selectedCategories.push(e.value);
        else
            _selectedCategories = _selectedCategories.filter(category => category !== e.value);

        setSelectedItemss(_selectedCategories);
        onFilterChanged(_selectedCategories);
    }
    
    return(
        <div className="overflow-y-scroll max-h-[300px]">
            {items.map((x) => {
                return (
                    <div key={x.id} className="flex items-center w-full " >
                        <Checkbox inputId={x.name} name="category" value={x.id} onChange={handleToggle} checked={selectedItems.some((item) => item === x.id)} />
                        <label htmlFor={x.id.toString()} className="ml-2">
                            {x.name}
                        </label>
                    </div>
                );
            })}
        </div>
    )
}