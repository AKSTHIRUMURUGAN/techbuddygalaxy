import { NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
  try {
    const { templateUrl } = await request.json();
    
    if (!templateUrl) {
      return NextResponse.json(
        { error: 'Template URL is required' },
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

    // Validate file format by checking for Word document signature
    if (!buffer || buffer.length < 4) {
      return NextResponse.json(
        { error: 'Invalid or empty file' },
        { status: 400 }
      );
    }

    // Create a PizZip instance with the template content
    let zip;
    try {
      zip = new PizZip(buffer);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid Word document format. Please ensure the file is a valid .docx file.' },
        { status: 400 }
      );
    }
    
    // Extract the document.xml content to find placeholders
    let documentXml = '';
    try {
      if (!zip.files['word/document.xml']) {
        return NextResponse.json(
          { error: 'Invalid Word document structure' },
          { status: 400 }
        );
      }
      documentXml = zip.files['word/document.xml'].asText();
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to read Word document content' },
        { status: 400 }
      );
    }

    // Find all placeholders in the format {placeholder}
    const placeholderRegex = /\{([^}]+)\}/g;
    const matches = [...documentXml.matchAll(placeholderRegex)];
    
    // Extract unique placeholders
    const uniquePlaceholders = [...new Set(matches.map(match => match[1]))];
    
    if (uniquePlaceholders.length === 0) {
      return NextResponse.json(
        { error: 'No placeholders found in the template. Please use {placeholder} format in your Word document.' },
        { status: 400 }
      );
    }
    
    // Create placeholder objects with metadata
    const placeholders = uniquePlaceholders.map(placeholder => {
      const key = placeholder.trim();
      let type = 'text';
      
      // Determine input type based on placeholder name
      if (key.toLowerCase().includes('date')) {
        type = 'date';
      } else if (key.toLowerCase().includes('email')) {
        type = 'email';
      } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile')) {
        type = 'tel';
      } else if (key.toLowerCase().includes('salary') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('price')) {
        type = 'number';
      }
      
      return {
        key,
        type,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(),
        required: true
      };
    });

    return NextResponse.json({
      success: true,
      placeholders,
      templateUrl,
      fileSize: buffer.length,
      message: `Found ${placeholders.length} placeholders in the template`
    });

  } catch (error) {
    console.error('Error analyzing template:', error);
    
    // Handle specific error types
    if (error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Failed to download template. Please check the URL and try again.' },
        { status: 400 }
      );
    }
    
    if (error.message.includes('Array buffer allocation failed')) {
      return NextResponse.json(
        { error: 'Template file is too large or corrupted. Please use a smaller file.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze template. Please ensure the URL points to a valid Word document.' },
      { status: 500 }
    );
  }
}