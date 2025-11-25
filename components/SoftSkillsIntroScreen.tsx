import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';

interface SoftSkillsIntroScreenProps {
    onStart: () => void;
    onBack: () => void;
}

export const SoftSkillsIntroScreen: React.FC<SoftSkillsIntroScreenProps> = ({ onStart, onBack }) => {
    const [swipeProgress, setSwipeProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = () => {
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !containerRef.current || !buttonRef.current) return;

        const touch = e.touches[0];
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonWidth = buttonRef.current.offsetWidth;
        const maxDistance = containerRect.width - buttonWidth - 8;

        const relativeX = touch.clientX - containerRect.left - buttonWidth / 2;
        const progress = Math.max(0, Math.min(relativeX / maxDistance, 1));

        setSwipeProgress(progress);

        if (progress >= 0.95) {
            onStart();
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (swipeProgress < 0.95) {
            setSwipeProgress(0);
        }
    };

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current || !buttonRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonWidth = buttonRef.current.offsetWidth;
        const maxDistance = containerRect.width - buttonWidth - 8;

        const relativeX = e.clientX - containerRect.left - buttonWidth / 2;
        const progress = Math.max(0, Math.min(relativeX / maxDistance, 1));

        setSwipeProgress(progress);

        if (progress >= 0.95) {
            onStart();
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (swipeProgress < 0.95) {
            setSwipeProgress(0);
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
            return () => window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans relative overflow-hidden flex flex-col">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(251,146,60,0.15),transparent_50%)]"></div>

            {/* Header */}
            <div className="relative z-10 pt-6 px-5 pb-4">
                <button onClick={onBack} className="text-slate-400 text-xs hover:text-white transition-colors mb-4">← Voltar</button>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-xs font-bold">JORNADA PREMIUM</span>
                    </div>

                    <h1 className="text-2xl font-black text-white mb-2 tracking-tight leading-tight">
                        Transforme Sua<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">Carreira em 30 Dias</span>
                    </h1>

                    <p className="text-slate-300 text-xs max-w-[280px] mx-auto leading-relaxed">
                        Desenvolva as habilidades que os recrutadores mais valorizam.
                    </p>
                </div>
            </div>

            {/* Motivational Cards Grid */}
            <div className="relative z-10 px-5 flex-1 overflow-y-auto pb-6">
                <div className="space-y-3 mb-6">
                    {/* Card 1: Inteligência Emocional */}
                    <div className="relative h-40 rounded-2xl overflow-hidden shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>

                        <div className="relative h-full p-4 flex flex-col justify-between">
                            <div>
                                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 mb-2">
                                    <span className="text-white text-[9px] font-bold uppercase tracking-wide">Módulo 1</span>
                                </div>
                                <h3 className="text-white font-black text-lg mb-1.5 leading-tight">
                                    Inteligência<br />Emocional
                                </h3>
                                <p className="text-purple-100 text-[10px] leading-relaxed">
                                    "Domine suas emoções antes que elas dominem você. Aprenda a ler pessoas e situações com maestria."
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-white/80 text-[9px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <span>10 dias de transformação</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Liderança */}
                    <div className="relative h-40 rounded-2xl overflow-hidden shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-rose-500"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>

                        <div className="relative h-full p-4 flex flex-col justify-between">
                            <div>
                                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 mb-2">
                                    <span className="text-white text-[9px] font-bold uppercase tracking-wide">Módulo 2</span>
                                </div>
                                <h3 className="text-white font-black text-lg mb-1.5 leading-tight">
                                    Liderança &<br />Influência
                                </h3>
                                <p className="text-orange-100 text-[10px] leading-relaxed">
                                    "Líderes não nascem prontos, eles se constroem. Inspire, motive e guie pessoas rumo ao sucesso."
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-white/80 text-[9px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <span>10 dias de impacto</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Produtividade */}
                    <div className="relative h-40 rounded-2xl overflow-hidden shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>

                        <div className="relative h-full p-4 flex flex-col justify-between">
                            <div>
                                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 mb-2">
                                    <span className="text-white text-[9px] font-bold uppercase tracking-wide">Módulo 3</span>
                                </div>
                                <h3 className="text-white font-black text-lg mb-1.5 leading-tight">
                                    Produtividade<br />Extrema
                                </h3>
                                <p className="text-emerald-100 text-[10px] leading-relaxed">
                                    "Trabalhe de forma inteligente, não apenas dura. Multiplique seus resultados sem sacrificar sua saúde."
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-white/80 text-[9px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <span>10 dias de performance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom CTA */}
            <div className="relative z-10 px-5 pb-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-4">
                {/* Swipe to Start Button */}
                <div
                    ref={containerRef}
                    className="relative w-full h-16 bg-white/10 rounded-full border border-white/20 overflow-hidden backdrop-blur-sm"
                    onMouseMove={handleMouseMove}
                >
                    {/* Background Progress */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 via-orange-500 to-purple-500 transition-all duration-200"
                        style={{ width: `${swipeProgress * 100}%` }}
                    ></div>

                    {/* Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pl-8">
                        <span className="text-white font-black text-sm tracking-wider">
                            {swipeProgress > 0.5 ? '🚀 SOLTE PARA COMEÇAR' : 'ARRASTE PARA INICIAR'}
                        </span>
                    </div>

                    {/* Draggable Button */}
                    <div
                        ref={buttonRef}
                        className="absolute top-2 left-2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform"
                        style={{
                            transform: `translateX(${swipeProgress * (containerRef.current ? containerRef.current.offsetWidth - 64 : 0)}px)`,
                            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                    >
                        <ChevronRight className="w-6 h-6 text-slate-900" />
                    </div>
                </div>

                <p className="text-center text-slate-400 text-[10px] mt-3">
                    ✨ Apenas 15 minutos por dia • Resultados garantidos
                </p>
            </div>
        </div>
    );
};
