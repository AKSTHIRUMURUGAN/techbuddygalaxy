import { getBaseTemplate } from './baseTemplate';

export const getInvoiceEmailTemplate = (invoice) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const viewUrl = `${appUrl}/invoices/${invoice._id}`;
  
  const content = `
    <div class="email-content">
      <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 20px; font-weight: 700;">
        Invoice for Your Project 📄
      </h1>
      
      <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">
        Dear <strong>${invoice.clientName}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">
        Thank you for choosing our services. Please find your invoice details below.
      </p>
      
      <div class="info-box">
        <h3 style="color: #667eea; margin-bottom: 15px; font-size: 18px;">Invoice Details</h3>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #666666;"><strong>Invoice Number:</strong></td>
            <td style="padding: 8px 0; color: #1a1a1a;">${invoice.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666;"><strong>Project:</strong></td>
            <td style="padding: 8px 0; color: #1a1a1a;">${invoice.projectTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666;"><strong>Invoice Date:</strong></td>
            <td style="padding: 8px 0; color: #1a1a1a;">
              ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666;"><strong>Due Date:</strong></td>
            <td style="padding: 8px 0; color: #dc3545; font-weight: 600;">
              ${new Date(invoice.dueDate).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666;"><strong>Total Amount:</strong></td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 20px; font-weight: 700;">
              ${invoice.currency} ${invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          ${invoice.paidAmount > 0 ? `
          <tr>
            <td style="padding: 8px 0; color: #666666;"><strong>Paid Amount:</strong></td>
            <td style="padding: 8px 0; color: #28a745; font-weight: 600;">
              ${invoice.currency} ${invoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666;"><strong>Balance Due:</strong></td>
            <td style="padding: 8px 0; color: #dc3545; font-weight: 700; font-size: 18px;">
              ${invoice.currency} ${invoice.balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <p style="font-size: 14px; color: #666666; margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
        <strong>Note:</strong> Includes 3 minor revisions free of cost. Additional revisions or major scope changes may incur extra charges.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${viewUrl}" class="btn">View & Pay Invoice</a>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #1a1a1a; margin-bottom: 10px;">Payment Terms</h4>
        <p style="font-size: 14px; color: #555555;">${invoice.paymentTerms}</p>
      </div>
      
      <p style="font-size: 16px; color: #555555; margin-top: 30px;">
        If you have any questions regarding this invoice, please feel free to contact us.
      </p>
      
      <p style="font-size: 16px; color: #555555; margin-top: 20px;">
        Best regards,<br>
        <strong>${process.env.COMPANY_NAME || 'Tech Buddy Galaxy'} Team</strong>
      </p>
    </div>
  `;
  
  return getBaseTemplate(content);
};
