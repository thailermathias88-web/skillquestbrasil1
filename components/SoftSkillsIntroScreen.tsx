import React from 'react';
import { ChevronLeft, Target, BookOpen, Lightbulb, MessageSquare, Zap, Trophy } from 'lucide-react';
import { SlideToUnlock } from './SlideToUnlock';

interface SoftSkillsIntroScreenProps {
    onStart: () => void;
    onBack: () => void;
    userLevel: number;
    userXP: number;
    streak: number;
}

export const SoftSkillsIntroScreen: React.FC<SoftSkillsIntroScreenProps> = ({
    onStart,
    onBack,
    userLevel,
    userXP,
    streak
}) => {
    const features = [
        {
            icon: Target,
            title: 'A Tarefa',
            description: 'Uma ação prática e concreta para executar hoje',
            color: 'from-blue-500 to-cyan-500',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            icon: Lightbulb,
            title: 'Por Que Importa',
            description: 'Contexto e relevância da habilidade para sua carreira',
            color: 'from-amber-500 to-orange-500',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600'
        },
        {
            icon: BookOpen,
            title: 'Leitura Recomendada',
            description: 'Material de referência para aprofundar o conhecimento',
            color: 'from-purple-500 to-indigo-500',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            icon: MessageSquare,
            title: 'Reflexão Diária',
            description: 'Pergunta para autoanálise e crescimento pessoal',
            color: 'from-pink-500 to-rose-500',
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-600'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white pb-32">
            {/* Header */}
            <div className="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 text-white p-6 pb-20 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                <div className="relative z-10">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm mb-4"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="text-center mt-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Trophy className="w-10 h-10 text-yellow-300" />
                        </div>
                        <h1 className="text-3xl font-extrabold mb-2">Desafio 30 Dias</h1>
                        <p className="text-purple-100 text-sm">Coaching Comportamental Gamificado</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-6 -mt-12 mb-6 relative z-20">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100 text-center">
                        <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">Nv.{userLevel}</p>
                        <p className="text-xs text-slate-500">Nível</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100 text-center">
                        <Trophy className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{userXP}</p>
                        <p className="text-xs text-slate-500">XP Total</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100 text-center">
                        <div className="text-2xl mb-2">🔥</div>
                        <p className="text-2xl font-bold text-slate-900">{streak}</p>
                        <p className="text-xs text-slate-500">Dias</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Como Funciona?</h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Durante 30 dias, você receberá um desafio diário estruturado para desenvolver suas soft skills de forma consistente e mensurável.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="space-y-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rules */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-5 border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        Regras do Desafio
                    </h3>
                    <ul className="space-y-2 text-sm text-purple-800">
                        <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>Apenas 1 tarefa disponível por vez</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>24 horas de intervalo entre cada desafio</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>100 XP por tarefa completada</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>Suba de nível conforme acumula XP</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Slide to Unlock - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-6 shadow-2xl border-t border-purple-100">
                <SlideToUnlock onUnlock={onStart} text="Deslize para começar" />
            </div>
        </div >
    );
};
