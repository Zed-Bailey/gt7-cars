import type { Config } from "tailwindcss";


const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { },
  darkMode: "class",
  plugins: []
};
export default config;
