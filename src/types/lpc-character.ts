import type { LpcMergeLayer } from './lpc-assets'
import type { LpcSheetCatalogEntry } from './lpc-sheet-catalog'

export const LPC_BODY_TYPES = [
    'male',
    'female',
    'muscular',
    'pregnant',
    'teen',
    'child',
] as const

export const LPC_HEAD_STYLES = ['human_male', 'human_female'] as const

export const LPC_FACE_STYLES = ['neutral'] as const

export const LPC_HAIR_STYLES = [
    'afro',
    'balding',
    'bangs',
    'bangs_bun',
    'bangslong',
    'bangslong2',
    'bangsshort',
    'bedhead',
    'bob',
    'bob_side_part',
    'braid',
    'braid2',
    'bunches',
    'buzzcut',
    'cornrows',
    'cowlick',
    'cowlick_tall',
    'curls_large',
    'curls_large_xlong',
    'curly_long',
    'curly_short',
    'curly_short2',
    'curtains',
    'curtains_long',
    'dreadlocks_long',
    'dreadlocks_short',
    'extensions',
    'flat_top_fade',
    'flat_top_straight',
    'half_up',
    'halfmessy',
    'high_and_tight',
    'high_ponytail',
    'idol',
    'jewfro',
    'lob',
    'long',
    'long_band',
    'long_center_part',
    'long_messy',
    'long_messy2',
    'long_straight',
    'long_tied',
    'longhawk',
    'loose',
    'messy',
    'messy1',
    'messy2',
    'messy3',
    'mop',
    'natural',
    'page',
    'page2',
    'parted',
    'parted_side_bangs',
    'parted_side_bangs2',
    'parted2',
    'parted3',
    'pigtails',
    'pigtails_bangs',
    'pixie',
    'plain',
    'ponytail',
    'ponytail2',
    'princess',
    'relm_ponytail',
    'relm_short',
    'relm_xlong',
    'sara',
    'shorthawk',
    'shoulderl',
    'shoulderr',
    'single',
    'spiked',
    'spiked_beehive',
    'spiked_liberty',
    'spiked_liberty2',
    'spiked_porcupine',
    'spiked2',
    'swoop',
    'swoop_side',
    'twists_fade',
    'twists_straight',
    'unkempt',
    'wavy',
    'xlong',
    'xlong_wavy',
] as const

export const LPC_HAIR_COLORS = [
    'ash',
    'bg',
    'black',
    'blonde',
    'blue',
    'carrot',
    'chestnut',
    'dark_brown',
    'dark_gray',
    'fg',
    'ginger',
    'gold',
    'gray',
    'green',
    'light_brown',
    'navy',
    'orange',
    'pink',
    'platinum',
    'purple',
    'raven',
    'red',
    'redhead',
    'rose',
    'sandy',
    'strawberry',
    'violet',
    'white',
] as const

export const LPC_ORIENTATIONS = ['up', 'left', 'down', 'right'] as const

export const LPC_ANIMATION_CONFIGS = {
    spellcast: { cycle: [0, 1, 2, 3, 4, 5, 6], spriteName: 'spellcast' },
    thrust: { cycle: [0, 1, 2, 3, 4, 5, 6, 7], spriteName: 'thrust' },
    walk: { cycle: [1, 2, 3, 4, 5, 6, 7, 8], spriteName: 'walk' },
    slash: { cycle: [0, 1, 2, 3, 4, 5], spriteName: 'slash' },
    shoot: { cycle: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], spriteName: 'shoot' },
    hurt: { cycle: [0, 1, 2, 3, 4, 5], spriteName: 'hurt', fixedOrientation: 'down' },
    climb: { cycle: [0, 1, 2, 3, 4, 5], spriteName: 'climb', fixedOrientation: 'up' },
    idle: { cycle: [0, 0, 1], spriteName: 'idle' },
    jump: { cycle: [0, 1, 2, 3, 4, 1], spriteName: 'jump' },
    sit: { cycle: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2], spriteName: 'sit' },
    emote: { cycle: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2], spriteName: 'emote' },
    run: { cycle: [0, 1, 2, 3, 4, 5, 6, 7], spriteName: 'run' },
    combat: { cycle: [0, 0, 1], spriteName: 'combat_idle' },
    '1h_slash': { cycle: [0, 1, 2, 3, 4, 5, 6], spriteName: 'backslash' },
    '1h_backslash': { cycle: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12], spriteName: 'backslash' },
    '1h_halfslash': { cycle: [0, 1, 2, 3, 4, 5], spriteName: 'halfslash' },
} as const

