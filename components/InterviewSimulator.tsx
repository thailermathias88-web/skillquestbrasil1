import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Square, Volume2, AlertCircle, CheckCircle, Loader2, ChevronLeft, RefreshCw, Keyboard, Send, Clock, Star } from 'lucide-react';
import { generateInterviewQuestion, evaluateInterviewAnswer } from '../services/geminiService';
import { UserProfile } from '../types';

interface InterviewSimulatorProps {
    userProfile: UserProfile;
    onBack: () => void;
}

type GameState = 'intro' | 'generating' | 'speaking_question' | 'listening' | 'processing' | 'feedback' | 'finished';

interface Interaction {
    question: string;
    answer: string;
    feedback: { score: number, feedback: string, improvement: string } | null;
}

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ userProfile, onBack }) => {
    const [gameState, setGameState] = useState<GameState>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [interactions, setInteractions] = useState<Interaction[]>([]);

    // Current Interaction State
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [currentFeedback, setCurrentFeedback] = useState<{ score: number, feedback: string, improvement: string } | null>(null);

    // Timer
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Error & Fallback States
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [useTextMode, setUseTextMode] = useState(false);

    // Speech Recognition
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
            window.speechSynthesis.cancel();
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        if (gameState === 'listening' && !useTextMode) {
            startTimer();
        } else if (gameState === 'listening' && useTextMode) {
            startTimer();
        } else {
            stopTimer();
        }
    }, [gameState, useTextMode]);

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(180);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    submitAnswer(); // Auto-submit on timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Text to Speech
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = 1.1;

            utterance.onstart = () => setGameState('speaking_question');
            utterance.onend = () => {
                setGameState('listening');
                if (!useTextMode) startListening();
            };

            window.speechSynthesis.speak(utterance);
        } else {
            setGameState('listening');
        }
    };

    const nextQuestion = async () => {
        if (currentQuestionIndex >= 5) {
            setGameState('finished');
            return;
        }

        setGameState('generating');
        setUserAnswer('');
        setCurrentFeedback(null);
        setErrorMsg(null);

        try {
            // Generate a random topic based on index to ensure variety
            const topics = ["Comportamental", "Técnico", "Situacional", "Soft Skills", "Carreira"];
            const topic = topics[currentQuestionIndex % topics.length];

            const data = await generateInterviewQuestion(userProfile.role, topic);
            setCurrentQuestion(data.question);
            speak(data.question);
        } catch (e) {
            const fallbackQ = "Fale sobre um projeto desafiador que você participou.";
            setCurrentQuestion(fallbackQ);
            speak(fallbackQ);
        }
    };

    const startListening = () => {
        setErrorMsg(null);
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setErrorMsg("Navegador sem suporte a voz.");
            setUseTextMode(true);
            return;
        }

        try {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.lang = 'pt-BR';
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onstart = () => setIsListening(true);

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        setUserAnswer(event.results[i][0].transcript);
                    }
                }
                if (finalTranscript) {
                    setUserAnswer(finalTranscript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech error", event);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    setErrorMsg("Permita o microfone.");
                    setUseTextMode(true);
                }
            };

            recognition.onend = () => setIsListening(false);
            recognition.start();
        } catch (e) {
            console.error(e);
            setUseTextMode(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const submitAnswer = async () => {
        stopListening();
        stopTimer();

        if (!userAnswer.trim()) {
            // If empty answer (timeout or manual click), handle gracefully
            setUserAnswer("Sem resposta.");
        }

        setGameState('processing');
        try {
            const evalResult = await evaluateInterviewAnswer(currentQuestion, userAnswer || "O candidato não respondeu.");
            setCurrentFeedback(evalResult);

            // Save interaction
            const newInteraction = {
                question: currentQuestion,
                answer: userAnswer,
                feedback: evalResult
            };
            setInteractions([...interactions, newInteraction]);

            setGameState('feedback');
        } catch (e) {
            setGameState('feedback');
        }
    };

    const handleContinue = () => {
        setCurrentQuestionIndex(prev => prev + 1);
        if (currentQuestionIndex + 1 < 5) {
            nextQuestion();
        } else {
            setGameState('finished');
        }
    };

    // --- RENDER ---

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans">
            {/* Header */}
            <div className="px-4 py-4 flex items-center justify-between bg-[#1e293b]/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-700">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-300" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="font-bold text-base">Simulador IA</h1>
                    {gameState !== 'intro' && gameState !== 'finished' && (
                        <span className="text-xs text-emerald-400 font-medium">Pergunta {currentQuestionIndex + 1}/5</span>
                    )}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                    AI
                </div>
            </div>

            <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full relative overflow-y-auto pb-24">

                {/* INTRO STATE */}
                {gameState === 'intro' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
                        <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.4)]">
                                <Mic className="w-14 h-14 text-white" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-[#0f172a]">
                                Beta
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Entrevista Realista
                            </h2>
                            <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">
                                Vou fazer 5 perguntas sobre <span className="text-white font-bold">{userProfile.role}</span>.
                                Você terá 3 minutos para responder cada uma.
                            </p>
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                onClick={nextQuestion}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Começar Agora
                            </button>

                            <button
                                onClick={() => { setUseTextMode(true); nextQuestion(); }}
                                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                Prefiro usar apenas texto
                            </button>
                        </div>
                    </div>
                )}

                {/* ACTIVE INTERVIEW STATES */}
                {(gameState === 'generating' || gameState === 'speaking_question' || gameState === 'listening' || gameState === 'processing' || gameState === 'feedback') && (
                    <div className="space-y-6">

                        {/* Chat Interface */}
                        <div className="space-y-6">
                            {/* AI Message (Question) */}
                            <div className="flex gap-3 animate-slideInLeft">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0 flex items-center justify-center">
                                    <Volume2 className={`w-5 h-5 text-white ${gameState === 'speaking_question' ? 'animate-pulse' : ''}`} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="bg-[#1e293b] p-4 rounded-2xl rounded-tl-none border border-slate-700 shadow-sm">
                                        {gameState === 'generating' ? (
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        ) : (
                                            <p className="text-slate-200 leading-relaxed">{currentQuestion}</p>
                                        )}
                                    </div>
                                    {gameState === 'listening' && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 pl-1">
                                            <Clock className="w-3 h-3" />
                                            <span className={`${timeLeft < 30 ? 'text-red-400 font-bold' : ''}`}>
                                                {formatTime(timeLeft)} restantes
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Message (Answer) */}
                            {(userAnswer || isListening) && (
                                <div className="flex gap-3 flex-row-reverse animate-slideInRight">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center">
                                        <UserIcon />
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-emerald-600/20 p-4 rounded-2xl rounded-tr-none border border-emerald-500/30 text-right">
                                            <p className="text-white leading-relaxed">
                                                {userAnswer}
                                                {isListening && <span className="inline-block w-1 h-4 bg-emerald-400 ml-1 animate-pulse align-middle"></span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Feedback Message */}
                            {gameState === 'feedback' && currentFeedback && (
                                <div className="flex gap-3 animate-fadeIn">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0 flex items-center justify-center">
                                        <Star className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="bg-[#1e293b] p-5 rounded-2xl rounded-tl-none border border-slate-700 shadow-lg">
                                            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-3">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avaliação</span>
                                                <div className="flex items-center gap-1 bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/30">
                                                    <span className="text-indigo-400 font-bold text-sm">{currentFeedback.score}/10</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-emerald-400 text-xs font-bold mb-1 flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Mandou bem
                                                    </p>
                                                    <p className="text-slate-300 text-sm">{currentFeedback.feedback}</p>
                                                </div>
                                                <div>
                                                    <p className="text-orange-400 text-xs font-bold mb-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> Dica de Mestre
                                                    </p>
                                                    <p className="text-slate-300 text-sm">{currentFeedback.improvement}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleContinue}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                                        >
                                            {currentQuestionIndex < 4 ? 'Próxima Pergunta' : 'Ver Resultado Final'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls Area (Fixed Bottom) */}
                        {gameState === 'listening' && (
                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a]/90 backdrop-blur-lg border-t border-slate-800 z-30">
                                <div className="max-w-lg mx-auto flex items-center gap-4">
                                    {!useTextMode ? (
                                        <>
                                            <button
                                                onClick={isListening ? stopListening : startListening}
                                                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isListening
                                                        ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse'
                                                        : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                                    }`}
                                            >
                                                {isListening ? (
                                                    <><Square className="w-5 h-5 fill-current" /> Parar</>
                                                ) : (
                                                    <><Mic className="w-5 h-5" /> Falar</>
                                                )}
                                            </button>

                                            {userAnswer && !isListening && (
                                                <button
                                                    onClick={submitAnswer}
                                                    className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"
                                                >
                                                    <Send className="w-6 h-6" />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                value={userAnswer}
                                                onChange={(e) => setUserAnswer(e.target.value)}
                                                placeholder="Digite sua resposta..."
                                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 text-white focus:border-indigo-500 outline-none"
                                                onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                                            />
                                            <button
                                                onClick={submitAnswer}
                                                className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* FINISHED STATE */}
                {gameState === 'finished' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                            <Trophy className="w-12 h-12 text-emerald-400" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Entrevista Concluída!</h2>
                            <p className="text-slate-400">Você praticou 5 perguntas essenciais.</p>
                        </div>

                        <div className="w-full bg-[#1e293b] rounded-2xl border border-slate-700 p-6">
                            <div className="text-sm text-slate-400 mb-4 uppercase tracking-wider font-bold">Média Final</div>
                            <div className="text-5xl font-extrabold text-white mb-2">
                                {(interactions.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / 5).toFixed(1)}
                            </div>
                            <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={onBack}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-2xl transition-colors"
                        >
                            Voltar ao Menu
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

// Simple User Icon Component
const UserIcon = () => (
    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const Trophy = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
