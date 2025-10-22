# aDocaWorks - Marketplace de Freelancers

Uma plataforma completa de marketplace para freelancers, similar ao 99Freelas, construída com Next.js, Supabase e Mercado Pago.

## 🚀 Funcionalidades

### Autenticação e Usuários
- ✅ Cadastro e login com email/senha
- ✅ Perfis de usuário (Cliente, Freelancer, Admin)
- ✅ Verificação de email
- ✅ Sistema de KYC (Know Your Customer)
- ✅ Categorias e subcategorias de projetos
- ✅ Sistema de gamificação com níveis e conquistas
- ✅ Cashback de 2% para clientes
- ✅ Sistema de avaliações com múltiplos critérios
- ✅ Chat interno entre cliente e freelancer

### Projetos e Propostas
- ✅ Criação de projetos por clientes
- ✅ Sistema de propostas para freelancers
- ✅ Códigos únicos de 10 caracteres para rastreamento
- ✅ Categorização de projetos com filtros
- ✅ Orçamento e prazos
- ✅ Projetos com preço fixo ou orçamento aberto
- ✅ Matching inteligente de freelancers com IA

### Pagamentos e Escrow
- ✅ Sistema de marcos (milestones) de pagamento
- ✅ Integração com Mercado Pago
- ✅ Escrow: pagamento retido até conclusão
- ✅ Liberação de pagamento por marco
- ✅ Histórico de transações
- ✅ Saldo de freelancers
- ✅ Recibos em PDF

### Disputas e Resolução
- ✅ Sistema de abertura de disputas
- ✅ Painel administrativo para resolução
- ✅ Notificações para todas as partes
- ✅ Histórico completo de disputas

### Notificações
- ✅ Sistema de notificações em tempo real
- ✅ Notificações para propostas, pagamentos e disputas
- ✅ Indicador de notificações não lidas
- ✅ Página dedicada de notificações

### Webhooks
- ✅ Endpoint para Mercado Pago
- ✅ Endpoint de teste para desenvolvimento
- ✅ Validação de assinaturas
- ✅ Processamento assíncrono

### Segurança
- ✅ Row Level Security (RLS) no Supabase
- ✅ Audit logs completos
- ✅ Validação de permissões
- ✅ Rate limiting (recomendado para produção)

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Pagamentos**: Mercado Pago
- **Deploy**: Vercel

## 📦 Estrutura do Banco de Dados

- `profiles` - Perfis de usuários
- `projects` - Projetos publicados
- `proposals` - Propostas de freelancers
- `milestones` - Marcos de pagamento
- `transactions` - Transações financeiras
- `disputes` - Disputas entre partes
- `notifications` - Notificações do sistema
- `audit_logs` - Logs de auditoria
- `kyc_data` - Dados de verificação KYC
- `categories` - Categorias de projetos
- `subcategories` - Subcategorias de projetos
- `reviews` - Avaliações de usuários
- `conversations` - Conversas de chat
- `messages` - Mensagens de chat
- `user_levels` - Níveis de gamificação
- `achievements` - Conquistas disponíveis
- `user_achievements` - Conquistas dos usuários
- `cashback_transactions` - Transações de cashback

## 🚀 Como Executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente (Supabase e Mercado Pago)
4. Execute os scripts SQL na ordem (001 a 015)
5. Execute o projeto: `npm run dev`

## 🔐 Variáveis de Ambiente

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_token
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## 📝 Webhooks

### Mercado Pago
- URL: `/api/webhooks/mercadopago`
- Eventos: payment, refund

### Teste
- URL: `/api/webhooks/test`
- Para desenvolvimento e testes

## 🎯 Diferenciais do aDocaWorks

- **Taxa transparente de 7%** - Sem surpresas, taxa fixa e justa
- **Cashback de 2%** - Clientes ganham créditos em cada pagamento
- **Gamificação completa** - Níveis, conquistas e badges para freelancers
- **IA de Matching** - Recomendações inteligentes de freelancers para projetos
- **Chat integrado** - Comunicação direta e segura na plataforma
- **Pagamento seguro** - Sistema de escrow protege ambas as partes
- **Avaliações detalhadas** - Múltiplos critérios (comunicação, qualidade, prazo)
- **Recibos automáticos** - PDFs gerados automaticamente

## 📄 Licença

Este projeto é um exemplo educacional baseado no modelo do 99Freelas.
