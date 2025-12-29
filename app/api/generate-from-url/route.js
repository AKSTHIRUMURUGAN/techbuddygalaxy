import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { NextResponse } from 'next/server';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
  try {
    const { templateUrl, data } = await request.json();
    
    if (!templateUrl) {
      return NextResponse.json(
        { error: 'Template URL is required' },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Data is required' },
        { status: 400 }
      );
    }

    // Download the template file from URL with size limit
    const response = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to download template: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Template file is too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Read response as stream to handle large files better
    const chunks = [];
    const reader = response.body?.getReader();
    
    if (!reader) {
      return NextResponse.json(
        { error: 'Failed to read template file' },
        { status: 400 }
      );
    }

    let totalSize = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      totalSize += value.length;
      
      // Check size limit during streaming
      if (totalSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'Template file is too large. Maximum size is 10MB.' },
          { status: 400 }
        );
      }
      
      chunks.push(value);
    }

    // Combine chunks into buffer
    const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
    
    // Create a PizZip instance with the template content
    let zip;
    try {
      zip = new PizZip(buffer);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid Word document format' },
        { status: 400 }
      );
    }
    
    // Create docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Add current date to data if not provided
    const templateData = {
      ...data,
      currentDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    
    // Replace template variables
    doc.render(templateData);
    
    // Generate the document
    const docBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    
    // Return the Word document
    return new NextResponse(docBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="generated-document.docx"',
      },
    });
    
  } catch (error) {
    console.error('Error generating document from URL:', error);
    
    // Handle specific error types
    if (error.message.includes('Array buffer allocation failed')) {
      return NextResponse.json(
        { error: 'Template file is too large or corrupted. Please use a smaller file.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate document', details: error.message },
      { status: 500 }
    );
  }
}