-- ============================================
-- PAINEL DE ADMINISTRADOR - SKILLQUEST BRASIL
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query

-- 1. Criar tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  whatsapp TEXT,
  role TEXT,
  experience TEXT,
  city TEXT,
  cv_url TEXT,
  cv_mime_type TEXT,
  quiz_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Admin can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- 5. Política: Admin pode ver todos os perfis
CREATE POLICY "Admin can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'thailer.mathias88@gmail.com'
  );

-- 6. Política: Usuários podem inserir seu próprio perfil
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. Política: Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Criar bucket de storage para currículos (se não existir)
-- NOTA: Execute este comando separadamente se o bucket não existir
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('curriculos', 'curriculos', false);

-- 9. Política de storage: Admin pode ver todos os CVs
-- DROP POLICY IF EXISTS "Admin can view all CVs" ON storage.objects;
-- CREATE POLICY "Admin can view all CVs"
--   ON storage.objects FOR SELECT
--   TO authenticated
--   USING (
--     bucket_id = 'curriculos' AND
--     auth.jwt() ->> 'email' = 'thailer.mathias88@gmail.com'
--   );

-- 10. Política de storage: Usuários podem fazer upload de seus CVs
-- DROP POLICY IF EXISTS "Users can upload own CV" ON storage.objects;
-- CREATE POLICY "Users can upload own CV"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     bucket_id = 'curriculos' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se tudo foi criado corretamente:

-- Ver estrutura da tabela
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_profiles';

-- Ver políticas RLS
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Contar usuários cadastrados
-- SELECT COUNT(*) as total_usuarios FROM user_profiles;
