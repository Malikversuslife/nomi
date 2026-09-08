export const nomiCompanionStates = [
  "idle",
  "curious",
  "thinking",
  "encouraging",
  "supportive",
  "challenge",
  "reinforcing",
  "celebrating",
] as const;

export type NomiCompanionState = (typeof nomiCompanionStates)[number];

export type NomiCompanionCue = "wave" | "point" | "look" | "blink";

export interface NomiCompanionPresentation {
  state: NomiCompanionState;
  cue?: NomiCompanionCue;
  message?: string;
}
