import { Component, memo, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { Center, OrbitControls, Sparkles, useGLTF } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import {
  Box,
  CheckCircle2,
  HeartPulse,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  Waves,
} from 'lucide-react'
import { astronauts } from '../data/mockData'
import { StatusPill } from './ui'
import type { Astronaut } from '../types'

const MODEL_URL = '/assets/torso-with-removable-organs.glb'

export type OrganId =
  | 'heart'
  | 'lungs'
  | 'vessels'
  | 'digestive'
  | 'renal'
  | 'brain'
  | 'skeleton'
  | 'muscles'

export type ViewId = 'front' | 'back' | 'side'
type Quality = 'low' | 'balanced' | 'high'

export interface OrganInfo {
  label: string
  description: string
  metric: string
  value: string
  detail: string
  color: string
  baseMeshColor: string
  highlightColor: string
  meshMatchers: string[]
  available: boolean
}

interface MeshRecord {
  mesh: THREE.Mesh
  organ: OrganId | null
  isShell: boolean
  baseColor: string
  highlightColor: string
  material: THREE.MeshStandardMaterial
}

function getOrganData(astronaut: Astronaut): Record<OrganId, OrganInfo> {
  const isWatch = astronaut.status === 'watch'
  const isTired = astronaut.sleep < 6.8
  const isStressed = astronaut.stress > 40

  return {
    heart: {
      label: 'Heart',
      description: 'Cardiac myocardium, ventricular chambers, and atrial geometry from calibrated scan.',
      metric: 'Cardiac rhythm & rate',
      value: `${astronaut.heartRate} bpm · ${astronaut.heartRate > 72 ? 'Elevated baseline' : 'Nominal sinus rhythm'}`,
      detail: `Stroke volume: ~72 mL · Autonomic strain: ${Math.round(astronaut.stress * 0.8)}% · Sync: ${astronaut.lastSync}`,
      color: '#f43f5e',
      baseMeshColor: '#be123c',
      highlightColor: '#ff2d55',
      meshMatchers: ['heart ventricular', 'atrial myocardium', 'myocardium'],
      available: true,
    },
    lungs: {
      label: 'Lungs & airways',
      description: 'Bilateral pulmonary lobes, main bronchi, lobar arborization, and tracheal rings.',
      metric: 'Pulmonary ventilation & SpO₂',
      value: `${astronaut.spo2}% SpO₂ · ${astronaut.spo2 < 98 ? 'Perfusion watch' : 'Optimal gas exchange'}`,
      detail: `Respiratory rate: ${Math.round(astronaut.heartRate / 4.7)} br/min · Atmospheric O₂ balance nominal`,
      color: '#38bdf8',
      baseMeshColor: '#0284c7',
      highlightColor: '#00e5ff',
      meshMatchers: ['lung', 'bronchus', 'lobar bronchus', 'tracheal'],
      available: true,
    },
    vessels: {
      label: 'Major vessels',
      description: 'Ascending aorta, aortic arch, pulmonary trunk, coronary branches, and caval venous return.',
      metric: 'Systemic vascular perfusion',
      value: `${100 - Math.round(astronaut.stress * 0.25)}% index · ${isStressed ? 'Vasoconstrictive watch' : 'Stable arterial compliance'}`,
      detail: `Mean arterial pressure: 92 mmHg · Pulse pressure baseline: 118/76 mmHg (simulated)`,
      color: '#a78bfa',
      baseMeshColor: '#6366f1',
      highlightColor: '#c084fc',
      meshMatchers: [
        'artery',
        'vein',
        'aorta',
        'vena',
        'pulmonary trunk',
        'coronary',
        'cardiac vein',
        'carotid',
        'subclavian',
        'brachiocephalic',
      ],
      available: true,
    },
    digestive: {
      label: 'Digestive organs',
      description: 'Hepatic lobes, falciform groove, gastric fundus, small intestine, and colorectal tracts.',
      metric: 'Metabolic & hydration status',
      value: `${isTired ? 'Metabolic recovery review' : 'Hydration on target · 2.4 L/day'}`,
      detail: `Hepatic functional volume: nominal · GI motility: ${isWatch ? 'Microgravity adaptation shift' : 'Nominal baseline'}`,
      color: '#fbbf24',
      baseMeshColor: '#d97706',
      highlightColor: '#fde047',
      meshMatchers: ['liver', 'stomach', 'bowel', 'intestine', 'colon', 'cecum'],
      available: true,
    },
    renal: {
      label: 'Renal system',
      description: 'Paired kidneys with hilar concavity, renal pelves, and bilateral ureteral drainage.',
      metric: 'Renal balance & filtration',
      value: `${isWatch ? 'Electrolyte balance check queued' : 'Fluid balance in range'}`,
      detail: `Glomerular filtration: stable · Electrolyte excretion index: nominal range`,
      color: '#34d399',
      baseMeshColor: '#059669',
      highlightColor: '#4ade80',
      meshMatchers: ['kidney', 'renal pelvis', 'ureter'],
      available: true,
    },
    brain: {
      label: 'Cerebral system',
      description: 'Neuro-cranial structures are not present in this anatomical torso source model.',
      metric: 'Model geometry status',
      value: 'Unavailable in asset',
      detail: 'Excluded from CC0 torso library model; interface omits simulated substitutes.',
      color: '#94a3b8',
      baseMeshColor: '#64748b',
      highlightColor: '#cbd5e1',
      meshMatchers: [],
      available: false,
    },
    skeleton: {
      label: 'Skeletal system',
      description: 'Osteo-articular thoracic framework is not modeled in this soft-tissue torso asset.',
      metric: 'Model geometry status',
      value: 'Unavailable in asset',
      detail: 'Excluded from CC0 torso library model.',
      color: '#94a3b8',
      baseMeshColor: '#64748b',
      highlightColor: '#cbd5e1',
      meshMatchers: [],
      available: false,
    },
    muscles: {
      label: 'Muscular system',
      description: 'Somatic musculature is omitted to provide direct visualization of internal viscera.',
      metric: 'Model geometry status',
      value: 'Unavailable in asset',
      detail: 'Excluded from CC0 torso library model.',
      color: '#94a3b8',
      baseMeshColor: '#64748b',
      highlightColor: '#cbd5e1',
      meshMatchers: [],
      available: false,
    },
  }
}

const focusTargets: Record<OrganId, [number, number, number]> = {
  heart: [0, 0.1, 0],
  lungs: [0, 0.16, 0],
  vessels: [0, 0.15, 0],
  digestive: [0, -0.18, 0],
  renal: [0, -0.22, 0],
  brain: [0, 0.35, 0],
  skeleton: [0, 0, 0],
  muscles: [0, 0, 0],
}

function useRenderProfile(): { quality: Quality; visible: boolean } {
  const [visible, setVisible] = useState(() => !document.hidden)
  const quality = useMemo<Quality>(() => {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
    const cores = navigator.hardwareConcurrency ?? 4
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || memory <= 4 || cores <= 4) return 'low'
    return memory >= 8 && cores >= 8 ? 'high' : 'balanced'
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return { quality, visible }
}

export function AnatomicalTwin({
  astronaut,
  onSelectAstronaut,
}: {
  astronaut: Astronaut
  onSelectAstronaut?: (astronaut: Astronaut) => void
}) {
  const [selected, setSelected] = useState<OrganId>('heart')
  const [view, setView] = useState<ViewId>('front')
  const [resetKey, setResetKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [isInteracting, setIsInteracting] = useState(false)
  const interactionTimer = useRef<number | undefined>(undefined)

  const { quality, visible } = useRenderProfile()
  const organData = useMemo(() => getOrganData(astronaut), [astronaut])

  const beginTransition = () => setIsAnimating(true)
  const selectOrgan = (organ: OrganId) => {
    beginTransition()
    setSelected(organ)
  }

  // Demand-driven frame loop: only renders active frames when animating or user orbiting
  const frames = visible && (isAnimating || isInteracting) ? 'always' : 'demand'
  const dpr: [number, number] = quality === 'high' ? [1, 1.5] : quality === 'balanced' ? [1, 1.25] : [1, 1]
  const sparkles = quality === 'high' ? 24 : quality === 'balanced' ? 14 : 0

  useEffect(() => () => window.clearTimeout(interactionTimer.current), [])
  const beginInteraction = () => {
    window.clearTimeout(interactionTimer.current)
    setIsInteracting(true)
  }
  const endInteraction = () => {
    window.clearTimeout(interactionTimer.current)
    interactionTimer.current = window.setTimeout(() => setIsInteracting(false), 200)
  }

  const handleResetCamera = () => {
    beginTransition()
    setView('front')
    setSelected('heart')
    setResetKey((key) => key + 1)
  }

  return (
    <section className="panel overflow-hidden">
      {/* Top Header / Astronaut Context & Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-base font-bold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
            {astronaut.initials}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Astronaut Digital Twin
              </p>
              <StatusPill status={astronaut.status} />
            </div>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">{astronaut.name}</h2>
            <p className="text-xs text-slate-400">
              {astronaut.role} · {astronaut.location} · Odyssey Day {astronaut.missionDay}
            </p>
          </div>
        </div>

        {/* Quick Crew Switcher Pills & Camera Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden rounded-xl border border-white/10 bg-slate-950/60 p-1 md:flex">
            {astronauts.map((member) => (
              <button
                key={member.id}
                onClick={() => onSelectAstronaut?.(member)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  member.id === astronaut.id
                    ? 'bg-cyan-400/20 text-cyan-200 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Switch to ${member.name} (${member.role})`}
              >
                {member.initials}
              </button>
            ))}
          </div>

          <span className="hidden rounded-full border border-cyan-300/15 bg-cyan-400/[0.06] px-3 py-1.5 text-[11px] font-medium text-cyan-100 lg:inline">
            Adaptive: {quality}
          </span>

          <button
            className="button-secondary"
            onClick={handleResetCamera}
            title="Reset perspective to front default"
          >
            <RotateCcw className="size-3.5" />
            Reset camera
          </button>
        </div>
      </div>

      {/* Main 3D Side-by-Side Grid Layout */}
      <div className="anatomy-layout">
        {/* 3D WebGL Canvas Viewport */}
        <div className="anatomy-viewport">
          {/* Top-left perspective buttons */}
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
            {(['front', 'side', 'back'] as ViewId[]).map((option) => (
              <button
                key={option}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition backdrop-blur-md ${
                  view === option
                    ? 'border-cyan-300/40 bg-cyan-400/20 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    : 'border-white/10 bg-slate-950/50 text-slate-400 hover:bg-white/[0.07] hover:text-slate-200'
                }`}
                onClick={() => {
                  beginTransition()
                  setView(option)
                }}
              >
                {option} view
              </button>
            ))}
          </div>

          {/* Top-right real-time vitals badge */}
          <div className="absolute right-4 top-4 z-10 hidden sm:flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-1.5 backdrop-blur-md text-xs">
            <span className="flex items-center gap-1.5 font-medium text-rose-300">
              <HeartPulse className="size-3.5 text-rose-400 animate-pulse" />
              {astronaut.heartRate} <span className="text-[10px] text-slate-400">BPM</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 font-medium text-cyan-300">
              <Waves className="size-3.5 text-cyan-400" />
              {astronaut.spo2}% <span className="text-[10px] text-slate-400">SpO₂</span>
            </span>
          </div>

          {/* Bottom-left interactive guidance notice */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-lg border border-white/5 bg-slate-950/70 px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur-md">
            <ScanLine className="size-3.5 text-cyan-300 shrink-0" />
            <span>Drag to rotate · Scroll to zoom · Click organ to inspect</span>
          </div>

          {/* Canvas Component with demand-driven rendering */}
          <Canvas
            frameloop={frames}
            dpr={dpr}
            camera={{ position: [0, 0.04, 2.55], fov: 38 }}
            gl={{
              antialias: quality !== 'low',
              alpha: true,
              powerPreference: 'high-performance',
            }}
            fallback={<WebGLUnavailable />}
          >
            <color attach="background" args={['#050b16']} />
            <fog attach="fog" args={['#050b16', 2.8, 6.0]} />

            {/* Premium restrained holographic lighting */}
            <ambientLight intensity={0.85} color="#e0f2fe" />
            <directionalLight position={[3, 4, 3]} intensity={2.2} color="#ffffff" />
            <directionalLight position={[-3, 2, -3]} intensity={1.5} color="#38bdf8" />
            <pointLight position={[0, -1, 2]} intensity={1.6} color="#0284c7" />

            <Suspense fallback={<TwinLoader />}>
              <TwinModel
                selected={selected}
                onSelect={selectOrgan}
                astronaut={astronaut}
                organData={organData}
              />
              <HolographicScanner active={isAnimating || isInteracting} />
              <CameraDirector
                selected={selected}
                view={view}
                resetKey={resetKey}
                onSettled={() => setIsAnimating(false)}
              />
            </Suspense>

            {sparkles > 0 && (
              <Sparkles
                count={sparkles}
                scale={[2.8, 3.8, 2]}
                size={1.1}
                speed={0.18}
                opacity={0.3}
                color="#67e8f9"
              />
            )}

            <OrbitControls
              makeDefault
              enablePan={false}
              minDistance={1.4}
              maxDistance={3.8}
              minPolarAngle={0.6}
              maxPolarAngle={2.4}
              onStart={beginInteraction}
              onEnd={endInteraction}
            />
          </Canvas>
        </div>

        {/* Organ Inspector & Structure Selection Panel */}
        <OrganPanel selected={selected} onSelect={selectOrgan} organData={organData} />
      </div>
    </section>
  )
}

const OrganPanel = memo(function OrganPanel({
  selected,
  onSelect,
  organData,
}: {
  selected: OrganId
  onSelect: (organ: OrganId) => void
  organData: Record<OrganId, OrganInfo>
}) {
  const selectedOrgan = organData[selected]
  const availableCount = useMemo(
    () => Object.values(organData).filter((o) => o.available).length,
    [organData]
  )

  return (
    <aside className="flex flex-col justify-between border-t border-white/[0.07] bg-[#08111f]/90 p-5 backdrop-blur-xl lg:border-t-0 lg:border-l">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            <HeartPulse className="size-4" />
            Structure Selection
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            {availableCount} modeled
          </span>
        </div>

        {/* Organ list */}
        <div className="mt-4 space-y-1">
          {(Object.keys(organData) as OrganId[]).map((id) => {
            const organ = organData[id]
            const isSelected = selected === id
            return (
              <button
                key={id}
                disabled={!organ.available}
                onClick={() => onSelect(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                  isSelected
                    ? 'border border-cyan-400/30 bg-cyan-400/15 text-white shadow-sm'
                    : organ.available
                    ? 'border border-transparent text-slate-300 hover:bg-white/[0.045] hover:text-white'
                    : 'cursor-not-allowed border border-transparent text-slate-600'
                }`}
              >
                <span
                  className="size-2 rounded-full transition-shadow"
                  style={{
                    backgroundColor: organ.available ? organ.color : '#334155',
                    boxShadow: isSelected ? `0 0 10px ${organ.color}` : 'none',
                  }}
                />
                <span className="flex-1 text-xs font-medium">{organ.label}</span>
                {!organ.available && (
                  <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-slate-500">
                    N/A
                  </span>
                )}
                {isSelected && (
                  <CheckCircle2 className="size-3.5 text-cyan-300" />
                )}
              </button>
            )
          })}
        </div>

        {/* Selected organ detailed telemetry */}
        <div className="mt-5 rounded-xl border border-white/[0.08] bg-slate-950/60 p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ color: selectedOrgan.highlightColor }}
            >
              {selectedOrgan.label}
            </p>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Holographic ROI</span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-300">{selectedOrgan.description}</p>

          <div className="mt-4 border-t border-white/[0.06] pt-3">
            <p className="text-[11px] text-slate-400">{selectedOrgan.metric}</p>
            <p className="mt-0.5 text-base font-semibold text-white tracking-tight">
              {selectedOrgan.value}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-slate-400">{selectedOrgan.detail}</p>
          </div>
        </div>
      </div>

      {/* Attribution & Provenance Link */}
      <div className="mt-5 pt-3 border-t border-white/[0.06]">
        <a
          className="flex items-center gap-2 text-xs text-slate-500 transition hover:text-cyan-300"
          href="/assets/ANATOMY_MODEL_ATTRIBUTION.md"
          target="_blank"
          rel="noreferrer"
        >
          <Box className="size-3.5" />
          <span>Model attribution (CC0 Innerscene/MakeHuman)</span>
        </a>
      </div>
    </aside>
  )
})

