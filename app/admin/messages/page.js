'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FiArrowLeft, FiMessageCircle, FiPaperclip, FiPlus, FiSend, FiSmile, FiX } from 'react-icons/fi';

export default function AdminMessagesPage() {
  const [adminUser, setAdminUser] = useState({ id: 'admin', name: 'Admin', role: 'admin' });
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const conversationsIntervalRef = useRef(null);
  const messagesIntervalRef = useRef(null);
  const router = useRouter();

  const emojis = ['😀', '😂', '😊', '😍', '🥰', '😎', '🤔', '😢', '😭', '😡', '👍', '👎', '👏', '🙏', '💪', '🎉', '🎊', '❤️', '💯', '🔥', '✨', '⭐', '✅', '❌', '📝', '📋', '📊', '💼', '🚀', '💡'];
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (adminUser) {
      fetchConversations();
      fetchAllUsers();
      // Reduced polling frequency to 10 seconds for conversations
      conversationsIntervalRef.current = setInterval(fetchConversations, 10000);
      return () => {
        if (conversationsIntervalRef.current) {
          clearInterval(conversationsIntervalRef.current);
        }
      };
    }
  }, [adminUser]);

  useEffect(() => {
    // Clear previous message polling
    if (messagesIntervalRef.current) {
      clearInterval(messagesIntervalRef.current);
    }

    if (selectedConversation) {
      fetchMessages();
      markAsRead();
      // Reduced polling frequency to 5 seconds for messages
      messagesIntervalRef.current = setInterval(fetchMessages, 5000);
    }

    return () => {
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/verify-admin');
      if (response.ok) {
        setLoading(false);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/conversations?userId=${adminUser.id}`, {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const response = await fetch(
        `/api/messages?conversationId=${selectedConversation.conversationId}`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async () => {
    if (!selectedConversation) return;
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.conversationId,
          userId: adminUser.id,
        }),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedConversation || uploadingFile) return;

    setUploadingFile(true);
    try {
      let attachments = [];

      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('file', file);

          const uploadResponse = await fetch('/api/upload-file', {
            method: 'POST',
            body: formData,
          });

          const uploadData = await uploadResponse.json();
          if (uploadData.success) {
            attachments.push({
              name: file.name,
              type: file.type,
              size: file.size,
              url: uploadData.url,
            });
          }
        }
      }

      // Send message via API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: adminUser.id,
          receiverId: selectedConversation.otherUserId,
          message: newMessage,
          attachments,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        setSelectedFiles([]);
        setShowEmojiPicker(false);
        // Fetch messages once immediately after sending
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes
    const invalidFiles = files.filter(f => f.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      toast.error(`Some files exceed 100MB limit`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const downloadFile = (file) => {
    try {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const startNewChat = (otherUser) => {
    const convId = [adminUser.id, otherUser._id].sort().join('_');
    setSelectedConversation({
      conversationId: convId,
      otherUserId: otherUser._id,
      otherUser: {
        id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
        role: otherUser.role,
        profileImage: otherUser.profileImage,
      },
    });
    setShowNewChat(false);
    setMessages([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100">
      <div className="h-screen flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center border-b border-white/10">
          <div>
            <h1 className="text-2xl font-bold inline-flex items-center gap-2"><FiMessageCircle /> Messages</h1>
            <p className="text-violet-100">Chat with interns and team</p>
          </div>
          <Link href="/admin">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center gap-2 border border-white/20">
              <FiArrowLeft />
              Back to Dashboard
            </button>
          </Link>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-slate-950/80 border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl transition inline-flex items-center justify-center gap-2"
              >
                <FiPlus /> New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {showNewChat ? (
                <div className="p-4">
                  <h3 className="font-bold text-white mb-3">Start New Chat</h3>
                  <div className="space-y-2">
                    {allUsers.map(u => (
                      <button
                        key={u._id}
                        onClick={() => startNewChat(u)}
                        className="w-full text-left p-3 hover:bg-slate-800 rounded-lg transition border border-transparent hover:border-white/10"
                      >
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-sm text-slate-400">{u.role} • {u.department}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new chat</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.conversationId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-4 border-b border-white/10 hover:bg-slate-900/70 transition ${
                      selectedConversation?.conversationId === conv.conversationId
                        ? 'bg-violet-500/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {conv.otherUser.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-white truncate">
                            {conv.otherUser.name}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400 truncate">
                          {conv.lastMessage}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(conv.lastMessageTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-slate-900/40">
            {selectedConversation ? (
              <>
                <div className="bg-slate-950/80 border-b border-white/10 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedConversation.otherUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">
                        {selectedConversation.otherUser.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {selectedConversation.otherUser.role}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-slate-400 mt-8">
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          msg.senderId === adminUser.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-md ${
                            msg.senderId === adminUser.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-900'
                          } rounded-lg overflow-hidden`}
                        >
                          {/* File Attachment */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="p-3 border-b border-purple-500">
                              {msg.attachments.map((file, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setPreviewFile(file)}
                                  className="flex items-center gap-2 hover:underline w-full text-left"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">{file.name}</span>
                                    <p className="text-xs opacity-75">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Message Text */}
                          {msg.message && (
                            <div className="px-4 py-2">
                              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                            </div>
                          )}
                          
                          {/* Message Footer */}
                          <div className="px-4 pb-2 flex items-center justify-between gap-2">
                            <p
                              className={`text-xs ${
                                msg.senderId === adminUser.id ? 'text-purple-100' : 'text-slate-500'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                            {msg.senderId === adminUser.id && (
                              <div className="flex items-center gap-1">
                                {msg.read ? (
                                  <svg className="w-4 h-4 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                    <path d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414l.293.293 7.293-7.293a1 1 0 011.414 0z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="bg-slate-950/80 border-t border-white/10 p-4">
                  {/* File Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-3 p-3 bg-slate-900 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">
                          {selectedFiles.length} file(s) selected
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-white/10">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FiPaperclip className="w-5 h-5 text-violet-300 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-100 truncate">{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="text-red-400 hover:text-red-300 p-1 ml-2"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="mb-3 p-3 bg-slate-900 rounded-lg border border-white/10">
                      <div className="flex flex-wrap gap-2">
                        {emojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addEmoji(emoji)}
                            className="text-2xl hover:bg-slate-800 rounded p-1 transition"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg transition disabled:opacity-50"
                      title="Attach file (max 100MB)"
                    >
                      {uploadingFile ? (
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <FiPaperclip className="w-5 h-5" />
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg transition"
                      title="Add emoji"
                    >
                      <FiSmile className="text-xl" />
                    </button>
                    
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    
                    <button
                      type="submit"
                      disabled={(!newMessage.trim() && selectedFiles.length === 0) || uploadingFile}
                      className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-bold px-6 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      {uploadingFile ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <><FiSend />Send</>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <FiMessageCircle className="text-6xl mb-4 mx-auto text-slate-500" />
                  <p className="text-xl">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{previewFile.name}</h2>
                <p className="text-sm text-purple-100">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-white hover:text-slate-200 text-3xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {previewFile.type.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full h-auto mx-auto" />
              ) : previewFile.type === 'application/pdf' ? (
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-red-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xl font-bold text-slate-100 mb-2">PDF Document</p>
                  <p className="text-slate-300 mb-4">{previewFile.name}</p>
                  <p className="text-sm text-slate-400 mb-6">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                  </a>
                </div>
              ) : previewFile.type.startsWith('video/') ? (
                <video src={previewFile.url} controls className="max-w-full h-auto mx-auto" />
              ) : previewFile.type.startsWith('audio/') ? (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 mx-auto text-purple-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                  <p className="text-xl font-bold text-slate-100 mb-4">Audio File</p>
                  <audio src={previewFile.url} controls className="w-full max-w-md mx-auto" />
                </div>
              ) : previewFile.type.startsWith('text/') || 
                 previewFile.type === 'application/json' ||
                 previewFile.type === 'application/javascript' ? (
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-blue-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xl font-bold text-slate-100 mb-2">Text Document</p>
                  <p className="text-slate-300 mb-4">{previewFile.name}</p>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                  </a>
                </div>
              ) : previewFile.type.includes('word') || 
                 previewFile.type.includes('document') ||
                 previewFile.name.endsWith('.doc') ||
                 previewFile.name.endsWith('.docx') ? (
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-blue-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xl font-bold text-slate-100 mb-2">Word Document</p>
                  <p className="text-slate-300 mb-4">{previewFile.name}</p>
                  <p className="text-sm text-slate-400 mb-6">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={() => downloadFile(previewFile)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download to View
                  </button>
                </div>
              ) : previewFile.type.includes('excel') || 
                 previewFile.type.includes('spreadsheet') ||
                 previewFile.name.endsWith('.xls') ||
                 previewFile.name.endsWith('.xlsx') ? (
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-green-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xl font-bold text-slate-100 mb-2">Excel Spreadsheet</p>
                  <p className="text-slate-300 mb-4">{previewFile.name}</p>
                  <p className="text-sm text-slate-400 mb-6">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={() => downloadFile(previewFile)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download to View
                  </button>
                </div>
              ) : previewFile.type.includes('powerpoint') || 
                 previewFile.type.includes('presentation') ||
                 previewFile.name.endsWith('.ppt') ||
                 previewFile.name.endsWith('.pptx') ? (
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-orange-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xl font-bold text-slate-100 mb-2">PowerPoint Presentation</p>
                  <p className="text-slate-300 mb-4">{previewFile.name}</p>
                  <p className="text-sm text-slate-400 mb-6">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={() => downloadFile(previewFile)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download to View
                  </button>
                </div>
              ) : previewFile.type.includes('zip') || 
                 previewFile.type.includes('rar') ||
                 previewFile.type.includes('compressed') ? (
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-yellow-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xl font-bold text-slate-100 mb-2">Compressed Archive</p>
                  <p className="text-slate-300 mb-4">{previewFile.name}</p>
                  <p className="text-sm text-slate-400 mb-6">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={() => downloadFile(previewFile)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Archive
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xl font-bold text-slate-100 mb-2">File Attachment</p>
                  <p className="text-slate-300 mb-2">{previewFile.name}</p>
                  <p className="text-sm text-slate-400 mb-6">
                    {previewFile.type || 'Unknown type'} • {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => downloadFile(previewFile)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download File
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-6 py-4 flex gap-3">
              <button
                onClick={() => downloadFile(previewFile)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button
                onClick={() => setPreviewFile(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
