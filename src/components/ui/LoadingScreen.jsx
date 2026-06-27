import Logo from './Logo'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="animate-scale-in">
        <Logo size="xl" />
      </div>
      <div className="loading-dots">
        <span /><span /><span />
      </div>
    </div>
  )
}
