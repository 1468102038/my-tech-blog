import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listPosts, getPost } from '../utils/github.js'
import { groupByCategory, groupByTag, formatDate, excerpt } from '../utils/markdown.js'

export default function Categories() {
  const { cat } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const files = await listPosts()
      const items = await Promise.all(files.map(f => getPost(f.slug)))
      setPosts(items.filter(Boolean))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">加载中...</div>

  if (cat) {
    // 显示某个分类下的文章
    const filtered = posts.filter(p =>
      (p.meta?.categories || []).includes(cat) || (p.meta?.tags || []).includes(cat)
    )
    return (
      <div className="category-page">
        <h1>📂 {cat}</h1>
        <Link to="/categories" className="back-link">← 全部分类</Link>
        <div className="post-list">
          {filtered.map(post => (
            <article key={post.slug} className="post-card">
              <Link to={`/post/${post.slug}`} className="post-card-link">
                <h2 className="post-title">{post.meta?.title || post.slug}</h2>
                <span className="post-date">📅 {formatDate(post.meta?.date)}</span>
                <p className="post-excerpt">{excerpt(post.content)}</p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    )
  }

  // 显示所有分类和标签
  const catGroups = groupByCategory(posts)
  const tagGroups = groupByTag(posts)

  return (
    <div className="categories-page">
      <h1>📂 分类与标签</h1>
      <section className="category-section">
        <h2>分类</h2>
        <div className="tag-cloud">
          {Object.entries(catGroups).map(([cat, items]) => (
            <Link key={cat} to={`/category/${cat}`} className="tag tag-category">
              {cat} <span className="tag-count">({items.length})</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="category-section">
        <h2>标签</h2>
        <div className="tag-cloud">
          {Object.entries(tagGroups).map(([tag, items]) => (
            <Link key={tag} to={`/category/${tag}`} className="tag">
              #{tag} <span className="tag-count">({items.length})</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
