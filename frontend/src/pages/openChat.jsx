import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/navbar';
import { chatAPI } from '../services/chat';
import { customToast } from '../components/ToastProvider';
import { useAuthContext } from '../contexts/AuthContext';

const POLL_INTERVAL_MS = 8000;

const formatDisplayName = (author) => {
  if (!author) {
    return 'Former User';
  }

  const { first_name: firstName, last_name: lastName, email } = author;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  if (email) {
    return email;
  }

  return 'Community Member';
};

const getInitials = (author) => {
  if (!author) {
    return '??';
  }

  const first = author.first_name || '';
  const last = author.last_name || '';

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }

  if (first) {
    return first.substring(0, 2).toUpperCase();
  }

  if (author.email) {
    return author.email.substring(0, 2).toUpperCase();
  }

  return '??';
};

const createMessageLookup = (messages) => {
  const map = new Map();
  messages.forEach((message) => {
    map.set(message.message_id, message);
  });
  return map;
};

const ChatMessage = ({
  message,
  onReply,
  messageLookup,
  onScrollToMessage,
  registerMessageRef,
  isHighlighted,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleReply = () => setShowReply((prev) => !prev);

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    const trimmed = replyText.trim();

    if (!trimmed) {
      customToast.info('Please write a reply before sending.');
      return;
    }

    try {
      setSubmitting(true);
      await onReply(trimmed, message.message_id);
      setReplyText('');
      setShowReply(false);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to send reply.';
      customToast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const createdAt = useMemo(() => new Date(message.created_at).toLocaleString(), [message.created_at]);
  const displayName = useMemo(() => formatDisplayName(message.author), [message.author]);
  const initials = useMemo(() => getInitials(message.author), [message.author]);

  const parentMessage = useMemo(() => {
    if (!message.parent_message_id) {
      return null;
    }

    return messageLookup.get(message.parent_message_id) || null;
  }, [message.parent_message_id, messageLookup]);

  const parentPreview = useMemo(() => {
    if (!parentMessage) {
      return null;
    }

    const snippet = parentMessage.content || 'Message unavailable';
    return {
      authorName: formatDisplayName(parentMessage.author),
      snippet: snippet.length > 200 ? `${snippet.slice(0, 200)}…` : snippet,
    };
  }, [parentMessage]);

  const baseClasses = 'bg-gray-900/60 border border-gray-800 rounded-2xl px-5 py-4 shadow-lg shadow-black/10 transition-colors duration-300';
  const highlightClasses = isHighlighted ? ' border-blue-400/60 bg-blue-500/10 shadow-lg shadow-blue-500/30' : '';

  return (
    <div
      ref={(node) => registerMessageRef?.(message.message_id, node)}
      className={`${baseClasses}${highlightClasses}`.trim()}
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 flex-none rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold flex items-center justify-center shadow-md">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-white">{displayName}</span>
            <span className="text-xs text-gray-400">{createdAt}</span>
          </div>

          {parentPreview && (
            <button
              type="button"
              onClick={() => onScrollToMessage?.(parentMessage.message_id)}
              className="mt-3 w-full text-left rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 hover:border-blue-400 hover:bg-blue-500/15 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            >
              <p className="text-[11px] uppercase tracking-wide text-blue-200 flex items-center gap-2">
                Replying to {parentPreview.authorName}
                <span className="text-[10px] text-blue-300/80">(jump)</span>
              </p>
              <p className="mt-1 text-sm text-gray-100 leading-5">{parentPreview.snippet}</p>
            </button>
          )}

          <div className="mt-3 text-sm leading-6 text-gray-200 whitespace-pre-wrap break-words">
            {message.content}
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs text-blue-300">
            <button
              type="button"
              onClick={toggleReply}
              className="font-medium hover:text-blue-200"
            >
              {showReply ? 'Cancel reply' : 'Reply'}
            </button>
          </div>

          {showReply && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-700 bg-gray-950/80 text-sm text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write a thoughtful reply…"
                disabled={submitting}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={toggleReply}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200"
                  disabled={submitting}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Sending…' : 'Send reply'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const OpenChatPage = () => {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  const messageListRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const messageRefs = useRef(new Map());
  const highlightTimeoutRef = useRef(null);

  const fetchMessages = useCallback(async (withSpinner = false) => {
    try {
      if (withSpinner) {
        setLoading(true);
      } else {
        setIsPolling(true);
      }

      const response = await chatAPI.getMessages();

      if (response.success) {
        setMessages(response.messages);
      } else {
        customToast.error(response.message || 'Unable to load chat messages.');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'Unable to load chat messages.';
      customToast.error(errorMessage);
    } finally {
      if (withSpinner) {
        setLoading(false);
      }
      setIsPolling(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(true);
  }, [fetchMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(false);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  useEffect(() => {
    if (!loading && isAtBottom) {
      scrollToBottom(false);
    }
  }, [loading, isAtBottom, scrollToBottom]);

  useEffect(() => {
    if (!loading && isAtBottom) {
      scrollToBottom(true);
    }
  }, [messages, loading, isAtBottom, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const element = messageListRef.current;
    if (!element) {
      return;
    }

    const threshold = 120;
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    setIsAtBottom(distanceFromBottom <= threshold);
  }, []);

  useEffect(() => {
    const element = messageListRef.current;
    if (!element) {
      return undefined;
    }

    element.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const clearHighlightTimeout = useCallback(() => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
  }, []);

  const highlightMessage = useCallback((messageId) => {
    if (!messageId) {
      return;
    }

    setHighlightedMessageId(messageId);
    clearHighlightTimeout();
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedMessageId(null);
      highlightTimeoutRef.current = null;
    }, 2200);
  }, [clearHighlightTimeout]);

  useEffect(() => {
    return () => {
      clearHighlightTimeout();
    };
  }, [clearHighlightTimeout]);

  const registerMessageRef = useCallback((messageId, node) => {
    if (!messageId) {
      return;
    }

    if (node) {
      messageRefs.current.set(messageId, node);
    } else {
      messageRefs.current.delete(messageId);
    }
  }, []);

  const scrollToMessageById = useCallback((messageId) => {
    if (!messageId) {
      return;
    }

    const node = messageRefs.current.get(messageId);
    if (!node) {
      customToast.info('Original message not found.');
      return;
    }

    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightMessage(messageId);
  }, [highlightMessage]);

  const handleNewMessageSubmit = async (event) => {
    event.preventDefault();
    const trimmed = newMessage.trim();

    if (!trimmed) {
      customToast.info('Please enter a message before sending.');
      return;
    }

    try {
      setSending(true);
      const response = await chatAPI.postMessage({ content: trimmed });

      if (response.success && response.message) {
        setNewMessage('');
        setMessages((prevMessages) => {
          const exists = prevMessages.some((msg) => msg.message_id === response.message.message_id);
          if (exists) {
            return prevMessages;
          }
          return [...prevMessages, response.message];
        });
        scrollToBottom(true);
        highlightMessage(response.message.message_id);
      } else {
        customToast.error(response.message || 'Unable to send message.');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'Unable to send message.';
      customToast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleReply = useCallback(async (content, parentMessageId) => {
    const response = await chatAPI.postMessage({ content, parentMessageId });

    if (!response.success || !response.message) {
      throw new Error(response.message || 'Unable to send reply.');
    }

    setMessages((prevMessages) => {
      const exists = prevMessages.some((msg) => msg.message_id === response.message.message_id);
      if (exists) {
        return prevMessages;
      }
      return [...prevMessages, response.message];
    });
    scrollToBottom(true);
    highlightMessage(response.message.message_id);
  }, [scrollToBottom, highlightMessage]);

  const messageLookup = useMemo(() => createMessageLookup(messages), [messages]);

  const orderedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [messages]);

  const lastUpdatedText = useMemo(() => {
    if (!messages.length) {
      return 'Never';
    }

    const lastDate = messages.reduce((latest, message) => {
      const current = new Date(message.created_at).getTime();
      return current > latest ? current : latest;
    }, 0);

    return new Date(lastDate).toLocaleTimeString();
  }, [messages]);

  const loggedInName = useMemo(() => {
    if (!user) {
      return 'Loading user…';
    }

    return formatDisplayName({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="pt-24 pb-6 px-3 sm:px-6 lg:px-10 max-w-6xl mx-auto flex flex-col gap-4">
        <header className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg shadow-black/20">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Community Chat</h1>
            <p className="mt-1 text-sm text-gray-400">
              A shared space for every member. Ask questions, share quick wins, or drop industry news.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
            <span className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full">
              Logged in as <strong className="ml-1 text-white">{loggedInName}</strong>
            </span>
            <button
              type="button"
              onClick={() => fetchMessages(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white font-medium shadow-md"
            >
              Refresh
            </button>
          </div>
        </header>

        <section className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-xl shadow-black/20 overflow-hidden flex flex-col h-[calc(100vh-210px)]">
          <div className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">Drop a message</h2>
              <p className="text-xs text-gray-400">Keep it friendly and constructive — everyone can see what you post.</p>
            </div>
            <span className="text-xs text-gray-500">Last synced {lastUpdatedText}{isPolling ? ' • syncing…' : ''}</span>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div ref={messageListRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-400">Loading messages…</div>
              ) : orderedMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No conversations yet. Spark the first discussion!
                </div>
              ) : (
                orderedMessages.map((message) => (
                  <ChatMessage
                    key={message.message_id}
                    message={message}
                    onReply={handleReply}
                    messageLookup={messageLookup}
                    onScrollToMessage={scrollToMessageById}
                    registerMessageRef={registerMessageRef}
                    isHighlighted={highlightedMessageId === message.message_id}
                  />
                ))
              )}
              <div ref={bottomAnchorRef} />
            </div>

            {!isAtBottom && (
              <div className="px-6 pb-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => scrollToBottom(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full shadow-md hover:bg-blue-500"
                >
                  Jump to latest
                </button>
              </div>
            )}

            <form onSubmit={handleNewMessageSubmit} className="px-6 pb-6 pt-3 border-t border-gray-800 bg-gray-900/90 backdrop-blur">
              <div className="rounded-2xl border border-gray-700 bg-gray-950/80 focus-within:border-blue-500 transition">
                <textarea
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-sm text-gray-100 px-4 pt-4 resize-none focus:outline-none placeholder:text-gray-500"
                  placeholder="Press Enter to share something with everyone…"
                  disabled={sending}
                />
                <div className="flex justify-between items-center px-4 pb-4">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Community guidelines apply</p>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 disabled:opacity-50"
                    disabled={sending}
                  >
                    {sending ? 'Posting…' : 'Send message'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OpenChatPage;
