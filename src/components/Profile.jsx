import { useEffect, useState } from 'react'
import {
  getUserProfile,
  updateMyProfile,
  uploadAvatar,
  getPostComments,
  addPostComment,
  getPostReactions,
  reactToPost,
  reactToComment,
  followUser,
  unfollowUser,
} from '../services/backendApi'
import './Profile.css'

export default function Profile({ username, token, isOwner, onBackToOwnProfile, onAuthExpired }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [picInput, setPicInput] = useState('')
  const [genresInput, setGenresInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [commentsByPost, setCommentsByPost] = useState({})
  const [commentDrafts, setCommentDrafts] = useState({})
  const [replyDrafts, setReplyDrafts] = useState({})
  const [activeReplyFor, setActiveReplyFor] = useState({})
  const [sendingKey, setSendingKey] = useState('')
  const [postReactions, setPostReactions] = useState({})
  const [commentsSort, setCommentsSort] = useState('new')
  const [visibleRootComments, setVisibleRootComments] = useState({})
  const [visibleReplies, setVisibleReplies] = useState({})
  const [followBusy, setFollowBusy] = useState(false)

  const isInvalidAuthPayload = (value) => {
    const detail = String(value?.detail || '').toLowerCase()
    return detail.includes('invalid authentication') || detail.includes('not authenticated') || detail.includes('token')
  }

  const handleAuthExpired = () => {
    setError('Session expired. Please log in again.')
    if (typeof onAuthExpired === 'function') {
      onAuthExpired()
    }
  }

  const formatWhen = (value) => {
    if (!value) return 'just now'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return 'just now'
    return d.toLocaleString()
  }

  const reactionSummaryText = (summary) => {
    if (!summary) return ''
    const likes = summary.likes || 0
    const dislikes = summary.dislikes || 0
    const my = summary.my_reaction || 0
    if (my === 1 && likes > 1) return `You and ${likes - 1} others liked this`
    if (my === 1 && likes === 1) return `You liked this`
    if (likes > 0) return `${likes} like${likes > 1 ? 's' : ''}`
    if (my === -1 && dislikes > 1) return `You and ${dislikes - 1} others disliked this`
    if (my === -1 && dislikes === 1) return `You disliked this`
    if (dislikes > 0) return `${dislikes} dislike${dislikes > 1 ? 's' : ''}`
    return ''
  }

  const loadPostComments = async (games = [], sort = null) => {
    const pairs = await Promise.all(
      games.map(async (g) => {
        try {
          const comments = await getPostComments(g.id, sort || commentsSort)
          return [g.id, Array.isArray(comments) ? comments : []]
        } catch (_e) {
          return [g.id, []]
        }
      })
    )
    setCommentsByPost(Object.fromEntries(pairs))

    const reactionPairs = await Promise.all(
      games.map(async (g) => {
        try {
          const summary = await getPostReactions(g.id, token)
          return [g.id, summary || { likes: 0, dislikes: 0, my_reaction: 0 }]
        } catch (_e) {
          return [g.id, { likes: 0, dislikes: 0, my_reaction: 0 }]
        }
      })
    )
    setPostReactions(Object.fromEntries(reactionPairs))
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getUserProfile(username, token)
      if (res?.detail) {
        if (isInvalidAuthPayload(res)) {
          handleAuthExpired()
          return
        }
        setError(res.detail || 'Could not load profile.')
        return
      }
      setProfile(res)
      setPicInput(res.profile_pic || '')
      setGenresInput((res.genres || []).join(', '))
      await loadPostComments(res.games || [], commentsSort)
    } catch (e) {
      setError('Could not load profile.')
    } finally {
      setLoading(false)
    }
  }

  // When sort mode changes, reload comments for current profile
  useEffect(() => {
    if (!profile) return
    loadPostComments(profile.games || [], commentsSort)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsSort])

  useEffect(() => {
    if (!username) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const save = async () => {
    if (!token) return
    const genres = genresInput.split(',').map((s) => s.trim()).filter(Boolean)
    try {
      const res = await updateMyProfile(token, { profile_pic: picInput || null, genres })
      setProfile(res)
      setEditMode(false)
    } catch (e) {
      setError('Could not update profile.')
    }
  }

  const toggleFollow = async () => {
    if (!token || !profile || isOwner) return
    setFollowBusy(true)
    setError('')
    try {
      const next = profile.is_following
        ? await unfollowUser(token, profile.username)
        : await followUser(token, profile.username)

      if (isInvalidAuthPayload(next)) {
        handleAuthExpired()
        return
      }

      if (next?.ok) {
        setProfile((prev) => ({
          ...(prev || {}),
          is_following: !!next.is_following,
          follower_count: Number(next.follower_count) || 0,
          following_count: Number(next.following_count) || 0,
        }))
      } else {
        setError(next?.detail || 'Could not update follow status.')
      }
    } catch (_e) {
      setError('Could not update follow status.')
    } finally {
      setFollowBusy(false)
    }
  }

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    setSelectedFile(f || null)
  }

  const upload = async () => {
    if (!token || !selectedFile) return
    setUploading(true)
    try {
      const res = await uploadAvatar(token, selectedFile)
      setProfile(res)
      setPicInput(res.profile_pic || '')
      setSelectedFile(null)
    } catch (e) {
      setError('Could not upload avatar.')
    } finally {
      setUploading(false)
    }
  }

  const submitComment = async (postId, parentId = null) => {
    if (!token) {
      setError('You must be logged in to comment.')
      return
    }

    const key = parentId ? `reply-${parentId}` : `post-${postId}`
    const content = parentId ? (replyDrafts[parentId] || '').trim() : (commentDrafts[postId] || '').trim()

    if (!content) return

    setSendingKey(key)
    setError('')
    try {
      const created = await addPostComment(token, postId, { content, parent_id: parentId })
      if (!created?.id) {
        setError(created?.detail || 'Could not send comment.')
        return
      }
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), created],
      }))
      if (parentId) {
        setReplyDrafts((prev) => ({ ...prev, [parentId]: '' }))
        setActiveReplyFor((prev) => ({ ...prev, [parentId]: false }))
        setVisibleReplies((prev) => ({ ...prev, [parentId]: (prev[parentId] || 2) + 1 }))
      } else {
        setCommentDrafts((prev) => ({ ...prev, [postId]: '' }))
        setVisibleRootComments((prev) => ({ ...prev, [postId]: (prev[postId] || 3) + 1 }))
      }
    } catch (_e) {
      setError('Could not send comment.')
    } finally {
      setSendingKey('')
    }
  }

  const togglePostReaction = async (postId, value) => {
    if (!token) {
      setError('You must be logged in to react.')
      return
    }
    try {
      const summary = await reactToPost(token, postId, value)
      if (summary?.likes !== undefined) {
        setPostReactions((prev) => ({ ...prev, [postId]: summary }))
      }
    } catch (_e) {
      setError('Could not update reaction.')
    }
  }

  const toggleCommentReaction = async (postId, commentId, value) => {
    if (!token) {
      setError('You must be logged in to react.')
      return
    }
    try {
      const summary = await reactToComment(token, commentId, value)
      if (summary?.likes === undefined) return
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((item) => (
          item.id === commentId
            ? {
                ...item,
                like_count: summary.likes,
                dislike_count: summary.dislikes,
                my_reaction: summary.my_reaction,
              }
            : item
        )),
      }))
    } catch (_e) {
      setError('Could not update reaction.')
    }
  }

  if (loading) return <div className="profile-panel">Loading profile...</div>
  if (error) return <div className="profile-panel error">{error}</div>
  if (!profile) return null

  return (
    <section className="profile-panel">
      {onBackToOwnProfile && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={onBackToOwnProfile} className="collection-primary-btn">← Back to Your Profile</button>
        </div>
      )}
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <img src={profile.profile_pic || '/covers/tetris-nes.svg'} alt={profile.username} className="profile-avatar" />
        </div>
        <div>
          <h2>{profile.username}</h2>
          <div className="profile-follow-stats">
            <span>{Number(profile.follower_count) || 0} followers</span>
            <span>{Number(profile.following_count) || 0} following</span>
          </div>
          {!isOwner ? (
            token ? (
              <button
                onClick={toggleFollow}
                className="collection-primary-btn profile-follow-btn"
                disabled={followBusy}
              >
                {followBusy ? 'Updating...' : profile.is_following ? 'Unfollow' : 'Follow'}
              </button>
            ) : (
              <p className="muted">Log in to follow users.</p>
            )
          ) : null}
          {editMode ? (
            <div className="profile-edit-form">
              <label>
                Upload profile picture
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
              {selectedFile ? (
                <div className="profile-upload-actions">
                  <button onClick={upload} className="collection-primary-btn" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
                </div>
              ) : null}

              <label>
                Or profile picture URL
                <input value={picInput} onChange={(e) => setPicInput(e.target.value)} />
              </label>

              <label>
                Favorite genres (comma separated)
                <input value={genresInput} onChange={(e) => setGenresInput(e.target.value)} />
              </label>
              <div className="profile-edit-actions">
                <button onClick={save} className="collection-primary-btn">Save</button>
                <button onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-meta">
              <p className="muted">Favorite genres: {(profile.genres || []).join(', ') || 'Not set'}</p>
              {isOwner ? <button onClick={() => setEditMode(true)} className="collection-primary-btn">Edit Profile</button> : null}
            </div>
          )}
        </div>
      </div>

      <div className="profile-collection">
        <h3>Recent Posts</h3>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ marginRight: 8 }}>Sort:</label>
          <select className="sort-select" value={commentsSort} onChange={(e) => setCommentsSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="top">Most liked</option>
            <option value="old">Oldest</option>
          </select>
        </div>
        <div className="recent-posts-feed">
          {(profile.games || []).map((g) => {
            // hide test comments created by automated tests (reactor_..., commenter_...)
            const rawComments = commentsByPost[g.id] || []
            const allComments = rawComments.filter((c) => !/^reactor_|^commenter_/.test(String(c.username || '')))
            const rootComments = allComments.filter((c) => !c.parent_id)
            const visibleRootCount = visibleRootComments[g.id] || 3
            const repliesByParent = allComments.reduce((acc, c) => {
              if (c.parent_id) {
                acc[c.parent_id] = acc[c.parent_id] || []
                acc[c.parent_id].push(c)
              }
              return acc
            }, {})
            const postReaction = postReactions[g.id] || { likes: 0, dislikes: 0, my_reaction: 0 }

            return (
              <article key={g.id} className="recent-post">
                <header className="recent-post-header">
                  <img
                    src={profile.profile_pic || '/covers/tetris-nes.svg'}
                    alt={profile.username}
                    className="recent-post-avatar"
                  />
                  <div className="recent-post-author-meta">
                    <strong>{profile.username}</strong>
                    <span>{formatWhen(g.added_at)} · {String(g.status || 'library').replace('_', ' ')}</span>
                  </div>
                </header>

                <div className="recent-post-body">
                  <p className="recent-post-text">{g.review || `${profile.username} added ${g.title} to their library.`}</p>

                  <div className="recent-post-game-card">
                    <img
                      src={g.cover_url || '/covers/tetris-nes.svg'}
                      alt={g.title}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/covers/tetris-nes.svg' }}
                    />
                    <div>
                      <h4>{g.title}</h4>
                      <p className="muted">Status: {String(g.status || 'library').replace('_', ' ')}</p>
                      {g.rating ? <p className="recent-post-rating">★ {g.rating}/10</p> : null}
                    </div>
                  </div>
                </div>

                <div className="post-reaction-row">
                  <button
                    type="button"
                    className={`post-react-btn ${postReaction.my_reaction === 1 ? 'active-like' : ''}`}
                    onClick={() => togglePostReaction(g.id, 1)}
                  >
                    Like · {postReaction.likes || 0}
                  </button>
                  <button
                    type="button"
                    className={`post-react-btn ${postReaction.my_reaction === -1 ? 'active-dislike' : ''}`}
                    onClick={() => togglePostReaction(g.id, -1)}
                  >
                    Dislike · {postReaction.dislikes || 0}
                  </button>
                </div>
                <div className="reaction-summary">{reactionSummaryText(postReaction)}</div>

                <div className="recent-post-comments">
                  {rootComments.slice(0, visibleRootCount).map((comment) => (
                    <div key={comment.id} className="post-comment-thread">
                      <div className="post-comment">
                        <img
                          src={comment.profile_pic || '/covers/tetris-nes.svg'}
                          alt={comment.username}
                          className="post-comment-avatar"
                        />
                        <div className="post-comment-content">
                          <div className="post-comment-bubble">
                            <strong>{comment.username}</strong>
                            <p>{comment.content}</p>
                          </div>
                          <div className="post-comment-meta">
                            <span>{formatWhen(comment.created_at)}</span>
                            <button type="button" onClick={() => toggleCommentReaction(g.id, comment.id, 1)} className={comment.my_reaction === 1 ? 'active-like' : ''}>Like {comment.like_count || 0}</button>
                            <button type="button" onClick={() => toggleCommentReaction(g.id, comment.id, -1)} className={comment.my_reaction === -1 ? 'active-dislike' : ''}>Dislike {comment.dislike_count || 0}</button>
                            <span className="reaction-summary">{reactionSummaryText({ likes: comment.like_count || 0, dislikes: comment.dislike_count || 0, my_reaction: comment.my_reaction || 0 })}</span>
                            {token ? (
                              <button
                                type="button"
                                onClick={() => setActiveReplyFor((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                              >
                                Reply
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {(repliesByParent[comment.id] || []).slice(0, visibleReplies[comment.id] || 2).map((reply) => (
                        <div key={reply.id} className="post-reply">
                          <img
                            src={reply.profile_pic || '/covers/tetris-nes.svg'}
                            alt={reply.username}
                            className="post-comment-avatar"
                          />
                          <div className="post-comment-content">
                            <div className="post-comment-bubble">
                              <strong>{reply.username}</strong>
                              <p>{reply.content}</p>
                            </div>
                            <div className="post-comment-meta">
                              <span>{formatWhen(reply.created_at)}</span>
                              <button type="button" onClick={() => toggleCommentReaction(g.id, reply.id, 1)} className={reply.my_reaction === 1 ? 'active-like' : ''}>Like {reply.like_count || 0}</button>
                              <button type="button" onClick={() => toggleCommentReaction(g.id, reply.id, -1)} className={reply.my_reaction === -1 ? 'active-dislike' : ''}>Dislike {reply.dislike_count || 0}</button>
                              <span className="reaction-summary">{reactionSummaryText({ likes: reply.like_count || 0, dislikes: reply.dislike_count || 0, my_reaction: reply.my_reaction || 0 })}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(repliesByParent[comment.id] || []).length > (visibleReplies[comment.id] || 2) ? (
                        <button
                          type="button"
                          className="post-load-more-btn"
                          onClick={() => setVisibleReplies((prev) => ({ ...prev, [comment.id]: (prev[comment.id] || 2) + 2 }))}
                        >
                          Load more replies
                        </button>
                      ) : null}

                      {activeReplyFor[comment.id] && token ? (
                        <div className="post-reply-input-row">
                          <input
                            value={replyDrafts[comment.id] || ''}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                            placeholder={`Reply to ${comment.username}...`}
                          />
                          <button
                            type="button"
                            className="collection-primary-btn"
                            onClick={() => submitComment(g.id, comment.id)}
                            disabled={sendingKey === `reply-${comment.id}`}
                          >
                            {sendingKey === `reply-${comment.id}` ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {rootComments.length > visibleRootCount ? (
                    <button
                      type="button"
                      className="post-load-more-btn"
                      onClick={() => setVisibleRootComments((prev) => ({ ...prev, [g.id]: (prev[g.id] || 3) + 3 }))}
                    >
                      Load more comments
                    </button>
                  ) : null}

                  <div className="post-comment-input-row">
                    <input
                      value={commentDrafts[g.id] || ''}
                      onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [g.id]: e.target.value }))}
                      placeholder={token ? 'Write a comment...' : 'Log in to comment'}
                      disabled={!token}
                    />
                    <button
                      type="button"
                      className="collection-primary-btn"
                      onClick={() => submitComment(g.id)}
                      disabled={!token || sendingKey === `post-${g.id}`}
                    >
                      {sendingKey === `post-${g.id}` ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
