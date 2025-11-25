import React, { useState } from 'react';
import { ChevronLeft, Check, Target, Lightbulb, BookOpen, MessageSquare, Sparkles, Trophy } from 'lucide-react';

interface SoftSkillDay {
    day: number;
    title: string;
    action: string;
    whyItMatters: string;
    reading: string;
    reflection: string;
    xp: number;
}

interface SoftSkillsDayDetailProps {
    day: SoftSkillDay;
    onComplete: () => void;
    onBack: () => void;
}

export const SoftSkillsDayDetail: React.FC<SoftSkillsDayDetailProps> = ({
    day,
    onComplete,
    onBack
}) => {
    const [isCompleting, setIsCompleting] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    const handleComplete = () => {
        setIsCompleting(true);
        setShowCelebration(true);

        // Wait for animation
        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24 relative">
            {/* Celebration Overlay */}
            {showCelebration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4 animate-scaleIn">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-bounce">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                            Parabéns! 🎉
                        </h2>
                        <p className="text-slate-600 mb-4">
                            Você completou o desafio do dia {day.day}!
                        </p>
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-200">
                            <p className="text-purple-900 font-bold text-3xl mb-1">
                                +{day.xp} XP
                            </p>
                            <p className="text-purple-600 text-sm">Experiência ganha!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 text-white p-6 pb-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />

                <div className="relative z-10">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm mb-6"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-bold">Dia {day.day} de 30</span>
                        </div>
                        <h1 className="text-2xl font-extrabold mb-2">{day.title}</h1>
                        <p className="text-purple-100 text-sm">+{day.xp} XP ao completar</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 -mt-6 space-y-4 relative z-20">

                {/* Task */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">A Tarefa</h2>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{day.action}</p>
                </div>

                {/* Why It Matters */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Por Que Importa</h2>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{day.whyItMatters}</p>
                </div>

                {/* Reading */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Leitura Recomendada</h2>
                    </div>
                    <p className="text-slate-700 leading-relaxed italic">"{day.reading}"</p>
                </div>

                {/* Reflection */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-pink-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Reflexão Diária</h2>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">{day.reflection}</p>
                </div>
            </div>

            {/* Complete Button - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-6 shadow-2xl border-t border-purple-100">
                <button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${isCompleting
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/50 transform hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                >
                    {isCompleting ? (
                        <>
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            Concluindo...
                        </>
                    ) : (
                        <>
                            <Check className="w-6 h-6" />
                            Marcar como Concluído
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
