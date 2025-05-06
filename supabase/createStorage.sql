
-- This file can be used to create the project-attachments bucket if it doesn't exist

-- First check if the bucket exists
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE name = 'project-attachments'
  ) INTO bucket_exists;

  IF NOT bucket_exists THEN
    -- Create the project-attachments bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('project-attachments', 'project-attachments', true);
    
    -- Add policy to allow authenticated users to upload files
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Authenticated users can upload files',
      '(auth.role() = ''authenticated'')',
      'project-attachments'
    );
    
    RAISE NOTICE 'Created project-attachments bucket with upload policy';
  ELSE
    RAISE NOTICE 'Bucket project-attachments already exists';
  END IF;
END $$;
