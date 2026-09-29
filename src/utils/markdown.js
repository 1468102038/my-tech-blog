// 格式化日期
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 格式化日期为短格式 (YYYY-MM-DD)
export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 获取年月分组
export function groupByYearMonth(posts) {
  const groups = {}
  posts.forEach(post => {
    const date = post.meta?.date || ''
    if (!date) return
    const d = new Date(date)
    if (isNaN(d)) return
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const key = `${year}年${month}月`
    if (!groups[key]) groups[key] = []
    groups[key].push(post)
  })
  return groups
}

// 按分类分组
export function groupByCategory(posts) {
  const groups = {}
  posts.forEach(post => {
    const cats = post.meta?.categories || ['未分类']
    cats.forEach(cat => {
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(post)
    })
  })
  return groups
}

// 按标签分组
export function groupByTag(posts) {
  const groups = {}
  posts.forEach(post => {
    const tags = post.meta?.tags || []
    tags.forEach(tag => {
      if (!groups[tag]) groups[tag] = []
      groups[tag].push(post)
    })
  })
  return groups
}

// 估算阅读时间
export function readingTime(content) {
  const words = content?.length || 0
  return Math.max(1, Math.ceil(words / 400))
}

// 生成文章摘要
export function excerpt(content, length = 150) {
  if (!content) return ''
  const plain = content.replace(/[#*`~\-\[\]()!]/g, '').replace(/\n/g, ' ').trim()
  return plain.slice(0, length) + (plain.length > length ? '...' : '')
}

// 生成 slug
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}
