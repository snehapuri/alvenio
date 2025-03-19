import pytesseract
import cv2
import numpy as np
from PIL import Image
import aiofiles
from pathlib import Path
import uuid
import json
from app.core.config import settings

async def process_document(document_file) -> str:
    """
    Process and save the uploaded document file
    """
    # Generate unique filename
    file_extension = os.path.splitext(document_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = settings.UPLOAD_DIR / "documents" / unique_filename
    
    # Create documents directory if it doesn't exist
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save document file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await document_file.read()
        await out_file.write(content)
    
    return str(file_path)

async def extract_document_data(file_path: str, document_type: str) -> dict:
    """
    Extract relevant information from the document based on its type
    """
    try:
        # Read image
        image = cv2.imread(file_path)
        if image is None:
            raise ValueError("Could not read image file")
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding to preprocess the image
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        
        # Perform OCR
        text = pytesseract.image_to_string(gray)
        
        # Extract data based on document type
        extracted_data = {}
        
        if document_type == "aadhaar":
            extracted_data = extract_aadhaar_data(text)
        elif document_type == "pan":
            extracted_data = extract_pan_data(text)
        elif document_type == "income_proof":
            extracted_data = extract_income_data(text)
        
        return extracted_data
        
    except Exception as e:
        print(f"Error in document processing: {str(e)}")
        return {}

def extract_aadhaar_data(text: str) -> dict:
    """
    Extract information from Aadhaar card
    """
    data = {
        "name": "",
        "dob": "",
        "gender": "",
        "aadhaar_number": "",
        "address": ""
    }
    
    # TODO: Implement Aadhaar data extraction using regex or NLP
    # This is a placeholder implementation
    lines = text.split('\n')
    for line in lines:
        if "Name" in line:
            data["name"] = line.split(":")[-1].strip()
        elif "DOB" in line:
            data["dob"] = line.split(":")[-1].strip()
        elif "Gender" in line:
            data["gender"] = line.split(":")[-1].strip()
        elif "Aadhaar" in line:
            data["aadhaar_number"] = line.split(":")[-1].strip()
    
    return data

def extract_pan_data(text: str) -> dict:
    """
    Extract information from PAN card
    """
    data = {
        "name": "",
        "father_name": "",
        "dob": "",
        "pan_number": "",
        "address": ""
    }
    
    # TODO: Implement PAN data extraction using regex or NLP
    # This is a placeholder implementation
    lines = text.split('\n')
    for line in lines:
        if "Name" in line:
            data["name"] = line.split(":")[-1].strip()
        elif "Father's Name" in line:
            data["father_name"] = line.split(":")[-1].strip()
        elif "Date of Birth" in line:
            data["dob"] = line.split(":")[-1].strip()
        elif "PAN" in line:
            data["pan_number"] = line.split(":")[-1].strip()
    
    return data

def extract_income_data(text: str) -> dict:
    """
    Extract information from income proof document
    """
    data = {
        "monthly_income": 0.0,
        "employment_type": "",
        "employer_name": "",
        "document_type": ""
    }
    
    # TODO: Implement income data extraction using regex or NLP
    # This is a placeholder implementation
    lines = text.split('\n')
    for line in lines:
        if "Income" in line:
            try:
                data["monthly_income"] = float(line.split(":")[-1].strip().replace(",", ""))
            except:
                pass
        elif "Employment" in line:
            data["employment_type"] = line.split(":")[-1].strip()
        elif "Employer" in line:
            data["employer_name"] = line.split(":")[-1].strip()
    
    return data 