'use client'

import { PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind"

export function Providers({children}: { children: React.ReactNode }) {
  return (
    
    <PrimeReactProvider value={{pt: Tailwind}}>
      {children}
    </PrimeReactProvider>
    
  )
}