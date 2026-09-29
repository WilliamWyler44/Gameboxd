import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Plus,
  Trash2,
  RefreshCw,
  Receipt,
  CreditCard,
  Search,
  Copy,
  Check,
  Calendar,
  DollarSign,
  ShoppingBag,
  Eye,
  Filter,
  Users as UsersIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import {
  getAdminStats,
  getAdminUsersWithToken,
  getAdminRoms,
  getAdminPostsByUser,
  deleteAdminUser,
  deleteAdminUserWithToken,
  signup,
  login,
  createAdminUserWithToken,
  setUserAdminFlag,
  getAdminTransactions,
} from '../services/backendApi'
import '../styles/Admin.css'

export default function Admin({ onClose, initialToken = null, initialUser = null }) {
  const [users, setUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(null)
  const [totalPosts, setTotalPosts] = useState(0)
  const [emuGamesCount, setEmuGamesCount] = useState(0)
  const [roms, setRoms] = useState([])
  const [postsByUser, setPostsByUser] = useState([])
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [adminToken, setAdminToken] = useState(() => initialToken || null)
  const [adminLoginUser, setAdminLoginUser] = useState(() => initialUser?.username || '')
  const [adminLoginPass, setAdminLoginPass] = useState('')
  const [promoteUsername, setPromoteUsername] = useState('')
  const [romFile, setRomFile] = useState(null)
  const [romDescription, setRomDescription] = useState('')
  const [romCoverFile, setRomCoverFile] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [newIsAdmin, setNewIsAdmin] = useState(false)
  const [adminAuthUser, setAdminAuthUser] = useState('')
  const [adminAuthPass, setAdminAuthPass] = useState('')
  const [romConsole, setRomConsole] = useState('')
  const [uploadingRom, setUploadingRom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('users')
  const [toast, setToast] = useState(null)

  // Transaction History States
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [transactionSearch, setTransactionSearch] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [selectedReceiptTx, setSelectedReceiptTx] = useState(null)
  const [showRevenueBreakdown, setShowRevenueBreakdown] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)

  const totalPostsFromUsers = postsByUser.reduce((sum, row) => sum + (Number(row.post_count) || 0), 0)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    window.clearTimeout(showToast._timer)
    showToast._timer = window.setTimeout(() => setToast(null), 2600)
  }

  const consoles = [
    'NES', 'SNES', 'N64', 'GameCube', 'Wii', 'Wii U',
    'Game Boy', 'Game Boy Advance', 'Nintendo DS', 'Nintendo 3DS',
    'Genesis', 'Dreamcast', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5'
  ]

  const loadTransactions = async (token = adminToken) => {
    setTransactionsLoading(true)
    try {
      let txs = await getAdminTransactions(token)
      const existingIds = new Set((txs || []).map((t) => t.order_id))

      // Merge transactions recorded via gb_all_transactions (newer purchases)
      try {
        const localTx = JSON.parse(localStorage.getItem('gb_all_transactions') || '[]')
        if (Array.isArray(localTx) && localTx.length > 0) {
          const missing = localTx.filter((t) => !existingIds.has(t.order_id))
          if (missing.length > 0) {
            missing.forEach((t) => existingIds.add(t.order_id))
            txs = [...(txs || []), ...missing]
          }
        }
      } catch (e) {}

      // Also merge from gb_purchased_games (Game Library — may predate transaction recording)
      // Group individual game items by their orderId to reconstruct orders
      try {
        const purchasedGames = JSON.parse(localStorage.getItem('gb_purchased_games') || '[]')
        const loggedInUser = (() => {
          try { return JSON.parse(localStorage.getItem('gb_user') || '{}') } catch { return {} }
        })()

        if (Array.isArray(purchasedGames) && purchasedGames.length > 0) {
          // Group games by orderId
          const orderMap = new Map()
          purchasedGames.forEach((game) => {
            const oid = game.orderId || game.order_id || `GBX-LIB-${game.id}`
            if (!orderMap.has(oid)) {
              orderMap.set(oid, {
                order_id: oid,
                user_id: null,
                username: loggedInUser?.username || 'Game Library',
                profile_pic: null,
                items: [],
                total_amount: 0,
                payment_method: game.paymentMethod || 'Credit Card',
                status: 'completed',
                created_at: (() => {
                  if (game.purchaseDate) {
                    const d = new Date(game.purchaseDate)
                    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
                  }
                  return new Date().toISOString()
                })(),
              })
            }
            const order = orderMap.get(oid)
            order.items.push({
              id: game.id,
              title: game.title,
              coverUrl: game.coverUrl || game.cover_url || '',
              price: Number(game.price || 0),
              platform: game.platform || 'Digital Product',
              key: game.key || game.activation_key || '',
            })
            order.total_amount += Number(game.price || 0)
          })

          // Only add orders not already in the combined list
          orderMap.forEach((order) => {
            if (!existingIds.has(order.order_id)) {
              existingIds.add(order.order_id)
              order.total_amount = Math.round(order.total_amount * 100) / 100
              txs = [...(txs || []), order]
            }
          })
        }
      } catch (e) {
        console.error('Error merging purchased games into transactions:', e)
      }

      setTransactions(txs || [])
    } catch (err) {
      console.error('Error loading transactions:', err)
    } finally {
      setTransactionsLoading(false)
    }

  }

  // Load initial data
  useEffect(() => {
    loadData(adminToken)
  }, [adminToken])

  const loadData = async (token = adminToken) => {
    setLoading(true)
    try {
      // Get admin stats (users, posts, roms counts)
      const stats = await getAdminStats()
      setTotalUsers(Number(stats.total_users) || 0)
      setTotalPosts(stats.total_posts || 0)
      setEmuGamesCount(stats.total_roms || 0)

      // Get all users
      const allUsers = await getAdminUsersWithToken(token)
      setUsers(allUsers || [])

      // Get all ROMs
      const allRoms = await getAdminRoms()
      setRoms(allRoms || [])

      // Get posts by user
      const postsUsers = await getAdminPostsByUser()
      setPostsByUser(postsUsers || [])

      // Get transactions
      await loadTransactions(token)
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
    setLoading(false)
  }


  const handleAddUser = async () => {
    if (!newUsername.trim() || !newEmail.trim() || !newPassword) {
      showToast('Username, email and password are required', 'error')
      return
    }

    setLoading(true)
    try {
      if (newIsAdmin) {
        // Need admin credentials to create an admin user
        if (!adminAuthUser || !adminAuthPass) {
          showToast('Provide admin username and password to create an admin user', 'error')
          setLoading(false)
          return
        }
        // obtain token
        const tokenResp = await login({ username: adminAuthUser, password: adminAuthPass })
        if (!tokenResp || !tokenResp.access_token) {
          showToast('Admin login failed', 'error')
          setLoading(false)
          return
        }
        const payload = { username: newUsername, email: newEmail, password: newPassword, is_admin: true }
        const created = await createAdminUserWithToken(payload, tokenResp.access_token)
        if (created && !created.ok) {
          showToast('Failed to create admin user', 'error')
        } else {
          showToast('Admin user created', 'success')
          await loadData()
        }
      } else {
        // Create regular user via signup
        const res = await signup({ username: newUsername, email: newEmail, password: newPassword })
        if (res && res.id) {
          showToast('User created', 'success')
          await loadData()
        } else {
          showToast('Failed to create user', 'error')
        }
      }
    } catch (err) {
      console.error('Error creating user', err)
      showToast('Error creating user', 'error')
    } finally {
      setLoading(false)
      setNewUsername('')
      setNewEmail('')
      setNewPassword('')
      setNewIsAdmin(false)
      setAdminAuthUser('')
      setAdminAuthPass('')
    }
  }

  const handleRemoveUser = async (userId) => {
    if (!confirm('Delete this user and all their posts? This action cannot be undone.')) return
    setLoading(true)
    try {
      // Try delete without token first
      const res = await deleteAdminUser(userId)
      if (res && res.ok) {
        await loadData()
        showToast('User deleted', 'success')
        setLoading(false)
        return
      }

      // If not allowed, prompt for admin credentials and retry
      const adminUser = prompt('Admin username (required to authorize deletion):')
      if (!adminUser) {
        showToast('Admin username required', 'error')
        setLoading(false)
        return
      }
      const adminPass = prompt('Admin password:')
      if (!adminPass) {
        showToast('Admin password required', 'error')
        setLoading(false)
        return
      }
      const tokenResp = await login({ username: adminUser, password: adminPass })
      if (!tokenResp || !tokenResp.access_token) {
        showToast('Admin login failed', 'error')
        setLoading(false)
        return
      }
      const resc = await deleteAdminUserWithToken(userId, tokenResp.access_token)
      if (resc && resc.ok) {
        await loadData()
        showToast('User deleted', 'success')
      } else {
        showToast('Failed to delete user', 'error')
      }
    } catch (err) {
      console.error('Error deleting user', err)
      showToast('Error deleting user', 'error')
    }
    setLoading(false)
  }

  const handleAddRom = async () => {
    if (!romFile || !romConsole) {
      showToast('Please select a ROM file and console', 'error')
      return
    }
    
    setUploadingRom(true)
    try {
      const formData = new FormData()
      formData.append('file', romFile)
      formData.append('console', romConsole)
      if (romDescription) formData.append('description', romDescription)
      if (romCoverFile) formData.append('cover', romCoverFile)
      
      const response = await fetch('http://localhost:8001/admin/roms/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setRomFile(null)
        setRomCoverFile(null)
        setRomDescription('')
        setRomConsole('')
        // Reload ROM list
        await loadData()
        showToast(`ROM uploaded: ${data.filename}`, 'success')
      } else {
        let txt = 'Failed to upload ROM'
        try { txt = await response.text() } catch (e) {}
        showToast(txt || 'Failed to upload ROM', 'error')
      }
    } catch (error) {
      console.error('Error uploading ROM:', error)
      showToast('Error uploading ROM', 'error')
    } finally {
      setUploadingRom(false)
    }
  }

  const uniqueUsersList = useMemo(() => {
    const set = new Set()
    transactions.forEach((tx) => {
      if (tx.username) set.add(tx.username)
    })
    return Array.from(set).sort()
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // User filter
        if (userFilter !== 'all' && tx.username !== userFilter) return false
        // Payment filter
        if (paymentFilter !== 'all') {
          const method = (tx.payment_method || '').toLowerCase()
          if (paymentFilter === 'card' && !method.includes('card') && !method.includes('visa') && !method.includes('mastercard')) return false
          if (paymentFilter === 'paypal' && !method.includes('paypal')) return false
          if (paymentFilter === 'wallet' && !method.includes('wallet')) return false
        }
        // Search query
        if (transactionSearch.trim()) {
          const q = transactionSearch.toLowerCase()
          const orderMatch = (tx.order_id || '').toLowerCase().includes(q)
          const userMatch = (tx.username || '').toLowerCase().includes(q)
          const itemsMatch = (tx.items || []).some(
            (it) => (it.title || '').toLowerCase().includes(q) || (it.key || '').toLowerCase().includes(q)
          )
          if (!orderMatch && !userMatch && !itemsMatch) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        }
        if (sortOrder === 'oldest') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0)
        }
        if (sortOrder === 'highest') {
          return (b.total_amount || 0) - (a.total_amount || 0)
        }
        if (sortOrder === 'lowest') {
          return (a.total_amount || 0) - (b.total_amount || 0)
        }
        return 0
      })
  }, [transactions, userFilter, paymentFilter, transactionSearch, sortOrder])

  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + (Number(tx.total_amount) || 0), 0)
  }, [transactions])

  const revenueBreakdown = useMemo(() => {
    const paymentTotals = new Map()

    transactions.forEach((tx) => {
      const rawMethod = (tx.payment_method || 'Credit Card').toLowerCase()
      let label = 'Credit Card'

      if (rawMethod.includes('wallet')) {
        label = 'GameBoxd Wallet'
      } else if (rawMethod.includes('paypal')) {
        label = 'PayPal'
      }

      const entry = paymentTotals.get(label) || { label, total: 0, orders: 0 }
      entry.total += Number(tx.total_amount) || 0
      entry.orders += 1
      paymentTotals.set(label, entry)
    })

    return [...paymentTotals.values()].sort((a, b) => b.total - a.total)
  }, [transactions])

  const uniqueBuyersCount = useMemo(() => {
    const set = new Set()
    transactions.forEach((t) => t.username && set.add(t.username))
    return set.size
  }, [transactions])

  const avgOrderValue = useMemo(() => {
    if (!transactions.length) return 0
    return totalRevenue / transactions.length
  }, [totalRevenue, transactions.length])

  const handleCopyKey = (keyString) => {
    if (!keyString) return
    navigator.clipboard.writeText(keyString)
    setCopiedKey(keyString)
    showToast(`Key copied: ${keyString}`, 'success')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <div className="admin-header-actions">
            {adminToken && <span className="admin-session-badge">Signed in as {adminLoginUser || 'Admin'}</span>}
            {adminToken && (
              <button
                className="admin-btn-secondary admin-btn-small"
                onClick={() => {
                  setAdminToken(null)
                  setUsers([])
                  setAdminLoginPass('')
                }}
              >
                Logout
              </button>
            )}
            <button onClick={onClose} className="admin-close-btn">
              <X size={20} />
            </button>
          </div>
        </div>

        {toast && (
          <div className={`admin-toast admin-toast-${toast.type}`} role="status" aria-live="polite">
            {toast.message}
          </div>
        )}

        {/* If not logged in as admin, show login form first */}
        {!adminToken ? (
          <div className="admin-login">
            <h3>Admin Login</h3>
            <p className="admin-login-help">Login required to view users, roles, and admin actions.</p>
            <input placeholder="Username" value={adminLoginUser} onChange={(e) => setAdminLoginUser(e.target.value)} className="admin-input" />
            <input placeholder="Password" type="password" value={adminLoginPass} onChange={(e) => setAdminLoginPass(e.target.value)} className="admin-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={async () => {
                  setLoading(true)
                  try {
                    const resp = await login({ username: adminLoginUser, password: adminLoginPass })
                    if (resp && resp.access_token) {
                      setAdminToken(resp.access_token)
                      await loadData(resp.access_token)
                    } else {
                      alert('Login failed')
                    }
                  } catch (e) {
                    console.error(e)
                    alert('Login error')
                  }
                  setLoading(false)
                }}
                className="admin-btn-add"
              >
                Login
              </button>
              <button onClick={() => { setAdminLoginUser(''); setAdminLoginPass('') }} className="admin-btn-refresh">Clear</button>
            </div>
          </div>
        ) : (
          <>
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button
              className={`admin-tab ${activeTab === 'admins' ? 'active' : ''}`}
              onClick={() => setActiveTab('admins')}
            >
              Admins
            </button>
            <button
              className={`admin-tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions ({transactions.length})
            </button>
            <button
              className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Stats
            </button>
          </div>

        <div className="admin-content" key={activeTab}>
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h3>User Management</h3>
                <button onClick={loadData} className="admin-refresh-btn" disabled={loading}>
                  <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                </button>
              </div>

              <div className="admin-add-user">
                <input
                  type="text"
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="admin-input"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="admin-input"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="admin-input"
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={newIsAdmin} onChange={(e) => setNewIsAdmin(e.target.checked)} /> Make Admin
                </label>
                {newIsAdmin && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: '#bbb' }}>Provide admin credentials to authorize creation:</div>
                    <input type="text" placeholder="Admin username" value={adminAuthUser} onChange={(e) => setAdminAuthUser(e.target.value)} className="admin-input" />
                    <input type="password" placeholder="Admin password" value={adminAuthPass} onChange={(e) => setAdminAuthPass(e.target.value)} className="admin-input" />
                  </div>
                )}
                <button onClick={handleAddUser} className="admin-btn-add">
                  <Plus size={16} /> Add User
                </button>
              </div>

              <div className="admin-users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Created</th>
                      <th>Admin</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`role-pill ${user.is_admin ? 'role-pill-admin' : 'role-pill-user'}`}>
                              {user.is_admin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleRemoveUser(user.id)}
                              className="admin-btn-delete"
                              title="Remove user"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={async () => {
                                if (!adminToken) {
                                  alert('Admin login required')
                                  return
                                }
                                const targetIsAdmin = !!user.is_admin
                                const resp = await setUserAdminFlag(user.id, !targetIsAdmin, adminToken)
                                if (resp && resp.id) {
                                  alert('Updated')
                                  await loadData()
                                } else {
                                  alert('Failed to update')
                                }
                              }}
                              className="admin-btn-secondary admin-btn-small"
                              style={{ marginLeft: 8 }}
                            >{user.is_admin ? 'Demote' : 'Promote'}</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-user-count">
                Total Users: <strong>{users.length}</strong>
              </div>
            </div>
          )}

          {/* Admins Tab */}
          {activeTab === 'admins' && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h3>Admin Management</h3>
                <button onClick={loadData} className="admin-refresh-btn" disabled={loading}>
                  <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Promote existing user to admin (enter username)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="admin-input" placeholder="username" value={promoteUsername} onChange={(e) => setPromoteUsername(e.target.value)} />
                  <button className="admin-btn-add" onClick={async () => {
                    if (!promoteUsername) return alert('Enter username')
                    const found = users.find(u => u.username === promoteUsername)
                    if (!found) return alert('User not found; refresh and try again')
                    if (!adminToken) return alert('Admin login required')
                    const res = await setUserAdminFlag(found.id, true, adminToken)
                    if (res && res.id) {
                      alert('User promoted to admin')
                      setPromoteUsername('')
                      await loadData()
                    } else {
                      alert('Failed to promote user')
                    }
                  }}>Promote</button>
                </div>
              </div>

              <div>
                <h4>Current Admins</h4>
                <div className="admin-users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.is_admin).map((u) => (
                      <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="admin-btn-delete" onClick={async () => {
                            if (!confirm(`Demote ${u.username} from admin?`)) return
                            if (!adminToken) return alert('Admin login required')
                            const res = await setUserAdminFlag(u.id, false, adminToken)
                            if (res && res.id) {
                              alert('User demoted')
                              await loadData()
                            } else {
                              alert('Failed to demote')
                            }
                          }}>Demote</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

              <div className="admin-user-count">
                Total Users: <strong>{totalUsers === null ? '—' : totalUsers}</strong>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="admin-section admin-transactions-section">
              <div className="admin-section-header">
                <div>
                  <h3>Customer Transaction History</h3>
                  <p className="admin-section-subtitle">
                    Complete purchase log of every user order, activation keys, and payment records.
                  </p>
                </div>
                <button
                  onClick={() => loadTransactions(adminToken)}
                  className="admin-refresh-btn"
                  disabled={transactionsLoading}
                >
                  <RefreshCw
                    size={16}
                    style={{ animation: transactionsLoading ? 'spin 1s linear infinite' : 'none' }}
                  />
                  Refresh Orders
                </button>
              </div>

              {/* Summary Metric KPI Cards */}
              <div className="admin-tx-kpi-grid">
                <div
                  className="admin-tx-kpi-card kpi-revenue clickable-metric"
                  onClick={() => setShowRevenueBreakdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setShowRevenueBreakdown(true)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="View total revenue breakdown"
                >
                  <div className="kpi-icon-wrap">
                    <DollarSign size={20} />
                  </div>
                  <div className="kpi-body">
                    <div className="kpi-value">${totalRevenue.toFixed(2)}</div>
                    <div className="kpi-label">Total Revenue</div>
                  </div>
                </div>

                <div className="admin-tx-kpi-card kpi-orders">
                  <div className="kpi-icon-wrap">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="kpi-body">
                    <div className="kpi-value">{transactions.length}</div>
                    <div className="kpi-label">Completed Orders</div>
                  </div>
                </div>

                <div className="admin-tx-kpi-card kpi-buyers">
                  <div className="kpi-icon-wrap">
                    <UsersIcon size={20} />
                  </div>
                  <div className="kpi-body">
                    <div className="kpi-value">{uniqueBuyersCount}</div>
                    <div className="kpi-label">Unique Buyers</div>
                  </div>
                </div>

                <div className="admin-tx-kpi-card kpi-aov">
                  <div className="kpi-icon-wrap">
                    <Receipt size={20} />
                  </div>
                  <div className="kpi-body">
                    <div className="kpi-value">${avgOrderValue.toFixed(2)}</div>
                    <div className="kpi-label">Average Order Value</div>
                  </div>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="admin-tx-toolbar">
                <div className="admin-tx-search">
                  <Search size={16} className="tx-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by user, order ID, or game title..."
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    className="admin-input tx-search-input"
                  />
                  {transactionSearch && (
                    <button
                      className="tx-clear-search"
                      onClick={() => setTransactionSearch('')}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="admin-tx-filters">
                  <div className="tx-filter-group">
                    <label>Customer:</label>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="admin-select tx-select"
                    >
                      <option value="all">All Users ({uniqueUsersList.length})</option>
                      {uniqueUsersList.map((uname) => (
                        <option key={uname} value={uname}>
                          {uname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="tx-filter-group">
                    <label>Payment:</label>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="admin-select tx-select"
                    >
                      <option value="all">All Payment Methods</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="wallet">GameBoxd Wallet</option>
                    </select>
                  </div>

                  <div className="tx-filter-group">
                    <label>Sort:</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="admin-select tx-select"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Amount</option>
                      <option value="lowest">Lowest Amount</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="admin-users-table admin-tx-table-wrap">
                <table className="admin-tx-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Games Purchased</th>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => {
                        const itemsList = tx.items || []
                        return (
                          <tr key={tx.order_id || tx.id} className="tx-table-row">
                            <td>
                              <span className="tx-order-badge">{tx.order_id}</span>
                            </td>
                            <td>
                              <div className="tx-user-cell">
                                <div className="tx-user-avatar">
                                  {tx.profile_pic ? (
                                    <img src={tx.profile_pic} alt={tx.username} />
                                  ) : (
                                    <span>{(tx.username || 'G').charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <span className="tx-user-name">@{tx.username}</span>
                              </div>
                            </td>
                            <td>
                              <div className="tx-items-cell">
                                <div className="tx-items-covers">
                                  {itemsList.slice(0, 3).map((it, idx) => (
                                    <img
                                      key={idx}
                                      src={it.coverUrl || '/covers/donkey-kong-country-snes.png'}
                                      alt={it.title}
                                      className="tx-item-thumb"
                                      title={it.title}
                                    />
                                  ))}
                                  {itemsList.length > 3 && (
                                    <span className="tx-items-more">+{itemsList.length - 3}</span>
                                  )}
                                </div>
                                <div className="tx-items-info">
                                  <span className="tx-items-title">
                                    {itemsList[0]?.title || 'Game Purchase'}
                                    {itemsList.length > 1 && ` +${itemsList.length - 1} more`}
                                  </span>
                                  <span className="tx-items-platform">
                                    {itemsList[0]?.platform || 'Digital Product'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="tx-payment-pill" title={tx.payment_method}>
                                <CreditCard size={13} style={{ marginRight: 5, verticalAlign: -1 }} />
                                {tx.payment_method?.includes('Wallet')
                                  ? 'Wallet'
                                  : tx.payment_method?.includes('PayPal')
                                  ? 'PayPal'
                                  : 'Credit Card'}
                              </span>
                            </td>
                            <td>
                              <span className="tx-amount-badge">
                                ${Number(tx.total_amount || 0).toFixed(2)}
                              </span>
                            </td>
                            <td>
                              <span className="tx-date-cell">
                                {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                              </span>
                            </td>
                            <td>
                              <span className="tx-status-pill">
                                <Check size={12} /> Completed
                              </span>
                            </td>
                            <td>
                              <button
                                className="admin-btn-secondary admin-btn-small tx-view-btn"
                                onClick={() => setSelectedReceiptTx(tx)}
                                title="View order receipt & game activation keys"
                              >
                                <Eye size={14} /> Details
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', color: '#888', padding: '32px' }}>
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-user-count">
                Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> orders
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="admin-section">
              <h3>Statistics</h3>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="stat-number">{totalUsers === null ? '—' : totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div
                  className="admin-stat-card clickable-metric"
                  onClick={() => setShowRevenueBreakdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setShowRevenueBreakdown(true)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="View total revenue breakdown"
                >
                  <div className="stat-number">{totalRevenue ? `$${totalRevenue.toFixed(2)}` : '$0.00'}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-number">{transactions.length}</div>
                  <div className="stat-label">Orders Placed</div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-number">{totalPostsFromUsers || totalPosts}</div>
                  <div className="stat-label">Total Posts</div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-number">{emuGamesCount}</div>
                  <div className="stat-label">ROM Files</div>
                </div>
              </div>
              <button onClick={loadData} className="admin-btn-refresh">
                <RefreshCw size={16} /> Refresh Stats
              </button>

              <div className="admin-section" style={{ marginTop: 24 }}>
                <div className="admin-section-header">
                  <h3>Posts by User</h3>
                  <button onClick={loadData} className="admin-refresh-btn" disabled={loading}>
                    <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                  </button>
                </div>
                <div className="admin-users-table">
                  <table className="posts-by-user-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Post Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postsByUser.length > 0 ? (
                        postsByUser.map((row) => (
                          <tr key={row.user_id}>
                            <td>{row.username}</td>
                            <td>{row.post_count}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" style={{ textAlign: 'center', color: '#888' }}>
                            No post data found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-roms-list">
                <h4>ROM Inventory ({roms.length} files)</h4>
                {roms.length > 0 ? (
                  <div className="roms-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Filename</th>
                          <th>Size</th>
                          <th>Description</th>
                          <th>Cover</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roms.map((rom) => (
                          <tr key={rom.filename}>
                            <td>{rom.filename}</td>
                            <td>{(rom.size / 1024 / 1024).toFixed(2)} MB</td>
                            <td style={{ maxWidth: 320 }}>{rom.description || ''}</td>
                            <td>
                              {rom.cover_url ? (
                                <img src={rom.cover_url} alt="cover" style={{ height: 48, objectFit: 'cover' }} />
                              ) : (
                                <span style={{ color: '#888' }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                    No ROMs found in public/roms/ directory
                  </p>
                )}
              </div>

              <p className="admin-rom-info">
                Stats and ROM inventory are shown together here. ROMs are managed externally in public/roms/.
              </p>
            </div>
          )}
        </div>
          </>
        )}

        {/* Revenue Breakdown Modal */}
        {showRevenueBreakdown && (
          <div className="tx-receipt-overlay" onClick={() => setShowRevenueBreakdown(false)}>
            <div className="tx-receipt-modal revenue-breakdown-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tx-receipt-header">
                <div>
                  <span className="tx-receipt-badge">Revenue Breakdown</span>
                  <h3>Total Revenue</h3>
                  <div className="tx-receipt-meta">
                    {transactions.length} completed orders • ${totalRevenue.toFixed(2)} total
                  </div>
                </div>
                <button
                  className="admin-close-btn"
                  onClick={() => setShowRevenueBreakdown(false)}
                  title="Close revenue breakdown"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="tx-receipt-body">
                <div className="tx-receipt-summary-box">
                  <div className="tx-receipt-row">
                    <span>Gross revenue</span>
                    <strong>${totalRevenue.toFixed(2)}</strong>
                  </div>
                  <div className="tx-receipt-row">
                    <span>Transactions</span>
                    <strong>{transactions.length}</strong>
                  </div>
                  <div className="tx-receipt-row">
                    <span>Average order value</span>
                    <strong>${(transactions.length ? totalRevenue / transactions.length : 0).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="tx-receipt-section-title">By payment method</div>
                <div className="revenue-breakdown-list">
                  {revenueBreakdown.length > 0 ? (
                    revenueBreakdown.map((entry) => (
                      <div key={entry.label} className="revenue-breakdown-row">
                        <div className="revenue-breakdown-label-wrap">
                          <span className="revenue-breakdown-label">{entry.label}</span>
                          <span className="revenue-breakdown-orders">{entry.orders} orders</span>
                        </div>
                        <div className="revenue-breakdown-amount-wrap">
                          <span className="revenue-breakdown-amount">${entry.total.toFixed(2)}</span>
                          <span className="revenue-breakdown-share">
                            {totalRevenue > 0 ? `${((entry.total / totalRevenue) * 100).toFixed(1)}%` : '0.0%'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="revenue-breakdown-empty">No transaction data available.</div>
                  )}
                </div>
              </div>

              <div className="tx-receipt-footer">
                <button className="admin-btn-secondary" onClick={() => setShowRevenueBreakdown(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt & Key Details Modal */}
        {selectedReceiptTx && (
          <div className="tx-receipt-overlay" onClick={() => setSelectedReceiptTx(null)}>
            <div className="tx-receipt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tx-receipt-header">
                <div>
                  <span className="tx-receipt-badge">Verified Order</span>
                  <h3>{selectedReceiptTx.order_id}</h3>
                  <div className="tx-receipt-meta">
                    Customer: <strong>@{selectedReceiptTx.username}</strong> &bull;{' '}
                    {selectedReceiptTx.created_at
                      ? new Date(selectedReceiptTx.created_at).toLocaleString()
                      : 'Recently'}
                  </div>
                </div>
                <button
                  className="admin-close-btn"
                  onClick={() => setSelectedReceiptTx(null)}
                  title="Close receipt"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="tx-receipt-body">
                <div className="tx-receipt-section-title">Purchased Games & Keys</div>
                <div className="tx-receipt-items">
                  {(selectedReceiptTx.items || []).map((item, idx) => (
                    <div key={idx} className="tx-receipt-item-card">
                      <img
                        src={item.coverUrl || '/covers/donkey-kong-country-snes.png'}
                        alt={item.title}
                        className="tx-receipt-item-cover"
                      />
                      <div className="tx-receipt-item-details">
                        <div className="tx-receipt-item-top">
                          <h4>{item.title}</h4>
                          <span className="tx-receipt-item-price">
                            ${Number(item.price || 0).toFixed(2)}
                          </span>
                        </div>
                        <span className="tx-receipt-platform-badge">
                          {item.platform || 'Digital Product'}
                        </span>
                        <div className="tx-key-box">
                          <span className="tx-key-label">Activation Key:</span>
                          <code className="tx-key-code">{item.key || 'GBXD-AUTO-GEN-KEY'}</code>
                          <button
                            className="tx-key-copy-btn"
                            onClick={() => handleCopyKey(item.key)}
                            title="Copy activation key"
                          >
                            {copiedKey === item.key ? <Check size={14} color="#7ef7c9" /> : <Copy size={14} />}
                            {copiedKey === item.key ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="tx-receipt-summary-box">
                  <div className="tx-receipt-row">
                    <span>Customer Account</span>
                    <strong>@{selectedReceiptTx.username}</strong>
                  </div>
                  <div className="tx-receipt-row">
                    <span>Payment Method</span>
                    <strong>{selectedReceiptTx.payment_method || 'Credit Card'}</strong>
                  </div>
                  <div className="tx-receipt-row">
                    <span>Payment Status</span>
                    <strong style={{ color: '#7ef7c9' }}>Paid & Delivered</strong>
                  </div>
                  <div className="tx-receipt-divider" />
                  <div className="tx-receipt-row tx-receipt-total">
                    <span>Total Amount</span>
                    <span className="tx-receipt-total-val">
                      ${Number(selectedReceiptTx.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tx-receipt-footer">
                <button
                  className="admin-btn-secondary"
                  onClick={() => setSelectedReceiptTx(null)}
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
