import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://looacbgrwnnjhtkhaxrz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2FjYmdyd25uamh0a2hheHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTU1MzcsImV4cCI6MjA3MjE5MTUzN30.i8B_lAh_0vq2jJjqphiz3QQgbAm6HLEqu9wEh5l_YSw'
)

async function createVerificationBucket() {
  try {
    const { data, error } = await supabase.storage.createBucket('verification-documents', {
      public: false
    })

    if (error) {
      console.error('Error:', error.message)
    } else {
      console.log('Bucket created successfully')
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

createVerificationBucket()