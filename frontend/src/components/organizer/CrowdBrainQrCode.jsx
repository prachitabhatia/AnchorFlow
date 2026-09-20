import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function CrowdBrainQrCode({ eventId }) {
  const canvasRef = useRef(null);
  const [qrError, setQrError] = useState(false);

  // Note: The organizer must open this app via the laptop's actual LAN IP address (not "localhost")
  // for the generated QR code to resolve correctly when scanned by an attendee's phone on the same Wi-Fi / hotspot network.
  const port = window.location.port ? `:${window.location.port}` : '';
  const targetUrl = `${window.location.protocol}//${window.location.hostname}${port}/crowd-brain/${eventId}`;

  useEffect(() => {
    if (!canvasRef.current || !eventId) return;

    try {
      QRCode.toCanvas(
        canvasRef.current,
        targetUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) {
            console.error('Failed to generate Crowd Brain QR code:', error);
            setQrError(true);
          } else {
            setQrError(false);
          }
        }
      );
    } catch (err) {
      console.error('Synchronous QR generation error:', err);
      setQrError(true);
    }
  }, [targetUrl, eventId]);

  return (
    <div
      className="organizer-card"
      style={{
        marginTop: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>📱</span>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--organizer-text)', margin: 0 }}>
          Crowd Brain Attendee Feedback QR Code
        </h3>
      </div>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--organizer-text-secondary)',
          margin: '0 0 1rem 0',
          maxWidth: '500px',
        }}
      >
        Display or scan this QR code to collect live feedback from attendees on stage agenda segments.
      </p>

      {!qrError ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md, 8px)',
            boxShadow: 'var(--shadow-sm)',
            display: 'inline-block',
          }}
        >
          <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '4px' }} />
        </div>
      ) : null}

      <div style={{ marginTop: '1rem', width: '100%', maxWidth: '500px' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'var(--organizer-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '0.35rem',
          }}
        >
          Direct Feedback URL
        </span>
        <div
          style={{
            backgroundColor: 'var(--organizer-bg)',
            border: '1px solid var(--organizer-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.75rem',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-family-mono, monospace)',
            color: 'var(--organizer-border-focus, #38bdf8)',
            wordBreak: 'break-all',
            userSelect: 'all',
          }}
        >
          {targetUrl}
        </div>
      </div>
    </div>
  );
}
