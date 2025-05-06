import { decode } from "https://deno.land/std@0.167.0/encoding/base64.ts";

/**
 * Maximum file size in bytes that we'll attempt to process
 * 5MB limit to prevent very large files from causing issues
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Maximum text length we'll include in the context
 * To prevent token overload when sending to OpenAI
 */
const MAX_TEXT_LENGTH = 15000;

/**
 * Extract content from a file based on its type
 * @param fileUrl URL to the file
 * @param fileType MIME type of the file
 * @param fileName Name of the file for reference
 * @param fileSize Size of the file in bytes
 */
export async function extractFileContent(
  fileUrl: string,
  fileType: string,
  fileName: string,
  fileSize: number
): Promise<string | null> {
  // Skip files that are too large
  if (fileSize > MAX_FILE_SIZE) {
    console.log(`Skipping large file ${fileName} (${fileSize} bytes)`);
    return `[File too large to process: ${fileName}]`;
  }

  try {
    console.log(`Attempting to extract content from ${fileName} (${fileType})`);
    
    // Fetch the file content
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      return null;
    }

    // Handle different file types
    if (fileType.startsWith('text/')) {
      // Text files (plain text, CSV, etc.)
      const text = await response.text();
      return truncateText(text, fileName);
    } 
    else if (fileType === 'application/pdf') {
      // For PDFs, we can only provide a description as we don't have a PDF parser in Deno
      return `[PDF File: ${fileName}. PDF content extraction not available in this version.]`;
    }
    else if (fileType.includes('spreadsheet') || 
             fileType.includes('excel') || 
             fileName.endsWith('.xlsx') || 
             fileName.endsWith('.xls')) {
      // Excel files
      return `[Spreadsheet File: ${fileName}. Spreadsheet content extraction not available in this version.]`;
    }
    else if (fileType.includes('word') || 
             fileType.includes('document') || 
             fileName.endsWith('.docx') || 
             fileName.endsWith('.doc')) {
      // Word documents
      return `[Word Document: ${fileName}. Document content extraction not available in this version.]`;
    }
    else if (fileType.includes('image/')) {
      // Images - we can't extract content but can acknowledge them
      return `[Image File: ${fileName}]`;
    }
    else {
      // Other file types
      return `[File: ${fileName} (${fileType}). Content extraction not supported for this file type.]`;
    }
  } catch (error) {
    console.error(`Error extracting content from ${fileName}:`, error);
    return null;
  }
}

/**
 * Truncate text to prevent token limits being exceeded
 */
function truncateText(text: string, fileName: string): string {
  if (text.length <= MAX_TEXT_LENGTH) {
    return `Content of ${fileName}:\n\n${text}`;
  }
  
  const truncated = text.substring(0, MAX_TEXT_LENGTH);
  return `Content of ${fileName} (truncated due to length):\n\n${truncated}\n\n[Content truncated - file continues for ${text.length - MAX_TEXT_LENGTH} more characters]`;
}
