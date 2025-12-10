import React from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';

export const PaymentCanceled: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
                <div className="mb-6">
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Pagamento Cancelado
                    </h1>
                    <p className="text-gray-600 text-lg mb-4">
                        Você cancelou o processo de pagamento.
                    </p>
                    <p className="text-gray-500">
                        Não se preocupe, você pode tentar novamente quando quiser!
                    </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <p className="text-orange-700">Nenhuma cobrança foi realizada</p>
                </div>

                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar ao Dashboard
                </button>
            </div>
        </div>
    );
};
