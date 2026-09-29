import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listPosts } from '../utils/github.js'

export default function Archive() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await listPosts()
      setPosts(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">加载中...</div>

  const groups = {}
  posts.forEach(p => {
    const year = (p.date || '未知').substring(0, 4)
    if (!groups[year]) groups[year] = []
    groups[year].push(p)
  })
  const years = Object.keys(groups).sort().reverse()

  return (
    <div className="archive-page">
      <h1>归档</h1>
      {years.map(year => (
        <div key={year} className="archive-group">
          <h2 className="archive-group-title">{year} 年 · {groups[year].length} 篇</h2>
          <ul className="archive-list">
            {groups[year].map(p => (
              <li key={p.slug}>
                <Link to={`/article/${p.slug}`}>{p.title}</Link>
                <span className="archive-date">{p.date}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
