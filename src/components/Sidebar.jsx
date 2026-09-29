import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Sidebar({ posts }) {
  const { theme } = useTheme()

  if (!posts || posts.length === 0) return null

  const categories = {}
  const tags = {}
  posts.forEach(p => {
    if (p.category) categories[p.category] = (categories[p.category] || 0) + 1
    if (p.tags) p.tags.forEach(t => { tags[t] = (tags[t] || 0) + 1 })
  })

  const recentPosts = posts.slice(0, 5)
  const catEntries = Object.entries(categories).sort((a, b) => b[1] - a[1])
  const tagEntries = Object.entries(tags).sort((a, b) => b[1] - a[1])

  return (
    <aside className="layout-sidebar">
      <div className="sidebar-section">
        <div className="sidebar-stats">
          <div className="stat-item">
            <div className="stat-num">{posts.length}</div>
            <div className="stat-label">文章</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{catEntries.length}</div>
            <div className="stat-label">分类</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{tagEntries.length}</div>
            <div className="stat-label">标签</div>
          </div>
        </div>
        <div className="sidebar-title">{theme.sidebarTitle || '关于本站'}</div>
        <p className="sidebar-bio">{theme.sidebarBio || '记录技术学习与成长的点滴'}</p>
      </div>

      {catEntries.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-title">分类</div>
          <ul className="sidebar-cat-list">
            {catEntries.map(([cat, count]) => (
              <li key={cat}>
                <Link to="/categories">{cat}</Link>
                <span className="sidebar-cat-count">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentPosts.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-title">最新文章</div>
          <ul className="sidebar-recent">
            {recentPosts.map(p => (
              <li key={p.slug}>
                <Link to={`/article/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tagEntries.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-title">标签云</div>
          <div className="tag-cloud">
            {tagEntries.map(([tag, count]) => (
              <Link key={tag} to="/categories" className="tag">
                {tag} <span className="tag-count">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
