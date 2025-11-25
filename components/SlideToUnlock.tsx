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

    const UNLOCK_THRESHOLD = 0.8; // 80% do caminho

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

            // Check if unlocked
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

            // Check if unlocked
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
            className="relative w-full h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full overflow-hidden shadow-inner"
        >
            {/* Background track */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                    opacity: isUnlocked ? 0 : 1 - position / 200,
                    transition: isUnlocked ? 'opacity 0.3s' : 'none'
                }}
            >
                <p className="text-sm font-bold text-purple-400 tracking-wide uppercase">
                    {text}
                </p>
            </div>

            {/* Progress fill */}
            <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-200"
                style={{
                    width: position + 64,
                    opacity: 0.3
                }}
            />

            {/* Slider button */}
            <div
                ref={sliderRef}
                onMouseDown={() => !isUnlocked && setIsDragging(true)}
                onTouchStart={() => !isUnlocked && setIsDragging(true)}
                className={`absolute left-0 top-0 w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${isUnlocked ? 'scale-110' : isDragging ? 'scale-105' : 'scale-100'
                    }`}
                style={{
                    transform: `translateX(${position}px)`,
                    transition: isDragging || isUnlocked ? 'none' : 'transform 0.3s ease-out'
                }}
            >
                <div className="relative">
                    {isUnlocked ? (
                        <div className="w-6 h-6 rounded-full border-3 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        </div>
                    ) : (
                        <>
                            <ChevronRight className="w-6 h-6 text-white absolute" />
                            <ChevronRight className="w-6 h-6 text-white absolute animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
