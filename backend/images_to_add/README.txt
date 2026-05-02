INSTRUCTIONS FOR ADDING IMAGES
==============================

1. Place all your image files in this folder (images_to_add)
2. Supported formats: .jpg, .jpeg, .png, .gif, .webp, .bmp
3. Run the add_images.py script:
   
   python add_images.py
   
   Or if using virtual environment:
   
   venv\Scripts\python.exe add_images.py

The script will:
- Copy images to backend/media/slider_images/
- Copy images to frontend/src/assets/
- Create SliderImage entries in the database

After running the script, your images will be available in the application!
