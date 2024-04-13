import { useState } from "react";
import Country from "../_models/Country";
import Manufacturer from "../_models/Manufacturer";
import {Checkbox, CheckboxChangeEvent} from "primereact/checkbox";

export default function CheckboxFilterGroup({items, onFilterChanged} : {items: Manufacturer[] | Country[], onFilterChanged: (value: number[]) => void}) {
    
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const handleToggle = (e: CheckboxChangeEvent) => {
        let _selectedCategories = [...selectedItems];

        
        if (e.checked)
            _selectedCategories.push(e.value);
        else
            _selectedCategories = _selectedCategories.filter(category => category !== e.value);

        setSelectedItems(_selectedCategories);
        onFilterChanged(_selectedCategories);
    }
    
    return(
        <div className="flex flex-col overflow-y-scroll max-h-[300px] gap-2">
            {items.map((x) => {
                return (
                    <div key={x.id} className="flex align-items-center" >
                        <Checkbox inputId={x.name} name="category" value={x.id} onChange={handleToggle} checked={selectedItems.some((item) => item === x.id)} />
                        <label htmlFor={x.name} className="ml-2">
                            {x.name}
                        </label>
                    </div>
                );
            })}
        </div>
    )
}