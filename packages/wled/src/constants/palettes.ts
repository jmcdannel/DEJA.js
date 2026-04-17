export interface WledPaletteMeta {
  id: number
  name: string
  /** CSS gradient string for preview rendering */
  gradient?: string
}

/** All built-in WLED palettes. Index = palette ID. Fetched from device at 192.168.86.35. */
export const WLED_PALETTES: WledPaletteMeta[] = [
  {
    id: 0,
    name: 'Default',
    gradient: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)',
  },
  { id: 1, name: '* Random Cycle' },
  { id: 2, name: '* Color 1' },
  { id: 3, name: '* Colors 1&2' },
  { id: 4, name: '* Color Gradient' },
  { id: 5, name: '* Colors Only' },
  {
    id: 6,
    name: 'Party',
    gradient: 'linear-gradient(90deg, #5500ab, #84007c, #b5004b, #e5001b, #e81700, #b84700, #abab00, #abab00, #ab5500, #dd1177, #f200ab)',
  },
  {
    id: 7,
    name: 'Cloud',
    gradient: 'linear-gradient(90deg, #0000ff, #0000ee, #0000cc, #4488ff, #88aaff, #aaccff, #ccddff, #eeeeff)',
  },
  {
    id: 8,
    name: 'Lava',
    gradient: 'linear-gradient(90deg, #000000, #1a0000, #3a0000, #7a0000, #cc0000, #ff4400, #ff8800, #ffcc00, #ffffff)',
  },
  {
    id: 9,
    name: 'Ocean',
    gradient: 'linear-gradient(90deg, #000060, #000080, #0000b0, #0000e0, #0033ff, #0066ff, #00aaff, #00ccff, #00eeff)',
  },
  {
    id: 10,
    name: 'Forest',
    gradient: 'linear-gradient(90deg, #002200, #004400, #006600, #008800, #00aa00, #00cc00, #00ee00, #33ff33)',
  },
  {
    id: 11,
    name: 'Rainbow',
    gradient: 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0000ff, #8800ff, #ff0088)',
  },
  {
    id: 12,
    name: 'Rainbow Bands',
    gradient: 'linear-gradient(90deg, #ff0000, #ff0000, #ff8800, #ff8800, #ffff00, #ffff00, #00ff00, #00ff00, #0000ff, #0000ff, #8800ff, #8800ff)',
  },
  {
    id: 13,
    name: 'Sunset',
    gradient: 'linear-gradient(90deg, #120a8f, #380c73, #6a0d68, #a01060, #d4204e, #f04030, #f08020, #f0c030)',
  },
  { id: 14, name: 'Rivendell' },
  {
    id: 15,
    name: 'Breeze',
    gradient: 'linear-gradient(90deg, #00aaff, #aaddff, #ffffff, #aaddff, #00aaff)',
  },
  {
    id: 16,
    name: 'Red & Blue',
    gradient: 'linear-gradient(90deg, #ff0000, #880000, #000000, #000088, #0000ff)',
  },
  {
    id: 17,
    name: 'Yellowout',
    gradient: 'linear-gradient(90deg, #000000, #333300, #888800, #cccc00, #ffff00, #ffffff)',
  },
  { id: 18, name: 'Analogous' },
  {
    id: 19,
    name: 'Splash',
    gradient: 'linear-gradient(90deg, #0000ff, #00aaff, #ffffff, #ff8800, #ff0000)',
  },
  {
    id: 20,
    name: 'Pastel',
    gradient: 'linear-gradient(90deg, #ffaaaa, #ffddaa, #ffffaa, #aaffaa, #aaaaff, #ddaaff)',
  },
  {
    id: 21,
    name: 'Sunset 2',
    gradient: 'linear-gradient(90deg, #000033, #330066, #660099, #9900cc, #cc3300, #ff6600, #ffcc00)',
  },
  {
    id: 22,
    name: 'Beach',
    gradient: 'linear-gradient(90deg, #fade8c, #f4c56f, #f2a945, #e88831, #e07020, #00aaff, #006699)',
  },
  { id: 23, name: 'Vintage' },
  { id: 24, name: 'Departure' },
  {
    id: 25,
    name: 'Landscape',
    gradient: 'linear-gradient(90deg, #005500, #008800, #55aa00, #aacc00, #d4aa00, #886600, #553300)',
  },
  { id: 26, name: 'Beech' },
  { id: 27, name: 'Sherbet' },
  { id: 28, name: 'Hult' },
  { id: 29, name: 'Hult 64' },
  { id: 30, name: 'Drywet' },
  { id: 31, name: 'Jul' },
  { id: 32, name: 'Grintage' },
  { id: 33, name: 'Rewhi' },
  { id: 34, name: 'Tertiary' },
  {
    id: 35,
    name: 'Fire',
    gradient: 'linear-gradient(90deg, #000000, #330000, #660000, #cc0000, #ff4400, #ff8800, #ffcc00, #ffff00)',
  },
  {
    id: 36,
    name: 'Icefire',
    gradient: 'linear-gradient(90deg, #000000, #000033, #0000aa, #0088ff, #00ccff, #ffffff, #ffcc00, #ff6600, #cc0000)',
  },
  {
    id: 37,
    name: 'Cyane',
    gradient: 'linear-gradient(90deg, #000000, #003333, #006666, #00aaaa, #00cccc, #00ffff)',
  },
  {
    id: 38,
    name: 'Light Pink',
    gradient: 'linear-gradient(90deg, #ffddee, #ffaabb, #ff88aa, #ff6699, #ff4488)',
  },
  {
    id: 39,
    name: 'Autumn',
    gradient: 'linear-gradient(90deg, #8b0000, #cc2200, #ee5500, #ff8800, #ffcc00, #ddaa00)',
  },
  {
    id: 40,
    name: 'Magenta',
    gradient: 'linear-gradient(90deg, #000000, #330033, #660066, #cc00cc, #ff00ff, #ff66ff)',
  },
  { id: 41, name: 'Magred' },
  { id: 42, name: 'Yelmag' },
  {
    id: 43,
    name: 'Yelblu',
    gradient: 'linear-gradient(90deg, #ffff00, #aaaa00, #005500, #0000aa, #0000ff)',
  },
  {
    id: 44,
    name: 'Orange & Teal',
    gradient: 'linear-gradient(90deg, #ff6600, #ff8800, #ffaa00, #008888, #006666, #004444)',
  },
  {
    id: 45,
    name: 'Tiamat',
    gradient: 'linear-gradient(90deg, #ff0000, #ff6600, #ffcc00, #00ff00, #0000ff, #6600ff)',
  },
  {
    id: 46,
    name: 'April Night',
    gradient: 'linear-gradient(90deg, #000011, #000033, #000066, #001199, #0033cc, #0066ff, #3399ff)',
  },
  {
    id: 47,
    name: 'Orangery',
    gradient: 'linear-gradient(90deg, #ff6600, #ff8800, #ffaa00, #ffcc00, #ff9900, #ff6600)',
  },
  {
    id: 48,
    name: 'C9',
    gradient: 'linear-gradient(90deg, #b80400, #da8a00, #1ea000, #0048b3, #ff6600)',
  },
  {
    id: 49,
    name: 'Sakura',
    gradient: 'linear-gradient(90deg, #ffddee, #ffbbcc, #ff88aa, #ff5588, #ff2266, #dd0044)',
  },
  {
    id: 50,
    name: 'Aurora',
    gradient: 'linear-gradient(90deg, #000000, #003300, #006600, #00aa44, #00ff88, #00aaff, #0044ff)',
  },
  {
    id: 51,
    name: 'Atlantica',
    gradient: 'linear-gradient(90deg, #000033, #002266, #0044aa, #0066cc, #0099ee, #00bbff, #00ddff)',
  },
  { id: 52, name: 'C9 2' },
  { id: 53, name: 'C9 New' },
  {
    id: 54,
    name: 'Temperature',
    gradient: 'linear-gradient(90deg, #0000ff, #0088ff, #00ffff, #00ff88, #00ff00, #88ff00, #ffff00, #ff8800, #ff0000)',
  },
  { id: 55, name: 'Aurora 2' },
  { id: 56, name: 'Retro Clown' },
  { id: 57, name: 'Candy' },
  { id: 58, name: 'Toxy Reaf' },
  { id: 59, name: 'Fairy Reaf' },
  { id: 60, name: 'Semi Blue' },
  { id: 61, name: 'Pink Candy' },
  { id: 62, name: 'Red Reaf' },
  { id: 63, name: 'Aqua Flash' },
  { id: 64, name: 'Yelblu Hot' },
  { id: 65, name: 'Lite Light' },
  { id: 66, name: 'Red Flash' },
  { id: 67, name: 'Blink Red' },
  { id: 68, name: 'Red Shift' },
  { id: 69, name: 'Red Tide' },
  { id: 70, name: 'Candy2' },
]
