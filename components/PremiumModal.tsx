import React, { useState } from 'react';
import { X, Check, Crown, FileText, BrainCircuit, MessageSquare, Mic, DollarSign, Video, Star, Loader2, Clock, Gift } from 'lucide-react';

interface PremiumModalProps {
    onClose: () => void;
    onUpgrade: () => void;
    userId?: string;
    userEmail?: string;
    isTrialActive?: boolean;
    trialEndsAt?: Date | null;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUpgrade, userId, userEmail, isTrialActive, trialEndsAt }) => {
    const [loading, setLoading] = useState(false);

    // Calculate remaining trial days
    const getTrialDaysRemaining = () => {
        if (!trialEndsAt) return 0;
        const now = new Date();
        const diff = trialEndsAt.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const trialDaysRemaining = getTrialDaysRemaining();

    const handleSubscribe = async () => {
        if (!userId || !userEmail) {
            console.error("User ID or Email missing for Stripe checkout");
            onUpgrade(); // Fallback to local state update if no user data (dev mode)
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${window.location.origin}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    userEmail,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar sessão de pagamento');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Erro no checkout:', error);
            alert('Erro ao iniciar pagamento. Tente novamente.');
            setLoading(false);
        }
    };

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

                    {/* Trial Banner */}
                    {isTrialActive && trialDaysRemaining > 0 && (
                        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <Gift className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-emerald-400 font-bold text-sm">🎉 Trial Gratuito Ativo!</h3>
                                    <p className="text-emerald-300/80 text-xs">
                                        Você tem <span className="font-bold">{trialDaysRemaining} dia{trialDaysRemaining !== 1 ? 's' : ''}</span> restantes de acesso completo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full py-4 bg-[#ff9f76] hover:bg-[#ff8f5e] text-[#18181b] font-black text-base uppercase tracking-wide rounded-full shadow-lg shadow-orange-900/20 transform transition active:scale-[0.98] mb-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    PROCESSANDO...
                                </>
                            ) : (
                                <>
                                    <Star className="w-5 h-5 fill-current" />
                                    QUERO MINHA VAGA
                                </>
                            )}
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