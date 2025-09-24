import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon } from 'lucide-react';
const EditEvent = () => {
  const navigate = useNavigate();
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    contacts,
    events,
    updateEvent
  } = useApp();
  const [contactId, setContactId] = useState('');
  const [notesRaw, setNotesRaw] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16));
  const [followUpStatus, setFollowUpStatus] = useState<'pending' | 'done'>('done');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const tagOptions = ['In Person Meeting', 'Virtual Meeting', 'Messaging', 'Other'];
  useEffect(() => {
    if (id) {
      const event = events.find(e => e.id === id);
      if (event) {
        setContactId(event.contactId);
        setNotesRaw(event.notesRaw);
        // Format date for datetime-local input
        const eventDate = new Date(event.date);
        setDate(eventDate.toISOString().substring(0, 16));
        setFollowUpStatus(event.followUpStatus);
        setSelectedTags(event.tags || []);
      } else {
        // Event not found, redirect back
        navigate('/events');
      }
    }
  }, [id, events, navigate]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId || !notesRaw.trim() || !date || !id) return;
    setIsProcessing(true);
    // Process with AI (mock)
    setTimeout(() => {
      const notesAiSummary = processNotesWithAI(notesRaw);
      updateEvent(id, {
        contactId,
        notesRaw,
        notesAiSummary,
        date: new Date(date).toISOString(),
        followUpStatus,
        tags: selectedTags.length > 0 ? selectedTags : undefined
      });
      navigate(contactId ? `/contacts/${contactId}` : '/events');
    }, 1000);
  };
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  // Mock AI processing function
  const processNotesWithAI = (text: string): string => {
    // In a real app, this would call an AI service
    // Simple summary - in real app this would be AI-generated
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };
  return <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-gray-800">
            Edit Interaction
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <select id="contact" value={contactId} onChange={e => setContactId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" required>
              <option value="">Select a contact</option>
              {contacts.map(contact => <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>)}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date and Time
            </label>
            <input id="date" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interaction Type
            </label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(tag => <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-sm ${selectedTags.includes(tag) ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}>
                  {tag}
                </button>)}
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              What happened?
            </label>
            <textarea id="notes" rows={4} value={notesRaw} onChange={e => setNotesRaw(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Describe your interaction, what you talked about, etc." required />
            <p className="mt-2 text-sm text-gray-500">
              Our AI will help organize this information for you
            </p>
          </div>
          <div className="mb-6">
            <div className="flex items-center">
              <input id="followUp" type="checkbox" checked={followUpStatus === 'pending'} onChange={e => setFollowUpStatus(e.target.checked ? 'pending' : 'done')} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded-md" />
              <label htmlFor="followUp" className="ml-2 block text-sm text-gray-700">
                I need to follow up on this interaction
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full mr-3 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={!contactId || !notesRaw.trim() || !date || isProcessing} className={`
                px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-full hover:bg-primary-700
                ${!contactId || !notesRaw.trim() || !date || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
              {isProcessing ? 'Processing...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export default EditEvent;