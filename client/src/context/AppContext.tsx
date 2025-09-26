import React, { useEffect, useState, createContext, useContext } from 'react';
// Types
export type Contact = {
  id: string;
  name: string;
  infoRaw: string;
  infoAiSummary: string;
  lastReachOutDate: string | null;
  status: 'warm' | 'neutral' | 'cold';
  createdAt: string;
  updatedAt: string;
  profileColor?: {
    bg: string;
    text: string;
  };
  preferences?: {
    followUpFrequency: '1 Month' | '3 Months' | '6 Months' | 'Never';
    messageTone: 'professional' | 'casual' | 'sincere';
  };
};
export type Event = {
  id: string;
  contactId: string;
  notesRaw: string;
  notesAiSummary: string;
  date: string;
  followUpStatus: 'pending' | 'done';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};
export type UserProfile = {
  name: string;
  demographics?: string;
  backgroundRaw: string;
  backgroundAiSummary: string;
  goalsRaw: string;
  goalsAiSummary: string;
  preferences: {
    messageTone: 'professional' | 'casual' | 'sincere';
  };
};

// NEW: shape for passing a single interaction into the chat
type InteractionContext = {
  dateISO: string;
  notesAiSummary: string;
  tags?: string[];
};

// Update ChatContext to include `interaction`
export type ChatContext = {
  isOpen: boolean;
  contactId?: string;
  eventId?: string; // keep for later, unused in MVP
  interaction?: InteractionContext; // <-- add this
  tone?: 'professional' | 'casual' | 'sincere';
};