const organMatchers: Record<OrganId, string[]> = {
  heart: ['heart ventricular', 'atrial myocardium', 'myocardium'],
  lungs: ['lung', 'bronchus', 'lobar bronchus', 'tracheal'],
  vessels: [
    'artery',
    'vein',
    'aorta',
    'vena',
    'pulmonary trunk',
    'coronary',
    'cardiac vein',
    'carotid',
    'subclavian',
    'brachiocephalic',
  ],
  digestive: ['liver', 'stomach', 'bowel', 'intestine', 'colon', 'cecum'],
  renal: ['kidney', 'renal pelvis', 'ureter'],
  brain: [],
  skeleton: [],
  muscles: [],
}

const organDefaultColors: Record<OrganId, { base: string; highlight: string }> = {
  heart: { base: '#be123c', highlight: '#ff2d55' },
  lungs: { base: '#0284c7', highlight: '#00e5ff' },
  vessels: { base: '#6366f1', highlight: '#c084fc' },
  digestive: { base: '#d97706', highlight: '#fde047' },
  renal: { base: '#059669', highlight: '#4ade80' },
  brain: { base: '#64748b', highlight: '#cbd5e1' },
  skeleton: { base: '#64748b', highlight: '#cbd5e1' },
  muscles: { base: '#64748b', highlight: '#cbd5e1' },
}

