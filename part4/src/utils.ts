import * as fs from 'fs';
import * as path from 'path';

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
