export type PageId = 'dashboard' | 'crew' | 'profile' | 'black-box' | 'future-self' | 'simulator' | 'reports' | 'settings'

export type Status = 'nominal' | 'watch' | 'attention'

export interface Astronaut {
  id: string
  name: string
  role: string
  initials: string
  status: Status
  location: string
  missionDay: number
  heartRate: number
  spo2: number
  sleep: number
  stress: number
  lastSync: string
}

export interface TrendPoint {
  time: string
  heartRate: number
  spo2: number
  strain: number
}

export interface MissionEvent {
  id: string
  time: string
  type: 'telemetry' | 'note' | 'alert' | 'protocol'
  title: string
  detail: string
}
