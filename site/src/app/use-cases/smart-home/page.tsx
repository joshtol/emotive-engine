'use client'

import { useState } from 'react'
import Link from 'next/link'
import EmotiveHeader from '@/components/EmotiveHeader'
import EmotiveFooter from '@/components/EmotiveFooter'


export default function SmartHomePage() {
  const [devices, setDevices] = useState({
    lights: false,
    thermostat: 72,
    security: true,
    music: false
  })

  return (
    <div className="emotive-container">
      <EmotiveHeader />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1e3a3a 0%, #0f1d1d 100%)',
        color: 'white',
        padding: '2rem'
      }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <Link
          href="/"
          style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '1rem',
            display: 'inline-block',
            marginBottom: '3rem',
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

        {/* Hero */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#4ECDC4'
          }}>
            🏠 Smart Home Hub
          </h1>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
            opacity: 0.9
          }}>
            Intelligent Home Companion
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            opacity: 0.7,
            maxWidth: '700px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            Unified IoT control with emotional AI that understands context and responds
            naturally to voice commands. Makes smart homes truly intelligent.
          </p>
        </div>

        {/* Interactive Demo */}
        <div style={{
          background: 'rgba(78,205,196,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem 2rem',
          border: '1px solid rgba(78,205,196,0.25)',
          marginBottom: '4rem',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#4ECDC4'
          }}>
            Control Your Home
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {/* Lights */}
            <div
              onClick={() => setDevices({ ...devices, lights: !devices.lights })}
              style={{
                padding: '2rem',
                background: devices.lights
                  ? 'rgba(78,205,196,0.2)'
                  : 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: devices.lights
                  ? '2px solid rgba(78,205,196,0.6)'
                  : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                opacity: devices.lights ? 1 : 0.4
              }}>
                💡
              </div>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Lights</div>
              <div style={{
                fontSize: '1rem',
                opacity: 0.7,
                color: devices.lights ? '#4ECDC4' : '#fff'
              }}>
                {devices.lights ? 'ON' : 'OFF'}
              </div>
            </div>

            {/* Thermostat */}
            <div style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>
                🌡️
              </div>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Thermostat</div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => setDevices({ ...devices, thermostat: Math.max(60, devices.thermostat - 1) })}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '1.2rem',
                    background: 'rgba(78,205,196,0.2)',
                    color: 'white',
                    border: '1px solid rgba(78,205,196,0.4)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: '1.5rem', color: '#4ECDC4', fontWeight: 'bold' }}>
                  {devices.thermostat}°F
                </span>
                <button
                  onClick={() => setDevices({ ...devices, thermostat: Math.min(85, devices.thermostat + 1) })}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '1.2rem',
                    background: 'rgba(78,205,196,0.2)',
                    color: 'white',
                    border: '1px solid rgba(78,205,196,0.4)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Security */}
            <div
              onClick={() => setDevices({ ...devices, security: !devices.security })}
              style={{
                padding: '2rem',
                background: devices.security
                  ? 'rgba(78,205,196,0.2)'
                  : 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: devices.security
                  ? '2px solid rgba(78,205,196,0.6)'
                  : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>
                {devices.security ? '🔒' : '🔓'}
              </div>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Security</div>
              <div style={{
                fontSize: '1rem',
                opacity: 0.7,
                color: devices.security ? '#4ECDC4' : '#fff'
              }}>
                {devices.security ? 'ARMED' : 'DISARMED'}
              </div>
            </div>

            {/* Music */}
            <div
              onClick={() => setDevices({ ...devices, music: !devices.music })}
              style={{
                padding: '2rem',
                background: devices.music
                  ? 'rgba(78,205,196,0.2)'
                  : 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                border: devices.music
                  ? '2px solid rgba(78,205,196,0.6)'
                  : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                opacity: devices.music ? 1 : 0.4
              }}>
                🎵
              </div>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Music</div>
              <div style={{
                fontSize: '1rem',
                opacity: 0.7,
                color: devices.music ? '#4ECDC4' : '#fff'
              }}>
                {devices.music ? 'PLAYING' : 'PAUSED'}
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: 'rgba(78,205,196,0.1)',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid rgba(78,205,196,0.3)'
          }}>
            <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              💬 "Hey assistant, {devices.lights ? 'turn off' : 'turn on'} the lights"
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.6, marginTop: '0.5rem' }}>
              Voice commands with emotional context coming soon
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div style={{
          marginBottom: '4rem'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#4ECDC4'
          }}>
            Key Features
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              padding: '2rem',
              background: 'rgba(78,205,196,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(78,205,196,0.2)'
            }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#4ECDC4' }}>
                🎤 Natural Voice Control
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Understands context and intent, not just keywords. Feels like talking to a friend.
              </p>
            </div>
            <div style={{
              padding: '2rem',
              background: 'rgba(78,205,196,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(78,205,196,0.2)'
            }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#4ECDC4' }}>
                📊 Smart Automation
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Learns routines and preferences. Proactively suggests adjustments.
              </p>
            </div>
            <div style={{
              padding: '2rem',
              background: 'rgba(78,205,196,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(78,205,196,0.2)'
            }}>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#4ECDC4' }}>
                🔌 Universal Integration
              </h4>
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Works with any IoT device. One interface for everything.
              </p>
            </div>
          </div>
        </div>

        {/* Target Market */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '3rem 2rem',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '1.5rem',
            color: '#4ECDC4'
          }}>
            Target Market
          </h3>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.8,
            marginBottom: '2rem'
          }}>
            🎯 Apple HomeKit • Amazon Alexa • Google Home • Nvidia • Samsung SmartThings
          </p>
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
              background: 'rgba(78,205,196,0.2)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '1.1rem',
              border: '1px solid rgba(78,205,196,0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(78,205,196,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(78,205,196,0.2)'
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
