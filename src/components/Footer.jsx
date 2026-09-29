import { SITE_CONFIG } from '../config/site.js'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} {SITE_CONFIG.author} · Powered by React + GitHub Pages</p>
        <div className="footer-links">
          <a href={`https://github.com/${SITE_CONFIG.owner}`} target="_blank" rel="noopener noreferrer">GitHub</a>
          <span>·</span>
          <a href={SITE_CONFIG.baseUrl} target="_blank" rel="noopener noreferrer">Pages</a>
        </div>
      </div>
    </footer>
  )
}
