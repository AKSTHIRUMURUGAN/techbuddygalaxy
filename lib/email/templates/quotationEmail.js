import { getBaseTemplate } from './baseTemplate';

export const getQuotationEmailTemplate = (quotation) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const viewUrl = `${appUrl}/quotations/${quotation._id}`;

  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      
      <!-- Quotation Badge -->
      <tr>
        <td align="center" style="padding: 10px 0 30px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 8px 20px; border-radius: 20px;">
                <span style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; font-weight: 600;">Official Quotation</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Title -->
      <tr>
        <td style="padding: 0 0 10px 0; text-align: center;">
          <h1 style="color: #1a1a2e; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.3;">
            Your Custom Quotation
          </h1>
        </td>
      </tr>
      
      <!-- Subtitle -->
      <tr>
        <td style="padding: 0 0 30px 0; text-align: center;">
          <p style="color: #6b6b80; font-size: 15px; margin: 0; font-style: italic; font-family: 'Georgia', 'Times New Roman', serif;">
            Crafted with precision for your project ✦
          </p>
        </td>
      </tr>
      
      <!-- Greeting -->
      <tr>
        <td style="padding: 0 0 5px 0;">
          <p style="font-size: 17px; color: #1a1a2e; margin: 0; font-weight: 600; font-family: 'Georgia', 'Times New Roman', serif;">
            Dear ${quotation.clientName},
          </p>
        </td>
      </tr>
      
      <!-- Intro Text -->
      <tr>
        <td style="padding: 0 0 30px 0;">
          <p style="font-size: 15px; color: #555555; line-height: 1.8; margin: 0;">
            Thank you for considering our services. We're excited to present a detailed quotation tailored specifically for your project requirements. Please review the details below.
          </p>
        </td>
      </tr>
      
      <!-- Quotation Details Card -->
      <tr>
        <td style="padding: 0 0 25px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%); border-radius: 12px; overflow: hidden;">
            
            <!-- Card Header -->
            <tr>
              <td style="padding: 20px 25px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px; color: #c4b5fd; text-transform: uppercase; width: 50%;">
                      Quotation Details
                    </td>
                    <td style="width: 50%; text-align: right;">
                      <!-- Decorative line -->
                      <div style="height: 1px; background: rgba(255,255,255,0.1);"></div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Quotation Number -->
            <tr>
              <td style="padding: 0 25px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 50%;">
                      <span style="font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); text-transform: uppercase; white-space: nowrap;">QUOTATION NO.</span>
                    </td>
                    <td style="padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 50%; text-align: right;">
                      <span style="font-size: 14px; color: #ffffff; font-weight: 600; white-space: nowrap;">${quotation.quotationNumber}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Project Title -->
            <tr>
              <td style="padding: 0 25px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 50%;">
                      <span style="font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); text-transform: uppercase; white-space: nowrap;">PROJECT</span>
                    </td>
                    <td style="padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 50%; text-align: right;">
                      <span style="font-size: 14px; color: #ffffff; font-weight: 600; white-space: nowrap;">${quotation.projectTitle}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Total Amount -->
            <tr>
              <td style="padding: 0 25px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.1); width: 45%; vertical-align: middle;">
                      <span style="font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); text-transform: uppercase; white-space: nowrap;">TOTAL AMOUNT</span>
                    </td>
                    <td style="padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.1); width: 55%; text-align: right; vertical-align: middle;">
                      <span style="font-size: 24px; color: #ffffff; font-weight: 700; letter-spacing: -0.5px; white-space: nowrap;">
                        ${quotation.currency} ${quotation.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Valid Till -->
            <tr>
              <td style="padding: 0 25px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 16px 0; width: 50%;">
                      <span style="font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); text-transform: uppercase; white-space: nowrap;">VALID UNTIL</span>
                    </td>
                    <td style="padding: 16px 0; width: 50%; text-align: right;">
                      <span style="font-size: 14px; color: #ffffff; font-weight: 600; white-space: nowrap;">
                        ${new Date(quotation.validTill).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
      
      <!-- Note Box -->
      <tr>
        <td style="padding: 0 0 30px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fffbf0; border: 1px solid #f5dfa0; border-left: 4px solid #f0b429; border-radius: 8px;">
            <tr>
              <td style="padding: 16px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="vertical-align: top; padding-right: 10px; font-size: 16px;">
                      📋
                    </td>
                    <td style="font-size: 13px; color: #7a6000; line-height: 1.7;">
                      <strong style="color: #5a4500;">Note:</strong> This quotation includes 3 minor revisions free of cost. Additional revisions or major scope changes may incur extra charges as per project requirements.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- CTA Button -->
      <tr>
        <td align="center" style="padding: 0 0 35px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background: linear-gradient(135deg, #302b63 0%, #24243e 100%); border-radius: 50px; box-shadow: 0 4px 15px rgba(48, 43, 99, 0.3);">
                <a href="${viewUrl}" style="display: inline-block; padding: 15px 45px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.5px;">
                  View Full Quotation →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Closing Text -->
      <tr>
        <td style="padding: 0 0 20px 0;">
          <p style="font-size: 15px; color: #555555; line-height: 1.8; margin: 0;">
            If you have any questions or would like to discuss this quotation further, please don't hesitate to reach out. We're always here to help.
          </p>
        </td>
      </tr>
      
      <!-- Signature -->
      <tr>
        <td style="padding: 0;">
          <p style="font-size: 15px; color: #1a1a2e; margin: 0; line-height: 1.8;">
            Warm regards,<br>
            <strong style="font-family: 'Georgia', 'Times New Roman', serif;">${process.env.COMPANY_NAME || 'Tech Buddy Galaxy'} Team</strong>
          </p>
        </td>
      </tr>
      
    </table>
  `;
  
  return getBaseTemplate(content);
};