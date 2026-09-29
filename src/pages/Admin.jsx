import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { isAuthenticated, login, logout } from '../utils/auth.js'
import {
  listPosts, getPost, createPost, updatePost, deletePost,
  listTemplates, getTemplate,
  getProfile, updateProfile, getProfileSha,
  getTheme, getThemeSha, updateTheme,
  parseFrontMatter, buildFrontMatter,
} from '../utils/github.js'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Admin() {
  const [authed, setAuthed] = useState(isAuthenticated())
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (login(account, password)) {
      setAuthed(true)
      setError('')
    } else {
      setError('账号或密码错误')
    }
  }

  if (!authed) {
    return (
      <div className="admin-login">
        <h1>🔐 管理后台</h1>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>账号</label>
            <input type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="请输入账号" />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>登录</button>
        </form>
      </div>
    )
  }

  return <AdminPanel onLogout={() => { logout(); setAuthed(false) }} />
}

function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState('posts')
  const tabs = [
    { id: 'posts', label: '📝 文章管理' },
    { id: 'profile', label: '👤 个人资料' },
    { id: 'theme', label: '🎨 外观设置' },
    { id: 'templates', label: '📋 模板' },
  ]

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 style={{ fontSize: '1.3rem', fontWeight: 600 }}>管理后台</h1>
        <button className="btn btn-sm" onClick={onLogout}>退出</button>
      </div>
      <div className="admin-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="admin-content">
        {tab === 'posts' && <PostManager />}
        {tab === 'profile' && <ProfileEditor />}
        {tab === 'theme' && <ThemeEditor />}
        {tab === 'templates' && <TemplateManager />}
      </div>
    </div>
  )
}

function PostManager() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function refresh() {
    setLoading(true)
    const data = await listPosts()
    setPosts(data)
    setLoading(false)
  }
  useEffect(() => { refresh() }, [])

  async function handleDelete(slug, sha) {
    if (!confirm(`确认删除「${slug}」？此操作不可撤销。`)) return
    try {
      await deletePost(slug, sha)
      setSuccess('删除成功')
      setTimeout(() => setSuccess(''), 3000)
      refresh()
    } catch (e) { setError(e.message) }
  }

  if (editing) return <PostEditor post={editing} onSave={() => { setEditing(null); refresh() }} onCancel={() => setEditing(null)} />

  return (
    <div>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>文章列表 ({posts.length})</h2>
        <button className="btn btn-primary" onClick={() => setEditing({ isNew: true })}>+ 新建文章</button>
      </div>
      {loading ? <div className="loading">加载中...</div> : posts.length === 0 ? <div className="empty-state">暂无文章</div> : (
        <table className="admin-table">
          <thead><tr><th>标题</th><th>日期</th><th>分类</th><th>操作</th></tr></thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.slug}>
                <td><Link to={`/article/${p.slug}`} target="_blank">{p.title}</Link></td>
                <td>{p.date}</td>
                <td>{p.category}</td>
                <td>
                  <button className="btn btn-sm" onClick={() => setEditing({ slug: p.slug, sha: p.sha })}>编辑</button>
                  <button className="btn btn-sm btn-danger" style={{ marginLeft: '0.4rem' }} onClick={() => handleDelete(p.slug, p.sha)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function PostEditor({ post, onSave, onCancel }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [sha, setSha] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (post.isNew) return
    getPost(post.slug).then(data => {
      if (!data) return
      setTitle(data.meta.title || '')
      setDate(data.meta.date || '')
      setCategory(data.meta.category || '')
      setTags(Array.isArray(data.meta.tags) ? data.meta.tags.join(', ') : '')
      setExcerpt(data.meta.excerpt || '')
      setContent(data.content || '')
      setSha(data.sha)
    })
  }, [post])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const meta = { title, date, category }
      if (tags.trim()) meta.tags = tags.split(',').map(t => t.trim()).filter(Boolean)
      if (excerpt.trim()) meta.excerpt = excerpt.trim()
      const fullContent = buildFrontMatter(meta) + '\n\n' + content
      const slug = post.isNew ? title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') : post.slug
      if (post.isNew) await createPost(slug, fullContent)
      else await updatePost(slug, fullContent, sha)
      onSave()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      {error && <div className="error-msg">{error}</div>}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>{post.isNew ? '新建文章' : '编辑文章'}</h2>
      <div className="form-row">
        <div className="form-group"><label>标题</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="文章标题" /></div>
        <div className="form-group"><label>日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>分类</label><input value={category} onChange={e => setCategory(e.target.value)} placeholder="如：前端开发" /></div>
        <div className="form-group"><label>标签 (逗号分隔)</label><input value={tags} onChange={e => setTags(e.target.value)} placeholder="React, CSS" /></div>
      </div>
      <div className="form-group"><label>摘要 (可选)</label><input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="一句话概括文章内容" /></div>
      <div className="form-group"><label>正文 (Markdown)</label><textarea className="markdown-editor" rows={18} value={content} onChange={e => setContent(e.target.value)} placeholder="# 标题&#10;&#10;正文内容..." /></div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !title}>{saving ? '保存中...' : '保存'}</button>
        <button className="btn" onClick={onCancel}>取消</button>
      </div>
    </div>
  )
}

