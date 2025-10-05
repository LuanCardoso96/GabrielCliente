# 🔐 Configuração de Chaves e Segurança

## ⚠️ IMPORTANTE: Segurança das Chaves

**NUNCA** commite chaves reais do Stripe, Firebase ou outras APIs no repositório Git!

## 🔧 Como Configurar as Chaves

### **1. Para Desenvolvimento Local:**

1. **Copie o arquivo de exemplo:**
   ```bash
   cp env.example .env
   ```

2. **Preencha suas chaves reais no arquivo `.env`:**
   ```env
   STRIPE_SECRET_KEY=sk_live_sua_chave_aqui
   STRIPE_PUBLIC_KEY=pk_live_sua_chave_aqui
   STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_aqui
   ```

3. **O arquivo `.env` está protegido pelo `.gitignore`**

### **2. Para Produção (Deploy):**

Configure as variáveis de ambiente no seu provedor de hosting:

**Vercel:**
```bash
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLIC_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

**Netlify:**
- Site Settings → Environment Variables
- Adicione cada variável individualmente

**Outros provedores:**
- Configure nas variáveis de ambiente do painel

## 🛡️ Proteções Implementadas

### **Arquivos Protegidos pelo .gitignore:**
- `.env` e todas as variações
- `stripe-config.env`
- `firebase-config.env`
- `**/api-keys.json`
- `**/secrets.json`
- `**/credentials.json`
- `**/service-account.json`

### **Arquivos Seguros para Commit:**
- `env.example` - Exemplo sem chaves reais
- `src/api/stripe.js` - Usa variáveis de ambiente
- Documentação - Sem chaves expostas

## 🚨 Se Você Acidentalmente Commitou Chaves

### **1. Revogue as Chaves:**
- Acesse o painel do Stripe
- Revogue as chaves comprometidas
- Gere novas chaves

### **2. Limpe o Histórico:**
```bash
# Remover do último commit
git reset --soft HEAD~1

# Ou usar git filter-branch para limpar histórico
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch arquivo-com-chave' \
  --prune-empty --tag-name-filter cat -- --all
```

### **3. Force Push (CUIDADO):**
```bash
git push origin main --force
```

## 📋 Checklist de Segurança

- [ ] ✅ Arquivo `.env` está no `.gitignore`
- [ ] ✅ Chaves não estão nos arquivos de código
- [ ] ✅ Documentação não expõe chaves reais
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Chaves de produção revogadas se necessário

## 🔍 Verificação

Para verificar se não há chaves expostas:
```bash
# Buscar por padrões de chaves Stripe
grep -r "sk_live_" . --exclude-dir=node_modules
grep -r "pk_live_" . --exclude-dir=node_modules

# Deve retornar vazio se tudo estiver seguro
```

## 📞 Suporte

Se precisar de ajuda com configuração de segurança:
1. Revise este README
2. Consulte a documentação do Stripe
3. Verifique as configurações do seu provedor de hosting
