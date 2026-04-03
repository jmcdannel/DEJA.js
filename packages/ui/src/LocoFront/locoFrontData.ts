/**
 * Locomotive front-face design data for each roadname.
 *
 * Each entry defines the livery colours, stripe pattern, number-board style,
 * and nose-text (the big letters painted on the nose) that will be rendered
 * by the LocoFront.vue component.
 */

export interface LocoFrontDesign {
  /** Primary body colour of the cab nose */
  bodyColor: string
  /** Secondary colour (lower anti-climber / frame area) */
  frameColor: string
  /** Accent colour used for stripes or chevrons */
  accentColor: string
  /** Optional second accent for complex liveries */
  accent2Color?: string
  /** Windshield / cab glass tint */
  glassTint: string
  /** Number-board background */
  numberBoardBg: string
  /** Number-board text colour */
  numberBoardText: string
  /** Main nose text (road initials painted on the nose) */
  noseText: string
  /** Font family override for nose text (only if the road uses a distinctive face) */
  noseTextFont?: string
  /** Nose-text colour */
  noseTextColor: string
  /** Stripe style */
  stripeStyle: 'wedge' | 'chevron' | 'horizontal' | 'diagonal' | 'none'
  /** Handrail / grab-iron colour */
  handrailColor: string
  /** Headlight housing tint */
  headlightHousing: string
  /** Ditch-light colour */
  ditchLightColor: string
  /** Classification light / marker colour if different from ditch-light */
  classLightColor?: string
  /** Gradient direction for body (degrees, 0 = top-to-bottom) */
  bodyGradientAngle?: number
  /** Optional gradient stop for two-tone body */
  bodyColor2?: string
}