export type LpcBodyType = (typeof LPC_BODY_TYPES)[number]
export type LpcHeadStyle = (typeof LPC_HEAD_STYLES)[number]
export type LpcFaceStyle = (typeof LPC_FACE_STYLES)[number]
export type LpcKnownHairStyle = (typeof LPC_HAIR_STYLES)[number]
export type LpcKnownHairColor = (typeof LPC_HAIR_COLORS)[number]
// Keep string extensibility while preserving literal IntelliSense suggestions.
export type LpcHairStyle = LpcKnownHairStyle | (string & {})
export type LpcHairColor = LpcKnownHairColor | (string & {})
export type LpcOrientation = (typeof LPC_ORIENTATIONS)[number]
export type LpcAnimationName = keyof typeof LPC_ANIMATION_CONFIGS

export interface LpcCharacterBody {
    type?: LpcBodyType
    visible?: boolean
}

export interface LpcCharacterHead {
    style?: LpcHeadStyle
    visible?: boolean
}

export interface LpcCharacterFace {
    style?: LpcFaceStyle
    visible?: boolean
}

export interface LpcCosmeticItem {
    spritePath: string
    color?: string
    visible?: boolean
}

export interface LpcCharacterHair {
    style?: LpcHairStyle
    color?: LpcHairColor
    random?: boolean
    visible?: boolean
    items?: LpcCosmeticItem[]
}

// ---------------------------------------------------------------------------
// Clothing
// ---------------------------------------------------------------------------

export const LPC_TORSO_PATHS = [
    'torso/aprons/apron',
    'torso/aprons/apron_full',
    'torso/aprons/apron_half',
    'torso/aprons/overalls',
    'torso/aprons/suspenders',
    'torso/armour/leather',
    'torso/armour/legion',
    'torso/armour/plate',
    'torso/bandage',
    'torso/chainmail',
    'torso/clothes/blouse',
    'torso/clothes/blouse_longsleeve',
    'torso/clothes/corset',
    'torso/clothes/longsleeve/formal',
    'torso/clothes/longsleeve/formal_striped',
    'torso/clothes/longsleeve/laced',
    'torso/clothes/longsleeve/longsleeve',
    'torso/clothes/longsleeve/longsleeve2',
    'torso/clothes/longsleeve/longsleeve2_buttoned',
    'torso/clothes/longsleeve/longsleeve2_cardigan',
    'torso/clothes/longsleeve/longsleeve2_polo',
    'torso/clothes/longsleeve/longsleeve2_scoop',
    'torso/clothes/longsleeve/longsleeve2_vneck',
    'torso/clothes/longsleeve/longsleeves',
    'torso/clothes/longsleeve/longsleeves_cuffed',
    'torso/clothes/longsleeve/longsleeves2',
    'torso/clothes/longsleeve/scoop',
    'torso/clothes/robe',
    'torso/clothes/shirt',
    'torso/clothes/shortsleeve',
    'torso/clothes/sleeveless',
    'torso/clothes/tunic',
    'torso/clothes/tunic_sara',
    'torso/clothes/vest',
    'torso/clothes/vest_open',
    'torso/jacket/collared',
    'torso/jacket/frock',
    'torso/jacket/iverness',
    'torso/jacket/santa',
    'torso/jacket/tabard',
    'torso/jacket/trench',
    'torso/jacket/trim',
    'torso/waist/belt_belly',
    'torso/waist/belt_double',
    'torso/waist/belt_formal',
    'torso/waist/belt_leather',
    'torso/waist/belt_leather2',
    'torso/waist/belt_loose',
    'torso/waist/belt_mage',
    'torso/waist/belt_robe',
    'torso/waist/buckles',
    'torso/waist/obi',
    'torso/waist/sash',
    'torso/waist/sash_narrow',
    'torso/waist/waistband',
] as const

export const LPC_LEGS_PATHS = [
    'legs/armour/plate',
    'legs/cuffed',
    'legs/formal',
    'legs/formal_striped',
    'legs/fur',
    'legs/hose',
    'legs/leggings',
    'legs/leggings2',
    'legs/pantaloons',
    'legs/pants',
    'legs/pants2',
    'legs/shorts/short_shorts',
    'legs/shorts/shorts',
    'legs/skirts/belle',
    'legs/skirts/child',
    'legs/skirts/legion',
    'legs/skirts/overskirt',
    'legs/skirts/plain',
    'legs/skirts/slit',
    'legs/skirts/straight',
] as const

