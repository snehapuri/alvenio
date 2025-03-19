import cv2
import numpy as np
import os
from pathlib import Path

def test_video_processing():
    # Create test directories
    test_dir = Path("test_data")
    test_dir.mkdir(exist_ok=True)
    (test_dir / "videos").mkdir(exist_ok=True)
    
    # Create a test video
    print("Creating test video...")
    cap = cv2.VideoCapture(0)  # Use default camera
    
    # Set video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    # Create video writer
    output_path = test_dir / "videos" / "test_video.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
    
    # Record for 5 seconds
    print("Recording video for 5 seconds...")
    start_time = cv2.getTickCount()
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Write frame
        out.write(frame)
        
        # Show preview
        cv2.imshow('Recording', frame)
        
        # Check if 5 seconds have passed
        if (cv2.getTickCount() - start_time) / cv2.getTickFrequency() > 5:
            break
            
        # Break on 'q' press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Release resources
    cap.release()
    out.release()
    cv2.destroyAllWindows()
    
    # Test video processing
    print("\nTesting video processing...")
    test_video = cv2.VideoCapture(str(output_path))
    
    if not test_video.isOpened():
        print("Error: Could not open test video")
        return
    
    # Read first frame
    ret, frame = test_video.read()
    if ret:
        print("Successfully read video frame")
        
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Apply some basic image processing
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 100, 200)
        
        # Save processed frame
        cv2.imwrite(str(test_dir / "processed_frame.jpg"), edges)
        print("Saved processed frame")
    
    # Release video capture
    test_video.release()
    print("\nTest completed successfully!")

if __name__ == "__main__":
    test_video_processing() 