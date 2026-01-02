# Farmer Verification Setup Guide

## Issue
The verification documents submission is failing because the database schema and storage bucket for verification are not set up.

## Solution

### Step 1: Run Database Schema
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-verification-schema.sql`
4. Click "Run" to execute the SQL

### Step 2: Verify Storage Bucket
1. Go to Storage in your Supabase dashboard
2. Check if `verification-documents` bucket exists
3. If not, it should be created by the SQL script above

### Step 3: Test the Fix
1. Try uploading verification documents again
2. The error should now be resolved

## What the Fix Does

1. **Adds verification columns** to the profiles table:
   - `verification_status`: tracks verification state
   - `verification_documents`: stores document file paths
   - `verification_submitted_at`: timestamp of submission
   - `verification_reviewed_at`: timestamp of review
   - `verification_notes`: admin notes

2. **Creates storage bucket** for verification documents with proper security policies

3. **Improves error handling** in the component with:
   - File size validation (max 5MB)
   - File type validation (JPG, PNG, PDF only)
   - Better error messages
   - Specific error handling for missing schema

## Security Features
- Documents are stored privately (not publicly accessible)
- Users can only access their own documents
- Proper folder structure using user ID

## File Validation
- Maximum file size: 5MB
- Allowed formats: JPG, PNG, PDF
- Required documents: Aadhaar, Land Records, Photo
- Optional: Bank Passbook