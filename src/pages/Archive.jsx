import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listPosts, getPost } from '../utils/github.js'
import { groupByYearMonth, formatDate } from '../utils/markdown.js'

export default function Archive() {
  const [groups, setGroups] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const files = await listPosts()
      const items = await Promise.all(files.map(f => getPost(f.slug)))
      const sorted = items.filter(Boolean)
        .sort((a, b) => (b.meta?.date || '').localeCompare(a.meta?.date || ''))
      setGroups(groupByYearMonth(sorted))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="archive-page">
      <h1>📦 文章归档</h1>
      {Object.keys(groups).length === 0 ? (
        <p className="empty-state">暂无文章</p>
      ) : (
        Object.entries(groups).map(([key, posts]) => (
          <section key={key} className="archive-group">
            <h2 className="archive-group-title">{key} ({posts.length} 篇)</h2>
            <ul className="archive-list">
              {posts.map(post => (
                <li key={post.slug}>
                  <Link to={`/post/${post.slug}`}>{post.meta?.title || post.slug}</Link>
                  <span className="archive-date">{formatDate(post.meta?.date)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
