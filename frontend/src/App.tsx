import { Activity, BrainCircuit, Database, Radio } from 'lucide-react'

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-10">
        <header className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-cyan-300">
          <Activity aria-hidden="true" className="size-5" />
          DR. NEXUS
        </header>
        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="mb-5 text-sm font-medium tracking-widest text-cyan-300 uppercase">Mission health intelligence</p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-7xl">Foundation ready for the next mission.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">DR. NEXUS will provide a secure, offline-aware foundation for astronaut health monitoring and decision support during long-duration space missions.</p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <Capability icon={Radio} title="Monitoring" detail="Future vital-sign and mission telemetry workflows." />
            <Capability icon={BrainCircuit} title="Decision support" detail="Reserved for validated clinical and AI-assisted tools." />
            <Capability icon={Database} title="Hybrid storage" detail="IndexedDB cache with Supabase-backed persistence." />
          </div>
        </section>
        <footer className="border-t border-slate-800 pt-6 text-sm text-slate-400">React + Vite + TypeScript · FastAPI · Supabase-ready · AI workspace prepared</footer>
      </div>
    </main>
  )
}

function Capability({ icon: Icon, title, detail }: { icon: typeof Activity; title: string; detail: string }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <Icon aria-hidden="true" className="mb-5 size-6 text-cyan-300" />
      <h2 className="font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </article>
  )
}

export default App
