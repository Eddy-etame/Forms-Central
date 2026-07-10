import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'King E Forms — One form backend for all your websites';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%)',
          padding: 72,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* glow */}
        <div
          style={{
            position: 'absolute',
            top: -140,
            left: 340,
            width: 560,
            height: 380,
            background: 'radial-gradient(closest-side, rgba(59,130,246,0.35), transparent)',
            display: 'flex',
          }}
        />
        {/* brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#ffffff',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            K
          </div>
          <div style={{ display: 'flex', color: '#e2e8f0', fontSize: 38, fontWeight: 700 }}>
            King E Forms
          </div>
        </div>

        {/* headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', color: '#ffffff', fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            One form backend for
          </div>
          <div style={{ display: 'flex', color: '#60a5fa', fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            all your websites.
          </div>
        </div>

        {/* footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', color: '#94a3b8', fontSize: 28 }}>
            No SMTP · Anti-spam · White-label emails · You own the data
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
