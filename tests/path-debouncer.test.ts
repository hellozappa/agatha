import { afterEach, describe, expect, it, vi } from "vitest";

import { PathDebouncer } from "../src/path-debouncer";

afterEach(() => {
  vi.useRealTimers();
});

describe("PathDebouncer", () => {
  it("runs only the latest callback scheduled for a path", () => {
    vi.useFakeTimers();
    const debouncer = new PathDebouncer(1_000);
    const firstCallback = vi.fn();
    const latestCallback = vi.fn();

    debouncer.schedule("note.md", firstCallback);
    vi.advanceTimersByTime(500);
    debouncer.schedule("note.md", latestCallback);
    vi.advanceTimersByTime(1_000);

    expect(firstCallback).not.toHaveBeenCalled();
    expect(latestCallback).toHaveBeenCalledOnce();
  });

  it("cancels every pending callback when cleared", () => {
    vi.useFakeTimers();
    const debouncer = new PathDebouncer(1_000);
    const callback = vi.fn();

    debouncer.schedule("one.md", callback);
    debouncer.schedule("two.md", callback);
    debouncer.clearAll();
    vi.runAllTimers();

    expect(callback).not.toHaveBeenCalled();
  });

  it("cancels one path without affecting another", () => {
    vi.useFakeTimers();
    const debouncer = new PathDebouncer(1_000);
    const cancelledCallback = vi.fn();
    const retainedCallback = vi.fn();

    debouncer.schedule("one.md", cancelledCallback);
    debouncer.schedule("two.md", retainedCallback);
    debouncer.cancel("one.md");
    vi.runAllTimers();

    expect(cancelledCallback).not.toHaveBeenCalled();
    expect(retainedCallback).toHaveBeenCalledOnce();
  });
});
