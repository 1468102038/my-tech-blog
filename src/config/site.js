// 站点配置
export const SITE_CONFIG = {
  title: 'Tech Blog',
  subtitle: '个人技术文章积累',
  description: '记录技术学习与成长的个人博客',
  author: '星航convoy',
  owner: '1468102038',
  repo: 'my-tech-blog',
  // GitHub Pages 部署地址
  baseUrl: 'https://1468102038.github.io/my-tech-blog/',
  // Giscus 评论系统配置 (需要启用 GitHub Discussions)
  giscus: {
    repo: '1468102038/my-tech-blog',
    repoId: '', // 需要在启用 Discussions 后填入
    category: 'Announcements',
    categoryId: '', // 需要在启用 Discussions 后填入
  },
}

// 固定认证凭据
export const AUTH_CONFIG = {
  account: '18976947265',
  password: 'Xzl2053270823!',
}

// GitHub API 配置
export const GITHUB_CONFIG = {
  owner: '1468102038',
  repo: 'my-tech-blog',
  branch: 'main',
  postsPath: 'posts',
  templatesPath: 'templates',
  configPath: 'src/config/site.js',
  apiBase: 'https://api.github.com',
}
