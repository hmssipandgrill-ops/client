export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { height: '44px' },
    md: { height: '60px' },
    lg: { height: '80px' },
    xl: { height: '112px' },
  }
  return (
    <img
      src="/logo.svg"
      alt="HMS Lounge & Bar"
      style={{ height: sizes[size].height, width: 'auto', display: 'block' }}
    />
  )
}
