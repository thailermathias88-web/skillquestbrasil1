import React from 'react';
import { X, Check, Crown, FileText, BrainCircuit, MessageSquare, Mic, DollarSign, Video, Star } from 'lucide-react';

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#18181b] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex flex-col max-h-[95vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pt-10 overflow-y-auto custom-scrollbar">
            
            {/* Header Brand */}
            <div className="text-center mb-6">
                <h2 className="text-white font-bold text-3xl tracking-tight flex items-center justify-center gap-2">
                    SkillQuest <span className="text-[#ff9f76]">PRO</span>
                </h2>
                <p className="text-gray-400 text-xs mt-1 font-medium tracking-wide">
                    DESBLOQUEIE SEU POTENCIAL MÁXIMO
                </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
                
                {/* 1. MENTORIA (EMPHASIS) */}
                <div className="flex items-start gap-4 p-3 rounded-xl bg-gradient-to-r from-[#ff9f76]/15 to-transparent border border-[#ff9f76]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-10 h-10 bg-[#ff9f76]/10 blur-xl rounded-full"></div>
                    <div className="w-8 h-8 rounded-full bg-[#ff9f76] flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-orange-900/20">
                        <Video className="w-4 h-4 text-[#18181b] fill-current" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            Mentoria em Grupo <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black animate-pulse shadow-sm">AO VIVO</span>
                        </h3>
                        <p className="text-[#ffcbba] text-[11px] leading-tight mt-0.5 font-medium">
                            Encontros quinzenais com experts do mercado.
                        </p>
                    </div>
                </div>
                
                {/* 2. Otimizador de CV */}
                <div className="flex items-start gap-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-[#ff9f76]/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/5">
                        <FileText className="w-4 h-4 text-[#ff9f76]" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Otimizador de CV</h3>
                        <p className="text-gray-500 text-[11px] leading-tight">IA reescreve e destaca seus pontos fortes.</p>
                    </div>
                </div>

                {/* 3. Devolutiva DISC Completa */}
                <div className="flex items-start gap-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-[#ff9f76]/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/5">
                        <BrainCircuit className="w-4 h-4 text-[#ff9f76]" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Devolutiva DISC Completa</h3>
                        <p className="text-gray-500 text-[11px] leading-tight">Análise profunda + download em PDF.</p>
                    </div>
                </div>

                {/* 4. Coach Comportamental */}
                <div className="flex items-start gap-4 px-2">
                     <div className="w-8 h-8 rounded-full bg-[#ff9f76]/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/5">
                        <MessageSquare className="w-4 h-4 text-[#ff9f76]" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Coach Comportamental</h3>
                        <p className="text-gray-500 text-[11px] leading-tight">Plano de 7 dias para evoluir seus soft skills.</p>
                    </div>
                </div>

                {/* 5. Guia de Entrevista */}
                <div className="flex items-start gap-4 px-2">
                     <div className="w-8 h-8 rounded-full bg-[#ff9f76]/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/5">
                        <Mic className="w-4 h-4 text-[#ff9f76]" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Guia de Entrevista</h3>
                        <p className="text-gray-500 text-[11px] leading-tight">Comportamental, Técnica e Cases REAIS de sucesso.</p>
                    </div>
                </div>

                {/* 6. Raio-X Salarial */}
                <div className="flex items-start gap-4 px-2">
                     <div className="w-8 h-8 rounded-full bg-[#ff9f76]/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/5">
                        <DollarSign className="w-4 h-4 text-[#ff9f76]" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Raio-X Salarial</h3>
                        <p className="text-gray-500 text-[11px] leading-tight">Comparativo Jr/Pl/Sr, regional e negociação.</p>
                    </div>
                </div>

            </div>

            {/* Pricing & CTA */}
            <div className="text-center mt-auto">
                 <div className="mb-6 relative inline-block">
                    <span className="text-3xl font-black text-white">R$ 49,90</span>
                    <span className="text-gray-400 text-sm font-medium"> /mês</span>
                    <p className="text-gray-500 text-[10px] mt-1">Cancele quando quiser.</p>
                 </div>

                <button 
                    onClick={onUpgrade}
                    className="w-full py-4 bg-[#ff9f76] hover:bg-[#ff8f5e] text-[#18181b] font-black text-base uppercase tracking-wide rounded-full shadow-lg shadow-orange-900/20 transform transition active:scale-[0.98] mb-6 flex items-center justify-center gap-2"
                >
                    <Star className="w-5 h-5 fill-current" />
                    QUERO MINHA VAGA
                </button>

                {/* Footer Links (Visual Only) */}
                <div className="flex justify-center gap-6 text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                    <span className="cursor-pointer hover:text-gray-300">Restaurar Compra</span>
                    <span className="cursor-pointer hover:text-gray-300">Termos</span>
                    <span className="cursor-pointer hover:text-gray-300">Privacidade</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};