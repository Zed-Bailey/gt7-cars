

export async function GET(request: Request) {

    let res = await fetch('https://ddm999.github.io/gt7info/data.json')
        .then(r => r.json())
        .catch(() => null);

    if(res === null) {
        return new Response(JSON.stringify({msg : "failed to fetch data"}), {status: 400});
    }

    let latest: Dealership = res;

    // filter cars to fetch only the ones that are newly added
    let newLegend = latest.legend.cars.filter((x) => x.new);
    let newUsed = latest.used.cars.filter((x) => x.new);

    // these are all the newly added cars
    let newCars = [...newLegend, ...newUsed];






    return Response.json(newCars);
}



export interface Dealership {
    updatetimestamp: string
    used: UsedCars
    legend: LegendCars
}
  
export interface UsedCars {
    date: string
    cars: Car[]
}
export interface LegendCars {
    date: string
    cars: Car[]
}
  
export interface Car {
    carid: string
    manufacturer: string
    region: string
    name: string
    credits: number
    state: string
    estimatedays: number
    new: boolean
}

  

  
 