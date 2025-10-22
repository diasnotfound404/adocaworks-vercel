# FreelaClone - Marketplace de Freelancers

Uma plataforma completa de marketplace para freelancers, similar ao 99Freelas, construída com Next.js, Supabase e Mercado Pago.

## 🚀 Funcionalidades

### Autenticação e Usuários
- ✅ Cadastro e login com email/senha
- ✅ Perfis de usuário (Cliente, Freelancer, Admin)
- ✅ Verificação de email
- ✅ Sistema de KYC (Know Your Customer)

### Projetos e Propostas
- ✅ Criação de projetos por clientes
- ✅ Sistema de propostas para freelancers
- ✅ Códigos únicos de 10 caracteres para rastreamento
- ✅ Categorização de projetos
- ✅ Orçamento e prazos

### Pagamentos e Escrow
- ✅ Sistema de marcos (milestones) de pagamento
- ✅ Integração com Mercado Pago
- ✅ Escrow: pagamento retido até conclusão
- ✅ Liberação de pagamento por marco
- ✅ Histórico de transações
- ✅ Saldo de freelancers

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

## 🚀 Como Executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente (Supabase)
4. Execute os scripts SQL na ordem (001 a 010)
5. Execute o projeto: `npm run dev`

## 🔐 Variáveis de Ambiente

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

## 📝 Webhooks

### Mercado Pago
- URL: `/api/webhooks/mercadopago`
- Eventos: payment, refund

### Teste
- URL: `/api/webhooks/test`
- Para desenvolvimento e testes

## 🎯 Próximos Passos

- [ ] Implementar sistema de avaliações
- [ ] Adicionar chat em tempo real
- [ ] Sistema de portfólio para freelancers
- [ ] Filtros avançados de busca
- [ ] Dashboard de analytics
- [ ] Integração com mais gateways de pagamento

## 📄 Licença

Este projeto é um exemplo educacional.
