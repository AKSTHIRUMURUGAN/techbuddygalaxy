import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Path to your Word template file
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'appointment-letter-template.docx');
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: 'Template file not found. Please upload appointment-letter-template.docx to public/templates/' },
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
    
    // Prepare template data
    const templateData = {
      employeeName: data.employeeName || '[Employee Name]',
      position: data.position || '[Position]',
      department: data.department || '[Department]',
      startDate: data.startDate ? new Date(data.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '[Start Date]',
      salary: data.salary ? parseInt(data.salary).toLocaleString() : '[Salary]',
      companyName: data.companyName || 'Tech Buddy Space',
      companyAddress: data.companyAddress || '[Company Address]',
      reportingManager: data.reportingManager || '[Reporting Manager]',
      hrName: data.hrName || '[HR Name]',
      hrTitle: data.hrTitle || 'HR Manager',
      currentDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      workLocation: data.workLocation || 'Main Office',
      probationPeriod: data.probationPeriod || '6 months'
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
        'Content-Disposition': `attachment; filename="appointment-letter-${data.employeeName ? data.employeeName.replace(/\s+/g, '-').toLowerCase() : 'employee'}.docx"`,
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