/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_PUBLIC_KEY
    }
};

export default nextConfig;
