import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
 
// Rozmiar obrazu
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
// Generator obrazu Open Graph
export default async function Image() {
  // Fetch font from public directory
  const fontData = await readFile(join(process.cwd(), 'public', 'fonts', 'BPdots.ttf'))

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #264653 0%, #2a9d8f 50%, #e9c46a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'BPdots',
        }}
      >
        {/* Decorative circles in background */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
          }}
        />

        {/* Main content container */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '60px 80px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left side - Text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '600px',
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '30px',
                padding: '10px 24px',
                marginBottom: '30px',
              }}
            >
              <span style={{ color: 'white', fontSize: 24, fontWeight: '600' }}>
                ✨ Teleturniej Online ✨
              </span>
            </div>

            {/* Main logo - styled like landing page */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  fontSize: 100,
                  fontWeight: 'bold',
                  color: '#e9c46a',
                  letterSpacing: '5px',
                  lineHeight: '1',
                  display: 'flex',
                  textShadow: '3px 3px 0 #f4a261, 6px 6px 0 #e76f51, 9px 9px 20px rgba(0, 0, 0, 0.5)',
                }}
              >
                FAMILIADA
              </div>
              <div
                style={{
                  fontSize: 32,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginTop: '10px',
                  fontWeight: '600',
                  display: 'flex',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                Online za darmo!
              </div>
            </div>

            {/* Features */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#e9c46a',
                    display: 'flex',
                  }}
                />
                <span style={{ color: 'white', fontSize: 28, fontWeight: '500' }}>
                  Multiplayer po polsku
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#f4a261',
                    display: 'flex',
                  }}
                />
                <span style={{ color: 'white', fontSize: 28, fontWeight: '500' }}>
                  Własne pytania
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#e76f51',
                    display: 'flex',
                  }}
                />
                <span style={{ color: 'white', fontSize: 28, fontWeight: '500' }}>
                  Graj na telefon
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Game board visualization */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Game board card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                padding: '30px',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Question placeholder */}
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  padding: '15px 20px',
                  marginBottom: '20px',
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#264653',
                  justifyContent: 'center',
                }}
              >
                Pytanie ankietowe
              </div>

              {/* Answer boxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      background: num === 1 ? 'rgba(233, 196, 106, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: num === 1 ? '#e9c46a' : 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: num === 1 ? '#264653' : 'white',
                      }}
                    >
                      {num}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: '8px',
                        background: num === 1 ? '#e9c46a' : 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        display: 'flex',
                      }}
                    />
                    {num === 1 && (
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 'bold',
                          color: '#e9c46a',
                          display: 'flex',
                        }}
                      >
                        100
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Team indicators */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(233, 196, 106, 0.3)',
                  borderRadius: '16px',
                  padding: '10px 20px',
                  border: '2px solid rgba(233, 196, 106, 0.5)',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#e9c46a',
                    display: 'flex',
                  }}
                />
                <span style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>Drużyna A</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(244, 162, 97, 0.3)',
                  borderRadius: '16px',
                  padding: '10px 20px',
                  border: '2px solid rgba(244, 162, 97, 0.5)',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#f4a261',
                    display: 'flex',
                  }}
                />
                <span style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>Drużyna B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      fonts: [
        {
          name: 'BPdots',
          data: fontData,
          style: 'normal',
        },
      ],
      ...size,
    }
  )
}
