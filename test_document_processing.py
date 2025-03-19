import cv2
import numpy as np
import pytesseract
from PIL import Image
import json
from pathlib import Path
import re
from datetime import datetime

class DocumentProcessor:
    def __init__(self):
        self.test_dir = Path("test_data")
        self.test_dir.mkdir(exist_ok=True)
        (self.test_dir / "documents").mkdir(exist_ok=True)
        
    def preprocess_image(self, image):
        """Preprocess image for better OCR results"""
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(binary)
        
        return denoised

    def extract_text(self, image_path):
        """Extract text from image using OCR"""
        # Read image
        image = cv2.imread(str(image_path))
        if image is None:
            raise ValueError("Could not read image")
        
        # Preprocess image
        processed = self.preprocess_image(image)
        
        # Perform OCR
        text = pytesseract.image_to_string(processed)
        return text

    def extract_aadhaar_data(self, text):
        """Extract information from Aadhaar card text"""
        data = {
            "name": "",
            "dob": "",
            "gender": "",
            "aadhaar_number": "",
            "address": ""
        }
        
        # Extract name (assuming format: Name: <name>)
        name_match = re.search(r"Name\s*:\s*([A-Za-z\s]+)", text)
        if name_match:
            data["name"] = name_match.group(1).strip()
        
        # Extract DOB (assuming format: DOB: DD/MM/YYYY)
        dob_match = re.search(r"DOB\s*:\s*(\d{2}/\d{2}/\d{4})", text)
        if dob_match:
            data["dob"] = dob_match.group(1)
        
        # Extract gender
        gender_match = re.search(r"Gender\s*:\s*([MF])", text)
        if gender_match:
            data["gender"] = gender_match.group(1)
        
        # Extract Aadhaar number (12 digits)
        aadhaar_match = re.search(r"\b\d{4}\s*\d{4}\s*\d{4}\b", text)
        if aadhaar_match:
            data["aadhaar_number"] = aadhaar_match.group(0).replace(" ", "")
        
        return data

    def extract_pan_data(self, text):
        """Extract information from PAN card text"""
        data = {
            "name": "",
            "father_name": "",
            "dob": "",
            "pan_number": "",
            "address": ""
        }
        
        # Extract name
        name_match = re.search(r"Name\s*:\s*([A-Za-z\s]+)", text)
        if name_match:
            data["name"] = name_match.group(1).strip()
        
        # Extract father's name
        father_match = re.search(r"Father's Name\s*:\s*([A-Za-z\s]+)", text)
        if father_match:
            data["father_name"] = father_match.group(1).strip()
        
        # Extract DOB
        dob_match = re.search(r"Date of Birth\s*:\s*(\d{2}/\d{2}/\d{4})", text)
        if dob_match:
            data["dob"] = dob_match.group(1)
        
        # Extract PAN number (10 characters)
        pan_match = re.search(r"[A-Z]{5}\d{4}[A-Z]{1}", text)
        if pan_match:
            data["pan_number"] = pan_match.group(0)
        
        return data

    def extract_income_data(self, text):
        """Extract information from income proof document"""
        data = {
            "monthly_income": 0.0,
            "employment_type": "",
            "employer_name": "",
            "document_type": ""
        }
        
        # Extract monthly income (assuming format: Monthly Income: Rs. X,XXX)
        income_match = re.search(r"Monthly Income\s*:\s*Rs\.\s*([\d,]+)", text)
        if income_match:
            try:
                data["monthly_income"] = float(income_match.group(1).replace(",", ""))
            except:
                pass
        
        # Extract employment type
        employment_match = re.search(r"Employment Type\s*:\s*([A-Za-z\s]+)", text)
        if employment_match:
            data["employment_type"] = employment_match.group(1).strip()
        
        # Extract employer name
        employer_match = re.search(r"Employer\s*:\s*([A-Za-z\s]+)", text)
        if employer_match:
            data["employer_name"] = employer_match.group(1).strip()
        
        return data

class LoanEligibilityAssessor:
    def __init__(self):
        self.MIN_MONTHLY_INCOME = 25000
        self.MAX_LOAN_MULTIPLIER = 24
        
    def assess_eligibility(self, loan_amount, monthly_income, employment_type):
        """Assess loan eligibility based on various factors"""
        result = {
            "eligible": False,
            "status": "rejected",
            "reason": "",
            "max_eligible_amount": 0
        }
        
        # Calculate maximum eligible amount
        max_eligible_amount = monthly_income * self.MAX_LOAN_MULTIPLIER
        
        # Check minimum income requirement
        if monthly_income < self.MIN_MONTHLY_INCOME:
            result["reason"] = f"Monthly income ({monthly_income}) is below minimum requirement ({self.MIN_MONTHLY_INCOME})"
            return result
        
        # Check loan amount
        if loan_amount > max_eligible_amount:
            result["reason"] = f"Requested loan amount ({loan_amount}) exceeds maximum eligible amount ({max_eligible_amount})"
            return result
        
        # Check employment type
        if employment_type.lower() not in ["salaried", "self-employed", "business"]:
            result["reason"] = "Unsupported employment type"
            return result
        
        # If all checks pass
        result["eligible"] = True
        result["status"] = "approved"
        result["reason"] = "Loan application approved"
        result["max_eligible_amount"] = max_eligible_amount
        
        return result

def test_document_processing():
    # Initialize processors
    doc_processor = DocumentProcessor()
    loan_assessor = LoanEligibilityAssessor()
    
    # Create sample document text (simulating OCR output)
    sample_aadhaar = """
    Name: John Doe
    DOB: 01/01/1990
    Gender: M
    Aadhaar: 1234 5678 9012
    Address: 123 Main St, City
    """
    
    sample_pan = """
    Name: John Doe
    Father's Name: James Doe
    Date of Birth: 01/01/1990
    PAN: ABCDE1234F
    Address: 123 Main St, City
    """
    
    sample_income = """
    Monthly Income: Rs. 50,000
    Employment Type: Salaried
    Employer: Tech Corp
    Document Type: Salary Slip
    """
    
    # Process documents
    print("Processing Aadhaar card...")
    aadhaar_data = doc_processor.extract_aadhaar_data(sample_aadhaar)
    print(json.dumps(aadhaar_data, indent=2))
    
    print("\nProcessing PAN card...")
    pan_data = doc_processor.extract_pan_data(sample_pan)
    print(json.dumps(pan_data, indent=2))
    
    print("\nProcessing Income proof...")
    income_data = doc_processor.extract_income_data(sample_income)
    print(json.dumps(income_data, indent=2))
    
    # Assess loan eligibility
    print("\nAssessing loan eligibility...")
    loan_amount = 500000  # 5 lakhs
    eligibility_result = loan_assessor.assess_eligibility(
        loan_amount=loan_amount,
        monthly_income=income_data["monthly_income"],
        employment_type=income_data["employment_type"]
    )
    print(json.dumps(eligibility_result, indent=2))

if __name__ == "__main__":
    test_document_processing() 