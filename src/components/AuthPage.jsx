import { useState } from 'react'
import { X } from 'lucide-react'
import { signup, login } from '../services/backendApi'
import './AuthPage.css'

export default function AuthPage({ onLogin, onClose }) {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required')
      return false
    }
    if (mode === 'signup' && !email.trim()) {
      setError('Email is required')
      return false
    }
    if (!password) {
      setError('Password is required')
      return false
    }
    // bcrypt has a 72-byte limit; proactively validate client-side for both modes
    if (new TextEncoder().encode(password).length > 72) {
      setError('Password must be 72 bytes or fewer. Use a shorter password.')
      return false
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setError('')
    setIsLoading(true)
    try {
      const user = await signup({ username, email, password, avatarFile })
      if (user && user.id) {
        const tokenRes = await login({ username, password })
        if (tokenRes.access_token) {
          onLogin({ username: user.username, token: tokenRes.access_token })
        }
      }
    } catch (e) {
      console.error('Signup error', e)
      setError((e && e.message) || (e && e.detail) || 'Could not sign up. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Username and password are required')
      return
    }

    setError('')
    setIsLoading(true)
    try {
      const tokenRes = await login({ username, password })
      if (tokenRes.access_token) {
        onLogin({ username, token: tokenRes.access_token })
      } else {
        setError(tokenRes.detail || 'Invalid username or password')
      }
    } catch (e) {
      setError(e.message || 'Could not log in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="auth-container">
          {mode === 'login' ? (
            <>
              <h1 className="auth-title">Sign In</h1>
              <p className="auth-subtitle">Welcome back to GameBoxd</p>

              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError('')
                    }}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    disabled={isLoading}
                  />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <p className="auth-toggle">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setError('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="auth-link"
                >
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-title">Sign Up</h1>
              <p className="auth-subtitle">Create your GameBoxd account</p>

              <form onSubmit={handleSignup} className="auth-form">
                <div className="form-group">
                  <label htmlFor="signup-username">Username</label>
                  <input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError('')
                    }}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-avatar">Profile Picture (optional)</label>
                  <input
                    id="signup-avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0]
                      setAvatarFile(f || null)
                      setError('')
                      if (f) {
                        const url = URL.createObjectURL(f)
                        setAvatarPreview(url)
                      } else {
                        setAvatarPreview(null)
                      }
                    }}
                    disabled={isLoading}
                  />
                  {avatarPreview && (
                    <div className="avatar-preview">
                      <img src={avatarPreview} alt="avatar preview" />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError('')
                    }}
                    disabled={isLoading}
                  />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <p className="auth-toggle">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="auth-link"
                >
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
