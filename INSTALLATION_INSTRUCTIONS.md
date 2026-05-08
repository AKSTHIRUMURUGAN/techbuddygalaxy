# Installation Instructions for Enhanced Quotation System

## Required Dependencies

The enhanced quotation system requires the following npm packages:

```bash
npm install jspdf html2canvas
```

### Package Details:

1. **jsPDF** - PDF generation library
   - Used for creating PDF documents from quotations
   - Enables download and email attachment features

2. **html2canvas** - HTML to canvas converter
   - Converts HTML elements to canvas for PDF generation
   - Ensures accurate rendering of quotation previews

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install jspdf html2canvas
   ```

2. **Verify Installation**
   ```bash
   npm list jspdf html2canvas
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test the System**
   - Navigate to `/admin/quotations`
   - Click "Create Quotation"
   - Follow the 4-step workflow
   - Test PDF generation in Preview step

## Environment Variables

Make sure these are set in `.env.local`:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com

# Company Information
COMPANY_NAME=Tech Buddy Galaxy
COMPANY_EMAIL=contact@techbuddyspace.in
COMPANY_PHONE=+91-XXXXXXXXXX
COMPANY_WEBSITE=https://techbuddyspace.in
COMPANY_ADDRESS=Your Company Address
COMPANY_GST=Your GST Number

# Application URL (for feedback links)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Features Enabled

After installation, you'll have access to:

✅ **4-Step Quotation Workflow**
- Step 1: Create (with service catalog)
- Step 2: Preview (with PDF download)
- Step 3: Send Email (Gmail integration)
- Step 4: Feedback (public form link)

✅ **PDF Generation**
- Download quotations as PDF
- Professional formatting
- Print-friendly layout

✅ **Service Catalog**
- Quick add pre-defined services
- 8 common services included
- Easy customization

✅ **Public Feedback Form**
- Multi-criteria ratings
- Star rating system
- Recommendation toggle
- Thank you page

✅ **Enhanced Email Composer**
- Editable email templates
- Gmail integration
- CC support
- Professional formatting

## Troubleshooting

### PDF Generation Issues

If PDF generation fails:

1. Check browser console for errors
2. Ensure html2canvas and jsPDF are installed
3. Try clearing browser cache
4. Check if element ref is properly set

### Email Sending Issues

If emails fail to send:

1. Verify Gmail App Password is correct
2. Check EMAIL_* environment variables
3. Ensure 2FA is enabled on Gmail account
4. Test with a simple email first

### Feedback Form Issues

If feedback form doesn't load:

1. Check NEXT_PUBLIC_APP_URL is set
2. Verify quotation ID is valid
3. Check MongoDB connection
4. Review browser console for errors

## Next Steps

1. **Test the Complete Workflow**
   - Create a test quotation
   - Preview and download PDF
   - Send test email
   - Submit test feedback

2. **Customize Service Catalog**
   - Edit `components/quotations/workflow/ServiceCatalog.js`
   - Add your own services and pricing

3. **Customize Email Templates**
   - Edit `components/quotations/workflow/EmailStep.js`
   - Modify the `generateEmailBody` function

4. **Customize Company Branding**
   - Update company logo in preview components
   - Modify colors in Tailwind classes
   - Update footer information

## Support

For issues or questions:
- Check `QUOTATION_SYSTEM_STATUS.md` for known issues
- Review `QUOTATION_SYSTEM_GUIDE.md` for usage guide
- Check browser console for error messages

---

**Installation Complete!** 🎉

Your professional quotation system is now ready to use.
