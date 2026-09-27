type TimerHandle = ReturnType<typeof setTimeout>;

export class PathDebouncer {
  private readonly timers = new Map<string, TimerHandle>();

  constructor(private readonly delayMilliseconds: number) {}

  schedule(path: string, callback: () => void): void {
    this.cancel(path);

    const timer = setTimeout(() => {
      this.timers.delete(path);
      callback();
    }, this.delayMilliseconds);
    this.timers.set(path, timer);
  }

  cancel(path: string): void {
    const timer = this.timers.get(path);
    if (timer === undefined) {
      return;
    }

    clearTimeout(timer);
    this.timers.delete(path);
  }

  clearAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
