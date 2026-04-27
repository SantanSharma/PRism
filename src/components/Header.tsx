export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }}>
              <path d="M16 4L4 26h24L16 4z" fill="url(#prism-main-h)" />
              <path d="M16 4L4 26h24L16 4z" stroke="url(#prism-stroke-h)" strokeWidth="1" />
              <path d="M16 10L8 22h16L16 10z" fill="url(#prism-inner-h)" />
              <path d="M10 22L16 10L14 22H10z" fill="rgba(255,255,255,0.15)" />
              <defs>
                <linearGradient id="prism-main-h" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
                <linearGradient id="prism-stroke-h" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="prism-inner-h" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <h1 className="text-lg font-bold text-zinc-100">PRism</h1>
              <p className="text-xs text-zinc-500">See every angle of your PR</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              GitHub
            </a>
            <a
              href="#about"
              className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
