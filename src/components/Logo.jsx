export default function Logo({ light = false }) {
  const ink = light ? '#F2E6D0' : '#0F3D3E'
  return (
    <span className="logo">
      <svg viewBox="0 0 64 64" width="38" height="38" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill={light ? '#F2E6D0' : '#0F3D3E'} />
        <path d="M14 44 L32 16 L50 44" fill="none" stroke={light ? '#0F3D3E' : '#F2E6D0'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="40" r="5" fill="#E07A5F" />
      </svg>
      <span className="logo-text" style={{ color: ink }}>
        TERRA<span>VIA</span>
      </span>
    </span>
  )
}
