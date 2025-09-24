import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../utils/dateUtils';
import { ArrowLeftIcon, EditIcon, Trash2Icon, UserIcon, CalendarIcon, TagIcon, MessageSquareIcon, CheckIcon, XIcon, BellIcon, RefreshCwIcon } from 'lucide-react';
const InteractionDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    events,
    contacts,
    updateEvent,
    deleteEvent,
    openChat
  } = useApp();
  // Find the event
  const event = events.find(e => e.id === id);
  const contact = event ? contacts.find(c => c.id === event.contactId) : null;
  // Edit states
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingRawNotes, setIsEditingRawNotes] = useState(false);
  const [isEditingAiSummary, setIsEditingAiSummary] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [isEditingFollowUp, setIsEditingFollowUp] = useState(false);
  // Form values
  const [editedDate, setEditedDate] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [tempEditedNotes, setTempEditedNotes] = useState('');
  const [tempEditedAiSummary, setTempEditedAiSummary] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedFollowUp, setEditedFollowUp] = useState<'pending' | 'done'>('done');
  // Available tag options
  const tagOptions = ['In Person Meeting', 'Virtual Meeting', 'Messaging', 'Other'];
  useEffect(() => {
    if (event) {
      // Initialize form values from event
      const eventDate = new Date(event.date);
      setEditedDate(eventDate.toISOString().substring(0, 16)); // Format for datetime-local input
      setEditedNotes(event.notesRaw);
      setTempEditedNotes(event.notesRaw);
      setTempEditedAiSummary(event.notesAiSummary || '');
      setEditedTags(event.tags || []);
      setEditedFollowUp(event.followUpStatus);
    } else {
      // No event found, redirect back
      navigate('/events');
    }
  }, [event, navigate]);
  if (!event || !contact) {
    return null; // Will redirect in useEffect
  }
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      deleteEvent(id!);
      navigate('/events');
    }
  };
  // Handle opening the chat window with contact context
  const handleOpenChat = () => {
    openChat({
      contactId: contact?.id,
      tone: contact?.preferences?.messageTone || 'professional'
    });
  };
  // Save functions for each editable field
  const saveDate = () => {
    updateEvent(id!, {
      date: new Date(editedDate).toISOString()
    });
    setIsEditingDate(false);
  };
  const saveNotes = () => {
    // In a real app, would process with AI here
    const notesAiSummary = editedNotes.length > 100 ? editedNotes.substring(0, 100) + '...' : editedNotes;
    updateEvent(id!, {
      notesRaw: editedNotes,
      notesAiSummary
    });
    setIsEditingNotes(false);
  };
  const saveRawNotes = () => {
    setEditedNotes(tempEditedNotes);
    updateEvent(id!, {
      notesRaw: tempEditedNotes
    });
    setIsEditingRawNotes(false);
  };
  const saveAiSummary = () => {
    updateEvent(id!, {
      notesAiSummary: tempEditedAiSummary
    });
    setIsEditingAiSummary(false);
  };
  const saveTags = () => {
    updateEvent(id!, {
      tags: editedTags.length > 0 ? editedTags : undefined
    });
    setIsEditingTags(false);
  };
  const saveFollowUp = () => {
    updateEvent(id!, {
      followUpStatus: editedFollowUp
    });
    setIsEditingFollowUp(false);
  };
  const handleRegenerate = () => {
    // Open the raw notes editor directly
    setIsEditingRawNotes(true);
    setTempEditedNotes(editedNotes);
  };
  const regenerateFromInput = () => {
    // Mock AI regeneration from edited input
    const contactName = contact.name.split(' ')[0];
    const newSummary = tempEditedNotes.length > 100 ? `${contactName} and the user discussed: ${tempEditedNotes.substring(0, 150)}...` : `Summary of interaction with ${contactName}: ${tempEditedNotes}`;
    setTempEditedAiSummary(newSummary);
    // Save both the raw input and regenerated summary
    setEditedNotes(tempEditedNotes);
    updateEvent(id!, {
      notesRaw: tempEditedNotes,
      notesAiSummary: newSummary
    });
    setIsEditingRawNotes(false);
  };
  const toggleTag = (tag: string) => {
    setEditedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  // Helper function to render tags
  const renderTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return <span className="text-gray-500 italic">No tags</span>;
    return <div className="flex flex-wrap gap-2">
        {tags.map(tag => <span key={tag} className="px-3 py-1 text-sm rounded-full bg-primary-100 text-primary-700">
            {tag}
          </span>)}
      </div>;
  };
  return <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back
      </button>
      {/* Interaction Header */}
      <div className="bg-white mb-6 p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-6 w-6 text-gray-400 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">
                Interaction Details
              </h1>
            </div>
            {/* Contact Info */}
            <div className="flex items-center mb-6">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600 mr-2">with</span>
              <Link to={`/contacts/${contact.id}`} className="font-medium text-primary-600 hover:text-primary-800">
                {contact.name}
              </Link>
            </div>
            {/* Date - Editable */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Date and Time
                </h3>
                <button onClick={() => setIsEditingDate(!isEditingDate)} className="ml-2 p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full">
                  <EditIcon size={14} />
                </button>
              </div>
              {isEditingDate ? <div className="flex items-center">
                  <input type="datetime-local" value={editedDate} onChange={e => setEditedDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                  <button onClick={saveDate} className="ml-2 p-1 text-green-600 hover:bg-green-50 rounded-full">
                    <CheckIcon size={16} />
                  </button>
                  <button onClick={() => setIsEditingDate(false)} className="ml-1 p-1 text-red-600 hover:bg-red-50 rounded-full">
                    <XIcon size={16} />
                  </button>
                </div> : <div className="text-gray-700">
                  {formatRelativeTime(event.date)} •{' '}
                  {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
                </div>}
            </div>
            {/* Tags - Editable */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Interaction Type
                </h3>
                <button onClick={() => setIsEditingTags(!isEditingTags)} className="ml-2 p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full">
                  <EditIcon size={14} />
                </button>
              </div>
              {isEditingTags ? <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tagOptions.map(tag => <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-sm ${editedTags.includes(tag) ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}>
                        {tag}
                      </button>)}
                  </div>
                  <div className="flex">
                    <button onClick={saveTags} className="p-1 text-green-600 hover:bg-green-50 rounded-full">
                      <CheckIcon size={16} />
                    </button>
                    <button onClick={() => setIsEditingTags(false)} className="ml-1 p-1 text-red-600 hover:bg-red-50 rounded-full">
                      <XIcon size={16} />
                    </button>
                  </div>
                </div> : <div>{renderTags(event.tags)}</div>}
            </div>
            {/* Follow-up Status - Editable */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Follow-up Status
                </h3>
                <button onClick={() => setIsEditingFollowUp(!isEditingFollowUp)} className="ml-2 p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full">
                  <EditIcon size={14} />
                </button>
              </div>
              {isEditingFollowUp ? <div className="flex items-center">
                  <div className="flex items-center">
                    <input id="followUp" type="checkbox" checked={editedFollowUp === 'pending'} onChange={e => setEditedFollowUp(e.target.checked ? 'pending' : 'done')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded-md" />
                    <label htmlFor="followUp" className="ml-2 text-gray-700">
                      I need to follow up on this interaction
                    </label>
                  </div>
                  <button onClick={saveFollowUp} className="ml-2 p-1 text-green-600 hover:bg-green-50 rounded-full">
                    <CheckIcon size={16} />
                  </button>
                  <button onClick={() => setIsEditingFollowUp(false)} className="ml-1 p-1 text-red-600 hover:bg-red-50 rounded-full">
                    <XIcon size={16} />
                  </button>
                </div> : <div>
                  {event.followUpStatus === 'pending' ? <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                      <BellIcon className="h-4 w-4 mr-1" />
                      Follow-up Needed
                    </span> : <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                      <CheckIcon className="h-4 w-4 mr-1" />
                      No follow-up needed
                    </span>}
                </div>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleOpenChat} className="inline-flex items-center px-4 py-2 bg-secondary-500 text-white text-sm font-medium rounded-full hover:bg-secondary-600 transition-colors">
              <MessageSquareIcon className="h-4 w-4 mr-2" />
              Draft Message
            </button>
          </div>
        </div>
      </div>
      {/* Interaction Content - Similar to Profile "About You" section */}
      <div className="bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-700">Details</h2>
            {!isEditingRawNotes && <button type="button" onClick={handleRegenerate} className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-800">
                <RefreshCwIcon className="h-4 w-4 mr-1" />
                Regenerate
              </button>}
          </div>
          {/* Raw Notes Editing */}
          {isEditingRawNotes ? <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Your Original Notes
              </label>
              <textarea rows={4} value={tempEditedNotes} onChange={e => setTempEditedNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500 mb-2" />
              <div className="flex gap-2">
                <button onClick={saveRawNotes} className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm">
                  Save
                </button>
                <button onClick={regenerateFromInput} className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm flex items-center">
                  <RefreshCwIcon className="h-3 w-3 mr-1" />
                  Regenerate
                </button>
                <button onClick={() => setIsEditingRawNotes(false)} className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm">
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
              setTempEditedAiSummary(event.notesAiSummary || '');
            }} className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800">
                  <EditIcon className="h-3 w-3 mr-1" />
                  Edit
                </button>}
            </div>
            {isEditingAiSummary ? <div>
                <textarea rows={4} value={tempEditedAiSummary} onChange={e => setTempEditedAiSummary(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                <div className="flex mt-2">
                  <button onClick={saveAiSummary} className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-sm">
                    Save
                  </button>
                  <button onClick={() => setIsEditingAiSummary(false)} className="ml-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm">
                    Cancel
                  </button>
                </div>
              </div> : <div className="text-gray-700 mb-6">
                {event.notesAiSummary || 'No AI summary available.'}
              </div>}
          </div>
          {/* Full Notes Section */}
        </div>
      </div>
    </div>;
};
export default InteractionDetail;