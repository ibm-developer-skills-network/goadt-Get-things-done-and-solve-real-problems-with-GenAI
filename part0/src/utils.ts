import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import qs from 'qs';

// Function to convert image file to base64 with correct data URI format
export function imageToBase64(filePath: string): string {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Get file extension to determine the correct MIME type
    const ext = path.extname(filePath).slice(1); // Remove the dot
    let mimeType = '';

    // Map file extensions to MIME types
    switch (ext) {
        case 'png':
            mimeType = 'image/png';
            break;
        case 'jpg':
        case 'jpeg':
            mimeType = 'image/jpeg';
            break;
        case 'gif':
            mimeType = 'image/gif';
            break;
        default:
            throw new Error('Unsupported file type');
    }

    return `data:${mimeType};base64,${base64Image}`;
}

export const getToken = async () => {
    const WATSON_TOKEN = process.env.WATSONX_TOKEN;
    if (WATSON_TOKEN) {
        return WATSON_TOKEN;
    }

    const data = qs.stringify({
      'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
      'apikey': process.env.IBMCLOUD_API_KEY
    });

    const config = {
      method: 'post',
      url: 'https://iam.cloud.ibm.com/identity/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data
    };

    try {
      const response = await axios(config);
      return response?.data?.access_token;
    } catch (error) {
      console.error('Error fetching token:', error);
    }
};