import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { login, logout, isAuthenticated, getGithubToken, setGithubToken, hasGithubToken } from '../utils/auth.js'
import {
  listPosts, getPost, createPost, updatePost, deletePost,
  listTemplates, getTemplate,
  getProfile, updateProfile, getProfileSha,
  buildFrontMatter, parseFrontMatter,
} from '../utils/github.js'
import { formatDate, generateSlug } from '../utils/markdown.js'

export default function Admin() {
  const [authed, setAuthed] = useState(isAuthenticated())
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('articles')

  if (!authed) {
    return (
      <div className="admin-login">
        <h1>🔐 管理登录</h1>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={e => {
          e.preventDefault()
          if (login(account, password)) {
            setAuthed(true)
            setError('')
          } else {
            setError('账号或密码错误')
          }
        }}>
          <div className="form-group">
            <label>账号（手机号）</label>
            <input type="text" value={account} onChange={e => setAccount(e.target.value)}
              placeholder="请输入手机号" required />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码" required />
          </div>
          <button type="submit" className="btn btn-primary">登录</button>
        </form>
        <Link to="/" className="back-link">← 返回首页</Link>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>⚙ 管理面板</h1>
        <button className="btn btn-sm" onClick={() => { logout(); setAuthed(false) }}>退出登录</button>
      </div>
      <div className="admin-tabs">
        <button className={`tab-btn ${tab === 'articles' ? 'active' : ''}`} onClick={() => setTab('articles')}>文章管理</button>
        <button className={`tab-btn ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>新建文章</button>
        <button className={`tab-btn ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>模板下载</button>
        <button className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>个人资料</button>
        <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>设置</button>
      </div>
      <div className="admin-content">
        {tab === 'articles' && <ArticleManager />}
        {tab === 'new' && <ArticleEditor />}
        {tab === 'templates' && <TemplateManager />}
        {tab === 'profile' && <ProfileEditor />}
        {tab === 'settings' && <Settings />}
      </div>
    </div>
  )
}

// 文章管理列表
function ArticleManager() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  async function reload() {
    setLoading(true)
    const files = await listPosts()
    const items = await Promise.all(files.map(f => getPost(f.slug)))
    setPosts(items.filter(Boolean))
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  if (editing) return <ArticleEditor existingPost={editing} onDone={() => { setEditing(null); reload() }} />

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="article-manager">
      {posts.length === 0 ? (
        <p className="empty-state">暂无文章</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>标题</th><th>日期</th><th>分类</th><th>操作</th></tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.slug}>
                <td>{post.meta?.title || post.slug}</td>
                <td>{formatDate(post.meta?.date)}</td>
                <td>{(post.meta?.categories || []).join(', ')}</td>
                <td>
                  <button className="btn btn-sm" onClick={() => setEditing(post)}>编辑</button>
                  <button className="btn btn-sm btn-danger" onClick={async () => {
                    if (confirm(`确认删除「${post.meta?.title || post.slug}」？`)) {
                      try { await deletePost(post.slug, post.sha); reload() }
                      catch (e) { alert(e.message) }
                    }
                  }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// 文章编辑器（新建/编辑）
function ArticleEditor({ existingPost, onDone }) {
  const [title, setTitle] = useState(existingPost?.meta?.title || '')
  const [date, setDate] = useState(existingPost?.meta?.date || new Date().toISOString().slice(0, 10))
  const [categories, setCategories] = useState((existingPost?.meta?.categories || []).join(', '))
  const [tags, setTags] = useState((existingPost?.meta?.tags || []).join(', '))
  const [author, setAuthor] = useState(existingPost?.meta?.author || '星航convoy')
  const [content, setContent] = useState(existingPost?.content || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      const meta = {
        title,
        date,
        categories: categories.split(',').map(s => s.trim()).filter(Boolean),
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        author,
      }
      const fullContent = buildFrontMatter(meta) + '\n\n' + content
      const slug = existingPost?.slug || generateSlug(title)

      if (existingPost) {
        await updatePost(slug, fullContent, existingPost.sha, `更新: ${title}`)
        setMsg('✅ 更新成功')
      } else {
        await createPost(slug, fullContent, `新增: ${title}`)
        setMsg('✅ 发布成功')
      }
      setTimeout(() => onDone?.(), 1500)
    } catch (e) {
      setMsg('❌ ' + e.message)
    }
    setSaving(false)
  }

  async function handleDownload() {
    const meta = { title, date, categories: categories.split(',').map(s => s.trim()).filter(Boolean), tags: tags.split(',').map(s => s.trim()).filter(Boolean), author }
    const fullContent = buildFrontMatter(meta) + '\n\n' + content
    const blob = new Blob([fullContent], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${generateSlug(title)}.md`
    a.click()
  }

  return (
    <div className="article-editor">
      <h2>{existingPost ? '编辑文章' : '新建文章'}</h2>
      {msg && <p className={msg.startsWith('✅') ? 'success-msg' : 'error-msg'}>{msg}</p>}
      <div className="form-row">
        <div className="form-group">
          <label>标题</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="文章标题" />
        </div>
        <div className="form-group">
          <label>日期</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>分类（逗号分隔）</label>
          <input type="text" value={categories} onChange={e => setCategories(e.target.value)} placeholder="前端, React" />
        </div>
        <div className="form-group">
          <label>标签（逗号分隔）</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="React, Vite" />
        </div>
      </div>
      <div className="form-group">
        <label>作者</label>
        <input type="text" value={author} onChange={e => setAuthor(e.target.value)} />
      </div>
      <div className="form-group">
        <label>正文（Markdown 格式）</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows="20"
          placeholder="在此输入 Markdown 内容..." className="markdown-editor" />
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : (existingPost ? '更新文章' : '发布文章')}
        </button>
        <button className="btn" onClick={handleDownload}>📥 下载为 .md</button>
        {onDone && <button className="btn" onClick={onDone}>取消</button>}
      </div>
    </div>
  )
}

// 模板管理
function TemplateManager() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const list = await listTemplates()
      setTemplates(list)
      setLoading(false)
    }
    load()
  }, [])

  async function downloadTemplate(t) {
    const content = await getTemplate(t.path)
    if (!content) return alert('下载失败')
    const blob = new Blob([content], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = t.name
    a.click()
  }

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="template-manager">
      <h2>📥 模板下载</h2>
      <p>点击下载文章模板，快速开始写作</p>
      {templates.length === 0 ? (
        <p className="empty-state">暂无模板</p>
      ) : (
        <div className="template-list">
          {templates.map(t => (
            <div key={t.path} className="template-card">
              <span className="template-name">{t.name}</span>
              <button className="btn btn-sm" onClick={() => downloadTemplate(t)}>下载</button>
            </div>
          ))}
        </div>
      )}
      <div className="template-info">
        <h3>模板说明</h3>
        <p>文章使用 Markdown 格式 + Front Matter 元数据：</p>
        <pre className="code-block">{`---
title: 文章标题
date: 2026-01-01
categories: 分类1, 分类2
tags: 标签1, 标签2
author: 作者名
---

正文内容...`}</pre>
      </div>
    </div>
  )
}

// 个人资料编辑
function ProfileEditor() {
  const [profile, setProfile] = useState(null)
  const [sha, setSha] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      const data = await getProfile()
      setProfile(data)
      setSha(await getProfileSha())
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      await updateProfile(profile, sha)
      setMsg('✅ 资料更新成功')
    } catch (e) {
      setMsg('❌ ' + e.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="profile-editor">
      <h2>👤 个人资料</h2>
      {msg && <p className={msg.startsWith('✅') ? 'success-msg' : 'error-msg'}>{msg}</p>}
      <div className="form-group">
        <label>姓名</label>
        <input type="text" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label>简介</label>
        <textarea value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows="3" />
      </div>
      <div className="form-group">
        <label>头像 URL</label>
        <input type="text" value={profile.avatar || ''} onChange={e => setProfile({ ...profile, avatar: e.target.value })} placeholder="https://..." />
      </div>
      <div className="form-group">
        <label>邮箱</label>
        <input type="email" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} />
      </div>
      <div className="form-group">
        <label>技能（逗号分隔）</label>
        <input type="text" value={(profile.skills || []).join(', ')} onChange={e => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
      </div>
      <div className="form-group">
        <label>GitHub 链接</label>
        <input type="text" value={profile.social?.github || ''} onChange={e => setProfile({ ...profile, social: { ...profile.social, github: e.target.value } })} />
      </div>
      <div className="form-group">
        <label>博客链接</label>
        <input type="text" value={profile.social?.blog || ''} onChange={e => setProfile({ ...profile, social: { ...profile.social, blog: e.target.value } })} />
      </div>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? '保存中...' : '保存资料'}
      </button>
    </div>
  )
}

// 设置（GitHub Token）
function Settings() {
  const [token, setToken] = useState(getGithubToken())
  const [msg, setMsg] = useState('')

  function handleSave() {
    setGithubToken(token)
    setMsg('✅ Token 已保存到本地浏览器')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="settings-page">
      <h2>⚙ 设置</h2>
      {msg && <p className="success-msg">{msg}</p>}
      <div className="form-group">
        <label>GitHub Personal Access Token (PAT)</label>
        <input type="password" value={token} onChange={e => setToken(e.target.value)}
          placeholder="ghp_..." className="token-input" />
        <p className="form-hint">
          需要一个有 <code>repo</code> 权限的 Token，用于文章上传/删除/资料编辑。<br />
          获取方式：GitHub → Settings → Developer settings → Personal access tokens → Generate new token<br />
          Token 仅存储在本地浏览器 localStorage 中，不会上传到服务器。
        </p>
      </div>
      <button className="btn btn-primary" onClick={handleSave}>保存 Token</button>
      <div className="settings-info">
        <h3>当前状态</h3>
        <p>GitHub Token: {hasGithubToken() ? '✅ 已设置' : '❌ 未设置'}</p>
      </div>
    </div>
  )
}
