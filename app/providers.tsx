'use client'

import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/soho-light/theme.css";

export function Providers({children}: { children: React.ReactNode }) {
  return (
    
    <PrimeReactProvider>
      {children}
    </PrimeReactProvider>
    
  )
}