import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

  static async uploadJSON(key, data) {
    if (!r2Available || !r2Client) {
      throw new Error('R2 storage not available');
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString, 'utf8');

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
        Key: key,
        Body: buffer,
        ContentType: 'application/json',
      });

      await r2Client.send(command);
      console.log('JSON data uploaded to R2:', key);
      return key;
    } catch (error) {
      console.error('Error uploading JSON to R2:', error);
      throw new Error('Failed to upload JSON data to R2');
    }
  }

  static async downloadJSON(key) {
    if (!r2Available || !r2Client) {
      throw new Error('R2 storage not available');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
        Key: key,
      });

      const response = await r2Client.send(command);
      const bodyString = await response.Body.transformToString();
      return JSON.parse(bodyString);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new Error('Application not found');
      }
      console.error('Error downloading JSON from R2:', error);
      throw new Error('Failed to download JSON data from R2');
    }
  }

  static async listApplications() {
    if (!r2Available || !r2Client) {
      throw new Error('R2 storage not available');
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
        Prefix: 'applications/',
      });

      const response = await r2Client.send(command);
      const applications = [];

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key.endsWith('.json')) {
            try {
              const applicationData = await this.downloadJSON(object.Key);
              applications.push(applicationData);
            } catch (error) {
              console.warn(`Failed to load application ${object.Key}:`, error.message);
            }
          }
        }
      }

      return applications;
    } catch (error) {
      console.error('Error listing applications from R2:', error);
      throw new Error('Failed to list applications from R2');
    }
  }

  static async deleteApplication(applicationId) {
    if (!r2Available || !r2Client) {
      throw new Error('R2 storage not available');
    }

    try {
      // Delete application JSON
      const applicationKey = `applications/${applicationId}.json`;
      await r2Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
        Key: applicationKey,
      }));

      // Try to delete associated resume file
      try {
        const resumeKey = `resumes/${applicationId}`;
        // List all files with this prefix to find the resume
        const listCommand = new ListObjectsV2Command({
          Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
          Prefix: resumeKey,
        });
        
        const listResponse = await r2Client.send(listCommand);
        if (listResponse.Contents) {
          for (const object of listResponse.Contents) {
            await r2Client.send(new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
              Key: object.Key,
            }));
          }
        }
      } catch (resumeError) {
        console.warn('Could not delete resume file:', resumeError.message);
      }

      console.log('Application deleted from R2:', applicationId);
    } catch (error) {
      console.error('Error deleting application from R2:', error);
      throw new Error('Failed to delete application from R2');
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

  static async deleteFile(key) {
    if (!r2Available || !r2Client) {
      throw new Error('R2 storage not available');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET || 'techbuddy-applications',
        Key: key,
      });

      await r2Client.send(command);
      console.log('File deleted from R2:', key);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw new Error('Failed to delete file from R2');
    }
  }

  static isAvailable() {
    return r2Available;
  }
}