import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, CheckCircle2, CircleDot, Info } from 'lucide-react'
import type { Status } from '../types'

export function StatusPill({ status, label }: { status: Status; label?: string }) {
  const styles = {
    nominal: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    watch: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    attention: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  }
  const text = label ?? (status === 'nominal' ? 'Nominal' : status === 'watch' ? 'Watch' : 'Attention')
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}><span className="size-1.5 rounded-full bg-current" />{text}</span>
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex items-end justify-between gap-4"><div>{eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>}<h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2></div>{action}</div>
}

export function MetricCard({ icon: Icon, label, value, detail, tone = 'cyan' }: { icon: LucideIcon; label: string; value: string; detail: string; tone?: 'cyan' | 'blue' | 'amber' | 'emerald' }) {
  const tones = { cyan: 'text-cyan-300 bg-cyan-400/10', blue: 'text-blue-300 bg-blue-400/10', amber: 'text-amber-200 bg-amber-400/10', emerald: 'text-emerald-300 bg-emerald-400/10' }
  return <article className="panel p-4"><div className="flex items-start justify-between"><p className="text-sm text-slate-400">{label}</p><span className={`rounded-lg p-2 ${tones[tone]}`}><Icon className="size-4" /></span></div><p className="mt-4 text-2xl font-semibold tracking-tight text-white">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></article>
}

export function SimulatedNotice() {
  return <div className="flex gap-3 rounded-xl border border-blue-400/15 bg-blue-400/[0.07] p-3 text-xs leading-5 text-blue-100"><Info className="mt-0.5 size-4 shrink-0 text-cyan-300" /><span><strong>Simulation prototype.</strong> All crew profiles, readings, forecasts, and recommendations displayed here are fictional mock data—not medical information or validated clinical guidance.</span></div>
}

export function EventIcon({ type }: { type: 'telemetry' | 'note' | 'alert' | 'protocol' }) {
  const config = { telemetry: [CircleDot, 'text-cyan-300 bg-cyan-400/10'], note: [Info, 'text-blue-300 bg-blue-400/10'], alert: [AlertTriangle, 'text-amber-200 bg-amber-400/10'], protocol: [CheckCircle2, 'text-emerald-300 bg-emerald-400/10'] } as const
  const [Icon, classes] = config[type]
  return <span className={`grid size-8 place-items-center rounded-lg ${classes}`}><Icon className="size-4" /></span>
}
