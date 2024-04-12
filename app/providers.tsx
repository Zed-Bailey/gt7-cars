// app/providers.tsx
'use client'

import {NextUIProvider} from '@nextui-org/react'
import { PrimeReactProvider } from "primereact/api";
import 'primereact/resources/themes/viva-dark/theme.css';

export function Providers({children}: { children: React.ReactNode }) {
  return (
    // <NextUIProvider>
      <PrimeReactProvider>
        {children}
      </PrimeReactProvider>
    // </NextUIProvider>
  )
}