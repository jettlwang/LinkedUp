import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon } from 'lucide-react';
const EditContact = () => {
  const navigate = useNavigate();
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    getContactById,
    updateContact
  } = useApp();
  const [name, setName] = useState('');
  const [infoRaw, setInfoRaw] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    if (id) {
      const contact = getContactById(id);
      if (contact) {
        setName(contact.name);
        setInfoRaw(contact.infoRaw);
      } else {
        // Contact not found, redirect back
        navigate('/contacts');
      }
    }
  }, [id, getContactById, navigate]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !id) return;
    setIsProcessing(true);
    // Process with AI (mock)
    setTimeout(() => {
      const infoAiSummary = processInfoWithAI(infoRaw);
      updateContact(id, {
        name,
        infoRaw,
        infoAiSummary
      });
      navigate('/contacts');
    }, 1000);
  };
  // Mock AI processing function
  const processInfoWithAI = (text: string): string => {
    // In a real app, this would call an AI service
    if (!text.trim()) return 'Updated contact';
    // Simple summary - in real app this would be AI-generated
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };
  return <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back
      </button>
      <div className="bg-white border-t border-b border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-gray-800">Edit Contact</h1>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Enter contact name" required />
          </div>
          <div className="mb-6">
            <label htmlFor="info" className="block text-sm font-medium text-gray-700 mb-1">
              Notes about this person
            </label>
            <textarea id="info" rows={4} value={infoRaw} onChange={e => setInfoRaw(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Where you met, what you talked about, their background, etc." />
            <p className="mt-2 text-sm text-gray-500">
              Our AI will help organize this information for you
            </p>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full mr-3 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || isProcessing} className={`
                px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-full hover:bg-primary-700
                ${!name.trim() || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
              {isProcessing ? 'Processing...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export default EditContact;