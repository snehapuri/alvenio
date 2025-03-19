from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from app.core.database import get_db
from app.models.models import User, LoanApplication, Document, VideoInteraction, LoanStatus, DocumentType
from app.services.video_service import process_video, verify_face
from app.services.document_service import process_document, extract_document_data
from app.services.loan_service import evaluate_loan_eligibility

router = APIRouter()

@router.post("/video-interaction")
async def create_video_interaction(
    video: UploadFile = File(...),
    question_id: int = Form(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    Process a video interaction from the user
    """
    try:
        # Save video file
        video_path = await process_video(video)
        
        # Verify face in video
        face_verified = await verify_face(video_path)
        
        # Create video interaction record
        video_interaction = VideoInteraction(
            user_id=user_id,
            video_path=video_path,
            question_id=question_id,
            face_verified=face_verified
        )
        
        db.add(video_interaction)
        db.commit()
        db.refresh(video_interaction)
        
        return {
            "status": "success",
            "face_verified": face_verified,
            "video_interaction_id": video_interaction.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents")
async def upload_document(
    document: UploadFile = File(...),
    document_type: DocumentType = Form(...),
    user_id: int = Form(...),
    loan_application_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload and process a document
    """
    try:
        # Save document file
        file_path = await process_document(document)
        
        # Extract data from document
        extracted_data = await extract_document_data(file_path, document_type)
        
        # Create document record
        doc = Document(
            user_id=user_id,
            loan_application_id=loan_application_id,
            document_type=document_type,
            file_path=file_path,
            extracted_data=json.dumps(extracted_data)
        )
        
        db.add(doc)
        db.commit()
        db.refresh(doc)
        
        return {
            "status": "success",
            "document_id": doc.id,
            "extracted_data": extracted_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/loan-applications")
async def create_loan_application(
    loan_amount: float = Form(...),
    loan_type: str = Form(...),
    monthly_income: float = Form(...),
    employment_type: str = Form(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    Create a new loan application
    """
    try:
        # Create loan application
        loan_application = LoanApplication(
            user_id=user_id,
            loan_amount=loan_amount,
            loan_type=loan_type,
            monthly_income=monthly_income,
            employment_type=employment_type
        )
        
        db.add(loan_application)
        db.commit()
        db.refresh(loan_application)
        
        # Evaluate eligibility
        eligibility_result = await evaluate_loan_eligibility(loan_application.id, db)
        
        # Update loan status based on evaluation
        loan_application.status = eligibility_result["status"]
        db.commit()
        
        return {
            "status": "success",
            "loan_application_id": loan_application.id,
            "eligibility_result": eligibility_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/loan-applications/{loan_application_id}")
async def get_loan_application(
    loan_application_id: int,
    db: Session = Depends(get_db)
):
    """
    Get loan application details
    """
    loan_application = db.query(LoanApplication).filter(
        LoanApplication.id == loan_application_id
    ).first()
    
    if not loan_application:
        raise HTTPException(status_code=404, detail="Loan application not found")
    
    return {
        "id": loan_application.id,
        "loan_amount": loan_application.loan_amount,
        "loan_type": loan_application.loan_type,
        "status": loan_application.status,
        "monthly_income": loan_application.monthly_income,
        "employment_type": loan_application.employment_type,
        "created_at": loan_application.created_at,
        "updated_at": loan_application.updated_at
    } 