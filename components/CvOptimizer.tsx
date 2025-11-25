import React from 'react';
import { ChevronLeft, FileText } from 'lucide-react';

interface CvOptimizerProps {
    onBack: () => void;
}

const CvOptimizer: React.FC<CvOptimizerProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="p-4 flex items-center gap-4 bg-white border-b border-slate-200 sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="font-bold text-lg text-slate-800">Otimizador de CV</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Em Breve</h2>
                <p className="text-slate-500 max-w-xs">
                    Estamos finalizando os últimos detalhes da nossa IA de otimização de currículos.
                </p>
            </div>
        </div>
    );
};

export default CvOptimizer;
