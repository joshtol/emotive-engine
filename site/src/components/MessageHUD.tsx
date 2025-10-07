'use client'

import { useEffect, useState } from 'react'
import './MessageHUD.css'

interface Message {
  id: string
  type: 'info' | 'error' | 'success' | 'warning' | 'login' | 'interaction'
  content: string
  duration?: number
  dismissible?: boolean
}

interface MessageHUDProps {
  messages?: Message[]
  onMessageDismiss?: (id: string) => void
}

export default function MessageHUD({ messages = [], onMessageDismiss }: MessageHUDProps) {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([])

  useEffect(() => {
    if (messages.length > 0) {
      setVisibleMessages(messages)
      
      // Auto-dismiss messages after their duration
      messages.forEach(message => {
        if (message.duration && message.duration > 0) {
          setTimeout(() => {
            handleDismiss(message.id)
          }, message.duration)
        }
      })
    }
  }, [messages])

  const handleDismiss = (id: string) => {
    setVisibleMessages(prev => prev.filter(msg => msg.id !== id))
    onMessageDismiss?.(id)
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️'
      case 'error': return '⚠️'
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'login': return '👤'
      case 'interaction': return '🖱️'
      default: return 'ℹ️'
    }
  }

  if (visibleMessages.length === 0) return null

  return (
    <div className="message-hud">
      {visibleMessages.map((message) => (
        <div
          key={message.id}
          className={`message-item message-${message.type} ${message.duration ? 'auto-dismiss' : 'show'}`}
          role="alert"
          aria-live="polite"
        >
          <span className="message-icon" aria-hidden="true">
            {getMessageIcon(message.type)}
          </span>
          <span className="message-text">{message.content}</span>
          {message.dismissible !== false && (
            <button
              className="message-dismiss"
              onClick={() => handleDismiss(message.id)}
              aria-label="Dismiss message"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
