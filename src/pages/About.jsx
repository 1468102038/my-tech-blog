import { useState, useEffect } from 'react'
import { getProfile } from '../utils/github.js'

export default function About() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getProfile()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="about-page">
      <h1>👋 关于我</h1>
      <div className="profile-card">
        {profile?.avatar && (
          <img src={profile.avatar} alt={profile.name} className="profile-avatar" />
        )}
        <h2>{profile?.name || '星航convoy'}</h2>
        <p className="profile-bio">{profile?.bio || '热爱技术，乐于分享'}</p>
        {profile?.email && <p>📧 {profile.email}</p>}
        {profile?.skills?.length > 0 && (
          <div className="profile-skills">
            <h3>技能栈</h3>
            <div className="tag-cloud">
              {profile.skills.map(skill => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
        {profile?.social && (
          <div className="profile-social">
            <h3>社交链接</h3>
            {profile.social.github && (
              <a href={profile.social.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            )}
            {profile.social.blog && (
              <a href={profile.social.blog} target="_blank" rel="noopener noreferrer">博客</a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
