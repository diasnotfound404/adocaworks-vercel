// NEW FEATURE - PDF Receipt Generator
export interface ReceiptData {
  transaction: {
    id: string
    code: string
    amount: number
    status: string
    payment_method: string
    created_at: string
  }
  project: {
    id: string
    title: string
    code: string
  }
  payer: {
    full_name: string
    email: string
    cpf?: string
  }
  payee: {
    full_name: string
    email: string
    cpf?: string
  }
  milestone?: {
    title: string
    description: string
  }
}

export function generateReceiptHTML(data: ReceiptData): string {
  const date = new Date(data.transaction.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007AFF;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #007AFF;
          margin: 0;
          font-size: 32px;
        }
        .header p {
          color: #666;
          margin: 5px 0 0 0;
        }
        .receipt-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .receipt-info h2 {
          margin-top: 0;
          color: #007AFF;
          font-size: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        .amount-section {
          background: #007AFF;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 30px 0;
        }
        .amount-section h3 {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: normal;
        }
        .amount-section .amount {
          font-size: 36px;
          font-weight: bold;
          margin: 0;
        }
        .parties {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 30px 0;
        }
        .party {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .party h3 {
          margin-top: 0;
          color: #007AFF;
          font-size: 18px;
        }
        .party p {
          margin: 5px 0;
          color: #666;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          color: #999;
          font-size: 12px;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          background: #10B981;
          color: white;
          font-size: 14px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>aDocaWorks</h1>
        <p>Recibo de Pagamento</p>
      </div>

      <div class="receipt-info">
        <h2>Informações do Recibo</h2>
        <div class="info-row">
          <span class="info-label">Código da Transação:</span>
          <span class="info-value">${data.transaction.code}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Data:</span>
          <span class="info-value">${date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><span class="status-badge">PAGO</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Método de Pagamento:</span>
          <span class="info-value">${data.transaction.payment_method || "Mercado Pago"}</span>
        </div>
      </div>

      <div class="amount-section">
        <h3>Valor Total</h3>
        <p class="amount">R$ ${data.transaction.amount.toFixed(2)}</p>
      </div>

      <div class="receipt-info">
        <h2>Detalhes do Projeto</h2>
        <div class="info-row">
          <span class="info-label">Projeto:</span>
          <span class="info-value">${data.project.title}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Código do Projeto:</span>
          <span class="info-value">${data.project.code}</span>
        </div>
        ${
          data.milestone
            ? `
        <div class="info-row">
          <span class="info-label">Marco:</span>
          <span class="info-value">${data.milestone.title}</span>
        </div>
        `
            : ""
        }
      </div>

      <div class="parties">
        <div class="party">
          <h3>Pagador</h3>
          <p><strong>${data.payer.full_name}</strong></p>
          <p>${data.payer.email}</p>
          ${data.payer.cpf ? `<p>CPF: ${data.payer.cpf}</p>` : ""}
        </div>
        <div class="party">
          <h3>Beneficiário</h3>
          <p><strong>${data.payee.full_name}</strong></p>
          <p>${data.payee.email}</p>
          ${data.payee.cpf ? `<p>CPF: ${data.payee.cpf}</p>` : ""}
        </div>
      </div>

      <div class="footer">
        <p>Este é um recibo eletrônico gerado automaticamente pela plataforma aDocaWorks.</p>
        <p>Para dúvidas ou suporte, entre em contato através do nosso site.</p>
        <p>&copy; 2025 aDocaWorks - Todos os direitos reservados</p>
      </div>
    </body>
    </html>
  `
}
