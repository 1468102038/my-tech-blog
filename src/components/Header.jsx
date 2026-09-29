import { Link, useLocation } from 'react-router-dom'
import { isAuthenticated, logout } from '../utils/auth.js'
import { useState, useEffect } from 'react'

export default function Header() {
  const location = useLocation()
  const [authed, setAuthed] = useState(isAuthenticated())

  useEffect(() => {
    setAuthed(isAuthenticated())
  }, [location])

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/archive', label: '归档' },
    { path: '/categories', label: '分类' },
    { path: '/about', label: '关于' },
  ]

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="logo-icon">📝</span>
          <span className="logo-text">Tech Blog</span>
        </Link>
        <nav className="header-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          {authed ? (
            <>
              <Link to="/admin" className="nav-link nav-admin">管理</Link>
              <button className="nav-link nav-logout" onClick={() => { logout(); setAuthed(false) }}>退出</button>
            </>
          ) : (
            <Link to="/admin" className="nav-link nav-admin">登录</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
