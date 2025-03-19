import { useState, useEffect, useRef } from 'react';
import { aiManagerService, videoService } from '../services/api';

// Sample questions and responses from the virtual AI manager
const AI_MANAGER_VIDEOS = {
  welcome: {
    video: '/videos/ai-manager-welcome.mp4',
    question: 'Welcome to Alvenio! I\'m here to help you apply for a loan. Can you please introduce yourself and tell me what type of loan you\'re interested in?'
  },
  income: {
    video: '/videos/ai-manager-income.mp4',
    question: 'Great to meet you! Now, could you tell me about your monthly income and employment type?'
  },
  purpose: {
    video: '/videos/ai-manager-purpose.mp4',
    question: 'Thank you for that information. What\'s the purpose of the loan you\'re applying for?'
  },
  documents: {
    video: '/videos/ai-manager-documents.mp4',
    question: 'Now I\'ll need you to upload some documents for verification. Please upload your Aadhaar card, PAN card, and income proof.'
  },
  approval: {
    video: '/videos/ai-manager-approval.mp4',
    question: 'Great news! Based on the information you\'ve provided, your loan has been pre-approved. Would you like to proceed with the application?'
  },
  rejection: {
    video: '/videos/ai-manager-rejection.mp4',
    question: 'I\'ve reviewed your information, but unfortunately, we cannot approve your loan at this time. Would you like to know the reasons and possible next steps?'
  },
  more_info: {
    video: '/videos/ai-manager-more-info.mp4',
    question: 'I need some additional information to process your application. Could you provide more details about your existing loans or financial commitments?'
  }
};

