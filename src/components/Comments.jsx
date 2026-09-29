import { SITE_CONFIG } from '../config/site.js'

// Giscus 评论系统组件
// 使用前需要:
// 1. 在 GitHub 仓库 Settings → General → Features 勾选 Discussions
// 2. 访问 https://giscus.app 获取 repoId 和 categoryId
// 3. 填入 SITE_CONFIG.giscus 中
export default function Comments() {
  const giscus = SITE_CONFIG.giscus

  // 如果未配置 Giscus，显示提示
  if (!giscus.repoId || !giscus.categoryId) {
    return (
      <div className="comments-placeholder">
        <h3>💬 评论</h3>
        <p>评论系统尚未配置。请按照以下步骤启用：</p>
        <ol>
          <li>在 GitHub 仓库 Settings → General → Features 勾选 <strong>Discussions</strong></li>
          <li>访问 <a href="https://giscus.app" target="_blank" rel="noopener noreferrer">giscus.app</a> 获取配置参数</li>
          <li>将 <code>repoId</code> 和 <code>categoryId</code> 填入 <code>src/config/site.js</code></li>
        </ol>
      </div>
    )
  }

  return (
    <div className="comments-section">
      <script
        src="https://giscus.app/client.js"
        data-repo={giscus.repo}
        data-repo-id={giscus.repoId}
        data-category={giscus.category}
        data-category-id={giscus.categoryId}
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        data-loading="lazy"
        crossOrigin="anonymous"
        async
      />
    </div>
  )
}
