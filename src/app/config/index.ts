const hasProcess = typeof process !== 'undefined';
const processArgs = hasProcess && Array.isArray(process.argv) ? process.argv : [];
const processEnv = hasProcess && process.env ? process.env : {};
const isLargeServer = processArgs.indexOf('--largeserver') !== -1;

const maxPlayers = isLargeServer ? 80 : 40;

export interface WeaponVariant {
  id: number;
  src: string;
  xp: number;
  val: number;
  poison?: boolean;
}

export const weaponVariants: WeaponVariant[] = [
  { id: 0, src: '', xp: 0, val: 1 },
  { id: 1, src: '_g', xp: 3000, val: 1.1 },
  { id: 2, src: '_d', xp: 7000, val: 1.18 },
  { id: 3, src: '_r', poison: true, xp: 12000, val: 1.18 },
];

interface VariantPlayer {
  weaponXP?: number[];
  weaponIndex: number;
}

export const fetchVariant = (player: VariantPlayer): WeaponVariant => {
  const weaponXp = (player.weaponXP && player.weaponXP[player.weaponIndex]) || 0;
  for (let i = weaponVariants.length - 1; i >= 0; i -= 1) {
    if (weaponXp >= weaponVariants[i].xp) {
      return weaponVariants[i];
    }
  }
  return weaponVariants[0];
};

export interface ClientConfig {
  maxScreenWidth: number;
  maxScreenHeight: number;
  serverUpdateRate: number;
  maxPlayers: number;
  maxPlayersHard: number;
  collisionDepth: number;
  minimapRate: number;
  colGrid: number;
  clientSendRate: number;
  healthBarWidth: number;
  healthBarPad: number;
  iconPadding: number;
  iconPad: number;
  deathFadeout: number;
  crownIconScale: number;
  crownPad: number;
  chatCountdown: number;
  chatCooldown: number;
  inSandbox: boolean;
  maxAge: number;
  gatherAngle: number;
  gatherWiggle: number;
  hitReturnRatio: number;
  hitAngle: number;
  playerScale: number;
  playerSpeed: number;
  playerDecel: number;
  nameY: number;
  skinColors: string[];
  animalCount: number;
  aiTurnRandom: number;
  cowNames: string[];
  shieldAngle: number;
  weaponVariants: WeaponVariant[];
  fetchVariant: typeof fetchVariant;
  resourceTypes: string[];
  areaCount: number;
  treesPerArea: number;
  bushesPerArea: number;
  totalRocks: number;
  goldOres: number;
  riverWidth: number;
  riverPadding: number;
  waterCurrent: number;
  waveSpeed: number;
  waveMax: number;
  treeScales: number[];
  bushScales: number[];
  rockScales: number[];
  snowBiomeTop: number;
  snowSpeed: number;
  maxNameLength: number;
  mapScale: number;
  mapPingScale: number;
  mapPingTime: number;
}

export const config: ClientConfig = {
  // RENDER
  maxScreenWidth: 1920,
  maxScreenHeight: 1080,

  // SERVER
  serverUpdateRate: 9,
  maxPlayers,
  maxPlayersHard: maxPlayers + 10,
  collisionDepth: 6,
  minimapRate: 3000,

  // COLLISIONS
  colGrid: 10,

  // CLIENT
  clientSendRate: 5,

  // UI
  healthBarWidth: 50,
  healthBarPad: 4.5,
  iconPadding: 15,
  iconPad: 0.9,
  deathFadeout: 3000,
  crownIconScale: 60,
  crownPad: 35,

  // CHAT
  chatCountdown: 3000,
  chatCooldown: 500,

  // SANDBOX
  inSandbox: processEnv.VULTR_SCHEME === 'mm_exp',

  // PLAYER
  maxAge: 100,
  gatherAngle: Math.PI / 2.6,
  gatherWiggle: 10,
  hitReturnRatio: 0.25,
  hitAngle: Math.PI / 2,
  playerScale: 35,
  playerSpeed: 0.0016,
  playerDecel: 0.993,
  nameY: 34,

  // CUSTOMIZATION
  skinColors: ['#bf8f54', '#cbb091', '#896c4b', '#fadadc', '#ececec', '#c37373', '#4c4c4c', '#ecaff7', '#738cc3', '#8bc373'],

  // ANIMALS
  animalCount: 7,
  aiTurnRandom: 0.06,
  cowNames: [
    'Sid', 'Steph', 'Bmoe', 'Romn', 'Jononthecool', 'Fiona', 'Vince', 'Nathan', 'Nick', 'Flappy', 'Ronald', 'Otis', 'Pepe',
    'Mc Donald', 'Theo', 'Fabz', 'Oliver', 'Jeff', 'Jimmy', 'Helena', 'Reaper', 'Ben', 'Alan', 'Naomi', 'XYZ', 'Clever',
    'Jeremy', 'Mike', 'Destined', 'Stallion', 'Allison', 'Meaty', 'Sophia', 'Vaja', 'Joey', 'Pendy', 'Murdoch', 'Theo',
    'Jared', 'July', 'Sonia', 'Mel', 'Dexter', 'Quinn', 'Milky',
  ],

  // WEAPONS
  shieldAngle: Math.PI / 3,
  weaponVariants,
  fetchVariant,

  // NATURE
  resourceTypes: ['wood', 'food', 'stone', 'points'],
  areaCount: 7,
  treesPerArea: 9,
  bushesPerArea: 3,
  totalRocks: 32,
  goldOres: 7,
  riverWidth: 724,
  riverPadding: 114,
  waterCurrent: 0.0011,
  waveSpeed: 0.0001,
  waveMax: 1.3,
  treeScales: [150, 160, 165, 175],
  bushScales: [80, 85, 95],
  rockScales: [80, 85, 90],

  // BIOME DATA
  snowBiomeTop: 2400,
  snowSpeed: 0.75,

  // DATA
  maxNameLength: 15,

  // MAP
  mapScale: 14400,
  mapPingScale: 40,
  mapPingTime: 2200,
};

export default config;

// Ensure CommonJS consumers continue to work while we migrate.
declare const module: any;
if (typeof module !== 'undefined' && module?.exports) {
  module.exports = config;
  module.exports.config = config;
  module.exports.fetchVariant = fetchVariant;
  module.exports.weaponVariants = weaponVariants;
}
