import React from 'react';
import { X, LogOut, User } from 'lucide-react';
import { supabase } from '../services/supabase';

interface UserMenuModalProps {
    onClose: () => void;
    userProfile: {
        name?: string;
        email?: string;
    };
    isPremium: boolean;
    onUpgrade: () => void;
}

export const UserMenuModal: React.FC<UserMenuModalProps> = ({ onClose, userProfile, isPremium, onUpgrade }) => {
    const handleLogout = async () => {
        await supabase.auth.signOut();
        onClose();
    };

    // Get initials from name or email
    const getInitials = () => {
        if (userProfile.name) {
            const names = userProfile.name.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
            }
            return userProfile.name.substring(0, 2).toUpperCase();
        }
        if (userProfile.email) {
            return userProfile.email.substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4 animate-fadeIn">
            <div
                className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Menu</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {getInitials()}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-900">{userProfile.name || 'Usuário'}</p>
                        <p className="text-sm text-slate-500">{userProfile.email || ''}</p>
                    </div>
                </div>

                {/* Plan Info */}
                {!isPremium ? (
                    <div className="mx-6 mb-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Plano Gratuito</p>
                                <p className="text-xs text-slate-600">Funcionalidades limitadas</p>
                            </div>
                            <button
                                onClick={() => {
                                    onUpgrade();
                                    onClose();
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
                            >
                                Upgrade
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mx-6 mb-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-purple-900">Plano Premium</p>
                                <p className="text-xs text-purple-700">Acesso total liberado</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <div className="p-6 pt-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </button>
                </div>

                {/* Safe area for mobile */}
                <div className="h-4 sm:hidden" />
            </div>
        </div>
    );
};
