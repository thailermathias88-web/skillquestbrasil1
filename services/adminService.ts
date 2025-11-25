import { supabase } from './supabase';
import { UserProfile, QuizData, SoftSkillsProgress } from '../types';

// Email do administrador
const ADMIN_EMAIL = 'thailer.mathias88@gmail.com';

export interface AdminUserData {
    id: string;
    userId: string;
    name: string;
    email: string;
    whatsapp: string;
    role: string;
    experience: string;
    city: string;
    cvUrl: string;
    cvMimeType: string;
    quizData?: QuizData;
    createdAt: string;
}

/**
 * Verifica se o usuário atual é administrador
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.email === ADMIN_EMAIL;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

/**
 * Busca todos os usuários cadastrados (apenas para admin)
 */
export async function getAllUsers(): Promise<AdminUserData[]> {
    try {
        const admin = await isAdmin();
        if (!admin) {
            throw new Error('Acesso negado: apenas administradores podem acessar esta função');
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(profile => ({
            id: profile.id,
            userId: profile.user_id,
            name: profile.name || 'N/A',
            email: profile.email || 'N/A',
            whatsapp: profile.whatsapp || 'N/A',
            role: profile.role || 'N/A',
            experience: profile.experience || 'N/A',
            city: profile.city || 'N/A',
            cvUrl: profile.cv_url || '',
            cvMimeType: profile.cv_mime_type || '',
            quizData: profile.quiz_data,
            createdAt: profile.created_at
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

/**
 * Salva o perfil do usuário no banco de dados
 */
export async function saveUserProfile(profile: UserProfile, userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: userId,
                name: profile.name,
                email: profile.email,
                whatsapp: profile.whatsapp,
                role: profile.role,
                experience: profile.experience,
                city: profile.city,
                cv_url: profile.cvBase64 ? `data:${profile.cvMimeType};base64,${profile.cvBase64}` : null,
                cv_mime_type: profile.cvMimeType,
                quiz_data: profile.quizData,
                soft_skills_progress: profile.softSkillsProgress,
                avatar_base64: profile.avatarBase64,
                avatar_mime_type: profile.avatarMimeType,
                social_links: profile.socialLinks,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error saving user profile:', error);
        throw error;
    }
}

/**
 * Exporta dados dos usuários para CSV
 */
export function exportToCSV(users: AdminUserData[]): void {
    const headers = ['Nome', 'Email', 'WhatsApp', 'Vaga Pretendida', 'Experiência', 'Cidade', 'Data de Cadastro'];
    const rows = users.map(user => [
        user.name,
        user.email,
        user.whatsapp,
        user.role,
        user.experience,
        user.city,
        new Date(user.createdAt).toLocaleDateString('pt-BR')
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_skillquest_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Download do currículo do usuário
 */
export function downloadCV(user: AdminUserData): void {
    if (!user.cvUrl) {
        alert('Currículo não disponível para este usuário');
        return;
    }

    const link = document.createElement('a');
    link.href = user.cvUrl;
    link.download = `CV_${user.name.replace(/\s+/g, '_')}.pdf`;
    link.click();
}

/**
 * Atualiza apenas o progresso de soft skills
 */
export async function updateSoftSkillsProgress(userId: string, progress: SoftSkillsProgress): Promise<void> {
    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                soft_skills_progress: progress,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating soft skills progress:', error);
        throw error;
    }
}
