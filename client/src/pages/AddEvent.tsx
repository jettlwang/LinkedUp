import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon, ArrowRightIcon, EditIcon, XIcon } from 'lucide-react';
const AddEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    contacts,
    addEvent
  } = useApp();
  // Step management (now starts at 1 instead of 2)
  const [step, setStep] = useState(1);
  // Get contactId from URL query params if available
  const params = new URLSearchParams(location.search);
  const preselectedContactId = params.get('contactId');
  // Form states
  const [contactId, setContactId] = useState(preselectedContactId || '');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16));
  const [selectedFormat, setSelectedFormat] = useState('');
  const [notesRaw, setNotesRaw] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [followUpStatus, setFollowUpStatus] = useState<'pending' | 'done'>('done');
  const [isProcessing, setIsProcessing] = useState(false);
  // Format options (renamed from tagOptions)
  const formatOptions = ['Met In Person', 'Met Online', 'Call', 'Text', 'Other'];
  useEffect(() => {
    if (preselectedContactId) {
      setContactId(preselectedContactId);
    }
  }, [preselectedContactId]);
  const handleNext = () => {
    if (step === 1) {
      // Validate required fields
      if (!contactId || !date || !selectedFormat) return;
      setStep(2);
    } else if (step === 2) {
      // Generate AI summary before proceeding to review
      if (!notesRaw.trim()) return;
      // Mock AI processing
      const generatedSummary = processNotesWithAI(notesRaw);
      setAiSummary(generatedSummary);
      setStep(3);
    } else if (step === 3) {
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
  const handleEditSummary = () => {
    setIsEditingSummary(true);
  };
  const handleSaveSummary = () => {
    setIsEditingSummary(false);
  };
  const handleSubmit = () => {
    setIsProcessing(true);
    // Process submission
    setTimeout(() => {
      // Create event with collected data
      const newEvent = {
        contactId,
        notesRaw,
        notesAiSummary: aiSummary,
        date: new Date(date).toISOString(),
        followUpStatus,
        tags: [selectedFormat] // Use selected format as a tag
      };
      // Add to context
      addEvent(newEvent);
      // Navigate to the created event details page
      // Get the ID of the newly created event (implementation may vary)
      const eventId = Date.now().toString(); // This is a simplification
      navigate(`/events/${eventId}`);
    }, 1000);
  };
  // Mock AI processing function
  const processNotesWithAI = (text: string): string => {
    // In a real app, this would call an AI service
    // Simple summary - in real app this would be AI-generated
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
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
                {[1, 2, 3].map(s => <div key={s} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${s === step ? 'bg-primary-600 text-white' : s < step ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                    {s}
                  </div>)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-primary-600 h-1 rounded-full transition-all duration-300" style={{
                width: `${(step - 1) * 50}%`
              }}></div>
              </div>
            </div>
            {/* Step 1: Basic Details */}
            {step === 1 && <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  🎉 Good job putting yourself out there!
                </h2>
                <p className="text-gray-600 mb-6">
                  Tell us about it so we can help you keep track.
                </p>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                      Person
                    </label>
                    <select id="contact" value={contactId} onChange={e => setContactId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" required disabled={!!preselectedContactId}>
                      <option value="">Select a connection</option>
                      {contacts.map(contact => <option key={contact.id} value={contact.id}>
                          {contact.name}
                        </option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date and Time
                    </label>
                    <input id="date" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interaction Format
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
                </div>
              </div>}
            {/* Step 2: What Happened */}
            {step === 2 && <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  How did it go?
                </h2>
                <p className="text-gray-600 mb-4">
                  Describe what you talked about.
                  Topics, advice, any next steps?
                </p>
                <div className="mb-4">
                  <textarea rows={8} value={notesRaw} onChange={e => setNotesRaw(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="What did you discuss? Any action items or follow-ups needed?" required />
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <input id="followUp" type="checkbox" checked={followUpStatus === 'pending'} onChange={e => setFollowUpStatus(e.target.checked ? 'pending' : 'done')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded-md" />
                    <label htmlFor="followUp" className="ml-2 block text-sm text-gray-700">
                      I need to follow up on this interaction
                    </label>
                  </div>
                </div>
              </div>}
            {/* Step 3: AI Summary Review */}
            {step === 3 && <div>
                <div className="mb-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Here's our summary of your interaction
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You can edit this or go back and try again if it doesn't
                    sound right.
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
                    <p className="text-gray-800">{aiSummary}</p>
                  </div>}
              </div>}
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8">
              <div>
                <button type="button" onClick={handleBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  {step === 1 ? 'Cancel' : 'Back'}
                </button>
              </div>
              {step === 3 && !isEditingSummary && <button onClick={handleEditSummary} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:opacity-60 flex items-center">
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>}
              <button type="button" onClick={handleNext} disabled={step === 1 && (!contactId || !date || !selectedFormat) || step === 2 && !notesRaw.trim() || isProcessing} className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-xl btn-gradient-primary
                  ${step === 1 && (!contactId || !date || !selectedFormat) || step === 2 && !notesRaw.trim() || isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                {step < 3 ? <>
                    Continue
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </> : isProcessing ? 'Saving...' : 'Save Interaction'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default AddEvent;