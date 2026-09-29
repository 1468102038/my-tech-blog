import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listPosts, getPost, parseFrontMatter } from '../utils/github.js'
import { formatDate, excerpt, readingTime } from '../utils/markdown.js'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const files = await listPosts()
      const items = await Promise.all(
        files.map(async f => {
          const post = await getPost(f.slug)
          return post
        })
      )
      const sorted = items
        .filter(Boolean)
        .sort((a, b) => (b.meta?.date || '').localeCompare(a.meta?.date || ''))
      setPosts(sorted)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>📝 个人技术博客</h1>
        <p>记录技术学习与成长的点滴</p>
      </div>
      {posts.length === 0 ? (
        <div className="empty-state">
          <p>暂无文章，请通过管理面板上传第一篇文章吧！</p>
          <Link to="/admin" className="btn btn-primary">前往管理</Link>
        </div>
      ) : (
        <div className="post-list">
          {posts.map(post => (
            <article key={post.slug} className="post-card">
              <Link to={`/post/${post.slug}`} className="post-card-link">
                <h2 className="post-title">{post.meta?.title || post.slug}</h2>
                <div className="post-meta">
                  <span className="post-date">📅 {formatDate(post.meta?.date)}</span>
                  <span className="post-reading">⏱ {readingTime(post.content)} 分钟</span>
                </div>
                <p className="post-excerpt">{excerpt(post.content)}</p>
                {(post.meta?.tags || []).length > 0 && (
                  <div className="post-tags">
                    {post.meta.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
