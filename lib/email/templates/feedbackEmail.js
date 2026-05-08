import { getBaseTemplate } from './baseTemplate';

export const getFeedbackRequestEmailTemplate = (service, client) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const feedbackUrl = `${appUrl}/quotations/${service._id}/feedback`;
  
  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      
      <!-- Feedback Badge -->
      <tr>
        <td align="center" style="padding: 10px 0 30px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 8px 20px; border-radius: 20px;">
                <span style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; font-weight: 600;">Feedback Request</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Title -->
      <tr>
        <td style="padding: 0 0 10px 0; text-align: center;">
          <h1 style="color: #1a1a2e; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.3;">
            We'd Love Your Feedback! ⭐
          </h1>
        </td>
      </tr>
      
      <!-- Subtitle -->
      <tr>
        <td style="padding: 0 0 30px 0; text-align: center;">
          <p style="color: #6b6b80; font-size: 15px; margin: 0; font-style: italic; font-family: 'Georgia', 'Times New Roman', serif;">
            Your opinion helps us grow and serve you better
          </p>
        </td>
      </tr>
      
      <!-- Greeting -->
      <tr>
        <td style="padding: 0 0 5px 0;">
          <p style="font-size: 17px; color: #1a1a2e; margin: 0; font-weight: 600; font-family: 'Georgia', 'Times New Roman', serif;">
            Dear ${client.name},
          </p>
        </td>
      </tr>
      
      <!-- Intro Text -->
      <tr>
        <td style="padding: 0 0 20px 0;">
          <p style="font-size: 15px; color: #555555; line-height: 1.8; margin: 0;">
            Thank you for trusting us with your project <strong>${service.projectTitle}</strong>. It was a pleasure working with you!
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 0 0 30px 0;">
          <p style="font-size: 15px; color: #555555; line-height: 1.8; margin: 0;">
            Your feedback is incredibly valuable to us. It helps us understand what we're doing well and where we can improve. We would greatly appreciate if you could take a moment to share your experience.
          </p>
        </td>
      </tr>
      
      <!-- CTA Button -->
      <tr>
        <td align="center" style="padding: 0 0 35px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50px; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);">
                <a href="${feedbackUrl}" style="display: inline-block; padding: 15px 45px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.5px;">
                  Share Your Feedback →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Info Box -->
      <tr>
        <td style="padding: 0 0 30px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #e8f5e9; border: 1px solid #a5d6a7; border-left: 4px solid #4caf50; border-radius: 8px;">
            <tr>
              <td style="padding: 16px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="vertical-align: top; padding-right: 10px; font-size: 16px;">
                      ✨
                    </td>
                    <td style="font-size: 13px; color: #2e7d32; line-height: 1.7;">
                      <strong style="color: #1b5e20;">Your feedback matters!</strong><br>
                      It takes just 2 minutes and helps us continue delivering exceptional service to you and others.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Closing Text -->
      <tr>
        <td style="padding: 0 0 20px 0;">
          <p style="font-size: 15px; color: #555555; line-height: 1.8; margin: 0;">
            We look forward to working with you again in the future!
          </p>
        </td>
      </tr>
      
      <!-- Signature -->
      <tr>
        <td style="padding: 0;">
          <p style="font-size: 15px; color: #1a1a2e; margin: 0; line-height: 1.8;">
            Warm regards,<br>
            <strong>Tech Buddy Galaxy Team</strong>
          </p>
        </td>
      </tr>
      
    </table>
  `;
  
  return getBaseTemplate(content);
};
