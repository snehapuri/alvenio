import { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Webcam from 'react-webcam';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AiBranchManager from '../../components/AiBranchManager';
import DocumentUpload from '../../components/DocumentUpload';

export default function NewApplication() {
  const [stage, setStage] = useState('welcome');
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [documents, setDocuments] = useState({
    aadhaar: null,
    pan: null,
    incomeProof: null,
  });
  const [extractedData, setExtractedData] = useState({});
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  // Handle AI manager completion
  const handleAiManagerComplete = (conversationData) => {
    // In a real app, we would use the conversation data
    // to extract information and pre-fill forms
    console.log('AI Manager conversation completed:', conversationData);
    
    // Create a temporary application ID
    const tempId = 'APP' + Date.now().toString().slice(-8);
    setApplicationId(tempId);
    
    // Move to the documents stage
    setStage('documents');
  };

  // Handle document upload completion
  const handleDocumentUploadComplete = (verificationStatus) => {
    // In a real app, we would save this data
    console.log('Documents verified:', verificationStatus);
    
    // Move to the loan details stage
    setStage('loanDetails');
  };

  const handleStartCapture = useCallback(() => {
    setCapturing(true);
    setIsRecording(true);
    setCountdown(5);
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm"
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();

      // Stop recording after 20 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 20000);
    }, 5000); // Wait for countdown
  }, [webcamRef, setCapturing]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCapture = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setCapturing(false);
    setIsRecording(false);
  }, [mediaRecorderRef, setCapturing]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      setRecordedBlob(blob);
      setVideoRecorded(true);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const handleDocumentUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setDocuments({
        ...documents,
        [type]: file
      });
      
      // Simulate document processing
      setTimeout(() => {
        let extractedInfo = {};
        
        if (type === 'aadhaar') {
          extractedInfo = {
            name: 'John Doe',
            dob: '01/01/1990',
            gender: 'M',
            aadhaar_number: '1234 5678 9012'
          };
        } else if (type === 'pan') {
          extractedInfo = {
            name: 'John Doe',
            father_name: 'James Doe',
            dob: '01/01/1990',
            pan_number: 'ABCDE1234F'
          };
        } else if (type === 'incomeProof') {
          extractedInfo = {
            monthly_income: 50000,
            employment_type: 'Salaried',
            employer_name: 'Tech Corp'
          };
        }
        
        setExtractedData({
          ...extractedData,
          [type]: extractedInfo
        });
      }, 1500);
    }
  };

  const handleEligibilityCheck = (values) => {
    // Simulate API call for eligibility check
    setTimeout(() => {
      const monthlyIncome = extractedData.incomeProof?.monthly_income || 50000;
      const employmentType = extractedData.incomeProof?.employment_type || 'Salaried';
      
      const maxLoanAmount = monthlyIncome * 24;
      
      let result = {
        eligible: true,
        status: 'approved',
        reason: 'Loan application approved',
        max_eligible_amount: maxLoanAmount,
        details: {
          loan_amount: values.loanAmount,
          monthly_income: monthlyIncome,
          employment_type: employmentType
        }
      };
      
      if (values.loanAmount > maxLoanAmount) {
        result = {
          eligible: false,
          status: 'rejected',
          reason: `Requested loan amount (${values.loanAmount}) exceeds maximum eligible amount (${maxLoanAmount})`,
          max_eligible_amount: maxLoanAmount
        };
      }
      
      setEligibilityResult(result);
      setStage('result');
    }, 2000);
  };

  const renderStage = () => {
    switch (stage) {
      case 'welcome':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">Welcome to Your Loan Application</h2>
            <p className="text-lg text-gray-700 mb-8">
              Our Alvenio will guide you through the loan application process. You&apos;ll need to:
            </p>
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mb-8">
              <ol className="list-decimal list-inside text-left space-y-3">
                <li>Have a video conversation with our Alvenio</li>
                <li>Upload your documents for verification</li>
                <li>Provide basic loan details</li>
                <li>Get instant eligibility assessment</li>
              </ol>
            </div>
            <button
              onClick={() => setStage('ai_manager')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
            >
              Let&apos;s Start
            </button>
          </div>
        );
      
      case 'ai_manager':
        return (
          <div>
            <AiBranchManager 
              userId={`user_${Date.now().toString().slice(-6)}`}
              onComplete={handleAiManagerComplete}
            />
            <div className="mt-6 text-center">
              <button
                onClick={() => setStage('documents')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
              >
                Skip AI Interaction (Demo)
              </button>
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">Record Your Introduction</h2>
            <p className="text-lg text-gray-700 mb-8">
              Please record a short video introduction of yourself for verification purposes.
            </p>
            
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg mb-8">
              {videoRecorded ? (
                <div className="text-center">
                  <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
                    ✅ Video recorded successfully!
                  </div>
                  <video 
                    className="rounded-lg mx-auto mb-4 w-full max-h-[360px]" 
                    src={recordedBlob ? URL.createObjectURL(recordedBlob) : ''} 
                    controls
                  />
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setVideoRecorded(false);
                        setRecordedBlob(null);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                    >
                      Re-record
                    </button>
                    <button
                      onClick={() => setStage('documents')}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Webcam
                    audio={true}
                    ref={webcamRef}
                    className="rounded-lg mx-auto mb-4 w-full max-h-[360px]"
                  />
                  
                  {countdown !== null && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="text-6xl font-bold text-white bg-black bg-opacity-50 rounded-full w-24 h-24 flex items-center justify-center">
                        {countdown || "REC"}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center space-x-4">
                    {capturing ? (
                      <button
                        onClick={handleStopCapture}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                      >
                        Stop Recording
                      </button>
                    ) : recordedChunks.length > 0 ? (
                      <button
                        onClick={handleDownload}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                      >
                        Save Recording
                      </button>
                    ) : (
                      <button
                        onClick={handleStartCapture}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded"
                      >
                        Start Recording
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Record a 10-20 second introduction stating your name and purpose of the loan.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'documents':
        return (
          <div>
            <DocumentUpload 
              applicationId={applicationId || `app_${Date.now().toString().slice(-6)}`}
              onComplete={handleDocumentUploadComplete}
            />
            <div className="mt-6 text-center">
              <button
                onClick={() => setStage('welcome')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded mr-4"
              >
                Back
              </button>
              <button
                onClick={() => setStage('loanDetails')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
              >
                Skip Document Upload (Demo)
              </button>
            </div>
          </div>
        );
        
      case 'loanDetails':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">Loan Details</h2>
            <p className="text-lg text-gray-700 mb-8">
              Please provide details about the loan you&apos;re applying for.
            </p>
            
            <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg mb-8">
              <Formik
                initialValues={{
                  loanAmount: '',
                  loanType: '',
                  loanPurpose: '',
                  loanTerm: ''
                }}
                validationSchema={Yup.object({
                  loanAmount: Yup.number()
                    .required('Loan amount is required')
                    .positive('Amount must be positive')
                    .max(10000000, 'Amount cannot exceed 1 crore'),
                  loanType: Yup.string()
                    .required('Loan type is required'),
                  loanPurpose: Yup.string()
                    .required('Loan purpose is required'),
                  loanTerm: Yup.number()
                    .required('Loan term is required')
                    .positive('Term must be positive')
                    .integer('Term must be a whole number')
                })}
                onSubmit={handleEligibilityCheck}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6 text-left">
                    <div>
                      <label htmlFor="loanAmount" className="block text-gray-700 font-medium mb-2">
                        Loan Amount (in ₹)
                      </label>
                      <Field
                        type="number"
                        name="loanAmount"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g. 500000"
                      />
                      <ErrorMessage name="loanAmount" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                    
                    <div>
                      <label htmlFor="loanType" className="block text-gray-700 font-medium mb-2">
                        Loan Type
                      </label>
                      <Field
                        as="select"
                        name="loanType"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Loan Type</option>
                        <option value="personal">Personal Loan</option>
                        <option value="home">Home Loan</option>
                        <option value="car">Car Loan</option>
                        <option value="education">Education Loan</option>
                        <option value="business">Business Loan</option>
                      </Field>
                      <ErrorMessage name="loanType" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                    
                    <div>
                      <label htmlFor="loanPurpose" className="block text-gray-700 font-medium mb-2">
                        Loan Purpose
                      </label>
                      <Field
                        type="text"
                        name="loanPurpose"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g. Home renovation"
                      />
                      <ErrorMessage name="loanPurpose" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                    
                    <div>
                      <label htmlFor="loanTerm" className="block text-gray-700 font-medium mb-2">
                        Loan Term (in months)
                      </label>
                      <Field
                        type="number"
                        name="loanTerm"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g. 36"
                      />
                      <ErrorMessage name="loanTerm" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                    
                    <div className="flex justify-center space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setStage('documents')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg"
                      >
                        {isSubmitting ? 'Processing...' : 'Check Eligibility'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        );
        
      case 'result':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">
              Loan Eligibility Result
            </h2>
            
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg mb-8">
              {eligibilityResult && (
                <div>
                  <div className={`flex items-center justify-center text-2xl mb-6 ${
                    eligibilityResult.eligible ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-4xl mr-4 ${
                      eligibilityResult.eligible ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {eligibilityResult.eligible ? '✓' : '✗'}
                    </div>
                    <span className="font-bold">
                      {eligibilityResult.eligible ? 'Approved' : 'Not Approved'}
                    </span>
                  </div>
                  
                  <div className="mb-6 p-4 rounded-lg bg-gray-50">
                    <p className="text-lg">
                      {eligibilityResult.reason}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Requested Loan Amount</div>
                      <div className="text-xl font-semibold">
                        ₹{Number(eligibilityResult.details?.loan_amount || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Maximum Eligible Amount</div>
                      <div className="text-xl font-semibold">
                        ₹{Number(eligibilityResult.max_eligible_amount || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Monthly Income</div>
                      <div className="text-xl font-semibold">
                        ₹{Number(eligibilityResult.details?.monthly_income || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Employment Type</div>
                      <div className="text-xl font-semibold">
                        {eligibilityResult.details?.employment_type || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {eligibilityResult.eligible ? (
                    <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Next Steps:</h3>
                      <ol className="list-decimal list-inside space-y-1 text-green-800">
                        <li>Our representative will contact you within 24 hours</li>
                        <li>Verify your details during the call</li>
                        <li>Receive your loan disbursement</li>
                      </ol>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg mb-6 text-left">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">Suggestions:</h3>
                      <ul className="list-disc list-inside space-y-1 text-red-800">
                        <li>Apply for a lower loan amount</li>
                        <li>Provide additional income proof</li>
                        <li>Add a co-applicant to strengthen your application</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-center space-x-4">
                    <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg">
                      Return Home
                    </Link>
                    {!eligibilityResult.eligible && (
                      <button
                        onClick={() => setStage('loanDetails')}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg"
                      >
                        Modify Application
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return <div>Unknown stage</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
      <Head>
        <title>New Loan Application | Alvenio</title>
        <meta name="description" content="Apply for a loan with AI assistance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-700">
              Alvenio
            </Link>
            
            <div className="flex items-center space-x-1">
              <div className={`h-3 w-3 rounded-full ${stage === 'welcome' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`h-3 w-3 rounded-full ${stage === 'ai_manager' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`h-3 w-3 rounded-full ${stage === 'documents' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`h-3 w-3 rounded-full ${stage === 'loanDetails' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`h-3 w-3 rounded-full ${stage === 'result' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {renderStage()}
      </main>

      <footer className="bg-primary-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Alvenio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function DocumentUploadCard({ title, icon, file, onUpload, extractedData }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-primary-700 mb-2">{title}</h3>
      
      {file ? (
        <div>
          <div className="bg-green-100 text-green-800 p-2 rounded-lg mb-3">
            ✅ Uploaded: {file.name}
          </div>
          
          {extractedData && (
            <div className="text-left bg-gray-50 p-3 rounded-lg text-sm">
              <h4 className="font-medium mb-1">Extracted Information:</h4>
              <ul className="space-y-1">
                {Object.entries(extractedData).map(([key, value]) => (
                  <li key={key}>
                    <span className="text-gray-500">{key.replace(/_/g, ' ')}: </span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <label className="cursor-pointer block w-full py-3 px-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
          <span className="text-gray-500">Click to upload</span>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={onUpload}
          />
        </label>
      )}
    </div>
  );
} 