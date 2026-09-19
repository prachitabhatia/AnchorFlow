import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { OrganizerAuthProvider } from './context/OrganizerAuthContext';
import { useOrganizerAuth } from './hooks/useOrganizerAuth';
import PasscodeGatePage from './pages/organizer/PasscodeGatePage';

// Organizer Pages
import EventListPage from './pages/organizer/EventListPage';
import EventCreatePage from './pages/organizer/EventCreatePage';
import EventSetupPage from './pages/organizer/EventSetupPage';
import SpeakersPage from './pages/organizer/SpeakersPage';
import AgendaPage from './pages/organizer/AgendaPage';
import ScriptsPage from './pages/organizer/ScriptsPage';
import LiveControlPage from './pages/organizer/LiveControlPage';
import SummaryPage from './pages/organizer/SummaryPage';

// Anchor Page
import AnchorScreen from './pages/anchor/AnchorScreen';

// Components
import OrganizerShell from './components/organizer/OrganizerShell';

/**
 * Protected Layout for Organizer Routes.
 * Renders PasscodeGatePage if unauthenticated; renders child routes via <Outlet /> if authenticated.
 */
function ProtectedOrganizerLayout() {
  const { isAuthenticated } = useOrganizerAuth();

  if (!isAuthenticated) {
    return <PasscodeGatePage />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/organizer/events" replace />} />

        {/* ====================================================================
            PUBLIC ANCHOR SCREEN ROUTE
            MUST NEVER be wrapped by OrganizerAuthProvider or PasscodeGatePage.
            No organizer passcode is read or required.
           ==================================================================== */}
        <Route path="/anchor/:eventId" element={<AnchorScreen />} />

        {/* ====================================================================
            PROTECTED ORGANIZER ROUTES
            Wrapped in OrganizerAuthProvider & ProtectedOrganizerLayout (PasscodeGatePage)
           ==================================================================== */}
        <Route
          path="/organizer/*"
          element={
            <OrganizerAuthProvider>
              <ProtectedOrganizerLayout />
            </OrganizerAuthProvider>
          }
        >
          <Route path="events" element={<EventListPage />} />
          <Route path="events/new" element={<EventCreatePage />} />
          <Route path="events/:id" element={<OrganizerShell />}>
            <Route index element={<EventSetupPage />} />
            <Route path="setup" element={<EventSetupPage />} />
            <Route path="speakers" element={<SpeakersPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="scripts" element={<ScriptsPage />} />
            <Route path="live" element={<LiveControlPage />} />
            <Route path="summary" element={<SummaryPage />} />
          </Route>
        </Route>

        {/* Fallback route for unknown paths */}
        <Route path="*" element={<Navigate to="/organizer/events" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
