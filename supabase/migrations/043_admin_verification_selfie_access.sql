-- Allow admins to read all verification selfies (private bucket)
CREATE POLICY "Admins read all verification selfies"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'verification-selfies'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
