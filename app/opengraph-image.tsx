import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Inlet — One form backend for all your websites';
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
              background: 'linear-gradient(150deg, #1E293B 0%, #0F172A 62%, #0B1220 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
              <path d="M32 13 L32 34" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" />
              <path d="M21 25 L32 36 L43 25" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="18" y="45" width="28" height="6.5" rx="3.25" fill="#3B82F6" />
            </svg>
          </div>
          <div style={{ display: 'flex', color: '#e2e8f0', fontSize: 38, fontWeight: 700 }}>
            Inlet
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
