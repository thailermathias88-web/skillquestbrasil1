import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AppView, AnalysisResult, DiscResult, DiscAnalysisDetails, SkillGapAnalysis, Skill, SoftSkillTask, InterviewPrepData, SalaryData, QuizData } from './types';
import { Logo } from './components/Logo';
import { analyzeCandidateProfile, generateDiscFeedback, generateSkillGapAnalysis, getSalaryData, getInterviewPrep } from './services/geminiService';
import { DiscTestModal } from './components/DiscTestModal';
import { PremiumModal } from './components/PremiumModal';
import {
    Home, Briefcase, GraduationCap, MessageSquare, User,
    ArrowRight, Upload, FileText, Check, Lock, ChevronRight,
    Mic, Play, DollarSign, Calendar, Search,
    BarChart3, Zap, X, ChevronLeft, Lightbulb, ThumbsUp, Loader2, MapPin, Star, Menu,
    BrainCircuit, Sparkles, Target, AlertCircle, Download, Clock, Crown, Rocket, CheckCircle, TrendingUp, Users, Mail, Share2, Copy, Unlock, Send, Bot, RefreshCw, BookOpen, PenTool, ChevronDown, ChevronUp, Shirt, Eye, Map, TrendingDown, BriefcaseBusiness, Code, Laptop, Trophy, ClipboardCheck, LayoutList, CalendarClock, Video, UserPlus
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { SupabaseStatus } from './components/SupabaseStatus';

// --- TYPES FOR UI STATE ---
enum Screen {
    LANDING = 'LANDING',
    REGISTER = 'REGISTER', // Added for Backend Simulation
    AUTH = 'AUTH',
    ONBOARDING = 'ONBOARDING',
    DASHBOARD = 'DASHBOARD',
    SERVICES = 'SERVICES',
    CV_OPTIMIZER = 'CV_OPTIMIZER',
    SOFT_SKILLS = 'SOFT_SKILLS',
    INTERVIEW = 'INTERVIEW',
    SALARY = 'SALARY',
    MENTORSHIP = 'MENTORSHIP',
    PROFILE = 'PROFILE',
    DISC_RESULT = 'DISC_RESULT'
}

// --- SHARED COMPONENTS ---

const CircularProgress: React.FC<{ percentage: number, color: string, size?: number, strokeWidth?: number }> = ({
    percentage,
    color,
    size = 60,
    strokeWidth = 6
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-slate-200"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    style={{ color: color }}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className="absolute text-xs font-bold text-slate-700">{percentage}%</span>
        </div>
    );
};

const SkillAnalysisModal: React.FC<{
    skill: Skill | null,
    role: string,
    onClose: () => void
}> = ({ skill, role, onClose }) => {
    const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (skill) {
                setLoading(true);
                const result = await generateSkillGapAnalysis(skill.name, skill.score, role);
                setAnalysis(result);
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [skill, role]);

    if (!skill) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{skill.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">{skill.level}</span>
                            <span className="text-xs text-slate-400">Atual: {skill.score}%</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300">
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
                            <p className="text-sm font-medium">Analisando gaps de conhecimento...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Current Status */}
                            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                                <h4 className="font-bold text-blue-800 text-sm mb-1 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Diagnóstico Atual
                                </h4>
                                <p className="text-sm text-blue-900 leading-relaxed">
                                    "{analysis?.currentStatus}"
                                </p>
                            </div>

                            {/* Missing Points */}
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-orange-500" />
                                    O que falta para 100%?
                                </h4>
                                <ul className="space-y-3">
                                    {analysis?.missingPoints?.map((point, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Plan */}
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                                <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                                    <Zap className="w-5 h-5" /> Dica de Ouro
                                </h4>
                                <p className="text-sm text-emerald-900 leading-relaxed italic">
                                    {analysis?.actionPlan}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {!loading && (
                    <div className="p-4 border-t border-slate-100 bg-white">
                        <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">
                            Entendido
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const BottomNav: React.FC<{ current: Screen, onNavigate: (s: Screen) => void }> = ({ current, onNavigate }) => {
    const navItems = [
        { id: Screen.DASHBOARD, icon: Home, label: 'Início' },
        { id: Screen.SERVICES, icon: Rocket, label: 'Recursos' },
        { id: Screen.MENTORSHIP, icon: GraduationCap, label: 'Mentoria' }, // Changed from Salary/Vagas
        { id: Screen.PROFILE, icon: User, label: 'Perfil' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-6 pb-6 z-50">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = current === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                        >
                            <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const Header: React.FC<{ title: string, onBack?: () => void, rightAction?: React.ReactNode }> = ({ title, onBack, rightAction }) => (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            {onBack && (
                <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-full">
                    <ArrowRight className="w-6 h-6 text-slate-700 rotate-180" />
                </button>
            )}
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        </div>
        {rightAction}
    </header>
);

const LoadingOverlay: React.FC = () => (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fadeIn">
        <Loader2 className="w-12 h-12 animate-spin text-[#fbbf24] mb-4" />
        <h2 className="text-xl font-bold">Analisando seu Perfil...</h2>
        <p className="text-white/80 text-sm mt-2">Nossa IA está lendo seu currículo em detalhes.</p>
    </div>
);

// --- SPECIFIC SCREENS ---

const RegisterScreen: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate backend call
        setTimeout(() => {
            setLoading(false);
            onRegister();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white p-6 pb-12 flex flex-col">
            <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                <div className="mb-8 text-center">
                    <Logo className="h-12 justify-center mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Crie sua conta</h2>
                    <p className="text-slate-500 text-sm">Comece sua jornada profissional hoje.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Seu nome"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="seu@email.com"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="******"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#009c3b] hover:bg-emerald-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cadastrar Grátis"}
                        </button>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
                    </p>
                </form>
            </div>
        </div>
    );
};

const MentorshipScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const mentors = [
        {
            name: "Luciene Silva",
            role: "Mentora Comportamental & Vendas",
            topics: ["Inteligência Emocional", "Atendimento", "Vendas", "Inteligência Social"],
            color: "bg-pink-100 text-pink-700"
        },
        {
            name: "Thailer Mathias",
            role: "Estrategista de Gestão & Tech",
            topics: ["KPIs", "Finanças Corporativas", "Inteligência Artificial"],
            color: "bg-blue-100 text-blue-700"
        }
    ];

    const schedule = [
        { day: "10", month: "OUT", time: "19:00", mentor: "Luciene Silva", title: "Inteligência Social no Corporativo", type: "Comportamento" },
        { day: "24", month: "OUT", time: "19:00", mentor: "Thailer Mathias", title: "Dominando KPIs e Métricas", type: "Gestão" },
        { day: "07", month: "NOV", time: "19:00", mentor: "Luciene Silva", title: "Máquina de Vendas & Atendimento", type: "Vendas" },
        { day: "21", month: "NOV", time: "19:00", mentor: "Thailer Mathias", title: "IA e Finanças na Prática", type: "Tech" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <Header title="Mentoria em Grupo" onBack={onBack} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-b-[30px] shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">AO VIVO</span>
                    <span className="text-blue-200 text-xs font-medium border border-blue-400/30 px-2 py-0.5 rounded">Quinzenal</span>
                </div>

                <h1 className="text-2xl font-bold mb-2">Acelere sua Carreira com Experts</h1>
                <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
                    Sessões exclusivas sobre Comportamento, Vendas, Gestão e IA para você se destacar no mercado.
                </p>
            </div>

            <div className="px-6 space-y-8">

                {/* Mentors Section */}
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Nossos Mentores
                    </h3>
                    <div className="grid gap-4">
                        {mentors.map((m, i) => (
                            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${m.color}`}>
                                    {m.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{m.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium mb-2">{m.role}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {m.topics.map((t, idx) => (
                                            <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] px-2 py-1 rounded border border-slate-100">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Schedule Section */}
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-emerald-500" /> Próximas Sessões
                    </h3>
                    <div className="space-y-4">
                        {schedule.map((s, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 relative overflow-hidden">
                                {i === 0 && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">PRÓXIMA</div>}

                                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl px-4 py-2 min-w-[70px]">
                                    <span className="text-xl font-bold text-slate-900">{s.day}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{s.month}</span>
                                </div>

                                <div className="flex-1 py-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{s.type}</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {s.time}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{s.title}</h4>
                                    <p className="text-xs text-slate-500">com {s.mentor}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                    <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 transition-colors">
                        <Video className="w-5 h-5" />
                        Acessar Sala de Transmissão
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3">Link liberado 10 minutos antes do início.</p>
                </div>

            </div>
        </div>
    );
};

const OnboardingScreen: React.FC<{ onAnalyze: (data: any) => void, isLoading: boolean }> = ({ onAnalyze, isLoading }) => {
    const [role, setRole] = useState('');
    const [experience, setExperience] = useState('Junior');
    const [motivation, setMotivation] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !role) return;
        onAnalyze({ role, experience, motivation, file });
    };

    return (
        <div className="min-h-screen bg-white p-6 pb-12">
            <Header title="Configurar Perfil" />
            <div className="mt-6 max-w-lg mx-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Vamos começar! 🚀</h2>
                    <p className="text-slate-500 text-sm">Preencha os dados abaixo para nossa IA analisar seu perfil.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cargo Alvo</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="Ex: Desenvolvedor Front-end"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nível de Experiência</label>
                            <select
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 outline-none"
                            >
                                <option value="Estágio">Estágio</option>
                                <option value="Júnior">Júnior (0-2 anos)</option>
                                <option value="Pleno">Pleno (3-5 anos)</option>
                                <option value="Sênior">Sênior (5+ anos)</option>
                                <option value="Liderança">Liderança / Tech Lead</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Qual sua maior motivação hoje?</label>
                            <textarea
                                value={motivation}
                                onChange={(e) => setMotivation(e.target.value)}
                                placeholder="Ex: Quero trabalhar em empresas internacionais..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 outline-none h-24 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Seu Currículo (PDF/Imagem)</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                                <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${file ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                    {file ? <Check className="w-6 h-6 text-emerald-600" /> : <Upload className="w-6 h-6 text-slate-400" />}
                                </div>
                                <p className="text-sm font-bold text-slate-700">{file ? file.name : 'Toque para enviar'}</p>
                                <p className="text-xs text-slate-400 mt-1">PDF, JPG ou PNG</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || !role || isLoading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Analisando...
                            </>
                        ) : (
                            <>
                                Gerar Análise Completa <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const SoftSkillsScreen: React.FC<{ plan: SoftSkillTask[], onBack: () => void }> = ({ plan, onBack }) => {
    const [activeDay, setActiveDay] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Header title="Plano de Soft Skills" onBack={onBack} />

            {plan.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Plano Indisponível</h3>
                    <p className="text-slate-500 mt-2 text-sm">Realize a análise do currículo novamente para gerar seu plano.</p>
                </div>
            ) : (
                <div className="p-6 space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
                        <h2 className="text-2xl font-bold mb-2">Desafio 7 Dias</h2>
                        <p className="text-indigo-200 text-sm">Pequenas ações diárias para desenvolver inteligência emocional e comunicação.</p>
                    </div>

                    <div className="space-y-4">
                        {plan.map((task, idx) => {
                            const isOpen = activeDay === idx;
                            return (
                                <div key={idx} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-slate-100 shadow-sm'}`}>
                                    <button
                                        onClick={() => setActiveDay(isOpen ? null : idx)}
                                        className="w-full flex items-center justify-between p-5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-slate-400 font-bold uppercase">{task.day}</p>
                                                <h3 className={`font-bold text-sm ${isOpen ? 'text-indigo-900' : 'text-slate-700'}`}>{task.title}</h3>
                                            </div>
                                        </div>
                                        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </button>

                                    {isOpen && (
                                        <div className="px-5 pb-5 pt-0 space-y-4 animate-fadeIn">
                                            <div className="bg-indigo-50 p-4 rounded-xl">
                                                <p className="text-sm text-indigo-900 leading-relaxed font-medium">{task.action}</p>
                                            </div>

                                            <div className="grid gap-3">
                                                <div className="flex gap-3 text-xs text-slate-600">
                                                    <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                                    <span><strong>Por que importa:</strong> {task.whyItMatters}</span>
                                                </div>
                                                <div className="flex gap-3 text-xs text-slate-600">
                                                    <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                    <span><strong>Leitura:</strong> {task.readingRecommendation}</span>
                                                </div>
                                                <div className="flex gap-3 text-xs text-slate-600">
                                                    <PenTool className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    <span><strong>Reflexão:</strong> {task.reflectionQuestion}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const InterviewScreen: React.FC<{ userProfile: UserProfile, onBack: () => void }> = ({ userProfile, onBack }) => {
    const [tab, setTab] = useState<'behavioral' | 'technical' | 'case-study'>('behavioral');
    const [data, setData] = useState<InterviewPrepData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPrep = async () => {
            setLoading(true);
            const res = await getInterviewPrep(userProfile.role, tab);
            setData(res);
            setLoading(false);
        };
        fetchPrep();
    }, [tab, userProfile.role]);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <Header title="Simulador de Entrevista" onBack={onBack} />

            {/* Tabs */}
            <div className="flex px-6 border-b border-slate-200 bg-white sticky top-[72px] z-30">
                {[
                    { id: 'behavioral', label: 'Comportamental' },
                    { id: 'technical', label: 'Técnica' },
                    { id: 'case-study', label: 'Estudo de Caso' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as any)}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${tab === t.id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
                        <p className="text-slate-400 text-sm">Gerando perguntas com IA...</p>
                    </div>
                ) : data ? (
                    <div className="space-y-6 animate-fadeIn">

                        {/* Dress Code Tip - ONLY FOR BEHAVIORAL */}
                        {tab === 'behavioral' && data.dressCode && (
                            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                        <Shirt className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 text-emerald-300">Dress Code Sugerido</h4>
                                        <p className="text-lg font-bold mb-1">{data.dressCode.attire}</p>
                                        <p className="text-xs text-slate-300 leading-relaxed">{data.dressCode.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Content based on type */}
                        {tab === 'case-study' && data.caseStudies ? (
                            <div className="space-y-6">
                                {data.caseStudies.map((study, index) => (
                                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                                        <div className="border-b border-slate-100 pb-4 mb-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="bg-indigo-100 text-indigo-700 font-bold text-xs px-2 py-0.5 rounded">CASO {index + 1}</div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
                                                    <User className="w-3 h-3" /> {study.candidateProfile}
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-xl leading-tight">{study.title}</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                                <h4 className="font-bold text-yellow-800 text-sm mb-1">O Cenário Real</h4>
                                                <p className="text-sm text-yellow-900 leading-relaxed">{study.scenario}</p>
                                                <p className="text-xs text-yellow-700 mt-2 italic font-medium">Desafio: {study.challenge}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700 text-sm mb-2">Pergunta Chave</h4>
                                                <p className="text-slate-600 italic">"{study.keyQuestion}"</p>
                                            </div>
                                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                                <h4 className="font-bold text-emerald-800 text-sm mb-1">A Resposta Vencedora</h4>
                                                <p className="text-sm text-emerald-900 leading-relaxed">{study.candidateResponse}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700 text-sm mb-2">Por que foi contratado?</h4>
                                                <p className="text-sm text-slate-600">{study.whyTheyGotHired}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Q&A List
                            <div className="space-y-4">
                                {data.questions?.map((q, i) => (
                                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="flex gap-3 mb-3">
                                            <span className="text-emerald-500 font-bold text-lg">Q{i + 1}.</span>
                                            <h3 className="font-bold text-slate-800">{q.question}</h3>
                                        </div>

                                        <div className="space-y-3 pl-8 border-l-2 border-slate-100 ml-2">
                                            <div className="bg-slate-50 p-3 rounded-lg">
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                                                    <Star className="w-3 h-3" /> Resposta Ideal
                                                </p>
                                                <p className="text-sm text-slate-600 leading-relaxed">{q.bestAnswer}</p>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                                                <p className="text-xs text-slate-500">
                                                    <span className="font-bold text-slate-700">Dica do Recrutador:</span> {q.recruiterTip}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                ) : null}
            </div>
        </div>
    );
};

const SalaryScreen: React.FC<{ userProfile: UserProfile, onBack: () => void }> = ({ userProfile, onBack }) => {
    const [data, setData] = useState<SalaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSalary = async () => {
            setLoading(true);
            const res = await getSalaryData(userProfile.role, userProfile.experience);
            setData(res);
            setLoading(false);
        };
        fetchSalary();
    }, [userProfile.role, userProfile.experience]);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <Header title="Raio-X Salarial" onBack={onBack} />

            {loading ? (
                <div className="h-[80vh] flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
                    <p className="text-slate-400 text-sm">Pesquisando mercado...</p>
                </div>
            ) : data ? (
                <div className="px-6 py-6 space-y-8 animate-fadeIn">

                    {/* Header Card */}
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-amber-100 text-xs font-bold uppercase tracking-wide">Média de Mercado</p>
                                <h2 className="text-3xl font-extrabold">R$ {data.pleno.toLocaleString('pt-BR')}</h2>
                                <p className="text-white/80 text-sm">Para nível Pleno</p>
                            </div>
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <DollarSign className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-black/10 rounded-xl p-3 text-center">
                                <p className="text-[10px] text-amber-100 font-bold uppercase mb-1">Júnior</p>
                                <p className="text-sm font-bold">R${(data.junior / 1000).toFixed(1)}k</p>
                            </div>
                            <div className="bg-white/20 rounded-xl p-3 text-center border border-white/20">
                                <p className="text-[10px] text-white font-bold uppercase mb-1">Pleno</p>
                                <p className="text-sm font-bold">R${(data.pleno / 1000).toFixed(1)}k</p>
                            </div>
                            <div className="bg-black/10 rounded-xl p-3 text-center">
                                <p className="text-[10px] text-amber-100 font-bold uppercase mb-1">Sênior</p>
                                <p className="text-sm font-bold">R${(data.senior / 1000).toFixed(1)}k</p>
                            </div>
                        </div>
                    </div>

                    {/* Regional Chart */}
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-500" /> Comparativo Regional
                        </h3>
                        <div className="h-64 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.regionalData} layout="vertical" margin={{ left: 0, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="region" type="category" width={100} tick={{ fontSize: 10 }} interval={0} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value: any) => [`R$ ${value}`, 'Média']}
                                    />
                                    <Bar dataKey="average" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20}>
                                        {data.regionalData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#fbbf24'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Negotiation Strategy */}
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-emerald-500" /> Como Negociar
                        </h3>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1">Argumento Principal</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{data.negotiationStrategy.mainArgument}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1">Argumento Secundário</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{data.negotiationStrategy.secondaryArgument}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl mt-2">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Frase de Fechamento</p>
                                <p className="text-sm text-slate-700 italic">"{data.negotiationStrategy.closingPhrase}"</p>
                            </div>
                        </div>
                    </div>

                </div>
            ) : null}
        </div>
    );
};

const LandingScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Header */}
            <header className="px-6 py-5 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-50 border-b border-slate-50">
                <Logo className="h-8" />
                <button
                    onClick={onStart}
                    className="text-sm font-bold text-slate-900 border-2 border-slate-900 rounded-full px-6 py-2 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-wide"
                >
                    Entrar
                </button>
            </header>

            {/* Hero Section */}
            <section className="px-6 pt-12 pb-16 flex flex-col items-center text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full mb-8 border border-emerald-100 shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Método Validado por Headhunters</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-[#0f172a] leading-[1.1] mb-6 tracking-tight">
                    Domine o Jogo <br />
                    <span className="block mt-2">da</span>
                    <span className="text-[#009c3b]">Contratação.</span>
                </h1>

                <p className="text-slate-500 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed font-medium">
                    A única plataforma que une Inteligência Artificial avançada com Mentoria Humana de Elite para garantir sua próxima vaga.
                </p>

                <button
                    onClick={onStart}
                    className="w-full max-w-md bg-[#009c3b] hover:bg-emerald-700 text-white font-extrabold text-lg py-5 rounded-xl shadow-xl shadow-emerald-500/20 transform transition hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                    Criar Conta Grátis
                    <ArrowRight className="w-6 h-6" />
                </button>

                <p className="mt-6 text-sm text-slate-400 font-medium">
                    Junte-se a 10.000+ profissionais aprovados.
                </p>
            </section>

            {/* Dark Mentorship Section */}
            <section className="bg-[#0f172a] py-20 px-6 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-md">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase">Mentoria Quinzenal Ao Vivo</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                        Acesso Direto à <br />
                        <span className="text-[#818cf8]">Elite do Mercado</span>
                    </h2>

                    <p className="text-slate-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Não dependa apenas da sorte. Participe de sessões quinzenais ao vivo com Diretores e Especialistas reais. Tire dúvidas, faça networking e aprenda o que a IA não te conta.
                    </p>

                    {/* Live Session Card Simulation */}
                    <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 max-w-sm mx-auto shadow-2xl transform rotate-1 hover:rotate-0 transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-white font-bold text-xs uppercase tracking-wider">Ao Vivo Agora</span>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#1e293b]"></div>
                                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#1e293b]"></div>
                                <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-[#1e293b] flex items-center justify-center text-[10px] text-white font-bold">+1k</div>
                            </div>
                        </div>

                        <div className="bg-[#0f172a] rounded-xl p-4 mb-6 border border-slate-700">
                            <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Tema da Sessão:</p>
                            <p className="text-white font-bold text-sm leading-snug">"Como negociar salário acima do teto"</p>
                        </div>

                        <button className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20">
                            <Video className="w-4 h-4" />
                            GARANTIR VAGA
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-[#0f172a] mb-4">Seu Arsenal Completo</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                            Não entregamos apenas "dicas". Entregamos um ecossistema completo de ferramentas para sua aprovação.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Card 1: Mentoria */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                            <div className="w-14 h-14 bg-[#e0e7ff] rounded-2xl flex items-center justify-center text-[#4338ca] mb-6">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f172a] mb-3">Mentoria Quinzenal Ao Vivo</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Conexão direta com quem contrata. Estratégias de campo de batalha, networking e tira-dúvidas em tempo real.
                            </p>
                        </div>

                        {/* Card 2: Soft Skills */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                            <div className="w-14 h-14 bg-[#fce7f3] rounded-2xl flex items-center justify-center text-[#be185d] mb-6">
                                <MessageSquare className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f172a] mb-3">Coaching de Soft Skills</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Habilidades técnicas contratam, comportamentais demitem. Nosso plano de 7 dias blinda sua inteligência emocional.
                            </p>
                        </div>

                        {/* Card 3: CV Optimizer */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                            <div className="w-14 h-14 bg-[#dbeafe] rounded-2xl flex items-center justify-center text-[#1d4ed8] mb-6">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f172a] mb-3">Otimizador de CV com IA</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Nossa IA reescreve seu currículo com as palavras-chave exatas que os sistemas de triagem procuram. Seja visto.
                            </p>
                        </div>

                        {/* Card 4: DISC */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                            <div className="w-14 h-14 bg-[#f3e8ff] rounded-2xl flex items-center justify-center text-[#7e22ce] mb-6">
                                <BrainCircuit className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f172a] mb-3">Devolutiva Completa do DISC</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Entenda seu perfil comportamental. Baixe o relatório completo e saiba vender sua personalidade na entrevista.
                            </p>
                        </div>

                        {/* Card 5: Simulator (Full Width on Mobile, or just next in grid) */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 md:col-span-2 lg:col-span-1">
                            <div className="w-14 h-14 bg-[#d1fae5] rounded-2xl flex items-center justify-center text-[#047857] mb-6">
                                <Mic className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f172a] mb-3">Simulador de Entrevista</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Treine com perguntas reais (técnicas e comportamentais). Receba feedback e sugestões de Dress Code para impressionar.
                            </p>
                        </div>

                        {/* Card 6: Raio-X Salário */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 md:col-span-2 lg:col-span-1">
                            <div className="w-14 h-14 bg-[#fef3c7] rounded-2xl flex items-center justify-center text-[#d97706] mb-6">
                                <DollarSign className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f172a] mb-3">Raio-X Salário</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Descubra faixas salariais por nível (Júnior, Pleno, Sênior) e regiões do Brasil. Negocie com dados reais do mercado.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-20 text-center bg-white">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-8">
                        Sua carreira não pode esperar.
                    </h2>
                    <button
                        onClick={onStart}
                        className="w-full bg-[#009c3b] hover:bg-emerald-700 text-white font-extrabold text-lg py-5 rounded-xl shadow-xl shadow-emerald-500/20 transform transition hover:-translate-y-1 active:scale-[0.98] uppercase tracking-wide"
                    >
                        Começar Agora
                    </button>
                    <p className="mt-6 text-xs text-slate-400">© 2025 SkillQuest Brazil. Todos os direitos reservados.</p>
                </div>
            </section>
        </div>
    );
};

const ServicesScreen: React.FC<{
    onNavigate: (s: Screen) => void,
    onOpenPremium: () => void,
    discCompleted: boolean,
    isPremium: boolean
}> = ({ onNavigate, onOpenPremium, discCompleted, isPremium }) => {
    const services = [
        {
            id: Screen.MENTORSHIP,
            title: 'Mentoria em Grupo',
            icon: Users,
            color: 'text-white',
            bg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
            desc: 'Mentoria ao vivo quinzenal com experts do mercado.',
            locked: !isPremium, // Unlocks with Premium
            tag: 'PREMIUM'
        },
        {
            id: Screen.CV_OPTIMIZER,
            title: 'Otimizador de CV',
            icon: FileText,
            color: 'text-white',
            bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
            desc: 'IA reescreve seu resumo e destaca skills.',
            locked: false,
            tag: 'GRÁTIS'
        },
        {
            id: Screen.DISC_RESULT,
            title: 'Devolutiva DISC Completa',
            icon: BrainCircuit,
            color: 'text-white',
            bg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
            desc: 'Baixe o PDF com sua análise comportamental.',
            locked: false, // Access to view logic, logic handles lock
            tag: 'PREMIUM'
        },
        {
            id: Screen.SOFT_SKILLS,
            title: 'Coach Comportamental',
            icon: MessageSquare,
            color: 'text-white',
            bg: 'bg-gradient-to-br from-pink-500 to-rose-500',
            desc: 'Plano diário para evoluir inteligência emocional.',
            locked: !isPremium,
            tag: 'PREMIUM'
        },
        {
            id: Screen.INTERVIEW,
            title: 'Guia de Entrevista',
            icon: Mic,
            color: 'text-white',
            bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            desc: 'Perguntas reais, respostas ideais e Dress Code.',
            locked: !isPremium,
            tag: 'PREMIUM'
        },
        {
            id: Screen.SALARY,
            title: 'Raio-X Salarial',
            icon: DollarSign,
            color: 'text-white',
            bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
            desc: 'Comparativo regional e estratégia de negociação.',
            locked: !isPremium,
            tag: 'PREMIUM'
        },
    ];

    const handleServiceClick = (s: any) => {
        // Logic for Services that are strictly locked
        if (s.locked) {
            onOpenPremium();
            return;
        }
        onNavigate(s.id);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Attractive Header */}
            <div className="bg-[#0f172a] text-white pt-8 pb-12 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Rocket className="w-6 h-6 text-yellow-400" />
                        Acelere sua Carreira
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                        Ferramentas de IA avançadas para te colocar no topo da lista dos recrutadores.
                    </p>
                </div>
            </div>

            <div className="px-6 -mt-6">
                {/* Upgrade Banner - Show only if NOT premium */}
                {!isPremium && (
                    <div
                        onClick={onOpenPremium}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-lg shadow-orange-200 mb-6 flex items-center justify-between cursor-pointer transform transition hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Seja Premium</h3>
                                <p className="text-white/80 text-xs">Desbloqueie 4 ferramentas</p>
                            </div>
                        </div>
                        <div className="bg-white text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                            VER PLANOS
                        </div>
                    </div>
                )}

                {/* Premium Active Banner - Show only if Premium */}
                {isPremium && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 shadow-lg mb-6 flex items-center gap-3 border border-slate-700">
                        <div className="w-10 h-10 bg-[#ffdf00] rounded-full flex items-center justify-center shadow-md">
                            <Star className="w-5 h-5 text-slate-900 fill-slate-900" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Membro Premium</h3>
                            <p className="text-slate-400 text-xs">Acesso total liberado</p>
                        </div>
                    </div>
                )}

                {/* Services List */}
                <div className="grid gap-4">
                    {services.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => handleServiceClick(s)}
                            className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group transition-all duration-300 ${s.locked ? 'opacity-90' : 'hover:shadow-md'}`}
                        >
                            {/* Background Decoration for Premium */}
                            {s.locked && <div className="absolute inset-0 bg-slate-50 opacity-50 z-10 pointer-events-none"></div>}

                            <div className="flex items-start justify-between relative z-20">
                                <div className="flex gap-4">
                                    <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center shadow-lg shadow-slate-200 ${s.color} shrink-0`}>
                                        <s.icon className="w-7 h-7" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{s.title}</h3>
                                        <p className="text-xs text-slate-500 max-w-[180px] leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tags and Icons */}
                            <div className="absolute top-5 right-5 z-20">
                                {s.locked ? (
                                    <div className="flex flex-col items-end gap-1">
                                        <Lock className="w-5 h-5 text-slate-400 mb-1" />
                                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 tracking-wider">PREMIUM</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                                            {isPremium && s.tag === 'PREMIUM' ? (
                                                <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-blue-500" />
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider ${s.tag === 'PREMIUM' ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                                            {s.tag}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DiscResultScreen: React.FC<{
    discResult: DiscResult | null,
    userProfile: UserProfile,
    onBack?: () => void,
    isPremium: boolean,
    onUpgrade: () => void
}> = ({ discResult, userProfile, onBack, isPremium, onUpgrade }) => {
    const [fullData, setFullData] = useState<DiscAnalysisDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (discResult && isPremium && !fullData) {
            setLoading(true);
            generateDiscFeedback(userProfile.role, discResult.name, discResult.description)
                .then(data => {
                    setFullData(data);
                    setLoading(false);
                });
        }
    }, [discResult, userProfile.role, isPremium]);

    if (!discResult) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full mb-4 flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Teste não realizado</h2>
                <p className="text-slate-500 mb-6 text-sm">Realize o teste DISC no Dashboard para acessar seu relatório.</p>
                <button onClick={onBack} className="text-emerald-600 font-bold">Voltar</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <Header title="Relatório DISC" onBack={onBack} />
            <div className="p-6">

                {/* Profile Header */}
                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                    <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Seu Perfil Natural</h3>
                    <h1 className="text-3xl font-extrabold mb-1">{discResult.name}</h1>
                    <p className="text-indigo-100 text-sm leading-relaxed opacity-90">{discResult.description}</p>
                </div>

                {/* Score Chart - AVAILABLE TO ALL */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <h4 className="font-bold text-slate-800 mb-4">Sua Distribuição de Energia</h4>
                    <div className="space-y-4">
                        {[
                            { label: 'Dominância (D)', key: 'D', color: 'bg-red-500', val: discResult.scores.D },
                            { label: 'Influência (I)', key: 'I', color: 'bg-yellow-400', val: discResult.scores.I },
                            { label: 'Estabilidade (S)', key: 'S', color: 'bg-green-500', val: discResult.scores.S },
                            { label: 'Conformidade (C)', key: 'C', color: 'bg-blue-500', val: discResult.scores.C },
                        ].map((item) => (
                            <div key={item.key}>
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                    <span>{item.label}</span>
                                    <span>{item.val}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PREMIUM CONTENT BLOCKER */}
                {!isPremium && (
                    <div className="relative rounded-2xl overflow-hidden border border-indigo-100">
                        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                                <Lock className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Análise Comportamental Completa</h3>
                            <p className="text-sm text-slate-500 mb-4">Descubra seus pontos fortes, cegos e como se comunicar na entrevista.</p>
                            <button
                                onClick={onUpgrade}
                                className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <Crown className="w-4 h-4" />
                                Desbloquear Relatório Premium
                            </button>
                        </div>
                        {/* Fake Content Background */}
                        <div className="p-6 opacity-30 select-none filter blur-sm">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
                            <div className="h-20 bg-emerald-50 rounded mb-4"></div>
                            <div className="h-20 bg-orange-50 rounded mb-4"></div>
                        </div>
                    </div>
                )}

                {/* AI Analysis Content - ONLY IF PREMIUM */}
                {isPremium && (
                    <>
                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                                <p className="text-xs text-slate-400">Gerando análise profunda...</p>
                            </div>
                        ) : fullData ? (
                            <div className="space-y-6 animate-fadeIn">

                                {/* Synergies */}
                                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
                                    <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                        <ThumbsUp className="w-5 h-5" /> Pontos Fortes
                                    </h4>
                                    <ul className="space-y-2">
                                        {fullData.synergies?.map((s, i) => (
                                            <li key={i} className="text-sm text-emerald-900 flex gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Blind Spots */}
                                <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl">
                                    <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" /> Pontos de Atenção
                                    </h4>
                                    <ul className="space-y-2">
                                        {fullData.blindSpots?.map((s, i) => (
                                            <li key={i} className="text-sm text-orange-900 flex gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Communication Tip */}
                                <div className="bg-white p-5 rounded-2xl border-l-4 border-indigo-500 shadow-sm">
                                    <h4 className="font-bold text-indigo-900 text-sm mb-1 uppercase tracking-wide">Dica de Comunicação</h4>
                                    <p className="text-slate-600 text-sm italic">"{fullData.communicationTip || 'Carregando dica...'}"</p>
                                </div>

                                {/* Download Button */}
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <button
                                        onClick={() => alert("PDF Baixado com Sucesso!")}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-xl"
                                    >
                                        <Download className="w-5 h-5" />
                                        Baixar Relatório PDF (15 Páginas)
                                    </button>
                                    <p className="text-center text-[10px] text-slate-400 mt-2">Inclui gráficos detalhados e mapa de competências.</p>
                                </div>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
};

const DashboardScreen: React.FC<{
    result: AnalysisResult | null,
    onNavigate: (s: Screen) => void,
    onSkillClick: (skill: Skill) => void,
    discResult: DiscResult | null,
    onStartDisc: () => void,
    onViewDisc: () => void
}> = ({ result, onNavigate, onSkillClick, discResult, onStartDisc, onViewDisc }) => {
    if (!result) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-6 rounded-b-[40px] shadow-sm mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Olá, {result.extractedName?.split(' ')[0] || 'Candidato'}</p>
                        <h1 className="text-2xl font-bold text-slate-900">Seu Diagnóstico</h1>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-600" />
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Match com a Vaga</p>
                        <h2 className="text-4xl font-extrabold">{result.matchScore}%</h2>
                        <p className="text-slate-400 text-xs mt-1">Baseado em {result.skills.length} skills</p>
                    </div>
                    <div className="w-20 h-20">
                        <CircularProgress percentage={result.matchScore} color="#10b981" size={80} strokeWidth={8} />
                    </div>
                </div>
            </div>

            <div className="px-6 space-y-8">

                {/* DISC SECTION - NEW */}
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-500" /> Perfil Comportamental
                    </h3>

                    {!discResult ? (
                        // Call to Action for Test
                        <div
                            onClick={onStartDisc}
                            className="bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-200 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Descubra seu Perfil</h4>
                                    <p className="text-indigo-100 text-xs max-w-[200px] mb-3">
                                        Faça o teste DISC gratuito e entenda suas soft skills.
                                    </p>
                                    <span className="inline-flex items-center gap-1 bg-white text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-md">
                                        <Play className="w-3 h-3 fill-current" /> COMEÇAR TESTE
                                    </span>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <BrainCircuit className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Mini Result Card
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Seu Estilo</p>
                                    <h4 className="text-lg font-bold text-indigo-600">{discResult.name}</h4>
                                </div>
                                <button onClick={onViewDisc} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                                    Ver Detalhes
                                </button>
                            </div>
                            {/* Simple Chart */}
                            <div className="flex gap-2 h-16 items-end justify-between px-2">
                                {[
                                    { k: 'D', v: discResult.scores.D, c: 'bg-red-500' },
                                    { k: 'I', v: discResult.scores.I, c: 'bg-yellow-400' },
                                    { k: 'S', v: discResult.scores.S, c: 'bg-green-500' },
                                    { k: 'C', v: discResult.scores.C, c: 'bg-blue-500' }
                                ].map((bar) => (
                                    <div key={bar.k} className="flex flex-col items-center gap-1 w-full">
                                        <div className={`w-full rounded-t-sm ${bar.c} opacity-80`} style={{ height: `${bar.v}%` }}></div>
                                        <span className="text-[10px] font-bold text-slate-500">{bar.k}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Roadmap Section */}
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        <Map className="w-5 h-5 text-emerald-500" /> Próximos Passos
                    </h3>
                    <div className="space-y-4">
                        {result.roadmap.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                                        {idx + 1}
                                    </div>
                                    {idx !== result.roadmap.length - 1 && <div className="w-0.5 h-full bg-emerald-100 my-1"></div>}
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-1 mb-2">
                                    <h4 className="font-bold text-slate-800 text-sm mb-1">{step.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills Grid */}
                <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Skills Analisadas
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {result.skills.map((skill, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSkillClick(skill)}
                                className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${skill.category === 'hard' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                        {skill.category.toUpperCase()}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">{skill.score}%</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-emerald-600 transition-colors">{skill.name}</h4>
                                <p className="text-[10px] text-slate-400">{skill.level}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [currentScreen, setScreen] = useState<Screen>(Screen.LANDING);
    const [userProfile, setUserProfile] = useState<UserProfile>({
        role: '',
        experience: '',
        cvFile: null,
        cvBase64: null,
        cvMimeType: null
    });
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

    // Feature States
    const [discResult, setDiscResult] = useState<DiscResult | null>(null);
    const [isPremium, setIsPremium] = useState(false);

    // Modals
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showDiscModal, setShowDiscModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async (data: any) => {
        setIsLoading(true);
        try {
            const base64 = await fileToBase64(data.file);
            const mimeType = data.file.type;

            const quizData: QuizData = {
                motivation: data.motivation,
                biggestChallenge: "",
                softSkillFocus: ""
            };

            const result = await analyzeCandidateProfile(
                data.role,
                data.experience,
                quizData,
                base64,
                mimeType
            );

            setAnalysisResult(result);
            setUserProfile({
                ...userProfile,
                role: data.role,
                experience: data.experience,
                cvFile: data.file,
                cvBase64: base64,
                cvMimeType: mimeType,
                quizData,
                name: result.extractedName
            });
            setScreen(Screen.DASHBOARD);
        } catch (error) {
            console.error(error);
            alert("Erro ao analisar CV. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigate = (screen: Screen) => {
        setScreen(screen);
        window.scrollTo(0, 0);
    };



    return (
        <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
            <SupabaseStatus />
            {isLoading && <LoadingOverlay />}

            {currentScreen === Screen.LANDING && (
                <LandingScreen onStart={() => setScreen(Screen.REGISTER)} />
            )}

            {currentScreen === Screen.REGISTER && (
                <RegisterScreen onRegister={() => setScreen(Screen.ONBOARDING)} />
            )}

            {currentScreen === Screen.ONBOARDING && (
                <OnboardingScreen onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}

            {currentScreen === Screen.DASHBOARD && (
                <>
                    <DashboardScreen
                        result={analysisResult}
                        onNavigate={handleNavigate}
                        onSkillClick={setSelectedSkill}
                        discResult={discResult}
                        onStartDisc={() => setShowDiscModal(true)}
                        onViewDisc={() => handleNavigate(Screen.DISC_RESULT)}
                    />
                    <BottomNav current={Screen.DASHBOARD} onNavigate={handleNavigate} />
                </>
            )}

            {currentScreen === Screen.SERVICES && (
                <>
                    <ServicesScreen
                        onNavigate={handleNavigate}
                        onOpenPremium={() => setShowPremiumModal(true)}
                        discCompleted={!!discResult}
                        isPremium={isPremium}
                    />
                    <BottomNav current={Screen.SERVICES} onNavigate={handleNavigate} />
                </>
            )}

            {currentScreen === Screen.DISC_RESULT && (
                <DiscResultScreen
                    discResult={discResult}
                    userProfile={userProfile}
                    onBack={() => handleNavigate(Screen.SERVICES)}
                    isPremium={isPremium}
                    onUpgrade={() => setShowPremiumModal(true)}
                />
            )}

            {currentScreen === Screen.SOFT_SKILLS && (
                <SoftSkillsScreen
                    plan={analysisResult?.softSkillPlan || []}
                    onBack={() => handleNavigate(Screen.SERVICES)}
                />
            )}

            {currentScreen === Screen.INTERVIEW && (
                <InterviewScreen
                    userProfile={userProfile}
                    onBack={() => handleNavigate(Screen.SERVICES)}
                />
            )}

            {currentScreen === Screen.SALARY && (
                <SalaryScreen
                    userProfile={userProfile}
                    onBack={() => handleNavigate(Screen.SERVICES)}
                />
            )}

            {/* Modals */}
            {selectedSkill && (
                <SkillAnalysisModal
                    skill={selectedSkill}
                    role={userProfile.role}
                    onClose={() => setSelectedSkill(null)}
                />
            )}

            {showDiscModal && (
                <DiscTestModal
                    onClose={() => setShowDiscModal(false)}
                    onComplete={(res) => {
                        setDiscResult(res);
                        setShowDiscModal(false);
                    }}
                />
            )}

            {showPremiumModal && (
                <PremiumModal
                    onClose={() => setShowPremiumModal(false)}
                    onUpgrade={() => {
                        setIsPremium(true);
                        setShowPremiumModal(false);
                    }}
                />
            )}

            {/* Placeholders for other nav items */}
            {currentScreen === Screen.MENTORSHIP && (
                <>
                    <MentorshipScreen onBack={() => handleNavigate(Screen.SERVICES)} />
                    <BottomNav current={Screen.MENTORSHIP} onNavigate={handleNavigate} />
                </>
            )}

            {currentScreen === Screen.PROFILE && (
                <div className="min-h-screen flex items-center justify-center bg-white pb-20">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Seu Perfil</h2>
                        <p className="text-slate-500 mb-6">{userProfile.name || 'Usuário'}</p>
                        <button onClick={() => handleNavigate(Screen.DASHBOARD)} className="text-slate-900 font-bold">Voltar ao Dashboard</button>
                    </div>
                    <BottomNav current={Screen.PROFILE} onNavigate={handleNavigate} />
                </div>
            )}
        </div>
    );
};

export default App;