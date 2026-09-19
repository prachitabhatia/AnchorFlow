import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useOrganizerAuth } from '../../hooks/useOrganizerAuth';
import '../../styles/organizer.css';

export default function OrganizerShell() {
  const { id } = useParams();
  const { logout } = useOrganizerAuth();
  const navigate = useNavigate();

  const handleLock = () => {
    logout();
    navigate('/organizer/events');
  };

  return (
    <div className="organizer-shell">
      {/* Top Bar */}
      <header className="organizer-top-bar">
        <div className="organizer-brand">
          <span style={{ fontSize: '1.25rem' }}>🎛️</span>
          <h1 className="organizer-brand-title">AnchorFlow</h1>
          {id && <span className="organizer-event-badge">Event: {id}</span>}
        </div>

        {/* Per-event Navigation */}
        <nav className="organizer-nav">
          <NavLink
            to={`/organizer/events/${id}`}
            end
            className={({ isActive }) => `organizer-nav-link ${isActive ? 'active' : ''}`}
          >
            ⚙️ Setup
          </NavLink>
          <NavLink
            to={`/organizer/events/${id}/live`}
            className={({ isActive }) => `organizer-nav-link ${isActive ? 'active' : ''}`}
          >
            🔴 Live Control
          </NavLink>
          <NavLink
            to={`/organizer/events/${id}/summary`}
            className={({ isActive }) => `organizer-nav-link ${isActive ? 'active' : ''}`}
          >
            📊 Summary
          </NavLink>
          <button
            onClick={handleLock}
            className="btn btn-secondary"
            style={{ marginLeft: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            🔒 Lock
          </button>
        </nav>
      </header>

      {/* Setup Sub-navigation bar when on setup sub-routes */}
      <div className="organizer-sub-nav">
        <NavLink
          to={`/organizer/events/${id}`}
          end
          className={({ isActive }) => `organizer-sub-nav-link ${isActive ? 'active' : ''}`}
        >
          Overview
        </NavLink>
        <NavLink
          to={`/organizer/events/${id}/speakers`}
          className={({ isActive }) => `organizer-sub-nav-link ${isActive ? 'active' : ''}`}
        >
          Speakers
        </NavLink>
        <NavLink
          to={`/organizer/events/${id}/agenda`}
          className={({ isActive }) => `organizer-sub-nav-link ${isActive ? 'active' : ''}`}
        >
          Agenda
        </NavLink>
        <NavLink
          to={`/organizer/events/${id}/scripts`}
          className={({ isActive }) => `organizer-sub-nav-link ${isActive ? 'active' : ''}`}
        >
          Scripts
        </NavLink>
      </div>

      {/* Main Content Render Area */}
      <main className="organizer-content">
        <Outlet />
      </main>
    </div>
  );
}
