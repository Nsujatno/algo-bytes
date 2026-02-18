import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 64,
  height: 64,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg fill="none" viewBox="8 8 48 48" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="8" width="48" height="48" rx="12" fill="#141414" stroke="#262626" strokeWidth="2"/> 
            <rect x="20" y="22" width="24" height="4" rx="2" fill="#FAFAFA" opacity="0.4"/>
            <rect x="26" y="30" width="18" height="4" rx="2" fill="#FAFAFA" opacity="0.8"/>
            <rect x="26" y="38" width="14" height="4" rx="2" fill="#FCD34D"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
