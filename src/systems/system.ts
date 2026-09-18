export interface System {
  init?(): void;
  fixedUpdate?(dtMs: number): void;
  render?(alpha: number): void;
  dispose?(): void;
}
