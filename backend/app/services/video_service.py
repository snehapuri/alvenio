import cv2
import numpy as np
import face_recognition
import os
from pathlib import Path
import aiofiles
from app.core.config import settings
import uuid

async def process_video(video_file) -> str:
    """
    Process and save the uploaded video file
    """
    # Generate unique filename
    file_extension = os.path.splitext(video_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = settings.UPLOAD_DIR / "videos" / unique_filename
    
    # Create videos directory if it doesn't exist
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save video file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await video_file.read()
        await out_file.write(content)
    
    return str(file_path)

async def verify_face(video_path: str) -> bool:
    """
    Verify face in the video using face_recognition library
    """
    try:
        # Open video file
        cap = cv2.VideoCapture(video_path)
        
        # Read first frame
        ret, frame = cap.read()
        if not ret:
            return False
        
        # Convert frame to RGB (face_recognition uses RGB)
        rgb_frame = frame[:, :, ::-1]
        
        # Find face locations
        face_locations = face_recognition.face_locations(rgb_frame)
        
        # If no face found, return False
        if not face_locations:
            return False
        
        # Get face encoding
        face_encoding = face_recognition.face_encodings(rgb_frame, face_locations)[0]
        
        # TODO: Compare with stored face encoding from previous interactions
        # For now, return True if a face is detected
        return True
        
    except Exception as e:
        print(f"Error in face verification: {str(e)}")
        return False
    finally:
        if 'cap' in locals():
            cap.release()

def extract_audio(video_path: str) -> str:
    """
    Extract audio from video file
    """
    try:
        # Open video file
        cap = cv2.VideoCapture(video_path)
        
        # Get audio properties
        audio_path = str(Path(video_path).with_suffix('.wav'))
        
        # TODO: Implement audio extraction
        # This would typically use ffmpeg or similar
        
        return audio_path
    finally:
        if 'cap' in locals():
            cap.release()

async def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe audio to text
    """
    # TODO: Implement audio transcription
    # This would typically use a speech-to-text service
    return "Transcribed text placeholder" 