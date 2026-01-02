# Quick Fix for Verification Bucket Issue

## Manual Solution (Recommended)
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **New bucket**
5. Name: `verification-documents`
6. Make it **Private** (uncheck public)
7. Click **Create bucket**

## Alternative: Use existing product-images bucket temporarily
If you need a quick fix, I can modify the code to use the existing `product-images` bucket for now.