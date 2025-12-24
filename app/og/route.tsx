import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a1a 100%)',
            padding: '80px',
            position: 'relative',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Background gradient overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)',
            }}
          />
          
          {/* Main content container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '32px',
              maxWidth: '900px',
            }}
          >
            {/* Brand name with accent */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '72px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: '1',
                }}
              >
                Azone
              </span>
              <span
                style={{
                  fontSize: '72px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '-0.02em',
                  lineHeight: '1',
                }}
              >
                .store
              </span>
            </div>
            
            {/* Divider line */}
            <div
              style={{
                width: '120px',
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, #7C3AED 50%, transparent 100%)',
              }}
            />
            
            {/* Subtitle */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: '500',
                color: '#E5E7EB',
                textAlign: 'center',
                letterSpacing: '-0.01em',
                lineHeight: '1.4',
              }}
            >
              Production-Ready Templates
            </div>
            
            {/* Tagline */}
            <div
              style={{
                fontSize: '24px',
                fontWeight: '400',
                color: '#9CA3AF',
                textAlign: 'center',
                marginTop: '16px',
                letterSpacing: '0.01em',
              }}
            >
              Built for scale. Designed for production.
            </div>
          </div>
          
          {/* Decorative elements */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              right: '60px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '60px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

