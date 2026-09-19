export interface EventCatalog {
  app_opened: { timestamp: number };
  LoginSubmitted: { name: string; section: string };
  login_completed: { playerId: string; section: string };
  RunStartRequested: { characterId: string | null };
  run_started: { runId: string; characterId: string | null; timestamp: number };
  player_stumbled: { stageId: string; distance: number; hazardId: string };
  player_caught: { stageId: string; distance: number; hazardId: string | null };
}
