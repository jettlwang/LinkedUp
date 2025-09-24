import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Events from './pages/Events';
import Profile from './pages/Profile';
import AddContact from './pages/AddContact';
import AddEvent from './pages/AddEvent';
import ContactDetail from './pages/ContactDetail';
import InteractionDetail from './pages/InteractionDetail';
import Onboarding from './pages/Onboarding';
import EditContact from './pages/EditContact';
import EditEvent from './pages/EditEvent';
import Layout from './components/Layout';
import ChatWindow from './components/ChatWindow';
import { AppProvider, useApp } from './context/AppContext';
// Wrapper component to access context
const AppWithChat = () => {
  const {
    chatContext,
    closeChat
  } = useApp();
  // Check if user has completed onboarding
  const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';
  return <>
      <Router>
        <Routes>
          {!hasOnboarded ? <Route path="*" element={<Onboarding />} /> : <>
              <Route path="/" element={<Layout>
                    <Dashboard />
                  </Layout>} />
              <Route path="/contacts" element={<Layout>
                    <Contacts />
                  </Layout>} />
              <Route path="/contacts/:id" element={<Layout>
                    <ContactDetail />
                  </Layout>} />
              <Route path="/add-contact" element={<AddContact />} />
              <Route path="/edit-contact/:id" element={<Layout>
                    <EditContact />
                  </Layout>} />
              <Route path="/events" element={<Layout>
                    <Events />
                  </Layout>} />
              <Route path="/events/:id" element={<Layout>
                    <InteractionDetail />
                  </Layout>} />
              <Route path="/add-event" element={<AddEvent />} />
              <Route path="/edit-event/:id" element={<Layout>
                    <EditEvent />
                  </Layout>} />
              <Route path="/profile" element={<Layout>
                    <Profile />
                  </Layout>} />
            </>}
        </Routes>
      </Router>
      {/* Global chat window */}
      <ChatWindow isOpen={chatContext.isOpen} onClose={closeChat} />
    </>;
};
export function App() {
  return <AppProvider>
      <AppWithChat />
    </AppProvider>;
}