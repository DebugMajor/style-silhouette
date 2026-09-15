import React from 'react';
import { UploadCloud, Clock, Sparkles } from 'lucide-react';

export default function Upload() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: '0.25rem'
        }}>
          MEDIA HUB
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          Batch Upload Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Bulk image processing and garment extraction pipeline.
        </p>
      </div>

      {/* Main Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        minHeight: '340px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(183, 110, 121, 0.1)',
          border: '1px solid rgba(183, 110, 121, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          marginBottom: '1.25rem',
          color: 'var(--accent)'
        }}>
          <UploadCloud size={24} />
        </div>

        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          Batch Upload & Automatic Tagging
        </h2>
        
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          maxWidth: '440px',
          lineHeight: '1.5',
          marginBottom: '1.5rem'
        }}>
          High-resolution bulk uploading with AI garment segmentation and automated metadata cataloging is currently in scheduled deployment.
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.85rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <Clock size={14} style={{ color: 'var(--accent)' }} />
          <span>Scheduled for Phase 2 Rollout</span>
        </div>
      </div>
    </div>
  );
}