type AppContextType = {
  contacts: Contact[];
  events: Event[];
  userProfile: UserProfile | null;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  updateUserProfile: (profile: UserProfile) => void;
  getContactById: (id: string) => Contact | undefined;
  getEventsByContactId: (contactId: string) => Event[];
  completeOnboarding: (profile: UserProfile) => void;
  chatContext: ChatContext;
  openChat: (context?: Partial<ChatContext>) => void;
  closeChat: () => void;
};
const AppContext = createContext<AppContextType | undefined>(undefined);
// Mock AI processing function
const processWithAI = (text: string): string => {
  // In a real app, this would call an AI service
  return text.length > 100 ? text.substring(0, 100) + '...' : text;
};
// Helper function to get a deterministic color based on contact ID
const getProfileColor = (contactId: string) => {
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
  const index = contactId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorPairs.length;
  return colorPairs[index];
};
export const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chatContext, setChatContext] = useState<ChatContext>({
    isOpen: false
  });
  // Default data
  const defaultContact: Contact = {
    id: 'default-contact-1',
    name: 'Sarah Chen',
    infoRaw: "Met at the Tech Networking Mixer downtown. She's a Senior Product Manager at TechCorp, graduated from Stanford with a CS degree. Really passionate about AI and machine learning applications in healthcare. Mentioned she's looking to mentor junior developers and is always open to coffee chats about career growth.",
    infoAiSummary: 'Senior Product Manager at TechCorp with Stanford CS background, passionate about AI/ML in healthcare, interested in mentoring',
    lastReachOutDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'warm',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    profileColor: getProfileColor('default-contact-1'),
    preferences: {
      followUpFrequency: '1 Month',
      messageTone: 'professional'
    }
  };
  const defaultEvent: Event = {
    id: 'default-event-1',
    contactId: 'default-contact-1',
    notesRaw: 'Had a great conversation at the Tech Networking Mixer. We talked about her work in AI/ML for healthcare applications and she shared some insights about product management career paths. She mentioned being interested in mentoring and gave me her business card. Really insightful discussion about the future of AI in medical diagnosis.',
    notesAiSummary: 'Productive networking conversation about AI/ML in healthcare, product management insights, potential mentoring opportunity',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    followUpStatus: 'done',
    tags: ['In Person Meeting'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  // Load data from localStorage on initial render
  useEffect(() => {
    const storedContacts = localStorage.getItem('contacts');
    const storedEvents = localStorage.getItem('events');
    const storedProfile = localStorage.getItem('userProfile');
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts));
    } else {
      // If no stored contacts, add default data
      setContacts([defaultContact]);
    }
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      // If no stored events, add default data
      setEvents([defaultEvent]);
    }
    if (storedProfile) setUserProfile(JSON.parse(storedProfile));
  }, []);
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [userProfile]);
  const addContact = (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'status'>): string => {
    const now = new Date().toISOString();
    const contactId = Date.now().toString();
    const profileColor = getProfileColor(contactId);
    const newContact: Contact = {
      id: contactId,
      ...contact,
      status: 'neutral',
      createdAt: now,
      updatedAt: now,
      profileColor,
      preferences: {
        followUpFrequency: contact.preferences?.followUpFrequency || '1 Month',
        messageTone: contact.preferences?.messageTone || 'professional'
      }
    };
    setContacts(prev => [...prev, newContact]);
    return contactId; // Return the created contact ID
  };
  const updateContact = (id: string, contactUpdate: Partial<Contact>) => {
    setContacts(prevContacts => prevContacts.map(contact => contact.id === id ? {
      ...contact,
      ...contactUpdate,
      updatedAt: new Date().toISOString()
    } : contact));
  };
  const deleteContact = (id: string) => {
    setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));
    // Also delete all events associated with this contact
    setEvents(prevEvents => prevEvents.filter(event => event.contactId !== id));
  };
  const addEvent = (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEvent: Event = {
      id: Date.now().toString(),
      ...event,
      createdAt: now,
      updatedAt: now
    };
    setEvents(prev => [...prev, newEvent]);
    // Update the contact's last reach out date
    setContacts(prev => prev.map(contact => contact.id === event.contactId ? {
      ...contact,
      lastReachOutDate: event.date,
      updatedAt: now
    } : contact));
  };
  const updateEvent = (id: string, eventUpdate: Partial<Event>) => {
    setEvents(prevEvents => prevEvents.map(event => event.id === id ? {
      ...event,
      ...eventUpdate,
      updatedAt: new Date().toISOString()
    } : event));
    // If the event date changed, update the contact's last reach out date if this is the most recent event
    if (eventUpdate.date && eventUpdate.contactId) {
      const updatedEvent = {
        ...events.find(e => e.id === id),
        ...eventUpdate
      };
      // Get all events for this contact
      const contactEvents = events.filter(e => e.contactId === updatedEvent.contactId);
      // Check if this is the most recent event
      const isLatestEvent = !contactEvents.some(e => e.id !== id && new Date(e.date) > new Date(updatedEvent.date as string));
      if (isLatestEvent) {
        setContacts(prev => prev.map(contact => contact.id === updatedEvent.contactId ? {
          ...contact,
          lastReachOutDate: updatedEvent.date as string,
          updatedAt: new Date().toISOString()
        } : contact));
      }
    }
  };
  const deleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };
  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  const getContactById = (id: string) => {
    return contacts.find(contact => contact.id === id);
  };
  const getEventsByContactId = (contactId: string) => {
    return events.filter(event => event.contactId === contactId);
  };
  const completeOnboarding = (profile: UserProfile) => {
    updateUserProfile(profile);
    localStorage.setItem('hasOnboarded', 'true');
  };
  // Chat window management
  const openChat = (context?: Partial<ChatContext>) => {
    setChatContext({
      isOpen: true,
      ...context
    });
  };
  const closeChat = () => {
    setChatContext({
      isOpen: false
    });
  };
  return <AppContext.Provider value={{
    contacts,
    events,
    userProfile,
    addContact,
    updateContact,
    deleteContact,
    addEvent,
    updateEvent,
    deleteEvent,
    updateUserProfile,
    getContactById,
    getEventsByContactId,
    completeOnboarding,
    chatContext,
    openChat,
    closeChat
  }}>
      {children}
    </AppContext.Provider>;
};
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};