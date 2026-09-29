import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost } from '../utils/github.js'
import { formatDate, readingTime } from '../utils/markdown.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import Comments from '../components/Comments.jsx'

export default function Article() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getPost(slug)
      setPost(data)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <div className="loading">加载中...</div>
  if (!post) return (
    <div className="empty-state">
      <p>文章不存在</p>
      <Link to="/" className="btn btn-primary">返回首页</Link>
    </div>
  )

  return (
    <div className="article-page">
      <div className="article-header">
        <Link to="/" className="back-link">← 返回首页</Link>
        <h1 className="article-title">{post.meta?.title || post.slug}</h1>
        <div className="article-meta">
          <span>📅 {formatDate(post.meta?.date)}</span>
          <span>⏱ {readingTime(post.content)} 分钟阅读</span>
          {post.meta?.author && <span>✍ {post.meta.author}</span>}
        </div>
        {(post.meta?.tags || []).length > 0 && (
          <div className="post-tags">
            {post.meta.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <MarkdownRenderer content={post.content} />
      <div className="article-footer">
        {(post.meta?.categories || []).map(cat => (
          <Link key={cat} to={`/category/${cat}`} className="category-link">📂 {cat}</Link>
        ))}
      </div>
      <Comments />
    </div>
  )
}
