import os
import cv2
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed

WORKSPACE = "/Users/sainath/Desktop/RAVONIXX"
BANNER_PATH = os.path.join(WORKSPACE, "public/images/watermarks/user_banner_tight.jpg")
LOGO_PATH = os.path.join(WORKSPACE, "public/images/watermarks/user_logo.jpg")

banner_raw = cv2.imread(BANNER_PATH)
logo_raw = cv2.imread(LOGO_PATH)

# 1. Main Logo: Full Square Shape (650x650)
sq_size = 650
logo_sq = cv2.resize(logo_raw, (sq_size, sq_size), interpolation=cv2.INTER_CUBIC)
cv2.rectangle(logo_sq, (0, 0), (sq_size - 1, sq_size - 1), (255, 180, 0), 4) # Cyan border
cv2.rectangle(logo_sq, (4, 4), (sq_size - 5, sq_size - 5), (255, 0, 200), 2) # Magenta border

# 2. Second Logo: Tight Banner (Width: 1150px)
banner_w = 1150
banner_h = int(banner_w * banner_raw.shape[0] / banner_raw.shape[1]) # ~262px
banner_sq = cv2.resize(banner_raw, (banner_w, banner_h), interpolation=cv2.INTER_CUBIC)
cv2.rectangle(banner_sq, (0, 0), (banner_w - 1, banner_h - 1), (255, 180, 0), 4)
cv2.rectangle(banner_sq, (4, 4), (banner_w - 5, banner_h - 5), (255, 0, 200), 2)

def process_image(filepath):
    img = cv2.imread(filepath)
    if img is None:
        return False, filepath, "Failed to read"
        
    h, w, _ = img.shape
    
    # Process standard high-res drone views (3264x3264)
    if w >= 2000 and h >= 2000:
        # 1. Clean Top-Left yellow text
        tl = img[0:300, 0:600]
        m_tl = ((tl[:,:,0] < 110) & (tl[:,:,1] > 130) & (tl[:,:,2] > 140)).astype(np.uint8) * 255
        m_tl = cv2.dilate(m_tl, np.ones((7,7), np.uint8), iterations=2)
        img[0:300, 0:600] = cv2.inpaint(tl, m_tl, 5, cv2.INPAINT_TELEA)
        
        # 2. Inpaint Bottom-Right black text under banner area
        br = img[h-300:h, w-1300:w]
        gray_br = cv2.cvtColor(br, cv2.COLOR_BGR2GRAY)
        m_br = (gray_br < 65).astype(np.uint8) * 255
        m_br = cv2.dilate(m_br, np.ones((5,5), np.uint8), iterations=2)
        img[h-300:h, w-1300:w] = cv2.inpaint(br, m_br, 5, cv2.INPAINT_TELEA)
        
        # 3. Apply Main Logo in Square Shape to Top-Right and Bottom-Left
        img[10:10+sq_size, w - sq_size - 10 : w - 10] = logo_sq
        img[h - sq_size - 10 : h - 10, 10:10+sq_size] = logo_sq
        
        # 4. Apply Second Logo (Tight Banner) to Bottom-Right
        img[h - banner_h - 10 : h - 10, w - banner_w - 10 : w - 10] = banner_sq
        
        cv2.imwrite(filepath, img)
        return True, filepath, "Updated"
        
    return True, filepath, "Skipped"

if __name__ == "__main__":
    maps_dir = os.path.join(WORKSPACE, "public/images/maps")
    image_files = []
    
    for root, _, files in os.walk(maps_dir):
        if "drone" in root:
            for f in files:
                if f.endswith((".png", ".jpg", ".jpeg")):
                    image_files.append(os.path.join(root, f))
                    
    print(f"=== Starting Watermark Application on {len(image_files)} Drone Images ===")
    
    processed = 0
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(process_image, path): path for path in image_files}
        for future in as_completed(futures):
            ok, path, msg = future.result()
            if ok:
                processed += 1
                if processed % 25 == 0 or processed == len(image_files):
                    print(f"Progress: {processed}/{len(image_files)} images processed")
                    
    print(f"\nAll {processed} images updated with square main logo and new tight banner successfully!")
