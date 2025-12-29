import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 Configuration with better error handling
let r2Client = null;
let r2Available = false;

try {
  if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    
    r2Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true, // Required for R2
      tls: true,
    });
    r2Available = true;
    console.log('R2 storage initialized successfully with endpoint:', endpoint);
  } else {
    console.warn('R2 credentials not configured. Using local storage fallback.');
  }
} catch (error) {
  console.error('Error initializing R2 client:', error);
  r2Available = false;
}

export class R2Storage {
  static async uploadFile(key, buffer, contentType) {
    if (!r2Available || !r2Client) {
      throw new Error('R2 storage not available');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await r2Client.send(command);
      
      // Return the public URL
      return `${process.env.R2_PUBLIC_URL}/${key}`;
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new Error('Failed to upload file to R2');
    }
  }

  static async getSignedUrl(key, expiresIn = 3600) {
    if (!r2Available || !r2Client) {
      throw new Error('R2 storage not available');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
        Key: key,
      });

      return await getSignedUrl(r2Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  static async downloadFile(key) {
    if (!r2Available || !r2Client) {
      throw new Error('R2 storage not available');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
        Key: key,
      });

      const response = await r2Client.send(command);
      return response.Body;
    } catch (error) {
      console.error('Error downloading from R2:', error);
      throw new Error('Failed to download file from R2');
    }
  }

  static isAvailable() {
    return r2Available;
  }
}