# 🚀 Workflow de Desenvolvimento - SkillQuest Brasil

## Procedimento para Fazer Alterações

### 1️⃣ Desenvolvimento Local

```bash
# Certifique-se de estar no diretório do projeto
cd c:\Users\Usuario\Desktop\skillquestbrasil1\skillquestbrasil1

# Inicie o servidor de desenvolvimento (se ainda não estiver rodando)
npm run dev
```

O servidor local estará disponível em: `http://localhost:3000`

### 2️⃣ Fazer Suas Alterações

- Edite os arquivos que precisar (`App.tsx`, componentes, etc.)
- O Vite recarrega automaticamente as mudanças no navegador
- Teste tudo localmente antes de fazer deploy

### 3️⃣ Commit e Push para GitHub

```bash
# Adicione os arquivos modificados
git add .

# Faça o commit com uma mensagem descritiva
git commit -m "Descrição das alterações feitas"

# Envie para o GitHub
git push origin main
```

### 4️⃣ Deploy Automático na Vercel ✨

**A Vercel detecta automaticamente o push e faz o deploy!**

- Não precisa fazer nada manualmente
- O deploy acontece automaticamente em 1-2 minutos
- Você receberá notificações no email (se configurado)

### 5️⃣ Verificar o Deploy

Acesse o painel da Vercel:
- **Dashboard**: https://vercel.com/dashboard
- Veja o status do deploy em tempo real
- Acesse os logs se houver algum erro

---

## 🔧 Comandos Úteis

### Testar Build de Produção Localmente

```bash
# Criar build de produção
npm run build

# Testar o build localmente
npm run preview
```

### Verificar Status do Git

```bash
# Ver arquivos modificados
git status

# Ver histórico de commits
git log --oneline -5
```

---

## 🌍 Variáveis de Ambiente

### Desenvolvimento Local
Edite o arquivo `.env.local` (já configurado)

### Produção (Vercel)
Configure no painel da Vercel:
1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione/edite as variáveis necessárias:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`

> [!IMPORTANT]
> Após alterar variáveis de ambiente na Vercel, você precisa fazer um **Redeploy** manual ou fazer um novo commit.

---

## 🐛 Troubleshooting

### Deploy falhou?
1. Verifique os logs no painel da Vercel
2. Certifique-se que o build local funciona: `npm run build`
3. Verifique se as variáveis de ambiente estão configuradas

### Mudanças não aparecem?
1. Limpe o cache do navegador (Ctrl + Shift + R)
2. Verifique se o deploy foi concluído na Vercel
3. Aguarde 1-2 minutos para propagação do CDN

### Erro de variáveis de ambiente?
1. Verifique se todas as variáveis estão configuradas na Vercel
2. Lembre-se: variáveis devem ter prefixo `VITE_` para serem expostas ao cliente
3. Após alterar variáveis, faça um redeploy

---

## 📋 Checklist Rápido

Antes de cada deploy:
- [ ] Testei localmente com `npm run dev`
- [ ] Verifiquei se não há erros no console
- [ ] Testei as funcionalidades principais
- [ ] Fiz commit com mensagem descritiva
- [ ] Fiz push para o GitHub

---

## 🎯 Resumo do Fluxo

```
1. Editar código localmente
   ↓
2. Testar com npm run dev
   ↓
3. git add . && git commit -m "mensagem"
   ↓
4. git push origin main
   ↓
5. Vercel faz deploy automático ✨
   ↓
6. Verificar no painel da Vercel
```

**É isso! Simples e automático!** 🚀
