import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Article from './pages/Article.jsx'
import Archive from './pages/Archive.jsx'
import Categories from './pages/Categories.jsx'
import About from './pages/About.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="post/:slug" element={<Article />} />
        <Route path="archive" element={<Archive />} />
        <Route path="categories" element={<Categories />} />
        <Route path="category/:cat" element={<Categories />} />
        <Route path="about" element={<About />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
