# How to Add Images to Your Application

## Quick Guide

### Step 1: Place Your Images
1. Navigate to: `backend/images_to_add/`
2. Copy all your image files into this folder
3. Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`

### Step 2: Run the Script
Open a terminal/command prompt and run:

**Using virtual environment (Recommended):**
```bash
cd backend
venv\Scripts\python.exe add_images.py
```

**Or using system Python:**
```bash
cd backend
python add_images.py
```

### Step 3: Restart Your Servers
After adding images, restart your frontend server to see the new images:
- Stop the frontend server (Ctrl+C)
- Start it again: `npm start` or `.\start-frontend.ps1`

## What the Script Does

The `add_images.py` script will:
1. ✅ Copy images to `backend/media/slider_images/` (for database storage)
2. ✅ Copy images to `frontend/src/assets/` (for frontend display)
3. ✅ Create database entries in the SliderImage model
4. ✅ Automatically generate titles from filenames

## Example

If you have images named:
- `solar_panel_1.jpg`
- `installation_photo.png`
- `completed_project.jpg`

Just place them in `backend/images_to_add/` and run the script. They will appear in your slider automatically!

## Managing Images in Database

You can also manage images through the Django admin panel:
1. Start your backend server
2. Go to: http://localhost:8000/admin
3. Login and navigate to "Slider Images"
4. You can edit titles, reorder images, and activate/deactivate them

## Notes

- Images are copied (not moved), so originals remain in `images_to_add/`
- You can delete the source images after running the script if you want
- The slider will automatically cycle through all active images
- Image order can be changed in the Django admin panel
