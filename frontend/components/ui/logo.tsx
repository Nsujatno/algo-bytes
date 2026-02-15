export function Logo({ className }: { className?: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="48" height="48" rx="12" fill="#141414" stroke="#262626" strokeWidth="2"/> 
        <rect x="20" y="22" width="24" height="4" rx="2" fill="#FAFAFA" opacity="0.4"/>
        <rect x="26" y="30" width="18" height="4" rx="2" fill="#FAFAFA" opacity="0.8"/>
        <rect x="26" y="38" width="14" height="4" rx="2" fill="#FCD34D"/>
    </svg>
  );
}
