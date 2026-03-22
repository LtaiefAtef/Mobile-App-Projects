import { Link, NavLink, useLocation } from 'react-router-dom'
import './Sidebar.css'
import type { JSX } from 'react'
const useAuth = () => {
  const logout = (): void => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  return { logout }
}

export default function Sidebar(): JSX.Element | null {
  const { logout } = useAuth()
  const location = useLocation()

  if (location.pathname === '/login') return null

  return (
    <aside className="sidebar">
      {/* Brand */}
      <NavLink to="/" className="sidebar-brand">
        <span className="sidebar-brand-dot" />
        FTUSA Admin
      </NavLink>
      {/* Links */}
      <div className="sidebar-links">
        <NavLink to="/" end className="sidebar-link">
          {/* Dashboard icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="/clients" className="sidebar-link">
          {/* Clients icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Clients
        </NavLink>
        <NavLink to="/contracts" className="sidebar-link">
          {/* Contracts icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 2 L14 2 L20 8 L20 22 L4 22 Z"/>
            <path d="M14 2 L14 8 L20 8"/>
            <line x1="8" y1="13" x2="16" y2="13"/>
            <line x1="8" y1="17" x2="16" y2="17"/>
            <line x1="8" y1="21" x2="12" y2="21"/>
          </svg>
          Contracts
        </NavLink>
        <NavLink to="/claims" className="sidebar-link">
            {/* Claims icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="4"/>
              <line x1="8" y1="2" x2="8" y2="0"/>
              <line x1="8" y1="14" x2="8" y2="16"/>
              <line x1="2" y1="8" x2="0" y2="8"/>
              <line x1="14" y1="8" x2="16" y2="8"/>
            </svg>
          Accident Claims
        </NavLink>
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <div className="sidebar-avatar-row">
          <div className="sidebar-avatar">U</div>
          <Link to="/profile" className='profile-link'>Username</Link>
        </div>
        <button className="sidebar-logout" onClick={logout}>
          {/* Logout icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>

    </aside>
  )
}