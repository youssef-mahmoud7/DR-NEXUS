import type { Astronaut, MissionEvent, TrendPoint } from '../types'

export const astronauts: Astronaut[] = [
  { id: 'chen', name: 'Dr. Lena Chen', role: 'Mission Commander', initials: 'LC', status: 'nominal', location: 'Harmony module', missionDay: 142, heartRate: 68, spo2: 98, sleep: 7.4, stress: 31, lastSync: '2 min ago' },
  { id: 'okafor', name: 'Malik Okafor', role: 'Flight Engineer', initials: 'MO', status: 'watch', location: 'Columbus module', missionDay: 142, heartRate: 74, spo2: 97, sleep: 6.2, stress: 48, lastSync: '1 min ago' },
  { id: 'alvarez', name: 'Sofia Alvarez', role: 'Science Officer', initials: 'SA', status: 'nominal', location: 'Quest airlock', missionDay: 142, heartRate: 64, spo2: 99, sleep: 7.9, stress: 24, lastSync: '3 min ago' },
  { id: 'wright', name: 'Noah Wright', role: 'Medical Officer', initials: 'NW', status: 'nominal', location: 'Destiny laboratory', missionDay: 142, heartRate: 66, spo2: 98, sleep: 7.1, stress: 29, lastSync: '2 min ago' },
]

export const healthTrend: TrendPoint[] = [
  { time: '00:00', heartRate: 62, spo2: 98, strain: 22 },
  { time: '04:00', heartRate: 58, spo2: 99, strain: 18 },
  { time: '08:00', heartRate: 71, spo2: 98, strain: 35 },
  { time: '12:00', heartRate: 76, spo2: 97, strain: 49 },
  { time: '16:00', heartRate: 69, spo2: 98, strain: 37 },
  { time: '20:00', heartRate: 67, spo2: 98, strain: 31 },
]

export const missionEvents: MissionEvent[] = [
  { id: 'evt-1', time: '14:32 UTC', type: 'alert', title: 'Recovery window flagged', detail: 'Malik Okafor: sleep duration is below mission baseline for 2 consecutive cycles.' },
  { id: 'evt-2', time: '13:55 UTC', type: 'protocol', title: 'EVA protocol logged', detail: 'Sofia Alvarez completed pre-EVA physiological check sequence.' },
  { id: 'evt-3', time: '12:18 UTC', type: 'telemetry', title: 'Crew telemetry synchronized', detail: 'All four wearable telemetry streams received by mission control.' },
  { id: 'evt-4', time: '09:40 UTC', type: 'note', title: 'Medical note added', detail: 'Crew medical officer recorded a routine hydration follow-up.' },
]

export const weeklyLoad = [
  { day: 'Mon', load: 42, recovery: 78 }, { day: 'Tue', load: 58, recovery: 74 }, { day: 'Wed', load: 47, recovery: 81 },
  { day: 'Thu', load: 64, recovery: 68 }, { day: 'Fri', load: 52, recovery: 76 }, { day: 'Sat', load: 38, recovery: 84 }, { day: 'Sun', load: 45, recovery: 79 },
]

export const systemChecks = [
  ['Wearable telemetry', '4 / 4 streams active', 'nominal'],
  ['Crew recovery', '1 member needs review', 'watch'],
  ['Cabin environment', 'Nominal range', 'nominal'],
] as const
