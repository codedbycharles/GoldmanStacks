import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../../context/useAuth";
import "./AppLayout.css";

export function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/dashboard" className="app-brand">
          <span className="brand-mark">G</span>
          <span>GoldmanStacks</span>
        </NavLink>

        <nav className="app-navigation" aria-label="Main navigation">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/quotes">My quotes</NavLink>
          <NavLink to="/quotes/new" className="nav-primary">
            New quote
          </NavLink>{" "}
          <button type="button" className="nav-logout" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
