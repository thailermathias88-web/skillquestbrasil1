import React, { useState } from 'react';
import { X, Linkedin, Instagram, Facebook, Check, Link as LinkIcon } from 'lucide-react';

interface SocialLinksModalProps {
    onClose: () => void;
    currentLinks: {
        linkedin?: string;
        instagram?: string;
        facebook?: string;
    };
    onSave: (links: { linkedin?: string; instagram?: string; facebook?: string }) => void;
}

export const SocialLinksModal: React.FC<SocialLinksModalProps> = ({ onClose, currentLinks, onSave }) => {
    const [linkedin, setLinkedin] = useState(currentLinks.linkedin || '');
    const [instagram, setInstagram] = useState(currentLinks.instagram || '');
    const [facebook, setFacebook] = useState(currentLinks.facebook || '');

    const handleSave = () => {
        onSave({
            linkedin: linkedin.trim(),
            instagram: instagram.trim(),
            facebook: facebook.trim()
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4 animate-fadeIn">
            <div
                className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <LinkIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Redes Sociais</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                        Adicione seus perfis de redes sociais para facilitar conexões profissionais.
                    </p>

                    {/* LinkedIn */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <div className="w-6 h-6 bg-[#0077b5] rounded flex items-center justify-center">
                                <Linkedin className="w-4 h-4 text-white" />
                            </div>
                            LinkedIn
                        </label>
                        <input
                            type="url"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            placeholder="https://linkedin.com/in/seu-perfil"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                    </div>

                    {/* Instagram */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded flex items-center justify-center">
                                <Instagram className="w-4 h-4 text-white" />
                            </div>
                            Instagram
                        </label>
                        <input
                            type="url"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="https://instagram.com/seu-perfil"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm"
                        />
                    </div>

                    {/* Facebook */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            <div className="w-6 h-6 bg-[#1877f2] rounded flex items-center justify-center">
                                <Facebook className="w-4 h-4 text-white" />
                            </div>
                            Facebook
                        </label>
                        <input
                            type="url"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder="https://facebook.com/seu-perfil"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Salvar
                    </button>
                </div>

                {/* Safe area for mobile */}
                <div className="h-4 sm:hidden" />
            </div>
        </div>
    );
};
