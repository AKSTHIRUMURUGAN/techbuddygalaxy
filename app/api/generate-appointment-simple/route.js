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
    
    // Generate the document
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    
    // Return the Word document
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="appointment-letter-${data.employeeName.replace(/\s+/g, '-').toLowerCase()}.docx"`,
      },
    });
    
  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json(
      { error: 'Failed to generate Word document', details: error.message },
      { status: 500 }
    );
  }
}