function TwinModel({
  selected,
  onSelect,
  organData,
}: {
  selected: OrganId
  onSelect: (id: OrganId) => void
  astronaut: Astronaut
  organData: Record<OrganId, OrganInfo>
}) {
  const gltf = useGLTF(MODEL_URL, false, true)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  const records = useRef<MeshRecord[]>([])

  // Setup materials and raycasting once per scene instance
  useEffect(() => {
    records.current = []

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const meshName = child.name.toLowerCase()
      const isShell = meshName.includes('torso shell')
      const organ =
        (Object.keys(organMatchers) as OrganId[]).find((id) =>
          organMatchers[id].some((matcher) => meshName.includes(matcher))
        ) ?? null

      if (isShell) {
        // Disable raycasting on transparent shell so pointer events penetrate directly to organs
        child.raycast = () => null
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#0891b2'),
          transparent: true,
          opacity: 0.11,
          emissive: new THREE.Color('#042f2e'),
          emissiveIntensity: 0.15,
          roughness: 0.22,
          metalness: 0.05,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
        child.material = material
        records.current.push({
          mesh: child,
          organ: null,
          isShell: true,
          baseColor: '#0891b2',
          highlightColor: '#22d3ee',
          material,
        })
      } else {
        const palette = organ ? organDefaultColors[organ] : null
        const baseColor = palette ? palette.base : '#199bb3'
        const highlightColor = palette ? palette.highlight : '#22d3ee'

        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          transparent: true,
          opacity: 0.58,
          emissive: new THREE.Color(baseColor),
          emissiveIntensity: 0.18,
          roughness: 0.32,
          metalness: 0.1,
          depthWrite: true,
        })
        child.material = material
        records.current.push({
          mesh: child,
          organ,
          isShell: false,
          baseColor,
          highlightColor,
          material,
        })
      }
    })

    return () => {
      records.current.forEach(({ material }) => material.dispose())
      records.current = []
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose()
      })
      useGLTF.clear(MODEL_URL)
    }
  }, [scene])

  // Efficient property updates on selection: NO material re-allocation!
  useEffect(() => {
    records.current.forEach(({ organ, isShell, baseColor, highlightColor, material }) => {
      if (isShell) {
        material.opacity = 0.11
        material.emissiveIntensity = 0.15
      } else {
        const isSelected = organ === selected
        const currentHighlight = (organ && organData[organ]?.highlightColor) || highlightColor
        const currentBase = (organ && organData[organ]?.baseMeshColor) || baseColor
        material.color.set(isSelected ? currentHighlight : currentBase)
        material.emissive.set(isSelected ? currentHighlight : currentBase)
        material.emissiveIntensity = isSelected ? 0.85 : 0.18
        material.opacity = isSelected ? 0.96 : 0.58
        material.needsUpdate = true
      }
    })
  }, [selected, organData])

  useEffect(() => {
    performance.mark('drnexus-anatomy-model-ready')
    performance.measure(
      'drnexus-anatomy-model-load',
      'drnexus-anatomy-module-requested',
      'drnexus-anatomy-model-ready'
    )
  }, [])

  // Organ selection directly on 3D meshes
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    const meshName = event.object.name.toLowerCase()
    const match = (Object.keys(organData) as OrganId[]).find(
      (id) =>
        organData[id].available &&
        organData[id].meshMatchers.some((matcher) => meshName.includes(matcher))
    )
    if (match) {
      onSelect(match)
    }
  }

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
  }

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  return (
    <Center>
      <primitive
        object={scene}
        scale={2.25}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </Center>
  )
}

