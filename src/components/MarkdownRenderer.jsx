import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Link } from 'react-router-dom'

export default function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith('/')) {
              return <Link to={href}>{children}</Link>
            }
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          },
          img: ({ src, alt }) => (
            <img src={src} alt={alt} loading="lazy" />
          ),
          pre: ({ children }) => (
            <pre className="code-block">{children}</pre>
          ),
          table: ({ children }) => (
            <div className="table-wrapper"><table>{children}</table></div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
