// Navbar component
import { useAuth } from '../hooks/useAuth';
import '../styles/Navbar.css';

export function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__brand">
          <h1 className="navbar__title">🗺️ TripTimeline Maps</h1>
        </div>

        <div className="navbar__user">
          <span className="navbar__email">{user?.email}</span>
          <button onClick={handleLogout} className="navbar__logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

