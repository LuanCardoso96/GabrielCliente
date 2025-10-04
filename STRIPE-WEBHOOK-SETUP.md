# Configuração do Webhook Stripe

## 🔗 Configuração do Webhook

Para que o sistema funcione completamente, você precisa configurar um webhook no painel do Stripe:

### 1. **Acesse o Painel do Stripe**
- Vá para: https://dashboard.stripe.com/webhooks
- Clique em "Add endpoint"

### 2. **Configure o Endpoint**
- **URL do Endpoint:** `https://sua-funcao-serverless.com/stripe-webhook`
- **Eventos para Escutar:**
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

### 3. **Obtenha o Webhook Secret**
- Após criar o webhook, copie o "Signing secret"
- Substitua `whsec_...` no arquivo `src/api/stripe.js` pela chave real

### 4. **Teste o Webhook**
- Use o Stripe CLI para testar localmente:
```bash
stripe listen --forward-to localhost:3000/stripe-webhook
```

## 🚀 Deploy da Função Serverless

### **Para Deno Deploy:**
1. Crie um arquivo `functions/stripe.js` com o código da função
2. Configure as variáveis de ambiente:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_BASE64`

### **Para Vercel:**
1. Crie `api/stripe.js` na pasta `pages/api/`
2. Configure as variáveis no painel do Vercel

### **Para Netlify:**
1. Crie `netlify/functions/stripe.js`
2. Configure as variáveis no painel do Netlify

## 🔒 Segurança

### **Importante:**
- ✅ **Chaves Live** estão configuradas para produção
- ⚠️ **Nunca** commite as chaves secretas no Git
- 🔐 Use variáveis de ambiente sempre
- 🛡️ Configure CORS adequadamente

### **Verificação:**
- Teste com valores pequenos primeiro
- Monitore os logs do Stripe
- Verifique se os pedidos estão sendo salvos no Firestore

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do Stripe Dashboard
2. Consulte a documentação oficial do Stripe
3. Teste com o Stripe CLI localmente
