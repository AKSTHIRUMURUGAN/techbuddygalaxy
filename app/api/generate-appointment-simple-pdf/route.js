import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Path to your existing Word template file
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'appointment-letter.docx');
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: 'Template file not found. Please make sure appointment-letter.docx exists in public/templates/' },
        { status: 404 }
      );
    }
    
    // Read the template file
    const content = fs.readFileSync(templatePath, 'binary');
    
    // Create a PizZip instance with the template content
    const zip = new PizZip(content);
    
    // Create docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Prepare template data - only name and position
    const templateData = {
      name: data.employeeName || '[Name]',
      position: data.position || '[Position]',
      employeeName: data.employeeName || '[Name]', // Alternative placeholder
      // Add current date in case it's needed
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      currentDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    
    // Replace template variables
    doc.render(templateData);
    
    // Generate the Word document buffer
    const docxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    
    // Convert DOCX to PDF using ConvertAPI
    const formData = new FormData();
    formData.append('StoreFile', 'true');
    formData.append('File', new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'appointment-letter.docx');
    
    const convertApiKey = process.env.CONVERT_API_KEY || 'wB0Ler6cEZ4DFSRl93WiYVL64j2x7xF5';
    
    const convertResponse = await fetch('https://v2.convertapi.com/convert/docx/to/pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${convertApiKey}`
      },
      body: formData
    });
    
    if (!convertResponse.ok) {
      throw new Error(`ConvertAPI error: ${convertResponse.status} ${convertResponse.statusText}`);
    }
    
    const convertResult = await convertResponse.json();
    
    if (!convertResult.Files || convertResult.Files.length === 0) {
      throw new Error('No files returned from ConvertAPI');
    }
    
    // Download the converted PDF from ConvertAPI
    const pdfUrl = convertResult.Files[0].Url;
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }
    
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // Return the PDF document
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="appointment-letter-${data.employeeName.replace(/\s+/g, '-').toLowerCase()}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('Error generating PDF from Word template:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF from Word template', details: error.message },
      { status: 500 }
    );
  }
}