function ProfileEditor() {
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getProfile().then(setProfile)
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const sha = await getProfileSha()
      await updateProfile(profile, sha)
      setSuccess('保存成功！')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }

  if (!profile) return <div className="loading">加载中...</div>

  return (
    <div>
      {success && <div className="success-msg">{success}</div>}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>个人资料</h2>
      <div className="form-group"><label>姓名</label><input value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
      <div className="form-group"><label>简介</label><textarea rows={3} value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} /></div>
      <div className="form-group"><label>头像 URL</label><input value={profile.avatar || ''} onChange={e => setProfile({ ...profile, avatar: e.target.value })} placeholder="https://..." /></div>
      <div className="form-group"><label>邮箱</label><input value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} /></div>
      <div className="form-group"><label>技能 (逗号分隔)</label><input value={(profile.skills || []).join(', ')} onChange={e => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
      <div className="form-group"><label>GitHub 链接</label><input value={profile.social?.github || ''} onChange={e => setProfile({ ...profile, social: { ...profile.social, github: e.target.value } })} /></div>
      <div className="form-group"><label>博客链接</label><input value={profile.social?.blog || ''} onChange={e => setProfile({ ...profile, social: { ...profile.social, blog: e.target.value } })} /></div>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存资料'}</button>
    </div>
  )
}

function ThemeEditor() {
  const { theme, setTheme } = useTheme()
  const [local, setLocal] = useState(theme)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => { setLocal(theme) }, [theme])

  async function handleSave() {
    setSaving(true)
    try {
      const sha = await getThemeSha()
      await updateTheme(local, sha)
      setTheme(local)
      setSuccess('外观设置已保存并应用！')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }

  function preview(t) {
    setLocal(t)
    const root = document.documentElement
    root.style.setProperty('--primary', t.primaryColor)
    root.style.setProperty('--radius', `${t.radius}px`)
    root.style.setProperty('--card-spacing', `${t.cardSpacing}px`)
  }

  const fonts = [
    { value: 'system', label: '系统默认 (无衬线)' },
    { value: 'serif', label: '衬线体 (宋体风格)' },
    { value: 'mono', label: '等宽体 (代码风格)' },
  ]

  return (
    <div>
      {success && <div className="success-msg">{success}</div>}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>🎨 外观设置</h2>
      <p className="form-hint" style={{ marginBottom: '1rem' }}>修改后实时预览，点击保存写入仓库 theme.json，全站生效。</p>

      <div className="theme-preview">
        <div className="post-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h3 className="post-title">预览卡片标题</h3>
          <div className="post-meta"><span>📅 2026-09-29</span><span>📂 示例分类</span></div>
          <p className="post-excerpt">这是一段预览文字，用来展示当前主题下的文章卡片效果。调整左侧设置可以看到实时变化。</p>
          <div className="post-tags"><span className="tag">React</span><span className="tag">CSS</span></div>
        </div>
      </div>

      <div className="form-group">
        <label>主题色</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="color" className="color-input" value={local.primaryColor} onChange={e => preview({ ...local, primaryColor: e.target.value })} />
          <input value={local.primaryColor} onChange={e => preview({ ...local, primaryColor: e.target.value })} style={{ flex: 1 }} />
        </div>
        <div className="form-hint">推荐色：#3b82f6(蓝) #10b981(绿) #f59e0b(橙) #8b5cf6(紫) #ef4444(红)</div>
      </div>

      <div className="form-group">
        <label>字体族</label>
        <select value={local.fontFamily} onChange={e => preview({ ...local, fontFamily: e.target.value })}>
          {fonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>圆角大小: {local.radius}px</label>
          <input type="range" min="0" max="20" value={local.radius} onChange={e => preview({ ...local, radius: parseInt(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>卡片间距: {local.cardSpacing}px</label>
          <input type="range" min="10" max="40" value={local.cardSpacing} onChange={e => preview({ ...local, cardSpacing: parseInt(e.target.value) })} />
        </div>
      </div>

      <div className="form-group"><label>侧边栏标题</label><input value={local.sidebarTitle || ''} onChange={e => setLocal({ ...local, sidebarTitle: e.target.value })} /></div>
      <div className="form-group"><label>侧边栏简介</label><textarea rows={2} value={local.sidebarBio || ''} onChange={e => setLocal({ ...local, sidebarBio: e.target.value })} /></div>

      <div className="form-row">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={local.showExcerpt !== false} onChange={e => setLocal({ ...local, showExcerpt: e.target.checked })} /> 显示文章摘要
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={local.showReadingTime !== false} onChange={e => setLocal({ ...local, showReadingTime: e.target.checked })} /> 显示阅读时间
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={local.showTags !== false} onChange={e => setLocal({ ...local, showTags: e.target.checked })} /> 显示标签
        </label>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存并应用'}</button>
        <button className="btn" onClick={() => { setLocal(theme); document.documentElement.style.setProperty('--primary', theme.primaryColor) }}>重置预览</button>
      </div>
    </div>
  )
}

function TemplateManager() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listTemplates().then(t => { setTemplates(t); setLoading(false) })
  }, [])

  function downloadTemplate(name, url) {
    fetch(url).then(r => r.text()).then(content => {
      const blob = new Blob([content], { type: 'text/markdown' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = name
      a.click()
    })
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>模板管理</h2>
      {loading ? <div className="loading">加载中...</div> : (
        <div className="template-list">
          {templates.map(t => (
            <div key={t.name} className="template-card">
              <span>{t.name}</span>
              <button className="btn btn-sm" onClick={() => downloadTemplate(t.name, t.url)}>下载</button>
            </div>
          ))}
        </div>
      )}
      <div className="template-info">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>使用说明</h3>
        <p className="form-hint">1. 下载模板文件到本地<br />2. 用 Markdown 编辑器填写内容<br />3. 在「文章管理」中新建文章，粘贴内容</p>
      </div>
    </div>
  )
}
