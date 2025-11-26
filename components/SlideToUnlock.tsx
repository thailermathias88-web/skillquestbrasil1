import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface SlideToUnlockProps {
    onUnlock: () => void;
    text?: string;
}

export const SlideToUnlock: React.FC<SlideToUnlockProps> = ({
    onUnlock,
    text = "Deslize para começar"
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(0);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const UNLOCK_THRESHOLD = 0.8;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current || !sliderRef.current) return;

            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();
            const sliderWidth = sliderRef.current.offsetWidth;
            const maxPosition = containerRect.width - sliderWidth;

            let newPosition = e.clientX - containerRect.left - sliderWidth / 2;
            newPosition = Math.max(0, Math.min(newPosition, maxPosition));

            setPosition(newPosition);

            if (newPosition / maxPosition >= UNLOCK_THRESHOLD && !isUnlocked) {
                setIsUnlocked(true);
                setIsDragging(false);
                setTimeout(() => {
                    onUnlock();
                }, 300);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging || !containerRef.current || !sliderRef.current) return;

            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();
            const sliderWidth = sliderRef.current.offsetWidth;
            const maxPosition = containerRect.width - sliderWidth;

            const touch = e.touches[0];
            let newPosition = touch.clientX - containerRect.left - sliderWidth / 2;
            newPosition = Math.max(0, Math.min(newPosition, maxPosition));

            setPosition(newPosition);

            if (newPosition / maxPosition >= UNLOCK_THRESHOLD && !isUnlocked) {
                setIsUnlocked(true);
                setIsDragging(false);
                setTimeout(() => {
                    onUnlock();
                }, 300);
            }
        };

        const handleEnd = () => {
            if (!isUnlocked) {
                setPosition(0);
            }
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, isUnlocked, onUnlock]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-16 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 rounded-[2rem] overflow-hidden shadow-2xl border-3 border-white"
            style={{
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.15), inset 0 2px 0 rgba(255,255,255,0.5)'
            }}
        >
            {/* Shimmer effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s infinite'
                }}
            />

            {/* Background track with gradient */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                style={{
                    opacity: isUnlocked ? 0 : Math.max(0.4, 1 - position / 150),
                    transition: isUnlocked ? 'opacity 0.3s' : 'none'
                }}
            >
                <p className="text-sm font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wider uppercase drop-shadow-sm">
                    {text}
                </p>
            </div>

            {/* Progress fill with animated gradient */}
            <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 transition-all duration-200"
                style={{
                    width: position + 64,
                    opacity: 0.2,
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                }}
            />

            {/* Glow trail */}
            {isDragging && position > 0 && (
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-32 h-12 bg-gradient-to-r from-purple-500/30 to-transparent rounded-full blur-xl"
                    style={{
                        left: Math.max(0, position - 40)
                    }}
                />
            )}

            {/* Slider button */}
            <div
                ref={sliderRef}
                onMouseDown={() => !isUnlocked && setIsDragging(true)}
                onTouchStart={() => !isUnlocked && setIsDragging(true)}
                className={`absolute left-0 top-0 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 ${isUnlocked ? 'scale-110' : isDragging ? 'scale-105' : 'scale-100'
                    }`}
                style={{
                    transform: `translateX(${position}px)`,
                    transition: isDragging || isUnlocked ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    background: isUnlocked
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)',
                    boxShadow: isUnlocked
                        ? '0 10px 40px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.3)'
                        : isDragging
                            ? '0 12px 40px rgba(139, 92, 246, 0.4), 0 0 25px rgba(236, 72, 153, 0.35)'
                            : '0 8px 32px rgba(139, 92, 246, 0.35), 0 0 16px rgba(236, 72, 153, 0.25)'
                }}
            >
                {/* Inner glow ring */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />

                <div className="relative z-10">
                    {isUnlocked ? (
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    ) : (
                        <div className="relative">
                            <ChevronRight className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={3} />
                            {!isDragging && (
                                <>
                                    <ChevronRight className="w-6 h-6 text-white/60 absolute top-0 left-1 animate-pulse" strokeWidth={3} />
                                    <ChevronRight className="w-6 h-6 text-white/40 absolute top-0 left-2 animate-pulse" strokeWidth={3} style={{ animationDelay: '0.3s' }} />
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Ripple effect when dragging */}
                {isDragging && !isUnlocked && (
                    <div className="absolute inset-0 rounded-full border-3 border-white/30 animate-ping" />
                )}
            </div>
        </div>
    );
};
