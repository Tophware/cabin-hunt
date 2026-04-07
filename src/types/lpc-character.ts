import type { LpcMergeLayer } from './lpc-assets'

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

export interface LpcCharacterDefinition {
    animation?: LpcAnimationName
    orientation?: LpcOrientation
    body?: LpcCharacterBody | null
    head?: LpcCharacterHead | null
    face?: LpcCharacterFace | null
    hair?: LpcCharacterHair | null
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