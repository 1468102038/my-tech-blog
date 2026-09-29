import { useState, useEffect } from 'react'
import { getProfile } from '../utils/github.js'

export default function About() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile().then(setProfile)
  }, [])

  if (!profile) return <div className="loading">加载中...</div>

  return (
    <div className="about-page">
      <h1>关于</h1>
      <div className="profile-card">
        {profile.avatar && <img src={profile.avatar} alt="avatar" className="profile-avatar" />}
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>{profile.name}</h2>
        <p className="profile-bio">{profile.bio}</p>

        {profile.email && <p style={{ color: 'var(--text-secondary)' }}>📧 {profile.email}</p>}

        {profile.skills && profile.skills.length > 0 && (
          <div className="profile-skills">
            <div className="sidebar-title">技能栈</div>
            <div className="tag-cloud">
              {profile.skills.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        )}

        {profile.social && (
          <div className="profile-social">
            <div className="sidebar-title">社交链接</div>
            {profile.social.github && <a href={profile.social.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
            {profile.social.blog && <a href={profile.social.blog} target="_blank" rel="noopener noreferrer">博客</a>}
          </div>
        )}
      </div>
    </div>
  )
}
