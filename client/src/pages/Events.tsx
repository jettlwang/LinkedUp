import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../utils/dateUtils';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, Trash2Icon } from 'lucide-react';
const Events = () => {
  const navigate = useNavigate();
  const {
    events,
    contacts,
    deleteEvent
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  // Filter events
  const filteredEvents = events.filter(event => {
    const contact = contacts.find(c => c.id === event.contactId);
    const contactName = contact?.name || '';
    const matchesSearch = event.notesRaw.toLowerCase().includes(searchQuery.toLowerCase()) || event.notesAiSummary.toLowerCase().includes(searchQuery.toLowerCase()) || contactName.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'follow-up') return matchesSearch && event.followUpStatus === 'pending';
    if (filter === 'recent') {
      const eventDate = new Date(event.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && eventDate >= thirtyDaysAgo;
    }
    return matchesSearch;
  });
  // Sort events by date (newest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const handleEditEvent = (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-event/${eventId}`);
  };
  const handleDeleteEvent = (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      deleteEvent(eventId);
    }
  };
  // Helper function to render tags
  const renderTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;
    return <div className="flex flex-wrap gap-1">
        {tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
            {tag}
          </span>)}
      </div>;
  };
  return <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Interactions</h1>
          <p className="text-gray-600 mt-1">Track your networking activity</p>
        </div>
        <Link to="/add-event" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-full hover:bg-primary-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Log Interaction
        </Link>
      </header>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" placeholder="Search interactions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div className="flex items-center">
          <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500">
            <option value="all">All Interactions</option>
            <option value="recent">Recent (Last 30 Days)</option>
            <option value="follow-up">Needs Follow-up</option>
          </select>
        </div>
      </div>
      {/* Events List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {sortedEvents.length > 0 ? <div>
            {/* Column Headers */}
            <div className="px-6 py-1 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center">
                <div className="min-w-[120px] mr-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Tag
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Connection
                  </span>
                </div>
                <div className="w-[140px] text-right">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Time
                  </span>
                </div>
              </div>
            </div>
            {/* Events Rows */}
            <div className="divide-y divide-gray-100">
              {sortedEvents.map(event => {
            const contact = contacts.find(c => c.id === event.contactId);
            const truncatedNotes = (event.notesAiShort || event.notesAiSummary || event.notesRaw).length > 60 ? (event.notesAiShort || event.notesAiSummary || event.notesRaw).substring(0, 60) + '...' : event.notesAiShort || event.notesAiSummary || event.notesRaw;
            return <div key={event.id} className="group hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                    <div className="px-6 py-4">
                      <div className="flex items-center">
                        {/* First column: Tags */}
                        <div className="min-w-[120px] mr-4">
                          {renderTags(event.tags)}
                        </div>
                        {/* Second column: Contact name and truncated notes */}
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold mr-3 flex-shrink-0">
                              {contact?.name.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <Link to={`/contacts/${contact?.id}`} className="font-medium text-gray-900 hover:text-primary-600 whitespace-nowrap mr-2" onClick={e => e.stopPropagation()}>
                              {contact?.name || 'Unknown Contact'}
                            </Link>
                            <span className="text-sm text-gray-600 truncate">
                              {truncatedNotes}
                            </span>
                          </div>
                        </div>
                        {/* Third column: Time and actions */}
                        <div className="w-[140px] flex items-center justify-end">
                          {/* Action buttons that appear on hover */}
                          <div className="mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                            <button onClick={e => handleEditEvent(e, event.id)} className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full">
                              <EditIcon size={16} />
                            </button>
                            <button onClick={e => handleDeleteEvent(e, event.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full">
                              <Trash2Icon size={16} />
                            </button>
                          </div>
                          <div className="flex items-center">
                            {event.followUpStatus === 'pending' && <span className="mr-2 px-2 py-1 text-xs rounded-xl bg-yellow-50 text-yellow-700 whitespace-nowrap">
                                Follow-up
                              </span>}
                            <span className="text-sm text-gray-500 whitespace-nowrap">
                              {formatRelativeTime(event.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>;
          })}
            </div>
          </div> : <div className="py-12 px-4 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No interactions found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? `No interactions match "${searchQuery}"` : "You haven't logged any interactions yet"}
            </p>
            <Link to="/add-event" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-full hover:bg-primary-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Log your first interaction
            </Link>
          </div>}
      </div>
    </div>;
};
export default Events;