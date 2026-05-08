export const getBaseTemplate = (content) => {
  const companyName = process.env.COMPANY_NAME || 'Tech Buddy Galaxy';
  const companyWebsite = process.env.COMPANY_WEBSITE || 'https://techbuddyspace.in';
  const companyEmail = process.env.COMPANY_EMAIL || 'contact@techbuddyspace.in';
  const companyPhone = process.env.COMPANY_PHONE || '+91-XXXXXXXXXX';
  const instagram = process.env.SOCIAL_INSTAGRAM || '#';
  const linkedin = process.env.SOCIAL_LINKEDIN || '#';
  const whatsapp = process.env.SOCIAL_WHATSAPP || '#';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName}</title>
  <!--[if !mso]><!-->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  </style>
  <!--<![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
  
  <!-- Main Container -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        
        <!-- Email Wrapper -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;" bgcolor="#667eea">
              <!--[if !mso]><!-->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0; text-align: center;">
                    <!-- Logo -->
                    <img src="https://galaxy.techbuddyspace.in/tbg.png" alt="${companyName}" style="height: 60px; width: auto; display: block; margin: 0 auto 15px auto; border: none;" />
                    <!-- Company Name -->
                    <a href="${companyWebsite}" style="font-size: 28px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: -0.5px; display: inline-block;">${companyName}</a>
                    <!-- Tagline -->
                    <p style="margin: 5px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.7); letter-spacing: 1px;">A unit of TechBuddySpace Private Limited</p>
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
              <!--[if mso]>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0;">
                    <img src="https://galaxy.techbuddyspace.in/tbg.png" alt="${companyName}" height="60" style="height: 60px; width: auto; display: block; margin: 0 auto 15px auto; border: none;" />
                    <a href="${companyWebsite}" style="font-size: 28px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: -0.5px;">${companyName}</a>
                    <p style="margin: 5px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.7); letter-spacing: 1px;">A unit of TechBuddySpace Private Limited</p>
                  </td>
                </tr>
              </table>
              <![endif]-->
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;" class="email-body">
              ${content}
            </td>
          </tr>
          
          <!-- Footer Divider -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    
                    <!-- Footer Message -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 0 0 30px 0; font-size: 14px; line-height: 1.8; color: #cccccc; font-style: italic; text-align: center;">
                          Thank you for choosing our services. We truly value your trust and partnership. We believe your company will grow to greater heights, and we are excited to be part of your journey. Looking forward to working with you again soon.
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Footer Links -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 0 0 25px 0; text-align: center;">
                          <a href="${companyWebsite}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 15px; display: inline-block;">Website</a>
                          <a href="mailto:${companyEmail}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 15px; display: inline-block;">Email Us</a>
                          <a href="tel:${companyPhone}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 15px; display: inline-block;">Call Us</a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Social Links -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 0 0 25px 0; text-align: center;">
                          <a href="${instagram}" title="Instagram" style="display: inline-block; margin: 0 10px; color: #ffffff; text-decoration: none; font-size: 24px;">📷</a>
                          <a href="${linkedin}" title="LinkedIn" style="display: inline-block; margin: 0 10px; color: #ffffff; text-decoration: none; font-size: 24px;">💼</a>
                          <a href="${whatsapp}" title="WhatsApp" style="display: inline-block; margin: 0 10px; color: #ffffff; text-decoration: none; font-size: 24px;">💬</a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Contact Info -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 0 0 4px 0; font-size: 13px; color: #999999; text-align: center;">
                          <strong style="color: #ffffff;">${companyName}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 2px 0; font-size: 13px; color: #999999; text-align: center;">
                          Email: <a href="mailto:${companyEmail}" style="color: #667eea; text-decoration: none;">${companyEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 2px 0; font-size: 13px; color: #999999; text-align: center;">
                          Phone: <a href="tel:${companyPhone}" style="color: #667eea; text-decoration: none;">${companyPhone}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 2px 0; font-size: 13px; color: #999999; text-align: center;">
                          Website: <a href="${companyWebsite}" style="color: #667eea; text-decoration: none;">${companyWebsite}</a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Copyright -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 20px 0 0 0; font-size: 12px; color: #666666; text-align: center; border-top: 1px solid #333333;">
                          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;
};