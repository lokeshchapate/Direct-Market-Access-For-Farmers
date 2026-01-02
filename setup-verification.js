import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://looacbgrwnnjhtkhaxrz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2FjYmdyd25uamh0a2hheHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTU1MzcsImV4cCI6MjA3MjE5MTUzN30.i8B_lAh_0vq2jJjqphiz3QQgbAm6HLEqu9wEh5l_YSw'
)

async function setupVerification() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE;
      `
    })

    if (error) {
      console.error('Error:', error.message)
    } else {
      console.log('Verification columns added successfully')
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

setupVerification()