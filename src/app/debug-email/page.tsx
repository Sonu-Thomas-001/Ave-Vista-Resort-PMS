'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function DebugEmail() {
    const [templates, setTemplates] = useState<any>([]);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function check() {
            const { data, error } = await supabase.from('email_templates').select('*');
            if (error) setError(error);
            if (data) setTemplates(data);
        }
        check();
    }, []);

    return (
        <div className="p-10">
            <h1>Debug Email Templates</h1>
            {error && <pre className="bg-red-100 p-4">{JSON.stringify(error, null, 2)}</pre>}
            <pre className="bg-gray-100 p-4">{JSON.stringify(templates, null, 2)}</pre>
        </div>
    );
}
