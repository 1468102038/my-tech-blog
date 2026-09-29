import { siteConfig } from '../config/site.js'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <p>© {year} {siteConfig.author} · Powered by React + Vite</p>
        <div className="footer-links">
          <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
          <span>·</span>
          <a href={`https://${siteConfig.githubUsername}.github.io/${siteConfig.repoName}/`} target="_blank" rel="noopener noreferrer">站点</a>
        </div>
      </div>
    </footer>
  )
}