export const LOCO_FRONT_DESIGNS: Record<string, LocoFrontDesign> = {
  /* ─── BNSF Heritage "Wedge" ────────────────────────────────────── */
  bnsf: {
    bodyColor: '#E87511',        // BNSF orange
    frameColor: '#1a1a1a',
    accentColor: '#FFD100',      // Yellow stripe
    accent2Color: '#000000',     // Black swoosh outline
    glassTint: 'rgba(40,60,80,0.75)',
    numberBoardBg: '#111111',
    numberBoardText: '#ffffff',
    noseText: 'BNSF',
    noseTextColor: '#000000',
    stripeStyle: 'wedge',
    handrailColor: '#f5f5f5',
    headlightHousing: '#cccccc',
    ditchLightColor: '#e2e2e2',
  },
  /* ─── Union Pacific "Armour Yellow" ────────────────────────────── */
  up: {
    bodyColor: '#FFB81C',        // Armour Yellow
    frameColor: '#3d3d3d',
    accentColor: '#c8102e',      // UP red (wing accents)
    accent2Color: '#1e3a6d',     // UP blue (shield)
    glassTint: 'rgba(30,50,70,0.78)',
    numberBoardBg: '#111111',
    numberBoardText: '#ffffff',
    noseText: 'UP',
    noseTextColor: '#1e3a6d',
    stripeStyle: 'horizontal',
    handrailColor: '#f0f0f0',
    headlightHousing: '#bbbbbb',
    ditchLightColor: '#dddddd',
  },
  /* ─── CSX "Dark Future" ────────────────────────────────────────── */
  csx: {
    bodyColor: '#003087',        // CSX blue
    frameColor: '#1e1e1e',
    accentColor: '#FFD100',      // CSX yellow
    glassTint: 'rgba(20,30,55,0.82)',
    numberBoardBg: '#000000',
    numberBoardText: '#ffffff',
    noseText: 'CSX',
    noseTextColor: '#ffffff',
    stripeStyle: 'diagonal',
    handrailColor: '#eeeeee',
    headlightHousing: '#999999',
    ditchLightColor: '#cccccc',
  },
  /* ─── Norfolk Southern ─────────────────────────────────────────── */
  ns: {
    bodyColor: '#1a1a1a',        // Black
    frameColor: '#111111',
    accentColor: '#b2b2b2',      // Grey/silver striping
    glassTint: 'rgba(25,25,35,0.85)',
    numberBoardBg: '#000000',
    numberBoardText: '#ffffff',
    noseText: 'NS',
    noseTextColor: '#ffffff',
    stripeStyle: 'horizontal',
    handrailColor: '#999999',
    headlightHousing: '#777777',
    ditchLightColor: '#aaaaaa',
  },
  /* ─── Canadian National ────────────────────────────────────────── */
  cn: {
    bodyColor: '#c8102e',        // CN red (as Pantone 186)
    frameColor: '#1a1a1a',
    accentColor: '#ffffff',
    glassTint: 'rgba(40,20,20,0.78)',
    numberBoardBg: '#111111',
    numberBoardText: '#ffffff',
    noseText: 'CN',
    noseTextColor: '#ffffff',
    stripeStyle: 'none',
    handrailColor: '#f0f0f0',
    headlightHousing: '#cccccc',
    ditchLightColor: '#dddddd',
  },
  /* ─── Amtrak Phase V ───────────────────────────────────────────── */
  amtrak: {
    bodyColor: '#1c3f6e',        // Amtrak midnight blue
    bodyColor2: '#e4e4e4',       // Silver lower
    frameColor: '#222222',
    accentColor: '#e31837',      // Amtrak red
    accent2Color: '#e4e4e4',
    glassTint: 'rgba(18,32,60,0.80)',
    numberBoardBg: '#0a1e3d',
    numberBoardText: '#ffffff',
    noseText: 'Amtrak',
    noseTextColor: '#ffffff',
    noseTextFont: 'sans-serif',
    stripeStyle: 'chevron',
    handrailColor: '#e4e4e4',
    headlightHousing: '#b0b0b0',
    ditchLightColor: '#cccccc',
  },
  /* ─── Montana Rail Link ────────────────────────────────────────── */
  mrl: {
    bodyColor: '#003ea4',        // MRL blue
    frameColor: '#1a1a1a',
    accentColor: '#ffffff',
    accent2Color: '#d4001f',
    glassTint: 'rgba(15,30,65,0.82)',
    numberBoardBg: '#111111',
    numberBoardText: '#ffffff',
    noseText: 'MRL',
    noseTextColor: '#ffffff',
    stripeStyle: 'horizontal',
    handrailColor: '#e8e8e8',
    headlightHousing: '#aaaaaa',
    ditchLightColor: '#cccccc',
  },
  /* ─── Great Northern "Big Sky Blue" ────────────────────────────── */
  gn: {
    bodyColor: '#e86a10',        // GN orange
    bodyColor2: '#2d6e3f',       // GN green (lower)
    frameColor: '#2d2d2d',
    accentColor: '#2d6e3f',
    glassTint: 'rgba(40,35,20,0.78)',
    numberBoardBg: '#1a1a1a',
    numberBoardText: '#ffffff',
    noseText: 'GN',
    noseTextColor: '#ffffff',
    stripeStyle: 'horizontal',
    handrailColor: '#f0f0f0',
    headlightHousing: '#cccccc',
    ditchLightColor: '#dddddd',
  },
  /* ─── Burlington Northern (Cascade Green) ──────────────────────── */
  bn: {
    bodyColor: '#006837',        // BN green
    frameColor: '#1e1e1e',
    accentColor: '#000000',
    glassTint: 'rgba(10,40,25,0.80)',
    numberBoardBg: '#111111',
    numberBoardText: '#ffffff',
    noseText: 'BN',
    noseTextColor: '#ffffff',
    stripeStyle: 'none',
    handrailColor: '#e5e5e5',
    headlightHousing: '#aaaaaa',
    ditchLightColor: '#cccccc',
  },
  /* ─── Santa Fe "Warbonnet" ─────────────────────────────────────── */
  santefe: {
    bodyColor: '#c8102e',        // Warbonnet red
    bodyColor2: '#e4e4e4',       // Silver lower
    frameColor: '#2a2a2a',
    accentColor: '#FFD100',      // Yellow nose
    accent2Color: '#000000',
    glassTint: 'rgba(50,18,18,0.80)',
    numberBoardBg: '#111111',
    numberBoardText: '#ffffff',
    noseText: 'Santa Fe',
    noseTextColor: '#FFD100',
    stripeStyle: 'wedge',
    handrailColor: '#e8e8e8',
    headlightHousing: '#bbbbbb',
    ditchLightColor: '#dddddd',
  },
}

/** Fallback for any road not in the map */
export const DEFAULT_DESIGN: LocoFrontDesign = {
  bodyColor: '#555555',
  frameColor: '#1e1e1e',
  accentColor: '#cccccc',
  glassTint: 'rgba(30,30,40,0.80)',
  numberBoardBg: '#111111',
  numberBoardText: '#ffffff',
  noseText: '',
  noseTextColor: '#ffffff',
  stripeStyle: 'none',
  handrailColor: '#e0e0e0',
  headlightHousing: '#999999',
  ditchLightColor: '#cccccc',
}

export function getLocoFrontDesign(roadname?: string | null): LocoFrontDesign {
  if (!roadname) return DEFAULT_DESIGN
  return LOCO_FRONT_DESIGNS[roadname.toLowerCase()] ?? DEFAULT_DESIGN
}
