import { GITHUB_CONFIG } from '../config/site.js'
import { getGithubToken } from './auth.js'
import { Base64 } from 'js-base64'

const API = GITHUB_CONFIG.apiBase
const OWNER = GITHUB_CONFIG.owner
const REPO = GITHUB_CONFIG.repo

// 获取文章列表
export async function listPosts() {
  try {
    const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${GITHUB_CONFIG.postsPath}`)
    if (!res.ok) return []
    const files = await res.json()
    return files
      .filter(f => f.name.endsWith('.md'))
      .map(f => ({
        name: f.name,
        slug: f.name.replace('.md', ''),
        path: f.path,
        sha: f.sha,
        url: f.download_url,
      }))
  } catch (e) {
    console.error('listPosts error:', e)
    return []
  }
}

// 获取单篇文章内容
export async function getPost(slug) {
  try {
    const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${GITHUB_CONFIG.postsPath}/${slug}.md`)
    if (!res.ok) return null
    const data = await res.json()
    const content = Base64.decode(data.content)
    const { meta, body } = parseFrontMatter(content)
    return { slug, content: body, meta, sha: data.sha }
  } catch (e) {
    console.error('getPost error:', e)
    return null
  }
}

// 解析 Front Matter
export function parseFrontMatter(content) {
  const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(fmRegex)
  if (!match) return { meta: {}, body: content }

  const fmText = match[1]
  const body = match[2]
  const meta = {}
  fmText.split('\n').forEach(line => {
    const idx = line.indexOf(':')
    if (idx > -1) {
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      if (key === 'tags' || key === 'categories') {
        meta[key] = val.split(',').map(s => s.trim()).filter(Boolean)
      } else {
        meta[key] = val
      }
    }
  })
  return { meta, body }
}

// 生成 Front Matter
export function buildFrontMatter(meta) {
  const lines = ['---']
  Object.entries(meta).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      lines.push(`${k}: ${v.join(', ')}`)
    } else {
      lines.push(`${k}: ${v}`)
    }
  })
  lines.push('---')
  return lines.join('\n')
}

// 上传/创建文章
export async function createPost(slug, content, message = '新增文章') {
  const token = getGithubToken()
  if (!token) throw new Error('未设置 GitHub Token')

  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${GITHUB_CONFIG.postsPath}/${slug}.md`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Base64.encode(content),
    }),
  })
  if (!res.ok) throw new Error(`上传失败: ${res.statusText}`)
  return res.json()
}

// 更新文章
export async function updatePost(slug, content, sha, message = '更新文章') {
  const token = getGithubToken()
  if (!token) throw new Error('未设置 GitHub Token')

  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${GITHUB_CONFIG.postsPath}/${slug}.md`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Base64.encode(content),
      sha,
    }),
  })
  if (!res.ok) throw new Error(`更新失败: ${res.statusText}`)
  return res.json()
}

// 删除文章
export async function deletePost(slug, sha, message = '删除文章') {
  const token = getGithubToken()
  if (!token) throw new Error('未设置 GitHub Token')

  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${GITHUB_CONFIG.postsPath}/${slug}.md`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, sha }),
  })
  if (!res.ok) throw new Error(`删除失败: ${res.statusText}`)
  return res.json()
}

// 获取模板列表
export async function listTemplates() {
  try {
    const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${GITHUB_CONFIG.templatesPath}`)
    if (!res.ok) return []
    const files = await res.json()
    return files.map(f => ({
      name: f.name,
      path: f.path,
      url: f.download_url,
    }))
  } catch (e) {
    return []
  }
}

// 获取模板内容
export async function getTemplate(path) {
  try {
    const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}`)
    if (!res.ok) return null
    const data = await res.json()
    return Base64.decode(data.content)
  } catch (e) {
    return null
  }
}

// 获取个人资料
export async function getProfile() {
  try {
    const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/profile.json`)
    if (!res.ok) return getDefaultProfile()
    const data = await res.json()
    return JSON.parse(Base64.decode(data.content))
  } catch (e) {
    return getDefaultProfile()
  }
}

// 更新个人资料
export async function updateProfile(profile, sha) {
  const token = getGithubToken()
  if (!token) throw new Error('未设置 GitHub Token')

  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/profile.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: '更新个人资料',
      content: Base64.encode(JSON.stringify(profile, null, 2)),
      sha,
    }),
  })
  if (!res.ok) throw new Error(`更新资料失败: ${res.statusText}`)
  return res.json()
}

// 获取 profile.json 的 sha（用于更新）
export async function getProfileSha() {
  try {
    const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/profile.json`)
    if (!res.ok) return null
    const data = await res.json()
    return data.sha
  } catch (e) {
    return null
  }
}

function getDefaultProfile() {
  return {
    name: '星航convoy',
    bio: '热爱技术，乐于分享',
    avatar: '',
    email: '',
    social: {
      github: 'https://github.com/1468102038',
      blog: '',
    },
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  }
}
