# PDF Generation Guide

## Overview

This project uses **browser-native print functionality** for PDF generation instead of libraries like html2canvas + jsPDF. This approach:

✅ **Preserves exact HTML/CSS/JS rendering** - No conversion issues  
✅ **Supports modern CSS** - Including lab() colors, gradients, custom fonts  
✅ **Better quality** - Native browser rendering instead of canvas conversion  
✅ **Smaller bundle size** - No heavy PDF libraries needed  
✅ **Print-optimized** - Uses CSS @media print rules  

## Problem Solved

**Previous Error:**
```
Error: Attempting to parse an unsupported color function "lab"
```

This occurred because `html2canvas` doesn't support modern CSS color functions like `lab()`, `lch()`, `oklch()`, etc.

## How It Works

### 1. PDF Generation (Browser Print Dialog)

```javascript
import { generatePDF } from '@/lib/utils/pdfGenerator';

// In your component
const handleDownloadPDF = async () => {
  await generatePDF(elementRef.current, 'my-document.pdf');
};
```

**What happens:**
1. Clones the HTML element
2. Extracts all CSS styles from the page
3. Opens a new window with the styled content
4. Triggers the browser's print dialog
5. User selects "Save as PDF" as the destination

**Benefits:**
- Exact rendering of your HTML/CSS
- No color function limitations
- Professional print layout
- User controls page size, margins, etc.

### 2. HTML Download (Standalone File)

```javascript
import { downloadAsHTML } from '@/lib/utils/pdfGenerator';

// In your component
const handleDownloadHTML = () => {
  downloadAsHTML(elementRef.current, 'my-document.html');
};
```

**What happens:**
1. Creates a complete standalone HTML file
2. Embeds all CSS styles inline
3. Downloads as .html file
4. Can be opened in any browser and printed to PDF later

**Benefits:**
- Preserves all styling
- Can be edited later
- Shareable format
- No server required

## Usage Example

```jsx
"use client";
import { useRef } from 'react';
import { generatePDF, downloadAsHTML } from '@/lib/utils/pdfGenerator';

export default function MyDocument() {
  const documentRef = useRef(null);

  return (
    <div>
      {/* Action Buttons */}
      <div className="print:hidden">
        <button onClick={() => window.print()}>
          Print
        </button>
        <button onClick={() => generatePDF(documentRef.current, 'document.pdf')}>
          Download PDF
        </button>
        <button onClick={() => downloadAsHTML(documentRef.current, 'document.html')}>
          Download HTML
        </button>
      </div>

      {/* Document Content */}
      <div ref={documentRef} className="bg-white">
        <h1>My Document</h1>
        <p>Content goes here...</p>
      </div>
    </div>
  );
}
```

## Print Styling Best Practices

### 1. Add Print-Specific CSS

```css
/* Hide elements in print */
.print\\:hidden {
  @media print {
    display: none !important;
  }
}

/* Page setup */
@media print {
  @page {
    size: A4;
    margin: 20mm;
  }
  
  body {
    margin: 0;
    padding: 20px;
  }
  
  /* Avoid page breaks inside elements */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
  }
  
  img, table {
    page-break-inside: avoid;
  }
}
```

### 2. Use Print-Safe Colors

While the new solution supports modern colors, for maximum compatibility:

```css
/* Good - Works everywhere */
color: #1a1a2e;
background: rgb(232, 184, 109);

/* Also works now - Modern CSS */
color: lab(50% 20 30);
background: oklch(0.7 0.15 120);
```

### 3. Hide Interactive Elements

```jsx
<button className="print:hidden">
  Click me
</button>

<div className="no-print">
  This won't appear in PDF
</div>
```

## Troubleshooting

### Issue: Pop-up blocked

**Solution:** The browser blocked the print window. Allow pop-ups for your site.

```javascript
const printWindow = window.open('', '_blank');
if (!printWindow) {
  alert('Please allow pop-ups to download PDF');
  return;
}
```

### Issue: Styles not appearing

**Solution:** Ensure styles are loaded before printing.

```javascript
// Wait for styles to load
await new Promise(resolve => {
  printWindow.onload = resolve;
  setTimeout(resolve, 1000); // Fallback
});
```

### Issue: Images not showing

**Solution:** Use inline images or ensure CORS is configured.

```jsx
// Good - Inline base64
<img src="data:image/png;base64,..." />

// Good - Same origin
<img src="/images/logo.png" />

// May fail - External without CORS
<img src="https://external.com/image.png" />
```

## Server-Side PDF Generation

For server-side PDF generation (e.g., email attachments), this project uses:

- **Puppeteer** - For HTML to PDF conversion on the server
- **ConvertAPI** - For DOCX to PDF conversion

See `app/api/generate-*-pdf/` routes for examples.

## Migration from html2canvas + jsPDF

If you're migrating from the old approach:

### Before:
```javascript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const canvas = await html2canvas(element);
const pdf = new jsPDF();
pdf.addImage(canvas.toDataURL(), 'PNG', 0, 0);
pdf.save('document.pdf');
```

### After:
```javascript
import { generatePDF } from '@/lib/utils/pdfGenerator';

await generatePDF(element, 'document.pdf');
```

### Benefits:
- ✅ No more color function errors
- ✅ Better rendering quality
- ✅ Smaller bundle size
- ✅ Simpler code
- ✅ Native browser features

## Dependencies

**Removed:**
- ❌ `html2canvas` - No longer needed
- ❌ `jspdf` - No longer needed (for client-side)

**Current:**
- ✅ Native browser APIs only
- ✅ `react-hot-toast` - For user notifications

## Additional Resources

- [MDN: Window.print()](https://developer.mozilla.org/en-US/docs/Web/API/Window/print)
- [CSS @page](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)
- [Print Stylesheet Guide](https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/)

---

**Last Updated:** May 8, 2026  
**Maintained by:** Tech Buddy Galaxy Team
