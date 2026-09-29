import { useState } from 'react'
import { signup, login } from '../services/backendApi'

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async () => {
    setError('')
    try {
      const user = await signup({ username, email, password })
      if (user && user.id) {
        // auto-login
        const tokenRes = await login({ username, password })
        if (tokenRes.access_token) {
          onLogin({ username: user.username, token: tokenRes.access_token })
        }
      }
    } catch (e) {
      setError('Could not sign up')
    }
  }

  const handleLogin = async () => {
    setError('')
    try {
      const tokenRes = await login({ username, password })
      if (tokenRes.access_token) {
        onLogin({ username, token: tokenRes.access_token })
      } else {
        setError(tokenRes.detail || 'Invalid login')
      }
    } catch (e) {
      setError(e?.detail || e?.message || 'Could not log in')
    }
  }

  return (
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      {mode === 'signup' && (
        <>
          <input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button onClick={handleSignup}>Sign Up</button>
          <button onClick={()=>setMode('login')}>Have an account?</button>
        </>
      )}
      {mode === 'login' && (
        <>
          <input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button onClick={handleLogin}>Log In</button>
          <button onClick={()=>setMode('signup')}>Sign Up</button>
        </>
      )}
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  )
}
