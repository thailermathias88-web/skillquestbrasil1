import React, { useState, useEffect } from 'react';
import { UserProfile, SoftSkillsProgress, DailyTask } from '../types';
import { SOFT_SKILLS_JOURNEY } from '../data/softSkillsJourney';
import { updateSoftSkillsProgress } from '../services/adminService';
import {
    Lock, Check, Star, Trophy, Clock, ChevronRight,
    BookOpen, BrainCircuit, Zap, Flame, Shield, Crown,
    ArrowLeft, Calendar, X, Sparkles, Target, Award
} from 'lucide-react';

interface SoftSkillsJourneyScreenProps {
    userProfile: UserProfile;
    onBack: () => void;
    onUpdateProfile: (profile: UserProfile) => void;
}

export const SoftSkillsJourneyScreen: React.FC<SoftSkillsJourneyScreenProps> = ({
    userProfile,
    onBack,
    onUpdateProfile
}) => {
    const [progress, setProgress] = useState<SoftSkillsProgress>(
        userProfile.softSkillsProgress || {
            level: 1,
            currentDay: 1,
            completedDays: [],
            badges: [],
            lastCompletedDate: null,
            experience: 0
        }
    );
    const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [timeToNext, setTimeToNext] = useState<string>('');
    const [showCompletionSuccess, setShowCompletionSuccess] = useState(false);

    // Calcular cooldown
    useEffect(() => {
        const checkCooldown = () => {
            if (!progress.lastCompletedDate) return;

            const lastDate = new Date(progress.lastCompletedDate).getTime();
            const now = new Date().getTime();
            const cooldown = 24 * 60 * 60 * 1000; // 24h
            const diff = now - lastDate;

            if (diff < cooldown) {
                const remaining = cooldown - diff;
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                setTimeToNext(`${hours}h ${minutes}m`);
            } else {
                setTimeToNext('');
            }
        };

        checkCooldown();
        const interval = setInterval(checkCooldown, 60000); // Atualiza a cada minuto
        return () => clearInterval(interval);
    }, [progress.lastCompletedDate]);

    const handleCompleteTask = async () => {
        if (!selectedTask) return;

        const newCompletedDays = [...progress.completedDays, selectedTask.day];
        const newExperience = progress.experience + selectedTask.xpReward;

        // Calcular novo nível (ex: a cada 500xp sobe 1 nível)
        const newLevel = Math.floor(newExperience / 500) + 1;
        const leveledUp = newLevel > progress.level;

        // Adicionar badges
        const newBadges = [...progress.badges];
        if (selectedTask.day === 1) newBadges.push('Iniciado');
        if (selectedTask.day === 7) newBadges.push('Semana 1');
        if (selectedTask.day === 30) newBadges.push('Mestre Soft Skills');

        const newProgress: SoftSkillsProgress = {
            ...progress,
            currentDay: progress.currentDay + 1,
            completedDays: newCompletedDays,
            experience: newExperience,
            level: newLevel,
            badges: newBadges,
            lastCompletedDate: new Date().toISOString()
        };

        try {
            // Salvar no Supabase (se tiver ID do usuário)
            // Assumindo que userProfile tem ID ou que passamos o ID de alguma forma
            // Como userProfile pode não ter ID direto aqui, vamos atualizar o estado local e propagar

            // TODO: Idealmente chamar updateSoftSkillsProgress aqui se tivermos o userId disponível no contexto
            // await updateSoftSkillsProgress(userId, newProgress);

            setProgress(newProgress);
            onUpdateProfile({ ...userProfile, softSkillsProgress: newProgress });

            setShowCompletionSuccess(true);

            if (leveledUp) {
                setTimeout(() => setShowLevelUp(true), 500);
                setTimeout(() => setShowLevelUp(false), 3500);
            }

        } catch (error) {
            console.error('Erro ao salvar progresso:', error);
            alert('Erro ao salvar progresso. Tente novamente.');
        }
    };

    const isDayLocked = (day: number) => {
        // Dia 1 sempre liberado se não completado
        if (day === 1 && !progress.completedDays.includes(1)) return false;

        // Se já completou, não está bloqueado (mas pode estar em modo "revisão")
        if (progress.completedDays.includes(day)) return false;

        // Se é o próximo dia (currentDay), verifica cooldown
        if (day === progress.currentDay) {
            return !!timeToNext; // Bloqueado se tiver cooldown
        }

        // Dias futuros bloqueados
        return day > progress.currentDay;
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Comunicação': return 'from-blue-500 to-cyan-400';
            case 'Liderança': return 'from-purple-500 to-pink-500';
            case 'Produtividade': return 'from-orange-500 to-amber-400';
            case 'Inteligência Emocional': return 'from-emerald-500 to-teal-400';
            case 'Carreira': return 'from-indigo-500 to-violet-500';
            default: return 'from-slate-500 to-slate-400';
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white pb-20 font-sans">
            {/* Header Gamificado Premium */}
            <div className="relative bg-[#1E293B] pb-8 pt-4 rounded-b-[2.5rem] shadow-2xl overflow-hidden">
                {/* Background Glow Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-10 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 px-6">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={onBack} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors backdrop-blur-sm border border-slate-700">
                            <ArrowLeft className="w-5 h-5 text-slate-300" />
                        </button>
                        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 backdrop-blur-sm">
                            <Crown className="w-4 h-4 text-yellow-400" />
                            <span className="font-bold text-sm text-yellow-400 tracking-wide">NÍVEL {progress.level}</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-1 tracking-tight">
                                Sua Jornada
                            </h1>
                            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-400" />
                                30 Dias de Evolução
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-emerald-400 tracking-tighter drop-shadow-glow">{progress.experience}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">XP Total</div>
                        </div>
                    </div>

                    {/* Barra de Progresso do Nível */}
                    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-700/50">
                        <div
                            className="absolute h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                            style={{ width: `${(progress.experience % 500) / 5}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Nível {progress.level}</span>
                        <span>{500 - (progress.experience % 500)} XP para Nível {progress.level + 1}</span>
                    </div>
                </div>
            </div>

            {/* Timeline Vertical */}
            <div className="px-6 py-8 space-y-6 relative">
                {/* Linha conectora da timeline */}
                <div className="absolute left-[2.85rem] top-12 bottom-12 w-0.5 bg-slate-800 -z-10"></div>

                {SOFT_SKILLS_JOURNEY.map((task, index) => {
                    const isLocked = isDayLocked(task.day);
                    const isCompleted = progress.completedDays.includes(task.day);
                    const isNext = task.day === progress.currentDay;
                    const isFuture = task.day > progress.currentDay;

                    return (
                        <div
                            key={task.day}
                            onClick={() => !isLocked && setSelectedTask(task)}
                            className={`
                                group relative pl-4 transition-all duration-500
                                ${isNext && !isLocked ? 'scale-105' : 'hover:scale-[1.02]'}
                                ${!isLocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                            `}
                        >
                            <div className="flex items-center gap-5">
                                {/* Ícone de Status (Timeline Node) */}
                                <div className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 shadow-lg relative z-10 transition-all duration-500
                                    ${isCompleted ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-900/50' :
                                        isNext && !isLocked ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-900/50 animate-pulse-glow' :
                                            'bg-slate-800 border-slate-700 text-slate-600'}
                                `}>
                                    {isCompleted ? <Check className="w-7 h-7 stroke-[3]" /> :
                                        isLocked ? <Lock className="w-6 h-6" /> :
                                            <span className="font-black text-xl">{task.day}</span>}

                                    {/* Conector pequeno para o card */}
                                    {isNext && !isLocked && (
                                        <div className="absolute -right-2 w-3 h-3 bg-indigo-400 rotate-45"></div>
                                    )}
                                </div>

                                {/* Card do Conteúdo */}
                                <div className={`
                                    flex-1 min-w-0 rounded-2xl p-4 border transition-all duration-300
                                    ${isCompleted ? 'bg-slate-800/50 border-emerald-900/30' :
                                        isNext && !isLocked ? 'bg-gradient-to-br from-indigo-900/80 to-slate-900 border-indigo-500/50 shadow-xl shadow-indigo-900/20' :
                                            'bg-slate-800/30 border-slate-800 opacity-60 grayscale'}
                                `}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`
                                            text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                                            bg-gradient-to-r ${getCategoryColor(task.category)} text-white shadow-sm
                                        `}>
                                            {task.category}
                                        </span>
                                        {!isLocked && !isCompleted && (
                                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1 drop-shadow-sm">
                                                <Zap className="w-3 h-3 fill-yellow-400" /> +{task.xpReward} XP
                                            </span>
                                        )}
                                    </div>

                                    <h3 className={`font-bold text-base leading-tight mb-1 ${isNext && !isLocked ? 'text-white' : 'text-slate-300'}`}>
                                        {isLocked && !isCompleted ? 'Conteúdo Bloqueado' : task.title}
                                    </h3>

                                    {isNext && isLocked && timeToNext ? (
                                        <div className="flex items-center gap-2 mt-2 text-xs text-orange-400 font-bold bg-orange-900/20 px-2 py-1 rounded-lg inline-flex">
                                            <Clock className="w-3 h-3" />
                                            Libera em {timeToNext}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 line-clamp-1">
                                            {isLocked ? 'Complete o dia anterior para desbloquear.' : 'Toque para ver a missão de hoje.'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal da Tarefa (Glassmorphism Premium) */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
                    <div className="bg-[#1E293B] w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden animate-slideUp flex flex-col relative">

                        {/* Botão Fechar */}
                        <button
                            onClick={() => {
                                setSelectedTask(null);
                                setShowCompletionSuccess(false);
                            }}
                            className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header do Modal com Imagem/Gradiente */}
                        <div className={`relative h-40 flex-shrink-0 bg-gradient-to-br ${getCategoryColor(selectedTask.category)}`}>
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#1E293B] to-transparent pt-20">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                                        Dia {selectedTask.day}
                                    </span>
                                    <span className="bg-black/30 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold text-yellow-400 uppercase tracking-wider border border-yellow-500/20 flex items-center gap-1">
                                        <Zap className="w-3 h-3 fill-yellow-400" /> {selectedTask.xpReward} XP
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-white leading-tight shadow-black drop-shadow-md">{selectedTask.title}</h2>
                            </div>
                        </div>

                        {/* Conteúdo Scrollável */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#1E293B]">

                            {!showCompletionSuccess ? (
                                <>
                                    {/* Ação Principal */}
                                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
                                        <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            Sua Missão
                                        </h3>
                                        <p className="text-white text-lg font-medium leading-relaxed">{selectedTask.action}</p>
                                    </div>

                                    {/* Por que importa */}
                                    <div className="pl-4 border-l-2 border-slate-700">
                                        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Contexto</h3>
                                        <p className="text-slate-300 text-sm leading-relaxed">{selectedTask.whyItMatters}</p>
                                    </div>

                                    {/* Cards Grid */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Leitura */}
                                        <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BookOpen className="w-4 h-4 text-blue-400" />
                                                <h3 className="text-blue-400 font-bold text-xs uppercase">Leitura Recomendada</h3>
                                            </div>
                                            <p className="text-slate-200 text-sm font-medium">{selectedTask.reading}</p>
                                        </div>

                                        {/* Reflexão */}
                                        <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BrainCircuit className="w-4 h-4 text-purple-400" />
                                                <h3 className="text-purple-400 font-bold text-xs uppercase">Para Refletir</h3>
                                            </div>
                                            <p className="text-slate-200 text-sm italic">"{selectedTask.reflection}"</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-10 text-center animate-fadeIn">
                                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                        <Award className="w-12 h-12 text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">Missão Cumprida!</h3>
                                    <p className="text-slate-400 mb-8 max-w-xs mx-auto">Você completou o desafio de hoje e está um passo mais perto da sua melhor versão.</p>

                                    <div className="bg-slate-800 rounded-xl p-4 w-full mb-8 border border-slate-700">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Recompensa Recebida</div>
                                        <div className="text-3xl font-black text-yellow-400 flex items-center justify-center gap-2">
                                            <Zap className="w-6 h-6 fill-yellow-400" /> +{selectedTask.xpReward} XP
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer com Ação */}
                        <div className="p-6 border-t border-slate-800 bg-[#1E293B]">
                            {!progress.completedDays.includes(selectedTask.day) && !showCompletionSuccess ? (
                                <button
                                    onClick={handleCompleteTask}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                >
                                    <Check className="w-5 h-5" />
                                    Concluir Missão
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setSelectedTask(null);
                                        setShowCompletionSuccess(false);
                                    }}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Voltar para a Jornada
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Level Up Overlay */}
            {showLevelUp && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 animate-fadeIn backdrop-blur-xl">
                    <div className="text-center relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px] animate-pulse"></div>
                        <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] animate-bounce" />
                        <h2 className="text-6xl font-black text-white mb-4 tracking-tighter italic transform -skew-x-6">LEVEL UP!</h2>
                        <div className="inline-block bg-yellow-500 text-black font-black text-xl px-6 py-2 rounded-full transform rotate-2 shadow-lg shadow-yellow-500/50">
                            NÍVEL {progress.level} ALCANÇADO
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
