import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export const PaymentSuccess: React.FC = () => {
    useEffect(() => {
        // Redirecionar para o dashboard após 3 segundos
        const timer = setTimeout(() => {
            window.location.href = '/';
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
                <div className="mb-6">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Pagamento Confirmado!
                    </h1>
                    <p className="text-gray-600 text-lg mb-4">
                        Bem-vindo ao SkillQuest Premium!
                    </p>
                    <p className="text-gray-500">
                        Você agora tem acesso a todos os recursos exclusivos da plataforma.
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-700 font-semibold">✓ Assinatura ativada com sucesso</p>
                </div>

                <p className="text-sm text-gray-500">
                    Redirecionando para o dashboard...
                </p>
            </div>
        </div>
    );
};
