import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatRelativeTime, formatRelativeTimeShort } from '../utils/dateUtils';
import { UsersIcon, CalendarIcon, BellIcon, MessageSquareIcon } from 'lucide-react';
const Dashboard = () => {
  const {
    contacts,
    events,
    userProfile,
    openChat
  } = useApp();
  // Helper function to get contact profile color
  const getContactProfileColor = (contact: any) => {
    if (contact.profileColor) {
      return contact.profileColor;
    }
    // Fallback calculation for existing contacts
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
  // Calculate stats
  const totalContacts = contacts.length;
  const recentEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return eventDate >= thirtyDaysAgo;
  }).length;
  // Get contacts needing follow-up (no interaction in last 3 months)
  const needsFollowUp = contacts.filter(contact => {
    if (!contact.lastReachOutDate) return true;
    const lastReachOut = new Date(contact.lastReachOutDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastReachOut < threeMonthsAgo;
  });
  // Get recent events
  const recentEventsList = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  return <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {userProfile?.name || 'there'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your networking activity
        </p>
      </header>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 border-b-2 border-primary-100">
          <div className="flex items-center">
            <div className="p-2 bg-primary-50 rounded-xl">
              <UsersIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-700">
              Contacts
            </h2>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-800">
            {totalContacts}
          </p>
          <Link to="/contacts" className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-800">
            View all contacts
          </Link>
        </div>
        <div className="bg-white p-6 border-b-2 border-green-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-xl">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-700">
              Recent Activity
            </h2>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-800">
            {recentEvents}
          </p>
          <Link to="/events" className="mt-2 inline-block text-sm text-green-600 hover:text-green-800">
            View all events
          </Link>
        </div>
        <div className="bg-white p-6 border-b-2 border-red-100">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-xl">
              <BellIcon className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-700">
              Need Follow-up
            </h2>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-800">
            {needsFollowUp.length}
          </p>
          <Link to="/contacts" className="mt-2 inline-block text-sm text-red-600 hover:text-red-800">
            View contacts
          </Link>
        </div>
        <div className="bg-white p-6 border-b-2 border-pink-100">
          <div className="flex items-center">
            <div className="p-2 bg-pink-50 rounded-xl">
              <MessageSquareIcon className="h-6 w-6 text-secondary-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-700">
              AI Assistant
            </h2>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Draft follow-up messages with AI
          </p>
          <button onClick={() => openChat()} className="mt-2 text-sm text-secondary-600 hover:text-purple-800 rounded-full">
            Try it now
          </button>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-white mb-8">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-lg text-gray-800">
              Recent Interactions
            </h2>

            {recentEventsList.length > 0 && <Link to="/events" className="text-sm text-primary-600 hover:text-primary-800 self-start sm:self-auto
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 rounded">
                View all interactions
              </Link>}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentEventsList.length > 0 ? recentEventsList.map(event => {
          const contact = contacts.find(c => c.id === event.contactId);
          const profileColor = contact ? getContactProfileColor(contact) : null;
          return <div key={event.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {contact && profileColor && <div className={`w-8 h-8 rounded-full ${profileColor.bg} flex items-center justify-center ${profileColor.text} text-sm font-bold mr-3 flex-shrink-0`}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>}
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {contact?.name || 'Unknown Contact'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.notesAiShort || event.notesAiSummary || event.notesRaw}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTimeShort(event.date)}
                    </span>
                  </div>
                </div>;
        }) : <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No recent interactions</p>
              <Link to="/add-event" className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-800">
                Log your first interaction
              </Link>
            </div>}
        </div>
      </div>
      {/* Follow-up Reminders */}
      <div className="bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-lg text-gray-800">
            Follow-up Reminders
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {needsFollowUp.length > 0 ? needsFollowUp.slice(0, 3).map(contact => {
          const profileColor = getContactProfileColor(contact);
          return <div key={contact.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${profileColor.bg} flex items-center justify-center ${profileColor.text} text-sm font-bold mr-3 flex-shrink-0`}>
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {contact.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {contact.lastReachOutDate ? `Last contact: ${formatRelativeTime(contact.lastReachOutDate)}` : 'No previous interactions'}
                        </p>
                      </div>
                    </div>
                    <Link to={`/contacts/${contact.id}`} className="px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600 hover:bg-red-100">
                      Follow up
                    </Link>
                  </div>
                </div>;
        }) : <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No follow-ups needed right now</p>
              <p className="text-sm text-gray-400 mt-1">
                Great job staying in touch!
              </p>
            </div>}
        </div>
        {needsFollowUp.length > 3 && <div className="border-t border-gray-100 px-6 py-3 text-right">
            <Link to="/contacts" className="text-sm text-primary-600 hover:text-primary-800">
              View all contacts needing follow-up
            </Link>
          </div>}
      </div>
    </div>;
};
export default Dashboard;