import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function ContinueApplication() {
  const [applicationFound, setApplicationFound] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFindApplication = (values) => {
    setIsLoading(true);
    
    // Simulate API call to find application
    setTimeout(() => {
      if (values.email === 'test@example.com' && values.applicationId === '12345') {
        setApplicationFound({
          id: '12345',
          name: 'John Doe',
          email: 'test@example.com',
          loanType: 'Personal Loan',
          loanAmount: 500000,
          status: 'In Progress',
          stage: 'Document Verification',
          completedStages: ['Video Interaction', 'Basic Information'],
          pendingStages: ['Document Verification', 'Loan Assessment', 'Final Approval'],
          documents: {
            aadhaar: true,
            pan: false,
            incomeProof: false
          },
          lastUpdated: '2023-03-15T10:30:00Z'
        });
      } else {
        setApplicationFound(false);
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
      <Head>
        <title>Continue Application | Alvenio</title>
        <meta name="description" content="Continue your loan application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-700">
              Alvenio
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-800 mb-6 text-center">
            Continue Your Application
          </h1>
          
          {applicationFound === null ? (
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-lg text-gray-700 mb-8 text-center">
                Please enter your email and application ID to continue your loan application.
              </p>
              
              <Formik
                initialValues={{
                  email: '',
                  applicationId: ''
                }}
                validationSchema={Yup.object({
                  email: Yup.string()
                    .email('Invalid email address')
                    .required('Email is required'),
                  applicationId: Yup.string()
                    .required('Application ID is required')
                })}
                onSubmit={handleFindApplication}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                        Email Address
                      </label>
                      <Field
                        type="email"
                        name="email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your email"
                      />
                      <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                    
                    <div>
                      <label htmlFor="applicationId" className="block text-gray-700 font-medium mb-2">
                        Application ID
                      </label>
                      <Field
                        type="text"
                        name="applicationId"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your application ID"
                      />
                      <ErrorMessage name="applicationId" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                    
                    <div className="text-center pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors w-full md:w-auto"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching...
                          </span>
                        ) : 'Find My Application'}
                      </button>
                    </div>
                    
                    <div className="text-center text-gray-600 text-sm">
                      Don&apos;t have an application ID? <Link href="/application/new" className="text-primary-600 hover:text-primary-800">Start a new application</Link>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          ) : applicationFound === false ? (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="mb-6 text-5xl">❌</div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Application Not Found</h2>
              <p className="text-gray-700 mb-8">
                We couldn&apos;t find an application with the provided email and application ID. Please check your details and try again.
              </p>
              
              <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <button
                  onClick={() => setApplicationFound(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg"
                >
                  Try Again
                </button>
                <Link href="/application/new" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg text-center">
                  Start New Application
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary-800">Application #{applicationFound.id}</h2>
                  <p className="text-gray-600">{applicationFound.name} • {applicationFound.email}</p>
                </div>
                <div className="px-4 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm">
                  {applicationFound.status}
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">Application Progress</h3>
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(applicationFound.lastUpdated).toLocaleString()}
                  </span>
                </div>
                
                <div className="bg-gray-100 h-2 rounded-full mb-4">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${(applicationFound.completedStages.length / (applicationFound.completedStages.length + applicationFound.pendingStages.length)) * 100}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Completed Stages</h4>
                    <ul className="space-y-2">
                      {applicationFound.completedStages.map((stage, index) => (
                        <li key={index} className="flex items-center text-green-700">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {stage}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Pending Stages</h4>
                    <ul className="space-y-2">
                      {applicationFound.pendingStages.map((stage, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                          {stage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">Loan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Loan Type</div>
                    <div className="font-semibold">{applicationFound.loanType}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Loan Amount</div>
                    <div className="font-semibold">₹{applicationFound.loanAmount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-4">Document Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DocumentStatusCard
                    title="Aadhaar Card"
                    isUploaded={applicationFound.documents.aadhaar}
                  />
                  
                  <DocumentStatusCard
                    title="PAN Card"
                    isUploaded={applicationFound.documents.pan}
                  />
                  
                  <DocumentStatusCard
                    title="Income Proof"
                    isUploaded={applicationFound.documents.incomeProof}
                  />
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg">
                  Return Home
                </Link>
                <Link href={`/application/new`} className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg">
                  Continue Application
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-primary-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Alvenio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function DocumentStatusCard({ title, isUploaded }) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        {isUploaded ? (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Uploaded
          </span>
        ) : (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Pending
          </span>
        )}
      </div>
      
      {!isUploaded && (
        <button className="mt-3 w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium">
          Upload Document
        </button>
      )}
    </div>
  );
} 