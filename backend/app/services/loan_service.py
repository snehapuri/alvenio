from sqlalchemy.orm import Session
from app.models.models import LoanApplication, Document, LoanStatus
import json

async def evaluate_loan_eligibility(loan_application_id: int, db: Session) -> dict:
    """
    Evaluate loan eligibility based on various factors
    """
    try:
        # Get loan application
        loan_application = db.query(LoanApplication).filter(
            LoanApplication.id == loan_application_id
        ).first()
        
        if not loan_application:
            return {
                "status": LoanStatus.REJECTED,
                "reason": "Loan application not found"
            }
        
        # Get all documents for the loan application
        documents = db.query(Document).filter(
            Document.loan_application_id == loan_application_id
        ).all()
        
        # Check if all required documents are present
        required_docs = check_required_documents(documents)
        if not required_docs["all_present"]:
            return {
                "status": LoanStatus.MORE_INFO_NEEDED,
                "reason": required_docs["missing_docs"]
            }
        
        # Verify document data
        doc_verification = verify_document_data(documents)
        if not doc_verification["verified"]:
            return {
                "status": LoanStatus.MORE_INFO_NEEDED,
                "reason": doc_verification["reason"]
            }
        
        # Check income criteria
        income_check = check_income_criteria(loan_application)
        if not income_check["eligible"]:
            return {
                "status": LoanStatus.REJECTED,
                "reason": income_check["reason"]
            }
        
        # Check loan amount criteria
        loan_amount_check = check_loan_amount_criteria(loan_application)
        if not loan_amount_check["eligible"]:
            return {
                "status": LoanStatus.REJECTED,
                "reason": loan_amount_check["reason"]
            }
        
        # If all checks pass
        return {
            "status": LoanStatus.APPROVED,
            "reason": "Loan application approved",
            "details": {
                "loan_amount": loan_application.loan_amount,
                "monthly_income": loan_application.monthly_income,
                "employment_type": loan_application.employment_type
            }
        }
        
    except Exception as e:
        return {
            "status": LoanStatus.REJECTED,
            "reason": f"Error in evaluation: {str(e)}"
        }

def check_required_documents(documents: list) -> dict:
    """
    Check if all required documents are present
    """
    required_docs = {
        "aadhaar": False,
        "pan": False,
        "income_proof": False
    }
    
    for doc in documents:
        if doc.document_type == "aadhaar":
            required_docs["aadhaar"] = True
        elif doc.document_type == "pan":
            required_docs["pan"] = True
        elif doc.document_type == "income_proof":
            required_docs["income_proof"] = True
    
    missing_docs = [doc_type for doc_type, present in required_docs.items() if not present]
    
    return {
        "all_present": len(missing_docs) == 0,
        "missing_docs": ", ".join(missing_docs) if missing_docs else None
    }

def verify_document_data(documents: list) -> dict:
    """
    Verify the data extracted from documents
    """
    for doc in documents:
        try:
            data = json.loads(doc.extracted_data)
            
            if doc.document_type == "aadhaar":
                if not all([data.get("name"), data.get("dob"), data.get("aadhaar_number")]):
                    return {
                        "verified": False,
                        "reason": "Incomplete Aadhaar card information"
                    }
            
            elif doc.document_type == "pan":
                if not all([data.get("name"), data.get("dob"), data.get("pan_number")]):
                    return {
                        "verified": False,
                        "reason": "Incomplete PAN card information"
                    }
            
            elif doc.document_type == "income_proof":
                if not all([data.get("monthly_income"), data.get("employment_type")]):
                    return {
                        "verified": False,
                        "reason": "Incomplete income proof information"
                    }
        
        except Exception as e:
            return {
                "verified": False,
                "reason": f"Error verifying document data: {str(e)}"
            }
    
    return {"verified": True}

def check_income_criteria(loan_application: LoanApplication) -> dict:
    """
    Check if the applicant meets income criteria
    """
    # Minimum monthly income requirement (example: 25,000)
    MIN_MONTHLY_INCOME = 25000
    
    if loan_application.monthly_income < MIN_MONTHLY_INCOME:
        return {
            "eligible": False,
            "reason": f"Monthly income ({loan_application.monthly_income}) is below minimum requirement ({MIN_MONTHLY_INCOME})"
        }
    
    return {"eligible": True}

def check_loan_amount_criteria(loan_application: LoanApplication) -> dict:
    """
    Check if the requested loan amount is within eligible limits
    """
    # Maximum loan amount based on monthly income (example: 24x monthly income)
    MAX_LOAN_MULTIPLIER = 24
    
    max_eligible_amount = loan_application.monthly_income * MAX_LOAN_MULTIPLIER
    
    if loan_application.loan_amount > max_eligible_amount:
        return {
            "eligible": False,
            "reason": f"Requested loan amount ({loan_application.loan_amount}) exceeds maximum eligible amount ({max_eligible_amount})"
        }
    
    return {"eligible": True} 