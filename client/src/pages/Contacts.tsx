import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatRelativeTimeShort } from '../utils/dateUtils';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, Trash2Icon } from 'lucide-react';
const Contacts = () => {
  const {
    contacts,
    deleteContact
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  // Function to get profile color from saved data or fallback to calculation
  const getContactProfileColor = (contact: any) => {
    // Use saved profile color if available
    if (contact.profileColor) {
      return contact.profileColor;
    }
    // Fallback to calculation for existing contacts without saved colors
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
  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'warm') return matchesSearch && contact.status === 'warm';
    if (filter === 'cold') return matchesSearch && contact.status === 'cold';
    // Filter for follow-up needed
    if (filter === 'follow-up') {
      if (!contact.lastReachOutDate) return matchesSearch;
      const lastReachOut = new Date(contact.lastReachOutDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return matchesSearch && lastReachOut < threeMonthsAgo;
    }
    return matchesSearch;
  });
  // Function to determine status badge style
  const getStatusBadgeClass = (contact: any) => {
    if (!contact.lastReachOutDate) {
      return 'bg-yellow-50 text-yellow-700';
    }
    const lastReachOut = new Date(contact.lastReachOutDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    if (lastReachOut < threeMonthsAgo) {
      return 'bg-red-50 text-red-700';
    }
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    if (lastReachOut < oneMonthAgo) {
      return 'bg-yellow-50 text-yellow-700';
    }
    return 'bg-green-50 text-green-700';
  };
  // Function to get status text
  const getStatusText = (contact: any) => {
    if (!contact.lastReachOutDate) {
      return 'New';
    }
    const lastReachOut = new Date(contact.lastReachOutDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    if (lastReachOut < threeMonthsAgo) {
      return 'Follow up';
    }
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    if (lastReachOut < oneMonthAgo) {
      return 'Check in soon';
    }
    return 'Active';
  };
  // Handle edit contact
  const handleEditContact = (e: React.MouseEvent, contactId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-contact/${contactId}`);
  };
  // Handle delete contact
  const handleDeleteContact = (e: React.MouseEvent, contactId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this contact? This will also delete all associated interactions.')) {
      deleteContact(contactId);
    }
  };
  return <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Connections</h1>
          <p className="text-gray-600 mt-1">Manage your professional network</p>
        </div>
        <Link to="/add-contact" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-full hover:bg-primary-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Connection
        </Link>
      </header>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div className="flex items-center">
          <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500">
            <option value="all">All Contacts</option>
            <option value="warm">Active Relationships</option>
            <option value="follow-up">Needs Follow-up</option>
            <option value="cold">Inactive</option>
          </select>
        </div>
      </div>
      {/* Contacts List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filteredContacts.length > 0 ? <div>
            {/* Column Headers */}
            <div className="px-6 py-1 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center">
                <div className="min-w-[60px] mr-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Contact
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Name & Details
                  </span>
                </div>
                <div className="w-[140px] text-right">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Last Contact
                  </span>
                </div>
              </div>
            </div>
            {/* Contacts Rows */}
            <div className="divide-y divide-gray-100">
              {filteredContacts.map(contact => {
            const profileColor = getContactProfileColor(contact);
            return <Link key={contact.id} to={`/contacts/${contact.id}`} className="block hover:bg-gray-50 transition-colors duration-150 group">
                    <div className="px-6 py-4">
                      <div className="flex items-center">
                        {/* First column: Profile picture */}
                        <div className="min-w-[60px] mr-4">
                          <div className={`w-10 h-10 rounded-full ${profileColor.bg} flex items-center justify-center ${profileColor.text} font-bold`}>
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        {/* Second column: Contact name and info */}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900 whitespace-nowrap mr-2 flex-shrink-0">
                              {contact.name}
                            </h3>
                            <span className="text-sm text-gray-600 truncate">
                              - {contact.infoAiSummary || contact.infoRaw}
                            </span>
                          </div>
                        </div>
                        {/* Third column: Status, date and actions */}
                        <div className="w-[140px] flex items-center justify-end flex-shrink-0">
                          {/* Action buttons that appear on hover */}
                          <div className="mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                            <button onClick={e => handleEditContact(e, contact.id)} className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full">
                              <EditIcon size={16} />
                            </button>
                            <button onClick={e => handleDeleteContact(e, contact.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full">
                              <Trash2Icon size={16} />
                            </button>
                          </div>
                          <div className="flex items-center flex-shrink-0">
                            <span className={`mr-2 px-2 py-1 text-xs rounded-xl whitespace-nowrap ${getStatusBadgeClass(contact)}`}>
                              {getStatusText(contact)}
                            </span>
                            <span className="text-sm text-gray-500 whitespace-nowrap">
                              {contact.lastReachOutDate ? formatRelativeTimeShort(contact.lastReachOutDate) : 'New'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>;
          })}
            </div>
          </div> : <div className="py-12 px-4 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No contacts found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? `No contacts match "${searchQuery}"` : "You haven't added any contacts yet"}
            </p>
            <Link to="/add-contact" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-full hover:bg-primary-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add your first contact
            </Link>
          </div>}
      </div>
    </div>;
};
export default Contacts;