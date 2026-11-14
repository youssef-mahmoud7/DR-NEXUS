import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { astronauts } from './data/mockData'
import { AstronautProfile, BlackBox, CrewMonitoring, Dashboard, FutureSelf, HealthReports, SettingsPage, WhatIfSimulator } from './pages/pages'
import type { Astronaut, PageId } from './types'

function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [selectedAstronaut, setSelectedAstronaut] = useState<Astronaut>(astronauts[0])
  const [navOpen, setNavOpen] = useState(false)

  const openProfile = (astronaut: Astronaut) => {
    setSelectedAstronaut(astronaut)
    setActivePage('profile')
  }

  const content = {
    dashboard: <Dashboard onNavigate={setActivePage} onSelectAstronaut={openProfile} />,
    crew: <CrewMonitoring onSelectAstronaut={openProfile} />,
    profile: <AstronautProfile astronaut={selectedAstronaut} />,
    'black-box': <BlackBox />,
    'future-self': <FutureSelf />,
    simulator: <WhatIfSimulator />,
    reports: <HealthReports />,
    settings: <SettingsPage />,
  } satisfies Record<PageId, React.ReactNode>

  return <AppShell activePage={activePage} onNavigate={setActivePage} navOpen={navOpen} setNavOpen={setNavOpen}>{content[activePage]}</AppShell>
}

export default App
