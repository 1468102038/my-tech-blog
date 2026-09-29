import { AUTH_CONFIG } from '../config/site.js'

// 登录验证
export function login(account, password) {
  if (account === AUTH_CONFIG.account && password === AUTH_CONFIG.password) {
    sessionStorage.setItem('blog_auth', 'true')
    sessionStorage.setItem('blog_login_time', Date.now().toString())
    return true
  }
  return false
}

// 退出登录
export function logout() {
  sessionStorage.removeItem('blog_auth')
  sessionStorage.removeItem('blog_login_time')
  localStorage.removeItem('blog_gh_token')
}

// 检查是否已登录
export function isAuthenticated() {
  return sessionStorage.getItem('blog_auth') === 'true'
}

// 获取 GitHub Token（用户在管理面板中设置）
export function getGithubToken() {
  return localStorage.getItem('blog_gh_token') || ''
}

// 设置 GitHub Token
export function setGithubToken(token) {
  localStorage.setItem('blog_gh_token', token)
}

// 简单的 token 验证
export function hasGithubToken() {
  return getGithubToken().length > 0
}
