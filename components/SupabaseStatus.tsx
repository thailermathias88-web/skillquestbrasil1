import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export const SupabaseStatus: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Simple check: get session (doesn't require tables)
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;

                setStatus('connected');
                setMessage('Conectado ao Supabase');
            } catch (err: any) {
                console.error('Supabase connection error:', err);
                setStatus('error');
                setMessage(err.message || 'Erro de conexão');
            }
        };

        checkConnection();
    }, []);

    if (status === 'loading') return <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 z-[100]"><Loader2 className="w-3 h-3 animate-spin" /> Verificando conexão...</div>;

    if (status === 'error') return (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 z-[100] shadow-lg">
            <WifiOff className="w-3 h-3" />
            Erro: {message}
        </div>
    );

    return (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 z-[100] shadow-lg">
            <Wifi className="w-3 h-3" />
            Supabase Online
        </div>
    );
};
