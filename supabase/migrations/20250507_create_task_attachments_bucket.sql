
-- Create storage bucket for task attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'task-attachments', 'Task Attachments', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'task-attachments'
);

-- Create RLS policy to allow read access to authenticated users
CREATE POLICY "Task attachments are accessible to authenticated users" 
ON storage.objects FOR SELECT 
TO authenticated
USING (bucket_id = 'task-attachments');

-- Create RLS policy to allow users to insert their own uploads
CREATE POLICY "Users can upload task attachments" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'task-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create RLS policy to allow users to delete their own uploads
CREATE POLICY "Users can delete their own task attachments" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'task-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
