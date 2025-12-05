# Storage Setup Guide for Banner Uploads

## Manual Setup Steps

Since the Supabase CLI is having issues, follow these manual steps to set up storage:

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard: https://babugzeozpudnrbirwtg.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Enter bucket name: `banners`
5. Make it **Public** (toggle on)
6. Click **Create bucket**

### 2. Set Storage Policies

After creating the bucket, go to **Storage** → **Policies** and run these SQL commands in the **SQL Editor**:

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'banners');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload banners" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update banners" ON storage.objects FOR UPDATE 
USING (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete banners" ON storage.objects FOR DELETE 
USING (bucket_id = 'banners' AND auth.role() = 'authenticated');
```

### 3. Test Upload

1. Log in to your admin dashboard at: `http://localhost:5173/admin/login`
2. Navigate to **Content Management**
3. Try uploading an image for the hero section or category banners
4. The upload should work and display the image immediately

## Features

### Hero Section Uploads
- Upload custom background images for the main hero section
- Supports images up to 5MB
- Recommended size: 1920x1080px for best quality
- Fallback to gradient if no image is used

### Category Banner Uploads
- Upload images for Men, Women, and Accessories categories
- Supports images up to 5MB
- Recommended size: 800x1200px (portrait orientation)
- Individual upload buttons for each category

## Technical Details

- **Storage Bucket:** `banners`
- **Folder Structure:**
  - `hero-main/` - Main hero section images
  - `category-men/` - Men's category banners
  - `category-women/` - Women's category banners
  - `category-accessories/` - Accessories category banners
- **File Naming:** Automatic with timestamp and random string
- **Public Access:** All images are publicly accessible
- **CDN:** Images served via Supabase CDN

## Troubleshooting

### Upload Fails
- Verify storage bucket exists and is public
- Check storage policies are created
- Ensure you're logged in as admin
- Check file size (must be < 5MB)
- Verify file is an image type

### Images Not Displaying
- Check browser console for errors
- Verify public URL is accessible
- Check RLS policies on banners table
- Ensure banner is marked as "Active"

## Security Notes

- Only authenticated users can upload (admin only via UI)
- Public read access for all banner images
- File size limited to 5MB
- Only image files accepted
- URLs stored in database for reference
