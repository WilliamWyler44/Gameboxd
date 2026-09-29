const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001'

export async function signup({ username, email, password, avatarFile = null }) {
  if (avatarFile) {
    const form = new FormData()
    form.append('username', username)
    form.append('email', email)
    form.append('password', password)
    form.append('avatar', avatarFile)
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      body: form,
    })
    return res.json()
  }
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })
  return res.json()
}

export async function login({ username, password }) {
  const params = new URLSearchParams()
  params.set('username', username)
  params.set('password', password)
  const res = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  return res.json()
}

export async function listGames(token) {
  const res = await fetch(`${API_BASE}/games`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getActivity(token) {
  const res = await fetch(`${API_BASE}/activity`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getUserProfile(username, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`, { headers })
  return res.json()
}

export async function getUserFollowStatus(token, username) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}/follow-status`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function followUser(token, username) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function unfollowUser(token, username) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}/follow`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getFollowNotifications(token, limit = 20) {
  const q = new URLSearchParams({ limit: String(limit) })
  const res = await fetch(`${API_BASE}/me/notifications/followed-posts?${q.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getFollowNotificationsUnreadCount(token) {
  const res = await fetch(`${API_BASE}/me/notifications/followed-posts/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function markFollowNotificationsReadAll(token) {
  const res = await fetch(`${API_BASE}/me/notifications/followed-posts/read-all`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getFollowingFeed(token, limit = 20) {
  const q = new URLSearchParams({ limit: String(limit) })
  const res = await fetch(`${API_BASE}/me/feed/following?${q.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function searchUsers(searchTerm, limit = 6) {
  try {
    const q = new URLSearchParams({ q: searchTerm, limit: String(limit) })
    const res = await fetch(`${API_BASE}/users/search?${q.toString()}`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function updateMyProfile(token, payload) {
  const res = await fetch(`${API_BASE}/me/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function uploadAvatar(token, file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  return res.json()
}

export async function getGameReviews(rawgId) {
  const res = await fetch(`${API_BASE}/games/rawg/${rawgId}/reviews`)
  return res.json()
}

export async function addGame(token, { rawg_id, status = 'library', review = null, rating = null }) {
  const res = await fetch(`${API_BASE}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rawg_id, status, review, rating }),
  })
  return res.json()
}

export async function updateGame(token, id, payload) {
  const res = await fetch(`${API_BASE}/games/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function deleteGame(token, id) {
  const res = await fetch(`${API_BASE}/games/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getPostComments(postId, sort) {
  const q = sort ? `?sort=${encodeURIComponent(sort)}` : ''
  const res = await fetch(`${API_BASE}/posts/${postId}/comments${q}`)
  return res.json()
}

export async function addPostComment(token, postId, { content, parent_id = null }) {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content, parent_id }),
  })
  return res.json()
}

export async function getPostReactions(postId, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined
  const res = await fetch(`${API_BASE}/posts/${postId}/reactions`, { headers })
  return res.json()
}

export async function reactToPost(token, postId, value) {
  const res = await fetch(`${API_BASE}/posts/${postId}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ value }),
  })
  return res.json()
}

export async function reactToComment(token, commentId, value) {
  const res = await fetch(`${API_BASE}/comments/${commentId}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ value }),
  })
  return res.json()
}

// Admin endpoints
export async function getAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`)
    if (!res.ok) return { total_users: 0, total_posts: 0, total_roms: 0 }
    return res.json()
  } catch {
    return { total_users: 0, total_posts: 0, total_roms: 0 }
  }
}

export async function getAdminUsers() {
  return getAdminUsersWithToken(null)
}

export async function getAdminUsersWithToken(token = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await fetch(`${API_BASE}/admin/users`, { headers })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function setUserAdminFlag(userId, isAdmin, token) {
  try {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/admin?is_admin=${isAdmin ? '1' : '0'}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed')
    return res.json()
  } catch (e) {
    console.error('setUserAdminFlag error', e)
    return { ok: false }
  }
}

export async function getAdminRoms() {
  try {
    const res = await fetch(`${API_BASE}/admin/roms`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getAdminPostsByUser() {
  try {
    const res = await fetch(`${API_BASE}/admin/posts_by_user`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function createAdminUserWithToken(payload, token) {
  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(txt || 'Create failed')
    }
    return res.json()
  } catch (e) {
    console.error('createAdminUserWithToken error', e)
    return { ok: false, error: String(e) }
  }
}

export async function deleteAdminUser(userId) {
  return deleteAdminUserWithToken(userId, null)
}

export async function deleteAdminUserWithToken(userId, token = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers
    })
    if (!res.ok) throw new Error('Delete failed')
    return res.json()
  } catch (e) {
    console.error('deleteAdminUser error', e)
    return { ok: false }
  }
}

export async function getAdminTransactions(token = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await fetch(`${API_BASE}/admin/transactions`, { headers })
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    console.error('getAdminTransactions error', e)
    return []
  }
}

export async function createTransaction(payload, token = null) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return res.json()
  } catch (e) {
    console.error('createTransaction error', e)
    return null
  }
}

