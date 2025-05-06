
/**
 * Converts bytes to a human-readable size representation
 * @param bytes The size in bytes
 * @returns A human-readable size string (e.g., "3.5 MB")
 */
export const bytesToSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Creates a file path for storage using the user ID and file name
 * @param userId The user's ID
 * @param fileName The original file name
 * @returns A storage path string
 */
export const createStorageFilePath = (userId: string, fileName: string): string => {
  // Create a unique file name to avoid collisions
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = fileName.split('.').pop();
  
  return `${userId}/${timestamp}-${randomString}.${fileExtension}`;
};
