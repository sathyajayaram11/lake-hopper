export interface EffectIntensity {
  pixelRatioScale: number; // multiplies the renderer's current pixel ratio, e.g. 0.6
  frameSkipPattern: number; // render every Nth frame instead of every frame
}

export const EFFECT_INTENSITIES: Record<string, EffectIntensity> = {
  stage11Lag: { pixelRatioScale: 0.6, frameSkipPattern: 2 },
};
