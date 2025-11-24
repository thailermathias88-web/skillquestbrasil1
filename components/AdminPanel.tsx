import React, { useState, useEffect } from 'react';
import { AdminUserData, getAllUsers, exportToCSV, downloadCV, isAdmin } from '../services/adminService';
import {
    Users, Download, Search, Filter, Calendar, Mail, Phone,
    Briefcase, MapPin, FileText, Loader2, Lock, ChevronLeft,
    ChevronRight, X
} from 'lucide-react';

interface AdminPanelProps {
    onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
    const [users, setUsers] = useState<AdminUserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<AdminUserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const usersPerPage = 20;

    useEffect(() => {
        checkAuthAndLoadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, filterRole, users]);

    const checkAuthAndLoadUsers = async () => {
        try {
            const admin = await isAdmin();
            setIsAuthorized(admin);

            if (!admin) {
                setLoading(false);
                return;
            }

            const data = await getAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filtro de busca
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.whatsapp.includes(searchTerm)
            );
        }

        // Filtro de vaga
        if (filterRole !== 'all') {
            filtered = filtered.filter(user => user.role === filterRole);
        }

        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const handleExport = () => {
        exportToCSV(filteredUsers);
    };

    const handleDownloadCV = (user: AdminUserData) => {
        if (!user.cvUrl) {
            alert('Currículo não disponível');
            return;
        }
        downloadCV(user);
    };

    // Paginação
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Obter lista única de vagas para filtro
    const uniqueRoles = Array.from(new Set(users.map(u => u.role))).filter(Boolean);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-600">Carregando painel...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-xl">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso Negado</h2>
                    <p className="text-slate-600 mb-6">
                        Você não tem permissão para acessar o painel administrativo.
                    </p>
                    <button
                        onClick={onBack}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-8">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-8 sticky top-0 z-30 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Users className="w-6 h-6" />
                                    Painel Administrativo
                                </h1>
                                <p className="text-slate-400 text-sm mt-1">
                                    {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} cadastrado{filteredUsers.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg"
                        >
                            <Download className="w-5 h-5" />
                            Exportar CSV
                        </button>
                    </div>

                    {/* Filtros */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Busca */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, email ou WhatsApp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Filtro de Vaga */}
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                            >
                                <option value="all" className="bg-slate-900">Todas as vagas</option>
                                {uniqueRoles.map(role => (
                                    <option key={role} value={role} className="bg-slate-900">{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela de Usuários */}
            <div className="max-w-7xl mx-auto px-6 mt-6">
                {currentUsers.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum usuário encontrado</h3>
                        <p className="text-slate-500">
                            {searchTerm || filterRole !== 'all'
                                ? 'Tente ajustar os filtros de busca'
                                : 'Ainda não há usuários cadastrados'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nome</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">WhatsApp</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Vaga</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Experiência</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Cidade</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Cadastro</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">CV</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {currentUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-slate-900">{user.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail className="w-4 h-4" />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Phone className="w-4 h-4" />
                                                        {user.whatsapp}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Briefcase className="w-4 h-4" />
                                                        <span className="max-w-[150px] truncate">{user.role}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-600">{user.experience}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <MapPin className="w-4 h-4" />
                                                        {user.city}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.cvUrl ? (
                                                        <button
                                                            onClick={() => handleDownloadCV(user)}
                                                            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            Baixar
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-slate-600">
                                    Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuários
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Anterior
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-2"
                                    >
                                        Próxima
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
