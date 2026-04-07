import { useEffect, useState } from 'react'

import { LPC_ANIMATION_CONFIGS, type LpcAnimationName, type LpcOrientation } from '../types/lpc-character'

export type LpcWalkDirection = LpcOrientation

interface UseLpcWalkAnimationOptions {
    fps?: number
    isPlaying?: boolean
    animation?: LpcAnimationName
}

export function useLpcAnimation(options: UseLpcWalkAnimationOptions = {}) {
    const { fps = 8, isPlaying = true, animation = 'walk' } = options
    const frames = LPC_ANIMATION_CONFIGS[animation].cycle
    const [frameIndex, setFrameIndex] = useState(0)

    useEffect(() => {
        setFrameIndex(0)
    }, [animation])

    useEffect(() => {
        if (!isPlaying) {
            return undefined
        }

        const intervalMs = Math.max(1, Math.round(1000 / fps))
        const intervalId = window.setInterval(() => {
            setFrameIndex((currentIndex) => (currentIndex + 1) % frames.length)
        }, intervalMs)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [fps, frames.length, isPlaying])

    return {
        frame: frames[frameIndex],
        frameIndex,
        frames,
    }
}

export function useLpcWalkAnimation(options: UseLpcWalkAnimationOptions = {}) {
    const { fps = 8, isPlaying = true } = options

    return useLpcAnimation({ animation: 'walk', fps, isPlaying })
}