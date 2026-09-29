import { Link, useLocation } from 'react-router-dom'
import { siteConfig } from '../config/site.js'

export default function Header() {
  const location = useLocation()
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
          <span className="logo-icon">{siteConfig.logoIcon || '📝'}</span>
          <span>{siteConfig.title}</span>
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
        </nav>
      </div>
    </header>
  )
}
