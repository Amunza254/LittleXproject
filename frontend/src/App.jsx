import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, UserPlus, LogOut, Home, User } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', bio: '' });
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchFeed();
      fetchUsers();
    }
  }, [currentUser]);

  const fetchFeed = async () => {
    try {
      const response = await fetch(`${API_URL}/feed/${currentUser.id}`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data.filter(u => u.id !== currentUser.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        setView('feed');
        setLoginData({ username: '', password: '' });
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        setView('feed');
        setRegisterData({ username: '', email: '', password: '', bio: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser.id,
          content: newPost
        })
      });
      if (response.ok) {
        setNewPost('');
        fetchFeed();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id })
      });
      fetchFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    try {
      await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser.id,
          content: text
        })
      });
      setCommentText({ ...commentText, [postId]: '' });
      fetchFeed();
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      await fetch(`${API_URL}/friends/${currentUser.id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_id: friendId })
      });
      const response = await fetch(`${API_URL}/users/${currentUser.id}`);
      const updatedUser = await response.json();
      setCurrentUser(updatedUser);
      fetchUsers();
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setPosts([]);
    setUsers([]);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">SocialBook</h1>
            <p className="text-gray-600">Connect with friends and the world</p>
          </div>

          {view === 'login' ? (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
              <button
                onClick={() => setView('register')}
                disabled={loading}
                className="w-full text-indigo-600 py-2 font-medium hover:underline transition"
              >
                Create new account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                disabled={loading}
              />
              <textarea
                placeholder="Bio (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition resize-none"
                value={registerData.bio}
                onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                rows="2"
                disabled={loading}
              />
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
              <button
                onClick={() => setView('login')}
                disabled={loading}
                className="w-full text-indigo-600 py-2 font-medium hover:underline transition"
              >
                Already have an account?
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer" onClick={() => setView('feed')}>
            SocialBook
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('feed')}
              className={`p-2 rounded-lg transition ${
                view === 'feed' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Home"
            >
              <Home size={24} />
            </button>
            <button
              onClick={() => setView('profile')}
              className={`p-2 rounded-lg transition ${
                view === 'profile' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Profile"
            >
              <User size={24} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {view === 'feed' && (
            <>
              {/* Create Post */}
              <div className="bg-white rounded-lg shadow p-4 card-hover">
                <textarea
                  placeholder={`What's on your mind, ${currentUser.username}?`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
                  rows="3"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <button
                  onClick={handleCreatePost}
                  className="mt-3 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Post
                </button>
              </div>

              {/* Posts Feed */}
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow fade-in">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center font-semibold text-indigo-700">
                        {post.author_username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{post.author_username}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  </div>
                  <div className="px-4 py-2 border-t border-b flex gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        post.likes.includes(currentUser.id)
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={post.likes.includes(currentUser.id) ? 'currentColor' : 'none'}
                      />
                      <span>{post.likes.length}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                      <MessageCircle size={20} />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {post.comment_details && post.comment_details.length > 0 && (
                    <div className="p-4 border-b bg-gray-50 space-y-3">
                      {post.comment_details.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {comment.author_username[0].toUpperCase()}
                          </div>
                          <div className="flex-1 bg-white rounded-lg p-2">
                            <p className="font-semibold text-sm">{comment.author_username}</p>
                            <p className="text-gray-700 text-sm">{comment.content}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        value={commentText[post.id] || ''}
                        onChange={(e) =>
                          setCommentText({ ...commentText, [post.id]: e.target.value })
                        }
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {posts.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500">
                    No posts yet. Create your first post or add some friends!
                  </p>
                </div>
              )}
            </>
          )}

          {view === 'profile' && (
            <div className="bg-white rounded-lg shadow p-6 fade-in">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-4xl text-indigo-700 mx-auto mb-4">
                  {currentUser.username[0].toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold">{currentUser.username}</h2>
                <p className="text-gray-600">{currentUser.email}</p>
                {currentUser.bio && <p className="mt-2 text-gray-700">{currentUser.bio}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">{currentUser.posts.length}</p>
                  <p className="text-gray-600">Posts</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">
                    {currentUser.friends.length}
                  </p>
                  <p className="text-gray-600">Friends</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* People you may know */}
          <div className="bg-white rounded-lg shadow p-4 card-hover">
            <h3 className="font-bold text-lg mb-4">People you may know</h3>
            <div className="space-y-3">
              {users
                .filter((u) => !currentUser.friends.includes(u.id))
                .slice(0, 5)
                .map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.username}</p>
                        {user.bio && (
                          <p className="text-xs text-gray-500 truncate">{user.bio}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend(user.id)}
                      className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition flex-shrink-0"
                    >
                      <UserPlus size={18} />
                    </button>
                  </div>
                ))}
              {users.filter((u) => !currentUser.friends.includes(u.id)).length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No suggestions available
                </p>
              )}
            </div>
          </div>

          {/* Your Friends */}
          <div className="bg-white rounded-lg shadow p-4 card-hover">
            <h3 className="font-bold text-lg mb-4">
              Your Friends ({currentUser.friends.length})
            </h3>
            <div className="space-y-3">
              {users
                .filter((u) => currentUser.friends.includes(u.id))
                .map((friend) => (
                  <div key={friend.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center font-semibold text-sm">
                      {friend.username[0].toUpperCase()}
                    </div>
                    <p className="font-medium text-sm">{friend.username}</p>
                  </div>
                ))}
              {currentUser.friends.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No friends yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}