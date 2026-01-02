-- Add verification columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE;

-- Update your specific profile to verified status
-- Replace 'your-user-id' with your actual user ID from auth.users table
UPDATE profiles 
SET verification_status = 'verified', 
    verification_submitted_at = NOW() 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1);