import React, { useRef, useState } from 'react';
import { UserProfile, AnalysisResult } from '../types';
import {
    ArrowLeft, Camera, Linkedin, Instagram, Facebook,
    Briefcase, Star, Award, Zap, TrendingUp, Code, Palette,
    Users, Target, ChevronRight
} from 'lucide-react';
import { SocialLinksModal } from './SocialLinksModal';

interface ProfileScreenProps {
    userProfile: UserProfile;
    analysisResult: AnalysisResult | null;
    onBack: () => void;
    onUpdateProfile: (profile: UserProfile) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
    userProfile,
    analysisResult,
    onBack,
    onUpdateProfile
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showSocialLinksModal, setShowSocialLinksModal] = useState(false);

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];

                onUpdateProfile({
                    ...userProfile,
                    avatarBase64: base64Data,
                    avatarMimeType: file.type
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const softSkillsLevel = userProfile.softSkillsProgress?.level || 1;
    const softSkillsXP = userProfile.softSkillsProgress?.experience || 0;
    const progressToNextLevel = (softSkillsXP % 500) / 500 * 100;

    // Filter skills to show (prioritize high scores)
    const topSkills = analysisResult?.skills
        .sort((a, b) => b.score - a.score)
        .slice(0, 4) || [];

    // Skill icons mapping
    const getSkillIcon = (index: number) => {
        const icons = [
            { Icon: Code, color: 'text-blue-500', bg: 'bg-blue-50' },
            { Icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50' },
            { Icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
            { Icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' }
        ];
        return icons[index % 4];
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-28 font-sans">
            {/* Header com Gradiente */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-b-[3rem] shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-gradient-to-br from-white to-transparent rounded-full blur-3xl transform rotate-12"></div>
                </div>

                <div className="relative z-10 p-4 pb-16">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all backdrop-blur-sm mb-4"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    <div className="text-white text-center mt-6">
                        <h1 className="text-2xl font-bold mb-1">Perfil Profissional</h1>
                        <p className="text-blue-100 text-sm opacity-90">Gerencie suas informações</p>
                    </div>
                </div>
            </div>

            {/* Avatar e Info Principal */}
            <div className="relative px-4 -mt-12 mb-6">
                <div className="bg-white rounded-3xl shadow-xl p-4 border border-slate-100">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        {/* Avatar */}
                        <div className="relative group flex-shrink-0">
                            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                                {userProfile.avatarBase64 ? (
                                    <img
                                        src={`data:${userProfile.avatarMimeType};base64,${userProfile.avatarBase64}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                                        <span className="text-2xl font-bold">{userProfile.name?.charAt(0) || 'U'}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Nome e Rating */}
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-lg font-bold text-slate-900 mb-1">
                                {userProfile.name || 'Usuário'}
                            </h2>
                            <p className="text-sm text-slate-600 mb-2">
                                {userProfile.role || 'Profissional'}
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-3">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-lg text-slate-900">4.5</span>
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
                                <button
                                    onClick={() => setShowSocialLinksModal(true)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ${userProfile.socialLinks?.linkedin ? 'bg-[#0077b5] text-white' : 'bg-slate-100 text-slate-400'
                                        }`}
                                    title="LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setShowSocialLinksModal(true)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ${userProfile.socialLinks?.instagram ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white' : 'bg-slate-100 text-slate-400'
                                        }`}
                                    title="Instagram"
                                >
                                    <Instagram className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setShowSocialLinksModal(true)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ${userProfile.socialLinks?.facebook ? 'bg-[#1877f2] text-white' : 'bg-slate-100 text-slate-400'
                                        }`}
                                    title="Facebook"
                                >
                                    <Facebook className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-5">
                {/* Seção Minha Carreira */}
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        Minha Carreira
                    </h2>

                    {/* Trabalho Independente */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">Trabalho Independente</h3>
                                <p className="text-xs text-slate-500 mb-2">Experiência</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                                            style={{ width: '85%' }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 min-w-[32px] text-right">85%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trabalho In-house */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">Trabalho In-house</h3>
                                <p className="text-xs text-slate-500 mb-2">Experiência</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                                            style={{ width: '30%' }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 min-w-[32px] text-right">30%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção Habilidades */}
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        Habilidades
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {topSkills.map((skill, index) => {
                            const { Icon, color, bg } = getSkillIcon(index);
                            return (
                                <div
                                    key={index}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    {/* Circular Progress */}
                                    <div className="relative w-20 h-20 mb-3">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                stroke="currentColor"
                                                strokeWidth="5"
                                                fill="transparent"
                                                className="text-slate-100"
                                            />
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                stroke="currentColor"
                                                strokeWidth="5"
                                                fill="transparent"
                                                strokeDasharray={226}
                                                strokeDashoffset={226 - (226 * skill.score) / 100}
                                                className={`${index % 4 === 0 ? 'text-blue-500' :
                                                    index % 4 === 1 ? 'text-pink-500' :
                                                        index % 4 === 2 ? 'text-orange-500' :
                                                            'text-purple-500'
                                                    } transition-all duration-1000 ease-out`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className={`absolute inset-0 flex items-center justify-center ${bg} rounded-full m-2.5`}>
                                            <Icon className={`w-6 h-6 ${color}`} />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-xs mb-1.5 line-clamp-2 min-h-[32px] flex items-center">
                                        {skill.name}
                                    </h3>
                                    <span className="text-xl font-black text-slate-900">{skill.score}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Botão Adicionar Habilidade */}
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105">
                    <span className="text-2xl">+</span>
                    Adicionar Nova Habilidade
                </button>
            </div>

            {/* Social Links Modal */}
            {showSocialLinksModal && (
                <SocialLinksModal
                    onClose={() => setShowSocialLinksModal(false)}
                    currentLinks={userProfile.socialLinks || {}}
                    onSave={(links) => {
                        onUpdateProfile({
                            ...userProfile,
                            socialLinks: links
                        });
                    }}
                />
            )}
        </div>
    );
};

// Force reload
