import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon, EditIcon } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import confetti from 'canvas-confetti';


import { chat } from '../ai';
import { ONBOARDING_SUMMARY } from '../prompts';

const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        y: 0.6
      }
    });
  };
const Onboarding = () => {
  const navigate = useNavigate();
  const {
    completeOnboarding
  } = useApp();
  const [step, setStep] = useState(1);
  // User data states
  const [fullName, setFullName] = useState('');
  const [demographics, setDemographics] = useState('');
  const [situationDescription, setSituationDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [preferences, setPreferences] = useState({
    messageTone: 'professional' as const
  });
  // Derived data
  const firstName = fullName.split(' ')[0];
  const handleNext = async () => {
    if (step < 4) {
      // If moving to the AI summary step, generate the summary
      if (step === 3) {
        setIsProcessing(true);
        try {
          // Call backend API with fixed system prompt + user text
          const { answer } = await chat({
            messages: [
              { role: "system", content: ONBOARDING_SUMMARY },
              { role: "user", content: situationDescription }
            ]
          });
          setAiSummary(answer);
        } catch (err: any) {
          console.error("AI summary failed", err);
          setAiSummary("⚠️ Could not generate summary. Please try again.");
          } finally {
            setIsProcessing(false);
          }
      }
      setStep(step + 1);
    } else {
      try {
        // Create final profile with all collected data
        const profile = {
          name: fullName,
          firstName: firstName,
          demographics: demographics,
          backgroundRaw: situationDescription,
          backgroundAiSummary: aiSummary,
          goalsRaw: situationDescription,
          goalsAiSummary: aiSummary,
          preferences
        };
        // Complete onboarding and ensure localStorage is updated
        completeOnboarding(profile);
        // Force a reload to ensure React Router picks up the localStorage change
        window.location.href = '/';
        triggerConfetti();
      } catch (error) {
        console.error('Error during onboarding completion:', error);
      }
    }
  };
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  // Mock AI processing function
  const processWithAI = (text: string, demographics: string): string => {
    // In a real app, this would call an AI service
    const demographicContext = demographics ? `As a ${demographics}, ` : '';
    return `${demographicContext}${firstName} is looking to expand their professional network. ${text.length > 50 ? `They described their situation as: "${text.substring(0, 100)}..." and are looking for networking opportunities to advance their career.` : `They are at the beginning of their networking journey.`}`;
  };
  const selectDemographic = (demo: string) => {
    setDemographics(demo);
  };
  const handleEditSummary = () => {
    setIsEditingSummary(true);
  };
  const handleSaveSummary = () => {
    setIsEditingSummary(false);
  };
  const demographicOptions = ['Student - Undergrad', 'Student - Graduate', 'Recent Graduate', 'Early Career Professional', 'Other'];
  return <div className="
      min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8
      bg-gradient-to-br from-primary-100 to-secondary-100
      bg-[length:200%_200%] animate-gradient-shift
    ">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl text-center font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          LinkedUp
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Stay connected, grow together.
        </p>
      </div>
      <div className="m-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-10 py-12 rounded-3xl sm:px-10 border-t border-b border-gray-100">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map(s => <div key={s} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${s === step ? 'bg-primary-600 text-white' : s < step ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                  {s}
                </div>)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-primary-600 h-1 rounded-full transition-all duration-300" style={{
              width: `${(step - 1) * 33.33}%`
            }}></div>
            </div>
          </div>
          {/* Step 1: Enter Name */}
          {step === 1 && <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Let's start with your name 👋
              </h2>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your name
                </label>
                <input id="name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Your name here" />
              </div>
            </div>}
          {/* Step 2: Select Demographic */}
          {step === 2 && <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Where are you in your journey?
              </h2>
              <p className="text-gray-600 mb-4">
                This helps us tailor advice to your stage.
              </p>
              <div className="space-y-3">
                {demographicOptions.map(option => <div key={option} onClick={() => selectDemographic(option)} className={`
                      p-3 border rounded-xl cursor-pointer flex items-center
                      ${demographics === option ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                    `}>
                    <div className={`
                      w-5 h-5 rounded-full border flex items-center justify-center mr-3
                      ${demographics === option ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}
                    `}>
                      {demographics === option && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span>{option}</span>
                  </div>)}
              </div>
            </div>}
          {/* Step 3: Describe Current Situation */}
          {step === 3 && <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Tell us a little about yourself
              </h2>
              <p className="text-gray-600 mb-4">
                Don't worry about format — just type in your own words.
              </p>
              <div className="mb-4">
                <textarea rows={6} value={situationDescription} onChange={e => setSituationDescription(e.target.value)} className="w-full h-2/1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Tell us about your background and your current career goals. What are you hoping to do with networking?" />
              </div>
            </div>}
          {/* Step 4: AI Summary Review */}
          {step === 4 && <div>
              <div className="mb-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Here's how we understood your story
                </h2>
                <p className="text-gray-600 mb-4">
                  You can edit this or go back and try again if it doesn't sound right.
                </p>
              </div>
              {isEditingSummary ? <div className="mb-4">
                  <textarea rows={6} value={aiSummary} onChange={e => setAiSummary(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-2" />
                  <div className="flex gap-2">
                    <button onClick={handleSaveSummary} className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm">
                      Save
                    </button>
                    <button onClick={() => setIsEditingSummary(false)} className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm">
                      Cancel
                    </button>
                  </div>
                </div> : <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="prose prose-sm max-w-none text-gray-800">
                    <ReactMarkdown>{aiSummary}</ReactMarkdown>
                  </div>
                </div>}
            </div>}
          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8">
            <div>
              {step > 1 && <button type="button" onClick={handleBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back
                </button>}
            </div>
            {step === 4 && !isEditingSummary && <button onClick={handleEditSummary} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:opacity-60 flex items-center">
                <EditIcon className="h-4 w-4 mr-1" />
                Edit
              </button>}
            <button type="button" onClick={handleNext} 
              disabled={step === 1 && !fullName || step === 3 && !situationDescription || isProcessing } 
              className={`
                inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-xl
                ${step === 1 && !fullName || step === 3 && !situationDescription || isProcessing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-700'}
              `}>
              {step < 4 ? 'Continue' : 'Get Started'}
              {step < 4 && <ArrowRightIcon className="ml-2 h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default Onboarding;