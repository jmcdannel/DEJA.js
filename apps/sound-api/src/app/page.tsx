export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950/95 py-16 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 px-6 text-center md:px-0">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Deja Control</p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            DEJA Sound API
          </h1>
          <p className="text-lg text-slate-300">
            API for managing BBC sound effects from Vercel Blob. Explore the available endpoints below
            to integrate layout audio with your own control systems.
          </p>
        </div>
        <div className="w-full space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-xl">
          <h2 className="text-xl font-semibold text-white">Available Endpoints</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="rounded bg-emerald-500/20 px-3 py-1 text-sm font-mono uppercase text-emerald-300">GET</span>
              <span className="text-slate-100">/api/sounds</span>
              <span className="text-slate-400">- List all sound files</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="rounded bg-emerald-500/20 px-3 py-1 text-sm font-mono uppercase text-emerald-300">GET</span>
              <span className="text-slate-100">/api/sounds/[pathname]</span>
              <span className="text-slate-400">- Get specific sound file info</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
