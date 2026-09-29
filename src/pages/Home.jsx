import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listPosts } from '../utils/github.js'
import { siteConfig } from '../config/site.js'
import Sidebar from '../components/Sidebar.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    async function load() {
      try {
        const data = await listPosts()
        setPosts(data)
      } catch (e) {
        console.error('Failed to load posts:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="layout-two-col">
      <div className="layout-main">
        <div className="hero-section">
          <h1>{siteConfig.title}</h1>
          <p>{siteConfig.description}</p>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <p>还没有文章，去 Admin 添加第一篇吧！</p>
          </div>
        ) : (
          <div className="post-list">
            {posts.map(post => (
              <Link key={post.slug} to={`/article/${post.slug}`} className="post-card-link">
                <article className="post-card">
                  <h2 className="post-title">{post.title}</h2>
                  <div className="post-meta">
                    <span>📅 {post.date}</span>
                    {post.category && <span>📂 {post.category}</span>}
                    {theme.showReadingTime && post.content && (
                      <span>⏱ {Math.max(1, Math.ceil(post.content.length / 400))} 分钟</span>
                    )}
                  </div>
                  {theme.showExcerpt && post.excerpt && (
                    <p className="post-excerpt">{post.excerpt}</p>
                  )}
                  {theme.showTags && post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Sidebar posts={posts} />
    </div>
  )
}
