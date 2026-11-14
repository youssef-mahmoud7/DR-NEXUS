import { lazy, Suspense, useState } from 'react'
import { AppShell } from './components/AppShell'
import { astronauts } from './data/mockData'
import { AstronautProfile, BlackBox, CrewMonitoring, Dashboard, FutureSelf, HealthReports, SettingsPage, WhatIfSimulator } from './pages/pages'
import type { Astronaut, PageId } from './types'

const AnatomicalTwinWithFallback = lazy(() => import('./components/AnatomicalTwin').then(({ AnatomicalTwinWithFallback: Twin }) => ({ default: Twin })))

function AnatomicalTwinLoading() {
  performance.mark('drnexus-anatomy-module-requested')
  return <section className="panel flex min-h-[520px] items-center justify-center p-8"><div className="text-center"><span className="mx-auto block size-9 animate-pulse rounded-full border-2 border-cyan-300 border-t-transparent" /><p className="mt-4 text-sm font-medium text-slate-200">Preparing anatomical twin</p><p className="mt-1 text-xs text-slate-500">The rest of Mission Control remains available.</p></div></section>
}

function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [selectedAstronaut, setSelectedAstronaut] = useState<Astronaut>(astronauts[0])
  const [navOpen, setNavOpen] = useState(false)

  const openProfile = (astronaut: Astronaut) => {
    setSelectedAstronaut(astronaut)
    setActivePage('profile')
  }

  const content = {
    dashboard: <Dashboard onNavigate={setActivePage} onSelectAstronaut={openProfile} selectedAstronaut={selectedAstronaut} />,
    crew: <CrewMonitoring onSelectAstronaut={openProfile} />,
    profile: <AstronautProfile astronaut={selectedAstronaut} />,
    'black-box': <BlackBox />,
    'future-self': <FutureSelf />,
    simulator: <WhatIfSimulator />,
    reports: <HealthReports />,
    settings: <SettingsPage />,
  } satisfies Record<PageId, React.ReactNode>

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage} navOpen={navOpen} setNavOpen={setNavOpen}>
      {activePage === 'dashboard' ? (
        <div className="space-y-7">
          <Suspense fallback={<AnatomicalTwinLoading />}>
            <AnatomicalTwinWithFallback
              astronaut={selectedAstronaut}
              onSelectAstronaut={setSelectedAstronaut}
            />
          </Suspense>
          {content.dashboard}
        </div>
      ) : (
        content[activePage]
      )}
    </AppShell>
  )
}

export default App