function HolographicScanner({ active }: { active: boolean }) {
  const ring = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (active && ring.current) {
      ring.current.position.y = Math.sin(clock.getElapsedTime() * 0.65) * 0.72
      ring.current.rotation.z += 0.005
    }
  })

  return (
    <>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.007, 12, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} />
      </mesh>
      <gridHelper args={[2.4, 12, '#0e7490', '#083344']} position={[0, -0.92, 0]} />
    </>
  )
}

function CameraDirector({
  selected,
  view,
  resetKey,
  onSettled,
}: {
  selected: OrganId
  view: ViewId
  resetKey: number
  onSettled: () => void
}) {
  const { camera, controls } = useThree()
  const controlRef = controls as OrbitControlsImpl | undefined
  const target = useRef(new THREE.Vector3())
  const desiredPosition = useRef(new THREE.Vector3(0, 0.04, 2.55))

  useEffect(() => {
    const focus = focusTargets[selected]
    const base: Record<ViewId, [number, number, number]> = {
      front: [0, 0.04, 2.55],
      back: [0, 0.04, -2.55],
      side: [2.55, 0.04, 0],
    }
    desiredPosition.current.set(...base[view])
    target.current.set(...focus)
  }, [selected, view, resetKey])

  useFrame(() => {
    const positionDelta = camera.position.distanceTo(desiredPosition.current)
    const targetDelta = controlRef?.target.distanceTo(target.current) ?? 0
    if (positionDelta > 0.002 || targetDelta > 0.002) {
      camera.position.lerp(desiredPosition.current, 0.08)
      if (controlRef) {
        controlRef.target.lerp(target.current, 0.08)
        controlRef.update()
      } else {
        camera.lookAt(target.current)
      }
    } else {
      onSettled()
    }
  })

  return null
}

function TwinLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.14, 16, 16]} />
      <meshBasicMaterial color="#22d3ee" wireframe />
    </mesh>
  )
}

function WebGLUnavailable() {
  return (
    <div className="flex min-h-[520px] items-center justify-center p-8 text-center bg-slate-950/80">
      <div className="max-w-md rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
        <ShieldAlert className="mx-auto size-9 text-amber-300" />
        <h3 className="mt-4 text-base font-semibold text-white">WebGL Rendering Offline</h3>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          Hardware-accelerated 3D WebGL is unavailable on this browser session. Mission telemetry and
          the rest of the dashboard remain fully operational.
        </p>
      </div>
    </div>
  )
}

function ModelErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="panel flex min-h-[520px] flex-col items-center justify-center p-8 text-center bg-[#07111f]/90">
      <div className="max-w-md rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6">
        <ShieldAlert className="mx-auto size-9 text-rose-300" />
        <h3 className="mt-4 text-base font-semibold text-white">Anatomical Model Offline</h3>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          The 3D anatomical twin geometry could not be loaded. Real-time telemetry monitoring and crew
          records remain available.
        </p>
        {onRetry && (
          <button onClick={onRetry} className="button-secondary mt-5">
            <RotateCcw className="size-3.5" /> Retry Model Load
          </button>
        )}
      </div>
    </div>
  )
}

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    return this.state.failed ? (
      <ModelErrorFallback onRetry={() => this.setState({ failed: false })} />
    ) : (
      this.props.children
    )
  }
}

export function AnatomicalTwinWithFallback({
  astronaut,
  onSelectAstronaut,
}: {
  astronaut?: Astronaut
  onSelectAstronaut?: (astronaut: Astronaut) => void
}) {
  const activeAstronaut = astronaut ?? astronauts[0]
  return (
    <SceneErrorBoundary>
      <AnatomicalTwin astronaut={activeAstronaut} onSelectAstronaut={onSelectAstronaut} />
    </SceneErrorBoundary>
  )
}