export const LPC_FEET_PATHS = [
    'feet/accessory/plate_toe',
    'feet/accessory/plate_toe_thick',
    'feet/armour/plate',
    'feet/boots/basic',
    'feet/boots/fold',
    'feet/boots/revised',
    'feet/boots/rimmed',
    'feet/hoofs',
    'feet/sandals',
    'feet/shoes/basic',
    'feet/shoes/ghillies',
    'feet/shoes/revised',
    'feet/shoes/sara',
    'feet/slippers',
    'feet/socks/ankle',
    'feet/socks/high',
    'feet/socks/tabi',
] as const

export const LPC_ARMS_PATHS = [
    'arms/armour/plate',
    'arms/bracers',
    'arms/gloves',
    'arms/hands/ring',
] as const

export const LPC_ACCESSORY_PATHS = [
    'backpack/backpack',
    'backpack/basket',
    'backpack/jetpack',
    'backpack/squarepack',
    'backpack/straps',
    'bauldron',
    'cape/solid',
    'cape/solid_behind',
    'cape/tattered',
    'cape/tattered_behind',
    'cape/trim',
    'dress/bodice',
    'dress/kimono/normal/universal',
    'dress/kimono/normal/trim',
    'dress/kimono/sleeves/universal',
    'dress/kimono/split/universal',
    'dress/sash',
    'dress/slit',
    'hat/cloth',
    'hat/formal',
    'hat/headband',
    'hat/helmet',
    'hat/holiday',
    'hat/magic',
    'hat/pirate',
    'hat/visor',
    'neck/amulet/cross',
    'neck/amulet/dangle',
    'neck/amulet/star',
    'neck/capeclip',
    'neck/capetie',
    'neck/cravat',
    'neck/gem/emerald',
    'neck/gem/pearl',
    'neck/gem/round',
    'neck/jabot',
    'neck/necklace/beaded_large',
    'neck/necklace/beaded_small',
    'neck/necklace/chain',
    'neck/necklace/simple',
    'neck/scarf',
    'neck/tie/bowtie',
    'neck/tie/necktie',
    'quiver',
    'shadow',
    'shield/crusader',
    'shield/crusader2',
    'shield/heater',
    'shield/kite',
    'shield/round',
    'shield/spartan',
    'shoulders/epaulets',
    'shoulders/leather',
    'shoulders/legion',
    'shoulders/mantal',
    'shoulders/plate',
    'wrists/cuffs',
    'wrists/lace',
] as const

export type LpcKnownClothingPath =
    | (typeof LPC_TORSO_PATHS)[number]
    | (typeof LPC_LEGS_PATHS)[number]
    | (typeof LPC_FEET_PATHS)[number]
    | (typeof LPC_ARMS_PATHS)[number]
    | (typeof LPC_ACCESSORY_PATHS)[number]

/** Path relative to `spritesheets/`. Supports `{bodyType}` and `{sex}` placeholders. */
export type LpcClothingSpritePath = LpcKnownClothingPath | (string & {})

export type LpcCatalogSheetId = string & {}

export interface LpcCatalogClothingItem {
    /** Catalog entry id or resolved catalog entry from `lpc-sheet-catalog`. */
    sheet: LpcCatalogSheetId | LpcSheetCatalogEntry
    /** Variant name from the sheet definition, typically the color/material filename. */
    variant?: string
    visible?: boolean
}

export interface LpcSpritePathClothingItem {
    /**
     * Path to the item relative to `spritesheets/`.
     * The renderer automatically tries body-type and sex sub-folder variants.
     * Use `{bodyType}` or `{sex}` placeholders to force a specific variant.
     * @example 'torso/clothes/tunic'
     * @example 'legs/pants'
     * @example 'feet/boots/basic'
     */
    spritePath: LpcClothingSpritePath
    /** Color name matching the PNG filename inside the animation sub-folder. */
    color?: string
    visible?: boolean
}

export type LpcClothingItem = LpcCatalogClothingItem | LpcSpritePathClothingItem

export interface LpcCharacterDefinition {
    animation?: LpcAnimationName
    orientation?: LpcOrientation
    body?: LpcCharacterBody | null
    head?: LpcCharacterHead | null
    face?: LpcCharacterFace | null
    hair?: LpcCharacterHair | null
    clothes?: LpcClothingItem[]
    layers?: LpcMergeLayer[]
}

export function defineLpcCharacter<const T extends LpcCharacterDefinition>(character: T): T {
    return character
}

export function resolveLpcAnimationSpriteName(animation: LpcAnimationName) {
    return LPC_ANIMATION_CONFIGS[animation].spriteName
}

export function resolveLpcOrientation(animation: LpcAnimationName, orientation: LpcOrientation): LpcOrientation {
    const config = LPC_ANIMATION_CONFIGS[animation]
    return 'fixedOrientation' in config ? config.fixedOrientation : orientation
}