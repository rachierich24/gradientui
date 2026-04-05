'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { AuthResponse } from '@gradient365/types'

export default function LoginPage() {
  const router = useRouter()
  const [accountId, setAccountId] = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post<AuthResponse>('/api/auth/login', { account_id: accountId, password })
      localStorage.setItem('gradient365_token', res.token)
      localStorage.setItem('gradient365_user',  JSON.stringify(res.user))
      document.cookie = `gradient365_token=${res.token}; path=/; max-age=604800`
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--portal-surface)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid var(--portal-border)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Sign in</h1>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>Enter your Gradient 365 account ID and password.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Account ID</label>
            <input
              type="text"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              placeholder="CAFE-2026-00001"
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px', borderRadius: '8px', background: 'var(--portal-gradient)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '15px' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
