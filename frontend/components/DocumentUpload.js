import { useState } from 'react';
import { documentService } from '../services/api';

const DOCUMENT_TYPES = [
  { id: 'aadhar', name: 'Aadhaar Card', required: true, description: 'Government issued identification with 12-digit number' },
  { id: 'pan', name: 'PAN Card', required: true, description: 'Permanent Account Number issued by Income Tax Department' },
  { id: 'income', name: 'Income Proof', required: true, description: 'Salary slips or Income Tax Returns for the last 6 months' },
  { id: 'address', name: 'Address Proof', required: true, description: 'Utility bills, Passport, or Voter ID' },
  { id: 'bank', name: 'Bank Statement', required: true, description: 'Last 3 months bank statement' },
  { id: 'photo', name: 'Passport Size Photo', required: true, description: 'Recent passport size photograph with white background' },
  { id: 'signature', name: 'Signature Specimen', required: true, description: 'Scanned copy of your signature on white paper' },
  { id: 'property', name: 'Property Documents', required: false, description: 'Required only for secured loans' },
];

export default function DocumentUpload({ applicationId, onComplete }) {
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState({});
  const [verificationStatus, setVerificationStatus] = useState({});
  const [allUploaded, setAllUploaded] = useState(false);
  
  // Handle file change
  const handleFileChange = (docType, e) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docType]: file
      }));
      
      // Simulate verification process
      setUploading(prev => ({
        ...prev,
        [docType]: true
      }));
      
      // In a real app, we would upload the file to the backend here
      uploadDocument(docType, file);
    }
  };
  
  // Upload document to backend
  const uploadDocument = async (docType, file) => {
    try {
      // In a real app, we would call the API
      // const response = await documentService.uploadDocument(applicationId, docType, file);
      
      // For demo, we'll simulate a delay and random verification result
      setTimeout(() => {
        const isVerified = Math.random() > 0.3; // 70% success rate for demo
        
        setVerificationStatus(prev => ({
          ...prev,
          [docType]: {
            verified: isVerified,
            message: isVerified 
              ? 'Document verified successfully' 
              : 'Verification failed. Please upload a clearer image.'
          }
        }));
        
        setUploading(prev => ({
          ...prev,
          [docType]: false
        }));
        
        // Check if all required documents are uploaded and verified
        checkAllUploaded();
      }, 2000);
    } catch (error) {
      console.error(`Error uploading ${docType}:`, error);
      
      setVerificationStatus(prev => ({
        ...prev,
        [docType]: {
          verified: false,
          message: 'Upload failed. Please try again.'
        }
      }));
      
      setUploading(prev => ({
        ...prev,
        [docType]: false
      }));
    }
  };
  
  // Check if all required documents are uploaded and verified
  const checkAllUploaded = () => {
    const requiredDocs = DOCUMENT_TYPES.filter(doc => doc.required).map(doc => doc.id);
    
    const allVerified = requiredDocs.every(docType => 
      verificationStatus[docType] && verificationStatus[docType].verified
    );
    
    setAllUploaded(allVerified);
  };
  
  // Continue to next step
  const handleContinue = () => {
    // In a real app, we would call the API to update the application status
    onComplete && onComplete(verificationStatus);
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary-800 mb-4 text-center">
          Document Upload & Verification
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Please upload clear scanned copies or photos of the following documents.
        </p>
      </div>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOCUMENT_TYPES.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4 relative">
              <h3 className="text-lg font-semibold text-primary-700 mb-2">
                {doc.name}
                {doc.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
              
              {verificationStatus[doc.id] ? (
                <div className={`mb-4 p-3 rounded-lg ${
                  verificationStatus[doc.id].verified 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  <p className="text-sm">{verificationStatus[doc.id].message}</p>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    {!documents[doc.id] ? 'No file selected' : documents[doc.id].name}
                  </p>
                </div>
              )}
              
              <div className="flex items-center">
                <label className={`cursor-pointer px-4 py-2 rounded-lg ${
                  verificationStatus[doc.id] && verificationStatus[doc.id].verified
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}>
                  <input
                    type="file"
                    accept="image/*, application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(doc.id, e)}
                    disabled={uploading[doc.id]}
                  />
                  {verificationStatus[doc.id] && verificationStatus[doc.id].verified
                    ? 'Reupload'
                    : documents[doc.id]
                      ? 'Replace'
                      : 'Select File'}
                </label>
                
                {uploading[doc.id] && (
                  <div className="ml-3 flex items-center">
                    <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-sm text-gray-600">Verifying...</span>
                  </div>
                )}
              </div>
              
              {verificationStatus[doc.id] && verificationStatus[doc.id].verified && (
                <div className="absolute top-4 right-4">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <div className="flex flex-col items-center">
          <button
            onClick={handleContinue}
            className={`w-full md:w-1/2 py-3 px-6 rounded-lg font-bold ${
              allUploaded
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!allUploaded}
          >
            {allUploaded ? 'Continue to Next Step' : 'Upload All Required Documents'}
          </button>
          
          {!allUploaded && (
            <p className="mt-3 text-sm text-gray-500">
              Please upload and verify all required documents to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 