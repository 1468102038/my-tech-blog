import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listPosts } from '../utils/github.js'

export default function Categories() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    async function load() {
      const data = await listPosts()
      setPosts(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">加载中...</div>

  const categories = {}
  const tagMap = {}
  posts.forEach(p => {
    if (p.category) {
      if (!categories[p.category]) categories[p.category] = []
      categories[p.category].push(p)
    }
    if (p.tags) p.tags.forEach(t => {
      if (!tagMap[t]) tagMap[t] = []
      tagMap[t].push(p)
    })
  })

  const catEntries = Object.entries(categories).sort((a, b) => b[1].length - a[1].length)
  const tagEntries = Object.entries(tagMap).sort((a, b) => b[1].length - a[1].length)

  return (
    <div className="categories-page">
      <h1>分类</h1>

      {catEntries.map(([cat, catPosts]) => (
        <div key={cat} className="category-section">
          <h2>📂 {cat} <span className="tag-count">{catPosts.length}</span></h2>
          <ul className="archive-list">
            {catPosts.map(p => (
              <li key={p.slug}>
                <Link to={`/article/${p.slug}`}>{p.title}</Link>
                <span className="archive-date">{p.date}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {tagEntries.length > 0 && (
        <div className="category-section">
          <h2>🏷 全部标签</h2>
          <div className="tag-cloud">
            {tagEntries.map(([tag, tagPosts]) => (
              <button
                key={tag}
                className="tag"
                style={{ cursor: 'pointer', background: activeTag === tag ? 'var(--primary)' : '', color: activeTag === tag ? 'white' : '' }}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag} <span className="tag-count">{tagPosts.length}</span>
              </button>
            ))}
          </div>

          {activeTag && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.8rem' }}>「{activeTag}」相关文章</h3>
              <ul className="archive-list">
                {tagMap[activeTag].map(p => (
                  <li key={p.slug}>
                    <Link to={`/article/${p.slug}`}>{p.title}</Link>
                    <span className="archive-date">{p.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
