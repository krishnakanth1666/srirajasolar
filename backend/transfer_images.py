import os
import shutil
from pathlib import Path

def transfer_images():
    """
    Legacy function - Use add_images.py instead for adding new images.
    This function transfers specific images from media to assets.
    """
    # Get the base directory (backend folder)
    backend_dir = Path(__file__).resolve().parent
    frontend_dir = backend_dir.parent / 'frontend'
    
    # Define source and destination paths
    media_dir = backend_dir / 'media'
    assets_dir = frontend_dir / 'src' / 'assets'
    
    # Create directories if they don't exist
    media_dir.mkdir(exist_ok=True)
    assets_dir.mkdir(exist_ok=True)
    
    # List of image files to transfer
    image_files = [
        'solar_installation.jpg',
        'solar2.jpg',
        'solar3.jpg'
    ]
    
    # Transfer each image
    for image_file in image_files:
        source_path = media_dir / image_file
        dest_path = assets_dir / image_file
        
        if source_path.exists():
            print(f"Transferring {image_file}...")
            shutil.copy2(source_path, dest_path)
        else:
            print(f"Warning: {image_file} not found in media directory")
    
    print("Image transfer completed!")

if __name__ == "__main__":
    transfer_images() 