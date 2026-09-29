import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost } from '../utils/github.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import Comments from '../components/Comments.jsx'

export default function Article() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getPost(slug)
      setPost(data)
      setLoading(false)
    }
    load()
  }, [slug])

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
      setShowTop(scrollTop > 400)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) return <div className="loading">加载中...</div>
  if (!post) return <div className="empty-state"><p>文章不存在</p><Link to="/">返回首页</Link></div>

  const { meta, content } = post

  return (
    <div className="article-page">
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <header className="article-header">
        <Link to="/" className="back-link">← 返回首页</Link>
        <h1 className="article-title">{meta.title || slug}</h1>
        <div className="article-meta">
          {meta.date && <span>📅 {meta.date}</span>}
          {meta.category && <span>📂 {meta.category}</span>}
          {content && <span>⏱ {Math.max(1, Math.ceil(content.length / 400))} 分钟</span>}
        </div>
      </header>

      <MarkdownRenderer content={content} />

      <footer className="article-footer">
        {meta.category && <Link to="/categories" className="category-link">📂 {meta.category}</Link>}
        {meta.tags && meta.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </footer>

      <Comments />

      {showTop && (
        <button className="back-to-top visible" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ↑
        </button>
      )}
    </div>
  )
}
