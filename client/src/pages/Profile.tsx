import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckIcon, XIcon, RefreshCwIcon, EditIcon } from 'lucide-react';
const Profile = () => {
  const {
    userProfile,
    updateUserProfile
  } = useApp();
  // States for field values
  const [name, setName] = useState(userProfile?.name || '');
  const [demographics, setDemographics] = useState(userProfile?.demographics || '');
  const [backgroundRaw, setBackgroundRaw] = useState(userProfile?.backgroundRaw || '');
  const [backgroundAiSummary, setBackgroundAiSummary] = useState(userProfile?.backgroundAiSummary || '');
  const [preferences, setPreferences] = useState(userProfile?.preferences || {
    messageTone: 'professional' as const
  });
  // States for edit modes
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDemographics, setIsEditingDemographics] = useState(false);
  const [isEditingRawInput, setIsEditingRawInput] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isEditingTone, setIsEditingTone] = useState(false);
  // Temporary states for editing
  const [tempName, setTempName] = useState(name);
  const [tempBackgroundRaw, setTempBackgroundRaw] = useState(backgroundRaw);
  const [tempBackgroundAiSummary, setTempBackgroundAiSummary] = useState(backgroundAiSummary);
  const [tempPreferences, setTempPreferences] = useState(preferences);
  const demographicOptions = ['Student - Undergrad', 'Student - Graduate', 'Recent Graduate', 'Early Career Professional', 'Other'];
  // Save individual field changes
  const saveField = (field, value) => {
    const updatedProfile = {
      ...userProfile,
      [field]: value,
      // Keep these for compatibility
      goalsRaw: field === 'backgroundRaw' ? value : userProfile?.goalsRaw || backgroundRaw,
      goalsAiSummary: field === 'backgroundAiSummary' ? value : userProfile?.goalsAiSummary || backgroundAiSummary
    };
    updateUserProfile(updatedProfile);
  };
  // Handle name editing
  const saveName = () => {
    setName(tempName);
    saveField('name', tempName);
    setIsEditingName(false);
  };
  // Handle demographics selection
  const selectDemographic = demo => {
    setDemographics(demo);
    saveField('demographics', demo);
  };
  // Handle background raw text editing
  const saveBackgroundRaw = () => {
    setBackgroundRaw(tempBackgroundRaw);
    saveField('backgroundRaw', tempBackgroundRaw);
    setIsEditingRawInput(false);
  };
  // Handle AI summary editing
  const saveAiSummary = () => {
    setBackgroundAiSummary(tempBackgroundAiSummary);
    saveField('backgroundAiSummary', tempBackgroundAiSummary);
    setIsEditingSummary(false);
  };
  // Handle message tone preference
  const saveMessageTone = tone => {
    const newPreferences = {
      ...preferences,
      messageTone: tone
    };
    setPreferences(newPreferences);
    saveField('preferences', newPreferences);
  };
  const handleRegenerate = () => {
    // Open the raw input editor directly
    setIsEditingRawInput(true);
    setTempBackgroundRaw(backgroundRaw);
  };
  const regenerateFromInput = () => {
    // Mock AI regeneration from edited input
    const firstName = name.split(' ')[0];
    const demographicContext = demographics ? `As a ${demographics}, ` : '';
    const newSummary = `${demographicContext}${firstName} is looking to expand their professional network. ${tempBackgroundRaw.length > 50 ? `They described their situation as: "${tempBackgroundRaw.substring(0, 100)}..." and are looking for networking opportunities to advance their career.` : `They are at the beginning of their networking journey.`}`;
    setTempBackgroundAiSummary(newSummary);
    // Save both the raw input and regenerated summary
    setBackgroundRaw(tempBackgroundRaw);
    setBackgroundAiSummary(newSummary);
    saveField('backgroundRaw', tempBackgroundRaw);
    saveField('backgroundAiSummary', newSummary);
    setIsEditingRawInput(false);
  };
  return <div className="max-w-3xl mx-auto">
      <header className="mb-6 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your personal information and preferences
        </p>
      </header>

      <div className="space-y-12">
        {/* Name Field */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              {!isEditingName && <button type="button" onClick={() => {
              setIsEditingName(true);
              setTempName(name);
            }} className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                  <EditIcon className="h-3 w-3 mr-1" />
                  Edit
                </button>}
            </div>
            {isEditingName ? <div className="flex items-center">
                <input id="name" type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                <button onClick={saveName} className="ml-2 p-1 text-green-600 hover:bg-green-50 rounded-full" disabled={!tempName.trim()}>
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button onClick={() => setIsEditingName(false)} className="ml-1 p-1 text-red-600 hover:bg-red-50 rounded-full">
                  <XIcon className="h-5 w-5" />
                </button>
              </div> : <div className="text-gray-800 py-1">{name}</div>}
          </div>

          {/* Demographics Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Where are you in your journey?
              </label>
              {!isEditingDemographics && <button type="button" onClick={() => setIsEditingDemographics(true)} className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                  <EditIcon className="h-3 w-3 mr-1" />
                  Edit
                </button>}
            </div>

            {isEditingDemographics ? <div className="space-y-3">
                {demographicOptions.map(option => <div key={option} onClick={() => {
              selectDemographic(option);
              setIsEditingDemographics(false);
            }} className={`
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
              </div> : <div className="text-gray-800 py-1">
                {demographics || 'Not specified'}
              </div>}
          </div>
          </div>
          {/* About You Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="block text-gray-700">About You</h2>
              {!isEditingRawInput && <button type="button" onClick={handleRegenerate} className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-800">
                  <RefreshCwIcon className="h-4 w-4 mr-1" />
                  Regenerate
                </button>}
            </div>
            {isEditingRawInput ? <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Your Original Input
                </label>
                <textarea rows={4} value={tempBackgroundRaw} onChange={e => setTempBackgroundRaw(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-2" />
                <div className="flex gap-2">
                  <button onClick={saveBackgroundRaw} className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm">
                    Save
                  </button>
                  <button onClick={regenerateFromInput} className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm flex items-center">
                    <RefreshCwIcon className="h-3 w-3 mr-1" />
                    Regenerate
                  </button>
                  <button onClick={() => setIsEditingRawInput(false)} className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm">
                    Cancel
                  </button>
                </div>
              </div> : null}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  AI Summary
                </label>
                {!isEditingSummary && <button type="button" onClick={() => {
              setIsEditingSummary(true);
              setTempBackgroundAiSummary(backgroundAiSummary);
            }} className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800">
                    <EditIcon className="h-3 w-3 mr-1" />
                    Edit
                  </button>}
              </div>
              {isEditingSummary ? <div>
                  <textarea rows={4} value={tempBackgroundAiSummary} onChange={e => setTempBackgroundAiSummary(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                  <div className="flex mt-2">
                    <button onClick={saveAiSummary} className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm">
                      Save
                    </button>
                    <button onClick={() => setIsEditingSummary(false)} className="ml-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm">
                      Cancel
                    </button>
                  </div>
                </div> : <div className="text-gray-700">
                  {backgroundAiSummary || 'No AI summary available.'}
                </div>}
            </div>
          </div>

          {/* Message Tone Preferences */}
          <div>
            <label className="block text-gray-700 mb-2">
              <h2> Preferred Message Tone </h2>
            </label>
            <p className="mb-4 text-sm text-gray-500">
              This will be the default tone for new contacts. You can customize
              the tone for each contact individually.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {['professional', 'casual', 'sincere'].map(tone => <div key={tone} onClick={() => saveMessageTone(tone as any)} className={`
                  border rounded-full py-2 px-3 text-center cursor-pointer
                  ${preferences.messageTone === tone ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-300 hover:border-gray-400 text-gray-700'}
                `}>
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </div>)}
            </div>
          </div>
        
      </div>
    </div>;
};
export default Profile;