export default function AiBranchManager({ userId, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState('welcome');
  const [isAiSpeaking, setIsAiSpeaking] = useState(true);
  const [isUserRecording, setIsUserRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [videoError, setVideoError] = useState(false);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState(false);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const userVideoRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const speechSynthesisRef = useRef(null);
  
  // Check if speech synthesis is available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSpeechAvailable(true);
    }
  }, []);
  
  // Speak the text using the Web Speech API
  const speakText = (text) => {
    if (!isSpeechAvailable) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Find a good voice - prefer female voices if available
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Sometimes voices aren't loaded immediately
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setVoice(utterance, voices);
      };
    } else {
      setVoice(utterance, voices);
    }
    
    // Handle events
    utterance.onstart = () => {
      setIsAiSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsAiSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsAiSpeaking(false);
    };
    
    // Start speaking
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };
  
  // Set the appropriate voice
  const setVoice = (utterance, voices) => {
    // Prefer these voices if available
    const preferredVoices = [
      'Google UK English Female',
      'Microsoft Zira Desktop',
      'Samantha',
      'Female'
    ];
    
    let selectedVoice = null;
    
    // First try to find a preferred voice
    for (const preferredVoice of preferredVoices) {
      selectedVoice = voices.find(voice => 
        voice.name.includes(preferredVoice) || 
        voice.name.includes('female') || 
        voice.name.includes('Female')
      );
      if (selectedVoice) break;
    }
    
    // If no preferred voice is found, just use the first available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  };
  
  // Initialize the AI manager
  useEffect(() => {
    // In a real app, we would fetch the first question from the backend
    // For now, we'll use the welcome question
    const welcomeMessage = AI_MANAGER_VIDEOS.welcome.question;
    
    setConversation([
      {
        speaker: 'ai',
        content: welcomeMessage,
        video: AI_MANAGER_VIDEOS.welcome.video
      }
    ]);
    
    // Speak the welcome message
    if (isSpeechAvailable) {
      speakText(welcomeMessage);
    } else {
      // Fallback if speech synthesis is not available
      const timer = setTimeout(() => {
        setIsAiSpeaking(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Cleanup function
    return () => {
      // Stop any ongoing speech
      if (isSpeechAvailable) {
        window.speechSynthesis.cancel();
      }
      
      // Stop any ongoing streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isSpeechAvailable]);
  
  // Play AI manager video when it changes
  useEffect(() => {
    if (conversation.length <= 0 || conversation[conversation.length - 1].speaker !== 'ai') {
      return;
    }
    
    const aiMessage = conversation[conversation.length - 1].content;
    
    // Try to play the video
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
        setVideoError(true);
        
        // Speak the message if video fails and it's not the initial message
        if (isSpeechAvailable && conversation.length > 1) {
          speakText(aiMessage);
        }
      });
    }
    
    // Speak the message for the first message or if there's a video error
    if ((videoError || conversation.length === 1) && isSpeechAvailable) {
      speakText(aiMessage);
    }
  }, [conversation, videoError, isSpeechAvailable]);
  
  // Handle AI video ended
  const handleAiVideoEnded = () => {
    setIsAiSpeaking(false);
  };
  
  // Start recording user's response
  const startRecording = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      // Set up user video
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      
      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);
        
        // In a real app, we would send this blob to the backend
        // processRecordedVideo(blob);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsUserRecording(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      // Fallback for when camera access is denied
      alert("Unable to access camera and microphone. Please ensure you've granted permission and try again.");
    }
  };
  
  // Stop recording user's response
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsUserRecording(false);
  };
  
  // Process recorded video
  const processRecordedVideo = async (videoBlob) => {
    try {
      // In a real app, we would upload the video to the backend
      // For now, we'll simulate a response from the AI
      
      // Simulate uploading video
      // const response = await videoService.uploadVideo(videoBlob, currentQuestion, userId);
      
      // Simulate processing response
      setTimeout(() => {
        // Move to the next question
        let nextQuestion;
        
        switch (currentQuestion) {
          case 'welcome':
            nextQuestion = 'income';
            break;
          case 'income':
            nextQuestion = 'purpose';
            break;
          case 'purpose':
            nextQuestion = 'documents';
            break;
          case 'documents':
            nextQuestion = 'approval'; // or 'rejection' or 'more_info'
            break;
          default:
            nextQuestion = null;
            break;
        }
        
        if (nextQuestion) {
          // Stop any ongoing speech
          if (isSpeechAvailable) {
            window.speechSynthesis.cancel();
          }
          
          // Add user's response to conversation
          setConversation(prev => [
            ...prev,
            {
              speaker: 'user',
              content: 'User video response',
              video: recordedVideo
            },
            {
              speaker: 'ai',
              content: AI_MANAGER_VIDEOS[nextQuestion].question,
              video: AI_MANAGER_VIDEOS[nextQuestion].video
            }
          ]);
          
          setCurrentQuestion(nextQuestion);
          setIsAiSpeaking(true);
          setResponseSubmitted(false);
          setRecordedVideo(null);
          chunksRef.current = [];
          setVideoError(false); // Reset video error state
        } else {
          // End of conversation
          onComplete && onComplete();
        }
      }, 1500);
      
      setResponseSubmitted(true);
    } catch (error) {
      console.error("Error processing video:", error);
    }
  };
  
  // Submit recorded response
  const submitResponse = () => {
    if (recordedVideo) {
      // In a real app, we would convert the video URL back to a blob
      // For now, we'll just simulate processing the recorded video
      processRecordedVideo();
    }
  };
  
  // Discard recorded response
  const discardResponse = () => {
    setRecordedVideo(null);
    chunksRef.current = [];
  };
  
  // Skip current step (for demo)
  const skipCurrentStep = () => {
    processRecordedVideo();
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary-800 mb-4 text-center">
          Alvenio Interaction
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Have a conversation with our Alvenio to apply for your loan.
        </p>
        {!isSpeechAvailable && (
          <div className="text-center p-2 bg-yellow-50 text-yellow-800 rounded-lg mb-4">
            ⚠️ Voice synthesis not available in your browser. Please use Chrome for the best experience.
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* AI Manager Video */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-primary-700 mb-2">Alvenio</h3>
          
          {conversation.length > 0 && conversation[conversation.length - 1].speaker === 'ai' && (
            <div>
              {videoError ? (
                <div className="w-full h-64 rounded-lg bg-primary-700 flex items-center justify-center">
                  <div className={`text-white text-center p-4 ${isAiSpeaking ? 'animate-pulse' : ''}`}>
                    <div className="text-5xl mb-3">🤖</div>
                    <p className="font-medium">
                      {isAiSpeaking ? "AI Manager is speaking..." : "AI Manager has finished speaking"}
                    </p>
                  </div>
                </div>
              ) : (
                <video 
                  ref={videoRef}
                  className="w-full h-auto rounded-lg"
                  src={conversation[conversation.length - 1].video}
                  controls={false}
                  onEnded={handleAiVideoEnded}
                  onError={() => setVideoError(true)}
                />
              )}
              
              <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                <p className="text-primary-800">
                  {conversation[conversation.length - 1].content}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* User Response */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-primary-700 mb-2">Your Response</h3>
          
          {recordedVideo ? (
            <div>
              <video 
                className="w-full h-auto rounded-lg"
                src={recordedVideo}
                controls
              />
              <div className="mt-3 flex justify-center space-x-3">
                <button
                  onClick={discardResponse}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                  disabled={responseSubmitted}
                >
                  Record Again
                </button>
                <button
                  onClick={submitResponse}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded"
                  disabled={responseSubmitted}
                >
                  {responseSubmitted ? 'Processing...' : 'Submit Response'}
                </button>
              </div>
            </div>
          ) : isUserRecording ? (
            <div>
              <video 
                ref={userVideoRef}
                className="w-full h-auto rounded-lg"
                autoPlay
                muted
              />
              <div className="mt-3 flex justify-center">
                <button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Stop Recording
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <p className="text-gray-500 mb-4">
                {isAiSpeaking ? 'AI Manager is speaking...' : 'Click to record your response'}
              </p>
              <button
                onClick={startRecording}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded mb-3"
                disabled={isAiSpeaking}
              >
                Start Recording
              </button>
              
              <button
                onClick={skipCurrentStep}
                className="text-sm text-gray-500 hover:text-primary-600 underline"
                disabled={isAiSpeaking}
              >
                Demo: Skip to next question
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Conversation History */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-primary-700 mb-2">Conversation History</h3>
        <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
          {conversation.length > 0 ? (
            <div className="space-y-4">
              {conversation.map((message, index) => (
                <div key={index} className={`flex ${message.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div 
                    className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                      message.speaker === 'ai' 
                        ? 'bg-primary-50 text-primary-800' 
                        : 'bg-secondary-50 text-secondary-800'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1">
                      {message.speaker === 'ai' ? 'Alvenio' : 'You'}
                    </p>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No conversation history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
} 