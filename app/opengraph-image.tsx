import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Inlet — every form belongs to a client. The form backend for developers, by EAM.';
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
          backgroundColor: '#0B1A33',
          backgroundImage: 'radial-gradient(circle at 55% 0%, rgba(201,169,110,0.30) 0%, rgba(201,169,110,0) 42%), linear-gradient(135deg, #070D18 0%, #0D1F3C 55%, #13243F 100%)',
          padding: 72,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
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
              boxShadow: 'inset 0 0 0 1px rgba(201,169,110,0.35)',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
              <path d="M32 13 L32 34" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" />
              <path d="M21 25 L32 36 L43 25" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="18" y="45" width="28" height="6.5" rx="3.25" fill="#3B82F6" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <div style={{ display: 'flex', color: '#F5F0E8', fontSize: 38, fontWeight: 700 }}>Inlet</div>
            <div style={{ display: 'flex', color: '#C9A96E', fontSize: 20, letterSpacing: 4, textTransform: 'uppercase' }}>by EAM</div>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', color: '#F5F0E8', fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Every form belongs
          </div>
          <div style={{ display: 'flex', color: '#E8C987', fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, fontStyle: 'italic' }}>
            to a client.
          </div>
        </div>

        {/* footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', color: '#8892A4', fontSize: 26 }}>
            No e-mail in your code · Leads to the client · MCP for AI agents
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
