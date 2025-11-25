-- ============================================
-- ATUALIZAÇÃO: COACH COMPORTAMENTAL GAMIFICADO
-- ============================================
-- Execute este script no SQL Editor do Supabase para adicionar
-- a coluna de progresso da jornada de soft skills.

-- 1. Adicionar coluna JSONB para progresso
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS soft_skills_progress JSONB DEFAULT '{"level": 1, "currentDay": 1, "completedDays": [], "badges": [], "lastCompletedDate": null}'::jsonb;

-- 2. Criar índice para performance em queries futuras (opcional)
CREATE INDEX IF NOT EXISTS idx_user_profiles_soft_skills ON user_profiles USING gin (soft_skills_progress);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- SELECT soft_skills_progress FROM user_profiles LIMIT 5;
