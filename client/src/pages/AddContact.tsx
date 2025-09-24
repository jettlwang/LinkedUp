import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon, ArrowRightIcon, XIcon, EditIcon, CheckIcon, RefreshCwIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
const AddContact = () => {
  const navigate = useNavigate();
  const {
    addContact,
    addEvent
  } = useApp();
  // Step management
  const [step, setStep] = useState(1);
  // Form states
  const [name, setName] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().substring(0, 16));
  const [selectedFormat, setSelectedFormat] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [meetingStory, setMeetingStory] = useState('');
  // AI summary states
  const [aboutPersonSummary, setAboutPersonSummary] = useState('');
  const [aboutMeetingSummary, setAboutMeetingSummary] = useState('');
  const [isEditingPersonSummary, setIsEditingPersonSummary] = useState(false);
  const [isEditingMeetingSummary, setIsEditingMeetingSummary] = useState(false);
  const [tempPersonSummary, setTempPersonSummary] = useState('');
  const [tempMeetingSummary, setTempMeetingSummary] = useState('');
  // Follow-up frequency
  const [followUpFrequency, setFollowUpFrequency] = useState<'1 Month' | '3 Months' | '6 Months' | 'Never'>('1 Month');
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  // Format options
  const formatOptions = ['Event', 'Coffee Chat', 'Intro', 'Other'];
  const handleNext = () => {
    if (step === 1) {
      // Validate required fields
      if (!name || !meetingDate || !selectedFormat) return;
      setStep(2);
    } else if (step === 2) {
      // Generate AI summaries before proceeding to review
      if (!meetingStory.trim()) return;
      // Mock AI processing
      const {
        personSummary,
        meetingSummary
      } = processStoryWithAI(meetingStory, name);
      setAboutPersonSummary(personSummary);
      setAboutMeetingSummary(meetingSummary);
      setStep(3);
    } else if (step === 3) {
      // Proceed to follow-up frequency selection
      setStep(4);
    } else if (step === 4) {
      // Final submission
      handleSubmit();
    }
  };
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };
  const handleClose = () => {
    navigate(-1);
  };
  const handleEditPersonSummary = () => {
    setIsEditingPersonSummary(true);
    setTempPersonSummary(aboutPersonSummary);
  };
  const handleEditMeetingSummary = () => {
    setIsEditingMeetingSummary(true);
    setTempMeetingSummary(aboutMeetingSummary);
  };
  const savePersonSummary = () => {
    setAboutPersonSummary(tempPersonSummary);
    setIsEditingPersonSummary(false);
  };
  const saveMeetingSummary = () => {
    setAboutMeetingSummary(tempMeetingSummary);
    setIsEditingMeetingSummary(false);
  };
  const handleRegenerateAll = () => {
    const {
      personSummary,
      meetingSummary
    } = processStoryWithAI(meetingStory, name);
    setAboutPersonSummary(personSummary);
    setAboutMeetingSummary(meetingSummary);
  };
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        y: 0.6
      }
    });
  };
  const handleSubmit = () => {
    setIsProcessing(true);
    // Process submission
    setTimeout(() => {
      // Create contact with collected data
      const newContact = {
        name,
        infoRaw: meetingStory,
        infoAiSummary: aboutPersonSummary,
        lastReachOutDate: new Date(meetingDate).toISOString(),
        preferences: {
          followUpFrequency: followUpFrequency,
          messageTone: 'professional' as const
        }
      };
      // Add contact to context and get the actual contact ID
      const contactId = addContact(newContact);
      // Create interaction with collected data
      const newEvent = {
        contactId,
        notesRaw: meetingStory,
        notesAiSummary: aboutMeetingSummary,
        date: new Date(meetingDate).toISOString(),
        followUpStatus: 'done' as const,
        tags: [selectedFormat]
      };
      // Add interaction to context
      addEvent(newEvent);
      // Trigger confetti animation
      triggerConfetti();
      // Redirect to contacts page after a short delay
      setTimeout(() => {
        navigate('/contacts');
      }, 1500);
    }, 1000);
  };
  // Mock AI processing function
  const processStoryWithAI = (story: string, personName: string): {
    personSummary: string;
    meetingSummary: string;
  } => {
    // In a real app, this would call an AI service
    // Generate a summary about the person
    const personSummary = `${personName} is a professional contact ${story.includes('work') ? 'who works in ' + story.split('work')[1].split('.')[0].trim() : 'with relevant experience'}. ${story.length > 150 ? story.substring(0, 150).split('.')[0] + '.' : story}`;
    // Generate a summary about the meeting
    const meetingSummary = `Met with ${personName}${selectedFormat ? ' for a ' + selectedFormat.toLowerCase() : ''}. ${story.length > 100 ? story.substring(0, 100) + '...' : story}`;
    return {
      personSummary,
      meetingSummary
    };
  };
  return <div className="min-h-screen w-full bg-gradient-to-br from-primary-100 to-secondary-100 bg-[length:200%_200%] animate-gradient-shift">
      {/* Close button */}
      <button onClick={handleClose} className="fixed top-6 right-6 z-10 p-2 hover:opacity-60 transition-opacity">
        <XIcon className="h-6 w-6 text-gray-600" />
      </button>
      <div className="flex flex-col justify-center min-h-screen py-12 px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="bg-white px-10 py-12 rounded-3xl border-t border-b border-gray-100 shadow-lg">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map(s => <div key={s} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${s === step ? 'bg-primary-600 text-white' : s < step ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                    {s}
                  </div>)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-primary-600 h-1 rounded-full transition-all duration-300" style={{
                width: `${(step - 1) / 3 * 100}%`
              }}></div>
              </div>
            </div>
            {/* Step 1: Contact Basics */}
            {step === 1 && <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  🎉 Congrats on meeting someone new!
                </h2>
                <p className="text-gray-600 mb-6">
                  Let's save their details to help you stay connected.
                </p>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Enter their name" required />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      When did you meet?
                    </label>
                    <input id="date" type="datetime-local" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you meet?
                    </label>
                    <div className="space-y-3">
                      {formatOptions.map(format => <div key={format} onClick={() => setSelectedFormat(format)} className={`
                            p-3 border rounded-xl cursor-pointer flex items-center
                            ${selectedFormat === format ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                          `}>
                          <div className={`
                              w-5 h-5 rounded-full border flex items-center justify-center mr-3
                              ${selectedFormat === format ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}
                            `}>
                            {selectedFormat === format && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span>{format}</span>
                        </div>)}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn URL (optional)
                    </label>
                    <input id="linkedin" type="text" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
              </div>}
            {/* Step 2: Meeting Story */}
            {step === 2 && <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Tell us about {name}
                </h2>
                <p className="text-gray-600 mb-6">
                  Who are they, how did you meet, and how did it go? We'll save
                  this as both their profile and your first interaction
                  together.
                </p>
                <div className="mb-4">
                  <textarea rows={8} value={meetingStory} onChange={e => setMeetingStory(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Describe who they are, their background, and how your meeting went. Include any relevant details you want to remember." required />
                </div>
              </div>}
            {/* Step 3: AI Summary Review */}
            {step === 3 && <div>
                <div className="mb-6 border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Here's our summary
                  </h2>
                  <p className="text-gray-600 mb-2">
                    We've created two summaries - one for {name}'s profile and
                    one for your interaction.
                  </p>
                  <div className="flex justify-end">
                    <button onClick={handleRegenerateAll} className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
                      <RefreshCwIcon className="h-3 w-3 mr-1" />
                      Regenerate All
                    </button>
                  </div>
                </div>
                {/* About Person Summary */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      About {name}
                    </h3>
                    {!isEditingPersonSummary && <button onClick={handleEditPersonSummary} className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                        <EditIcon className="h-3 w-3 mr-1" />
                        Edit
                      </button>}
                  </div>
                  {isEditingPersonSummary ? <div className="mb-4">
                      <textarea rows={4} value={tempPersonSummary} onChange={e => setTempPersonSummary(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-2" />
                      <div className="flex gap-2">
                        <button onClick={savePersonSummary} className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm">
                          Save
                        </button>
                        <button onClick={() => setIsEditingPersonSummary(false)} className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm">
                          Cancel
                        </button>
                      </div>
                    </div> : <div className="p-4 bg-gray-50 rounded-xl text-gray-700 mb-6">
                      {aboutPersonSummary}
                    </div>}
                </div>
                {/* About Meeting Summary */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      About Your First Interaction
                    </h3>
                    {!isEditingMeetingSummary && <button onClick={handleEditMeetingSummary} className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                        <EditIcon className="h-3 w-3 mr-1" />
                        Edit
                      </button>}
                  </div>
                  {isEditingMeetingSummary ? <div>
                      <textarea rows={4} value={tempMeetingSummary} onChange={e => setTempMeetingSummary(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-2" />
                      <div className="flex gap-2">
                        <button onClick={saveMeetingSummary} className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm">
                          Save
                        </button>
                        <button onClick={() => setIsEditingMeetingSummary(false)} className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm">
                          Cancel
                        </button>
                      </div>
                    </div> : <div className="p-4 bg-gray-50 rounded-xl text-gray-700">
                      {aboutMeetingSummary}
                    </div>}
                </div>
              </div>}
            {/* Step 4: Follow-up Frequency */}
            {step === 4 && <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Great job!
                </h2>
                <p className="text-gray-600 mb-6">
                  How often would you like to stay in touch with {name}?
                </p>
                <div className="space-y-3 mb-6">
                  {['1 Month', '3 Months', '6 Months', 'Never'].map(frequency => <div key={frequency} onClick={() => setFollowUpFrequency(frequency as any)} className={`
                        p-4 border rounded-xl cursor-pointer flex items-center
                        ${followUpFrequency === frequency ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                      `}>
                        <div className={`
                          w-5 h-5 rounded-full border flex items-center justify-center mr-3
                          ${followUpFrequency === frequency ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}
                        `}>
                          {followUpFrequency === frequency && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="font-medium">{frequency}</span>
                          <p className="text-xs text-gray-500 mt-1">
                            {frequency === '1 Month' && 'Suggested for close connections'}
                            {frequency === '3 Months' && 'Good for regular networking'}
                            {frequency === '6 Months' && 'For occasional check-ins'}
                            {frequency === 'Never' && 'No automatic reminders'}
                          </p>
                        </div>
                      </div>)}
                </div>
              </div>}
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8">
              <div>
                <button type="button" onClick={handleBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  {step === 1 ? 'Cancel' : 'Back'}
                </button>
              </div>
              <button type="button" onClick={handleNext} disabled={step === 1 && (!name || !meetingDate || !selectedFormat) || step === 2 && !meetingStory.trim() || isProcessing} className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-xl btn-gradient-primary
                  ${step === 1 && (!name || !meetingDate || !selectedFormat) || step === 2 && !meetingStory.trim() || isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                {step < 4 ? <>
                    Continue
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </> : isProcessing ? 'Saving...' : 'Save Contact'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default AddContact;