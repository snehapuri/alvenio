from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class LoanStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    MORE_INFO_NEEDED = "more_info_needed"

class DocumentType(str, enum.Enum):
    AADHAAR = "aadhaar"
    PAN = "pan"
    INCOME_PROOF = "income_proof"
    BANK_STATEMENT = "bank_statement"
    OTHER = "other"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    phone_number = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    loan_applications = relationship("LoanApplication", back_populates="user")
    documents = relationship("Document", back_populates="user")
    video_interactions = relationship("VideoInteraction", back_populates="user")

class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    loan_amount = Column(Float)
    loan_type = Column(String)
    status = Column(Enum(LoanStatus), default=LoanStatus.PENDING)
    monthly_income = Column(Float)
    employment_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="loan_applications")
    documents = relationship("Document", back_populates="loan_application")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"))
    document_type = Column(Enum(DocumentType))
    file_path = Column(String)
    extracted_data = Column(String)  # JSON string of extracted information
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="documents")
    loan_application = relationship("LoanApplication", back_populates="documents")

class VideoInteraction(Base):
    __tablename__ = "video_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    video_path = Column(String)
    question_id = Column(Integer)
    response_text = Column(String)  # Transcribed response
    face_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="video_interactions") 