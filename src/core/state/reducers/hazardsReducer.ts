export interface ActiveHazardInfo {
  hazardId: string;
  lane: 0 | 1 | 2;
  distanceFromPlayerM: number;
  heightBand: 'low' | 'mid' | 'high';
  effect: 'stumble' | 'slow';
}

export interface ActivePickupInfo {
  pickupId: string;
  lane: 0 | 1 | 2;
  distanceFromPlayerM: number;
}

export interface HazardsState {
  hazards: ActiveHazardInfo[];
  pickups: ActivePickupInfo[];
}

export const initialHazardsState: HazardsState = {
  hazards: [],
  pickups: [],
};

export type HazardsAction =
  | { type: 'hazards/updated'; hazards: ActiveHazardInfo[] }
  | { type: 'pickups/updated'; pickups: ActivePickupInfo[] };

export function hazardsReducer(state: HazardsState, action: HazardsAction): HazardsState {
  switch (action.type) {
    case 'hazards/updated':
      return { ...state, hazards: action.hazards };
    case 'pickups/updated':
      return { ...state, pickups: action.pickups };
    default:
      return state;
  }
}
