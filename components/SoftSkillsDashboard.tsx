import React from 'react';
import { ChevronLeft, Lock, Check, Clock, Trophy, Zap, TrendingUp } from 'lucide-react';

interface CoachingProgress {
    currentDay: number;
    completedDays: number[];
    lastCompletedAt: string | null;
    totalXP: number;
    level: number;
    streak: number;
}

interface SoftSkillDay {
    day: number;
    title: string;
    xp: number;
}

interface SoftSkillsDashboardProps {
    progress: CoachingProgress;
    days: SoftSkillDay[];
    onDayClick: (day: number) => void;
    onBack: () => void;
}

export const SoftSkillsDashboard: React.FC<SoftSkillsDashboardProps> = ({
    progress,
    days,
    onDayClick,
    onBack
}) => {
    const { currentDay, completedDays, lastCompletedAt, totalXP, level, streak } = progress;

    // Calculate cooldown
    const getCooldownInfo = () => {
        if (!lastCompletedAt) return { isOnCooldown: false, remainingTime: 0 };

        const lastCompleted = new Date(lastCompletedAt).getTime();
        const now = Date.now();
        const elapsed = now - lastCompleted;
        const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

        if (elapsed < COOLDOWN_MS) {
            return {
                isOnCooldown: true,
                remainingTime: COOLDOWN_MS - elapsed
            };
        }

        return { isOnCooldown: false, remainingTime: 0 };
    };

    const formatTimeRemaining = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const { isOnCooldown, remainingTime } = getCooldownInfo();

    // Calculate XP progress to next level
    const xpPerLevel = 300;
    const xpInCurrentLevel = totalXP % xpPerLevel;
    const progressPercent = (xpInCurrentLevel / xpPerLevel) * 100;

    const getDayStatus = (dayNumber: number): 'completed' | 'available' | 'cooldown' | 'locked' => {
        if (completedDays.includes(dayNumber)) return 'completed';
        if (dayNumber === currentDay && !isOnCooldown) return 'available';
        if (dayNumber === currentDay && isOnCooldown) return 'cooldown';
        return 'locked';
    };

    const getDayStyle = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200';
            case 'available':
                return 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg shadow-purple-200/50 animate-pulse-slow';
            case 'cooldown':
                return 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200';
            default:
                return 'bg-slate-50 border-slate-200 opacity-60';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 text-white p-6 pb-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />

                <div className="relative z-10">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm mb-4"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="text-center">
                        <h1 className="text-2xl font-extrabold mb-2">Desafio 30 Dias</h1>
                        <div className="flex items-center justify-center gap-2 text-purple-100">
                            <Trophy className="w-4 h-4" />
                            <p className="text-sm font-medium">{completedDays.length}/30 dias completos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <div className="px-6 -mt-4 mb-6 relative z-20">
                <div className="bg-white rounded-2xl p-5 shadow-xl border border-purple-100">
                    {/* Level and XP */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Nível {level}</p>
                                <p className="text-xs text-slate-400">{totalXP} XP Total</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900 flex items-center gap-1">
                                🔥 {streak}
                            </p>
                            <p className="text-xs text-slate-500">Dias seguidos</p>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-600 mb-2">
                            <span>Progresso para Nível {level + 1}</span>
                            <span>{xpInCurrentLevel}/{xpPerLevel} XP</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Days List */}
            <div className="px-6 space-y-3">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Jornada de 30 Dias
                </h2>

                {days.map((day) => {
                    const status = getDayStatus(day.day);
                    const isClickable = status === 'available';

                    return (
                        <button
                            key={day.day}
                            onClick={() => isClickable && onDayClick(day.day)}
                            disabled={!isClickable}
                            className={`w-full p-4 rounded-2xl border-2 transition-all ${getDayStyle(status)} ${isClickable ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'cursor-not-allowed'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Day Number Circle */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${status === 'completed' ? 'bg-emerald-500 text-white' :
                                        status === 'available' ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' :
                                            status === 'cooldown' ? 'bg-amber-400 text-white' :
                                                'bg-slate-200 text-slate-400'
                                    }`}>
                                    {status === 'completed' ? <Check className="w-7 h-7" /> :
                                        status === 'cooldown' ? <Clock className="w-6 h-6" /> :
                                            status === 'locked' ? <Lock className="w-6 h-6" /> :
                                                `${day.day}`}
                                </div>

                                {/* Day Info */}
                                <div className="flex-1 text-left">
                                    <h3 className={`font-bold mb-1 ${status === 'locked' ? 'text-slate-400' : 'text-slate-900'
                                        }`}>
                                        Dia {day.day}: {day.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs">
                                        {status === 'completed' && (
                                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Concluído
                                            </span>
                                        )}
                                        {status === 'available' && (
                                            <span className="text-purple-600 font-bold">🎯 Disponível agora</span>
                                        )}
                                        {status === 'cooldown' && (
                                            <span className="text-amber-600 font-bold">
                                                ⏰ Disponível em {formatTimeRemaining(remainingTime)}
                                            </span>
                                        )}
                                        {status === 'locked' && (
                                            <span className="text-slate-400 font-bold flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Bloqueado
                                            </span>
                                        )}
                                        <span className={`${status === 'locked' ? 'text-slate-400' : 'text-purple-600'} font-bold flex items-center gap-1`}>
                                            <Zap className="w-3 h-3" /> +{day.xp} XP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
