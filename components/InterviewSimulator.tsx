import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, ChevronLeft, RefreshCw, Send, Clock, Star, Sparkles, Trophy, MessageSquare, CheckCircle2 } from 'lucide-react';
import { generateInterviewQuestion, evaluateInterviewAnswer } from '../services/geminiService';
import { UserProfile } from '../types';

interface InterviewSimulatorProps {
    userProfile: UserProfile;
    onBack: () => void;
}

type GameState = 'intro' | 'generating' | 'listening' | 'processing' | 'feedback' | 'finished';

interface Interaction {
    question: string;
    answer: string;
    feedback: { score: number, feedback: string, improvement: string } | null;
}

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({ userProfile, onBack }) => {
    const [gameState, setGameState] = useState<GameState>('intro');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [interactions, setInteractions] = useState<Interaction[]>([]);

    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [currentFeedback, setCurrentFeedback] = useState<{ score: number, feedback: string, improvement: string } | null>(null);

    const [timeLeft, setTimeLeft] = useState(180);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [useTextMode, setUseTextMode] = useState(false);

    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { }
            }
        };
    }, []);

    useEffect(() => {
        if (gameState === 'listening') {
            startTimer();
        } else {
            stopTimer();
        }
    }, [gameState]);

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(180);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopTimer();
                    submitAnswer();
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

    const nextQuestion = async () => {
        if (currentQuestionIndex >= 5) {
            setGameState('finished');
            return;
        }

        setGameState('generating');
        setUserAnswer('');
        setCurrentFeedback(null);
        setErrorMsg(null);
        setIsRecording(false);
        setIsListening(false);

        try {
            const topics = ["Comportamental", "Técnico", "Situacional", "Soft Skills", "Carreira"];
            const topic = topics[currentQuestionIndex % topics.length];
            const data = await generateInterviewQuestion(userProfile.role, topic);
            setCurrentQuestion(data.question);
            setGameState('listening');
        } catch (e) {
            const fallbackQ = "Fale sobre um projeto desafiador que você participou e como você lidou com obstáculos.";
            setCurrentQuestion(fallbackQ);
            setGameState('listening');
        }
    };

    const startListening = () => {
        setErrorMsg(null);

        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setErrorMsg("Navegador sem suporte a voz. Use o modo texto.");
            setUseTextMode(true);
            return;
        }

        try {
            // Stop any existing recognition
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { }
            }

            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.lang = 'pt-BR';
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                setIsRecording(true);
                setErrorMsg(null);
            };

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    setUserAnswer(prev => (prev + ' ' + finalTranscript).trim());
                } else if (interimTranscript) {
                    // Show interim for real-time feedback
                    setUserAnswer(prev => (prev + ' ' + interimTranscript).trim());
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech error:", event.error);
                setIsListening(false);
                setIsRecording(false);

                if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                    setErrorMsg("Permita o acesso ao microfone.");
                    setUseTextMode(true);
                } else if (event.error === 'no-speech') {
                    setErrorMsg("Nenhuma fala detectada. Tente novamente.");
                } else if (event.error === 'network') {
                    setErrorMsg("Erro de conexão. Verifique sua internet.");
                } else {
                    setErrorMsg("Erro ao reconhecer voz. Tente o modo texto.");
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                setIsRecording(false);
            };

            recognition.start();
        } catch (e) {
            console.error("Recognition error:", e);
            setErrorMsg("Erro ao iniciar gravação. Use o modo texto.");
            setUseTextMode(true);
            setIsListening(false);
            setIsRecording(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
        }
        setIsListening(false);
        setIsRecording(false);
    };

    const submitAnswer = async () => {
        stopListening();
        stopTimer();

        const finalAnswer = userAnswer.trim() || "Sem resposta.";
        setUserAnswer(finalAnswer);

        setGameState('processing');
        try {
            const evalResult = await evaluateInterviewAnswer(currentQuestion, finalAnswer);
            setCurrentFeedback(evalResult);

            const newInteraction = {
                question: currentQuestion,
                answer: finalAnswer,
                feedback: evalResult
            };
            setInteractions([...interactions, newInteraction]);

            setGameState('feedback');
        } catch (e) {
            setCurrentFeedback({
                score: 0,
                feedback: "Não foi possível avaliar.",
                improvement: "Tente novamente."
            });
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

    const getScoreColor = (score: number) => {
        if (score >= 9) return 'from-emerald-500 to-teal-500';
        if (score >= 7) return 'from-blue-500 to-cyan-500';
        if (score >= 5) return 'from-amber-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 9) return 'Excepcional';
        if (score >= 7) return 'Boa';
        if (score >= 5) return 'Adequada';
        if (score >= 3) return 'Fraca';
        return 'Inadequada';
    };

    const totalScore = interactions.reduce((sum, i) => sum + (i.feedback?.score || 0), 0);
    const avgScore = interactions.length > 0 ? (totalScore / interactions.length).toFixed(1) : '0.0';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 pb-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />

                <div className="relative z-10">
                    <button onClick={onBack} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm mb-4">
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-extrabold mb-1">Simulador de Entrevista</h1>
                        <p className="text-purple-100 text-sm">Pratique com IA e receba feedback detalhado</p>

                        {gameState !== 'intro' && gameState !== 'finished' && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-bold">Pergunta {currentQuestionIndex + 1}/5</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-6 max-w-2xl mx-auto relative z-20">

                {/* INTRO STATE */}
                {gameState === 'intro' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-3">Como Funciona</h2>
                            <ul className="space-y-3 text-slate-700">
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-purple-600 text-sm font-bold">1</span>
                                    </div>
                                    <span>Responda <span className="font-bold">5 perguntas</span> de entrevista</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-purple-600 text-sm font-bold">2</span>
                                    </div>
                                    <span>Você tem <span className="font-bold">3 minutos</span> para cada resposta</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-purple-600 text-sm font-bold">3</span>
                                    </div>
                                    <span>A IA avalia sua resposta com <span className="font-bold">feedback detalhado</span></span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                                <h3 className="font-bold text-amber-900">Dica Pro</h3>
                            </div>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                Use o método <span className="font-bold">STAR</span>: Situação, Tarefa, Ação, Resultado.
                                Seja específico e dê exemplos reais da sua experiência.
                            </p>
                        </div>

                        <button
                            onClick={nextQuestion}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Iniciar Simulação
                        </button>
                    </div>
                )}

                {/* GENERATING STATE */}
                {gameState === 'generating' && (
                    <div className="bg-white rounded-2xl p-12 shadow-lg border border-purple-100 text-center animate-fadeIn">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Gerando pergunta...</h3>
                        <p className="text-slate-600 text-sm">Preparando uma questão personalizada para você</p>
                    </div>
                )}

                {/* LISTENING STATE */}
                {gameState === 'listening' && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Question Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-indigo-900">Pergunta</h3>
                            </div>
                            <p className="text-lg text-slate-800 leading-relaxed">{currentQuestion}</p>
                        </div>

                        {/* Timer */}
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    <span className="font-bold text-purple-900">Tempo restante</span>
                                </div>
                                <span className={`text-2xl font-bold ${timeLeft < 30 ? 'text-red-600 animate-pulse' : 'text-purple-900'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* Answer Area */}
                        {!useTextMode ? (
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                                <div className="text-center mb-4">
                                    <button
                                        onClick={isRecording ? stopListening : startListening}
                                        disabled={isListening && !isRecording}
                                        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl transition-all transform ${isRecording
                                            ? 'bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 scale-110 animate-pulse'
                                            : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 hover:scale-105'
                                            } active:scale-95`}
                                    >
                                        {isRecording ? (
                                            <MicOff className="w-10 h-10 text-white" />
                                        ) : (
                                            <Mic className="w-10 h-10 text-white" />
                                        )}
                                    </button>
                                    <p className="mt-4 text-sm font-medium text-slate-700">
                                        {isRecording ? 'Gravando... Clique para pausar' : 'Clique para gravar sua resposta'}
                                    </p>
                                    {isRecording && (
                                        <div className="flex items-center justify-center gap-1 mt-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    )}
                                </div>

                                {userAnswer && (
                                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                        <p className="text-slate-700 leading-relaxed">{userAnswer}</p>
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                        <p className="text-red-700 text-sm">{errorMsg}</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setUseTextMode(true)}
                                    className="w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Prefiro digitar minha resposta
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Digite sua resposta aqui..."
                                    className="w-full h-40 p-4 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={submitAnswer}
                            disabled={!userAnswer.trim()}
                            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${userAnswer.trim()
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/50 transform hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <Send className="w-5 h-5" />
                            Enviar Resposta
                        </button>
                    </div>
                )}

                {/* PROCESSING STATE */}
                {gameState === 'processing' && (
                    <div className="bg-white rounded-2xl p-12 shadow-lg border border-purple-100 text-center animate-fadeIn">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Analisando sua resposta...</h3>
                        <p className="text-slate-600 text-sm">A IA está avaliando conteúdo, clareza e profundidade</p>
                    </div>
                )}

                {/* FEEDBACK STATE */}
                {gameState === 'feedback' && currentFeedback && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Score Card */}
                        <div className={`bg-gradient-to-br ${getScoreColor(currentFeedback.score)} rounded-2xl p-6 shadow-xl text-white`}>
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                                    <Star className="w-5 h-5" />
                                    <span className="font-bold">{getScoreLabel(currentFeedback.score)}</span>
                                </div>
                                <div className="text-6xl font-extrabold mb-2">{currentFeedback.score.toFixed(1)}</div>
                                <p className="text-white/90 text-sm">de 10.0 pontos</p>
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-emerald-100">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-emerald-900">O que você fez bem</h3>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{currentFeedback.feedback}</p>
                        </div>

                        {/* Improvement */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-blue-900">Como melhorar</h3>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{currentFeedback.improvement}</p>
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={handleContinue}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {currentQuestionIndex + 1 < 5 ? 'Próxima Pergunta' : 'Ver Resultado Final'}
                        </button>
                    </div>
                )}

                {/* FINISHED STATE */}
                {gameState === 'finished' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-8 shadow-xl text-white text-center">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Trophy className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-extrabold mb-2">Simulação Concluída!</h2>
                            <p className="text-purple-100 mb-4">Você respondeu todas as 5 perguntas</p>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
                                <p className="text-sm text-purple-100 mb-1">Pontuação Média</p>
                                <p className="text-4xl font-extrabold">{avgScore}</p>
                            </div>
                        </div>

                        {/* Individual Scores */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                            <h3 className="font-bold text-slate-900 mb-4">Resumo das Perguntas</h3>
                            <div className="space-y-3">
                                {interactions.map((interaction, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-700">Pergunta {idx + 1}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1">{interaction.question}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(interaction.feedback?.score || 0)} text-white font-bold text-sm`}>
                                            {interaction.feedback?.score.toFixed(1)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setGameState('intro');
                                    setCurrentQuestionIndex(0);
                                    setInteractions([]);
                                    setUserAnswer('');
                                    setCurrentFeedback(null);
                                }}
                                className="flex-1 py-4 bg-white hover:bg-slate-50 text-purple-600 font-bold rounded-2xl shadow-lg border-2 border-purple-600 transition-all"
                            >
                                <RefreshCw className="w-5 h-5 inline mr-2" />
                                Tentar Novamente
                            </button>
                            <button
                                onClick={onBack}
                                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/50 transition-all"
                            >
                                Concluir
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
