import { Client } from 'appwrite';
import { useEffect } from 'react';

export default function SubscriptionHome() {
    useEffect(() => {
        const client = new Client();

        client
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject('6604a8f75ce4c4c45153');
    }, []);
    return (
        <main className="flex">
            {/* Brand filters */}
            <div>
                <ul></ul>
            </div>

            {/* cars */}
            <div>

            </div>
        </main>
    );


}