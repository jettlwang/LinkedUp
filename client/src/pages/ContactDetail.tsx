import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../utils/dateUtils';
import { ArrowLeftIcon, CalendarIcon, MessageSquareIcon, PlusIcon, EditIcon, RefreshCwIcon } from 'lucide-react';
const ContactDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    getContactById,
    getEventsByContactId,
    addEvent,
    updateContact,
    openChat
  } = useApp();
  const [selectedTone, setSelectedTone] = useState<'professional' | 'casual' | 'sincere'>('professional');
  // Edit states for contact information
  const [isEditingRawInfo, setIsEditingRawInfo] = useState(false);
  const [isEditingAiSummary, setIsEditingAiSummary] = useState(false);
  const [tempEditedRawInfo, setTempEditedRawInfo] = useState('');
  const [tempEditedAiSummary, setTempEditedAiSummary] = useState('');
  if (!id) {
    navigate('/contacts');
    return null;
  }
  const contact = getContactById(id);
  if (!contact) {
    navigate('/contacts');
    return null;
  }
  // Get profile color from saved data or fallback
  const getContactProfileColor = (contact: any) => {
    if (contact.profileColor) {
      return contact.profileColor;
    }
    // Fallback calculation
    const colorPairs = [{
      bg: 'bg-primary-100',
      text: 'text-primary-600'
    }, {
      bg: 'bg-secondary-100',
      text: 'text-secondary-600'
    }, {
      bg: 'bg-green-100',
      text: 'text-green-600'
    }, {
      bg: 'bg-purple-100',
      text: 'text-purple-600'
    }, {
      bg: 'bg-blue-100',
      text: 'text-blue-600'
    }];
    const index = contact.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorPairs.length;
    return colorPairs[index];
  };
  const profileColor = getContactProfileColor(contact);
  // Initialize contact preferences if they don't exist
  const contactPreferences = contact.preferences || {
    followUpFrequency: '1 Month',
    messageTone: 'professional'
  };
  const events = getEventsByContactId(id);
  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // Get status text and color
  const getStatusInfo = () => {
    if (!contact.lastReachOutDate) {
      return {
        text: 'New Contact',
        color: 'yellow'
      };
    }
    const lastReachOut = new Date(contact.lastReachOutDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    if (lastReachOut < threeMonthsAgo) {
      return {
        text: 'Follow Up Needed',
        color: 'red'
      };
    }
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    if (lastReachOut < oneMonthAgo) {
      return {
        text: 'Check In Soon',
        color: 'yellow'
      };
    }
    return {
      text: 'Active Relationship',
      color: 'green'
    };
  };
  const status = getStatusInfo();
  // Handle opening the chat window with contact context
  const handleOpenChat = () => {
    openChat({
      contactId: id,
      tone: contactPreferences.messageTone
    });
  };
  // Update contact preferences
  const updateContactPreferences = (key: string, value: any) => {
    const updatedPreferences = {
      ...contactPreferences,
      [key]: value
    };
    updateContact(id, {
      preferences: updatedPreferences
    });
  };
  // Contact info editing functions
  const handleRegenerateInfo = () => {
    setIsEditingRawInfo(true);
    setTempEditedRawInfo(contact.infoRaw || '');
  };
  const saveRawInfo = () => {
    updateContact(id, {
      infoRaw: tempEditedRawInfo
    });
    setIsEditingRawInfo(false);
  };
  const regenerateFromInput = () => {
    // Mock AI regeneration from edited input
    const newSummary = tempEditedRawInfo.length > 100 ? `${tempEditedRawInfo.substring(0, 100)}...` : tempEditedRawInfo;
    updateContact(id, {
      infoRaw: tempEditedRawInfo,
      infoAiSummary: newSummary
    });
    setIsEditingRawInfo(false);
  };
  const saveAiSummary = () => {
    updateContact(id, {
      infoAiSummary: tempEditedAiSummary
    });
    setIsEditingAiSummary(false);
  };
  return <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Contacts
      </button>
      {/* Contact Header */}
    <div className="bg-white mb-6 p-6 border-b border-gray-100">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
    {/* LEFT: avatar + text */}
    <div className="flex items-start gap-4 min-w-0">
      <div className={`w-16 h-16 rounded-full ${profileColor.bg} flex items-center justify-center ${profileColor.text} text-2xl font-bold shrink-0`}>
        {contact.name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-gray-800 break-words">
          {contact.name}
        </h1>

        <p className="text-gray-600 mt-1">
          {contact.infoAiSummary || contact.infoRaw}
        </p>

        <div className="mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
            {status.text}
          </span>
        </div>
      </div>
    </div>

    {/* RIGHT: actions */}
    <div className="flex flex-col gap-2 lg:flex-row lg:gap-2 lg:justify-end lg:self-start">
      {/* Primary CTA — first on mobile, second on lg */}
      <button onClick={handleOpenChat} className="order-1 lg:order-2 inline-flex items-center justify-center px-3 py-2 text-sm leading-4 font-medium rounded-full
                   text-white btn-gradient-primary whitespace-nowrap w-full lg:w-auto">
        <MessageSquareIcon className="h-4 w-4 mr-1" />
        Draft Message
      </button>

      {/* Secondary CTA — second on mobile, first on lg */}
      <Link to={`/add-event?contactId=${id}`} className="order-2 lg:order-1 inline-flex items-center justify-center px-3 py-2 text-sm leading-4 font-medium rounded-full
                   text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 whitespace-nowrap w-full lg:w-auto">
        <CalendarIcon className="h-4 w-4 mr-1" />
        Log Interaction
      </Link>
    </div>
  </div>
    </div>

      {/* Contact Profile - Always Visible */}
      <div className="bg-white mb-6">
        <div className="p-6 space-y-6">
          {/* Contact Information Section - Updated with InteractionDetail style */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-700">Information</h2>
              {!isEditingRawInfo && <button type="button" onClick={handleRegenerateInfo} className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-800">
                  <RefreshCwIcon className="h-4 w-4 mr-1" />
                  Regenerate
                </button>}
            </div>
            {/* Raw Info Editing */}
            {isEditingRawInfo ? <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Your Original Notes
                </label>
                <textarea rows={4} value={tempEditedRawInfo} onChange={e => setTempEditedRawInfo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-2" placeholder="Where you met, what you talked about, their background, etc." />
                <div className="flex gap-2">
                  <button onClick={saveRawInfo} className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm">
                    Save
                  </button>
                  <button onClick={regenerateFromInput} className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm flex items-center">
                    <RefreshCwIcon className="h-3 w-3 mr-1" />
                    Regenerate
                  </button>
                  <button onClick={() => setIsEditingRawInfo(false)} className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm">
                    Cancel
                  </button>
                </div>
              </div> : null}
            {/* AI Summary Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  AI Summary
                </label>
                {!isEditingAiSummary && <button type="button" onClick={() => {
                setIsEditingAiSummary(true);
                setTempEditedAiSummary(contact.infoAiSummary || '');
              }} className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800">
                    <EditIcon className="h-3 w-3 mr-1" />
                    Edit
                  </button>}
              </div>
              {isEditingAiSummary ? <div>
                  <textarea rows={3} value={tempEditedAiSummary} onChange={e => setTempEditedAiSummary(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                  <div className="flex mt-2">
                    <button onClick={saveAiSummary} className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm">
                      Save
                    </button>
                    <button onClick={() => setIsEditingAiSummary(false)} className="ml-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm">
                      Cancel
                    </button>
                  </div>
                </div> : <div className="text-gray-700 mb-6">
                  {contact.infoAiSummary || 'No AI summary available.'}
                </div>}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              <h2> Follow-up Reminder Frequency </h2>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['1 Month', '3 Months', '6 Months', 'Never'].map(frequency => <div key={frequency} onClick={() => updateContactPreferences('followUpFrequency', frequency)} className={`
                    border rounded-full py-2 px-3 text-center cursor-pointer
                    ${contactPreferences.followUpFrequency === frequency ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-300 hover:border-gray-400 text-gray-700'}
                  `}>
                  {frequency}
                </div>)}
            </div>
          </div>
        </div>
      </div>
      {/* Interaction History */}
      <div className="bg-white">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className=" text-gray-800">Interaction History</h2>
          <Link to={`/add-event?contactId=${id}`} className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-800">
            <PlusIcon className="h-3 w-3 mr-1" />
            Add
          </Link>
        </div>
        <div className="py-4 px-6">
          {sortedEvents.length > 0 ? <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {sortedEvents.map(event => <Link key={event.id} to={`/events/${event.id}`} className="relative flex items-start group">
                    {/* Timeline dot */}
                    <div className="absolute left-0 w-5 h-5 rounded-full bg-primary-100 border-2 border-primary-500 z-10 mt-0.5 group-hover:bg-primary-200 transition-colors"></div>
                    {/* Content */}
                    <div className="ml-10 flex-1 bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:border-primary-200 transition-colors">
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        {event.notesAiSummary || event.notesRaw}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(event.date)}
                        </p>
                        {event.followUpStatus === 'pending' && <span className="px-2 py-1 text-xs rounded-xl bg-yellow-50 text-yellow-700">
                            Follow-up needed
                          </span>}
                      </div>
                    </div>
                  </Link>)}
              </div>
            </div> : <div className="py-8 text-center">
              <p className="text-gray-500">No interactions recorded yet</p>
              <Link to={`/add-event?contactId=${id}`} className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-800">
                Log your first interaction
              </Link>
            </div>}
        </div>
      </div>
    </div>;
};
export default ContactDetail;