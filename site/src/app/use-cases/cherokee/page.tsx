'use client'

import { useState } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'

export default function CherokeePage() {
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)

  // Cherokee Greetings & Common Phrases
  // Verified from official Cherokee Nation sources (cherokee.org, Cherokee Nation social media)
  const greetings = [
    {
      english: 'Hello',
      cherokee: 'ᎣᏏᏲ',
      pronunciation: 'oh-see-yoh',
      meaning: 'It\'s good to see you',
      context: 'Universal greeting for all occasions',
      color: '#DAA520',
      bgColor: 'rgba(218,165,32,0.15)',
      borderColor: 'rgba(218,165,32,0.4)',
      emoji: '👋'
    },
    {
      english: 'Hello (informal)',
      cherokee: 'ᏏᏲ',
      pronunciation: 'see-yoh',
      meaning: 'Hi / Hey',
      context: 'Casual greeting among friends',
      color: '#FFB347',
      bgColor: 'rgba(255,179,71,0.15)',
      borderColor: 'rgba(255,179,71,0.4)',
      emoji: '😊'
    },
    {
      english: 'Thank you',
      cherokee: 'ᏩᏙ',
      pronunciation: 'wah-doh',
      meaning: 'Expression of gratitude',
      context: 'Shows respect and appreciation',
      color: '#98D8C8',
      bgColor: 'rgba(152,216,200,0.15)',
      borderColor: 'rgba(152,216,200,0.4)',
      emoji: '🙏'
    },
    {
      english: 'How are you?',
      cherokee: 'ᏙᎯᏧ',
      pronunciation: 'doh-hee-choo',
      meaning: 'Asking about someone\'s wellbeing',
      context: 'Common conversation starter',
      color: '#F7DC6F',
      bgColor: 'rgba(247,220,111,0.15)',
      borderColor: 'rgba(247,220,111,0.4)',
      emoji: '💬'
    },
    {
      english: 'Good',
      cherokee: 'ᎣᏍᏓ',
      pronunciation: 'oh-s-dah',
      meaning: 'Response to "How are you?"',
      context: 'Can also mean "I\'m good"',
      color: '#82C4C3',
      bgColor: 'rgba(130,196,195,0.15)',
      borderColor: 'rgba(130,196,195,0.4)',
      emoji: '✨'
    },
    {
      english: 'Good morning',
      cherokee: 'ᎣᏍᏓ ᏌᎾᎴᎢ',
      pronunciation: 'oh-s-dah sah-nah-leh-ee',
      meaning: 'Morning greeting',
      context: 'Used until midday',
      color: '#F8B739',
      bgColor: 'rgba(248,183,57,0.15)',
      borderColor: 'rgba(248,183,57,0.4)',
      emoji: '🌅'
    },
    {
      english: '\'Til we meet again',
      cherokee: 'ᏙᎾᏓᎪᎲᎢ',
      pronunciation: 'doh-nah-dah-goh-huh-ee',
      meaning: 'There is no word for "goodbye" in Cherokee',
      context: 'Reflects belief in continued connection',
      color: '#C39BD3',
      bgColor: 'rgba(195,155,211,0.15)',
      borderColor: 'rgba(195,155,211,0.4)',
      emoji: '🤝'
    },
  ]

  return (
    <div className="emotive-container">
      <EmotiveHeader />

      <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      padding: 'var(--container-padding)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem'
        }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            ← Back to Portfolio
          </Link>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(218,165,32,0.2)',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: '1px solid rgba(218,165,32,0.4)'
          }}>
            Flagship Use Case
          </div>
        </div>

        {/* Hero */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#DAA520',
            letterSpacing: '-0.02em'
          }}>
            ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ
          </h1>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '600',
            marginBottom: '1rem',
            opacity: 0.9,
            letterSpacing: '-0.01em'
          }}>
            Cherokee Language Learning
          </h2>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            opacity: 0.7,
            fontWeight: '400',
            maxWidth: '700px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            Learn essential Cherokee greetings and phrases with authentic syllabary characters and pronunciation.
            All content verified through official Cherokee Nation sources.
          </p>
        </div>

        {/* Cherokee Greetings Grid */}
        <div style={{
          background: 'rgba(218,165,32,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          border: '1px solid rgba(218,165,32,0.25)',
          marginBottom: '4rem',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#DAA520'
          }}>
            Common Cherokee Greetings
          </h3>
          <p style={{
            textAlign: 'center',
            opacity: 0.7,
            marginBottom: '3rem',
            fontSize: '1rem'
          }}>
            Click any phrase to see the syllabary, pronunciation, and cultural context
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--grid-gap)',
            marginBottom: 'var(--spacing-md)'
          }}>
            {greetings.map((item) => (
              <div
                key={item.english}
                onClick={() => setSelectedPhrase(item.english)}
                style={{
                  padding: '2rem',
                  background: selectedPhrase === item.english
                    ? item.bgColor
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  border: selectedPhrase === item.english
                    ? `2px solid ${item.borderColor}`
                    : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'center',
                  willChange: 'transform',
                  boxShadow: selectedPhrase === item.english
                    ? `0 12px 40px ${item.borderColor}`
                    : '0 4px 16px rgba(31, 38, 135, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (selectedPhrase !== item.english) {
                    e.currentTarget.style.background = item.bgColor.replace('0.15', '0.08')
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                    e.currentTarget.style.boxShadow = `0 8px 24px ${item.borderColor}`
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPhrase !== item.english) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 38, 135, 0.1)'
                  }
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.75rem'
                }}>
                  {item.emoji}
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  opacity: 0.9
                }}>
                  {item.english}
                </div>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  color: item.color
                }}>
                  {item.cherokee}
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  opacity: 0.7,
                  fontStyle: 'italic'
                }}>
                  {item.pronunciation}
                </div>
              </div>
            ))}
          </div>

          {selectedPhrase && (() => {
            const selected = greetings.find(item => item.english === selectedPhrase)
            return selected ? (
              <div style={{
                marginTop: '2rem',
                padding: '2rem',
                background: selected.bgColor,
                borderRadius: '12px',
                textAlign: 'center',
                border: `2px solid ${selected.borderColor}`,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {selected.emoji} {selected.cherokee}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: selected.color }}>
                  {selected.english}
                </div>
                <div style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  Pronunciation: <strong>{selected.pronunciation}</strong>
                </div>
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.85,
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px'
                }}>
                  <strong style={{ color: selected.color }}>Meaning:</strong><br />
                  {selected.meaning}
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  opacity: 0.75,
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  fontStyle: 'italic'
                }}>
                  💡 <strong>Cultural Context:</strong> {selected.context}
                </div>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', marginTop: '1.5rem' }}>
                  🎵 Native speaker audio pronunciation coming in Phase 2
                </p>
              </div>
            ) : null
          })()}
        </div>

        {/* Why Learn Cherokee */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '4rem'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#DAA520'
          }}>
            Why Learn Cherokee?
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--grid-gap)',
            marginTop: '2rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(218,165,32,0.08)',
              border: '1px solid rgba(218,165,32,0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌍</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', color: '#DAA520' }}>Cultural Preservation</div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Help preserve one of America's indigenous languages spoken by over 450,000 Cherokee Nation citizens
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(218,165,32,0.08)',
              border: '1px solid rgba(218,165,32,0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💡</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', color: '#DAA520' }}>Unique Writing System</div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Learn the syllabary created by Sequoyah in 1821—one of few writing systems invented by a single person
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(218,165,32,0.08)',
              border: '1px solid rgba(218,165,32,0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.75rem', color: '#DAA520' }}>Cultural Respect</div>
              <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Show respect by learning greetings and phrases that honor Cherokee tradition and connection
              </div>
            </div>
          </div>
        </div>

        {/* Cultural Context */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '4rem'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            color: '#DAA520'
          }}>
            About the Cherokee Syllabary
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--grid-gap)'
          }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#DAA520' }}>
                📜 History
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Created by Sequoyah in 1821, the Cherokee syllabary is one of the few
                writing systems invented by a single individual—revolutionizing Cherokee
                literacy and enabling unprecedented cultural preservation.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#DAA520' }}>
                🎯 Structure
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                The syllabary contains 85 characters, each representing a complete syllable
                (consonant + vowel). Its remarkable efficiency allows learners to achieve
                literacy in a matter of days rather than years.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#DAA520' }}>
                💡 Cultural Impact
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Within years of its creation, the Cherokee Nation achieved one of the highest
                literacy rates in the world. Today, the syllabary remains essential for
                preserving Cherokee language and cultural identity.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div style={{
          background: 'rgba(218,165,32,0.1)',
          borderRadius: '16px',
          padding: 'var(--card-padding-lg) var(--card-padding)',
          border: '1px solid rgba(218,165,32,0.3)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '1rem',
            color: '#DAA520'
          }}>
            Coming with Cherokee Nation Partnership
          </h3>
          <p style={{
            opacity: 0.8,
            fontSize: '1rem',
            marginBottom: '2rem',
            maxWidth: '700px',
            margin: '0 auto 2rem auto'
          }}>
            This demo showcases the Emotive Engine's potential for culturally respectful language learning.
            Full implementation requires official Cherokee Nation approval and collaboration.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--grid-gap-sm)',
            marginTop: '2rem'
          }}>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎵</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Native Speaker Audio</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Authentic pronunciations from Cherokee Nation language department</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😊</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Emotional Feedback</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Characters react to learner's pronunciation with encouragement</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Expanded Vocabulary</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Family words, animals, nature—approved by Cherokee educators</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Interactive Conversations</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Practice full dialogues with emotionally responsive AI</div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{
          marginTop: '4rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'rgba(218,165,32,0.2)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.1rem',
              border: '1px solid rgba(218,165,32,0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(218,165,32,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(218,165,32,0.2)'
            }}
          >
            ← Back to All Use Cases
          </Link>
        </div>
      </div>
    </div>

      <EmotiveFooter />
    </div>
  )
}
