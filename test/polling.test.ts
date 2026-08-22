import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPoller } from "../src/polling.js";

describe("createPoller", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to a 5000ms interval", async () => {
    const fetcher = vi.fn().mockResolvedValue("x");
    const onData = vi.fn();
    const poller = createPoller(fetcher, { onData });

    poller.start();
    await vi.advanceTimersByTimeAsync(4_999);
    expect(fetcher).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("respects a configurable interval", async () => {
    const fetcher = vi.fn().mockResolvedValue("x");
    const onData = vi.fn();
    const poller = createPoller(fetcher, { intervalMs: 250, onData });

    poller.start();
    await vi.advanceTimersByTimeAsync(1_000);
    // 250ms cadence over 1000ms → 4 ticks
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it("routes results to onData and errors to onError", async () => {
    const onData = vi.fn();
    const onError = vi.fn();
    let mode: "ok" | "boom" = "ok";
    const poller = createPoller(
      () =>
        mode === "ok"
          ? Promise.resolve({ n: 1 })
          : Promise.reject(new Error("boom")),
      { intervalMs: 100, onData, onError }
    );

    poller.start();
    await vi.advanceTimersByTimeAsync(100);
    expect(onData).toHaveBeenCalledWith({ n: 1 });

    mode = "boom";
    await vi.advanceTimersByTimeAsync(100);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe("boom");

    mode = "ok";
    await vi.advanceTimersByTimeAsync(100);
    expect(onData).toHaveBeenCalledTimes(2);
    expect(onData).toHaveBeenLastCalledWith({ n: 1 });
  });

  it("wraps non-Error rejections into Error for onError", async () => {
    const onError = vi.fn();
    const onData = vi.fn();
    const poller = createPoller(() => Promise.reject("plain string"), {
      intervalMs: 50,
      onData,
      onError,
    });

    poller.start();
    await vi.advanceTimersByTimeAsync(50);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe("plain string");
  });

  it("stop() halts ticking; in-flight fetches still deliver", async () => {
    const onData = vi.fn();
    let release!: (v: unknown) => void;
    const fetcher = vi
      .fn()
      .mockImplementation(() => new Promise((res) => (release = res)));
    const poller = createPoller(fetcher, { intervalMs: 100, onData });

    poller.start();
    await vi.advanceTimersByTimeAsync(100);
    expect(fetcher).toHaveBeenCalledTimes(1);

    poller.stop();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetcher).toHaveBeenCalledTimes(1); // no more ticks

    release("late");
    await Promise.resolve();
    await Promise.resolve();
    expect(onData).toHaveBeenCalledWith("late"); // in-flight still delivered
    expect(poller.isRunning).toBe(false);
  });

  it("start() is idempotent while running", async () => {
    const fetcher = vi.fn().mockResolvedValue("x");
    const onData = vi.fn();
    const poller = createPoller(fetcher, { intervalMs: 100, onData });

    poller.start();
    poller.start();
    poller.start();
    await vi.advanceTimersByTimeAsync(1_000);
    // One timer only — double-start must not multiply the cadence.
    expect(fetcher).toHaveBeenCalledTimes(10);
  });

  it("dispose() clears the interval and prevents further callbacks", async () => {
    const onData = vi.fn();
    const onError = vi.fn();
    let release!: (v: unknown) => void;
    const fetcher = vi
      .fn()
      .mockImplementation(() => new Promise((res) => (release = res)));
    const poller = createPoller(fetcher, { intervalMs: 100, onData, onError });

    poller.start();
    await vi.advanceTimersByTimeAsync(100);
    poller.dispose();

    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // A result that was already in flight when dispose() ran is dropped:
    release("late");
    await Promise.resolve();
    await Promise.resolve();
    expect(onData).not.toHaveBeenCalled();

    // Restarting a disposed poller is a no-op:
    poller.start();
    await vi.advanceTimersByTimeAsync(500);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("skips a tick while the previous fetch is in flight", async () => {
    let release!: (v: unknown) => void;
    const gate = new Promise<unknown>((res) => (release = res));
    const fetcher = vi.fn().mockReturnValue(gate);
    const onData = vi.fn();
    const poller = createPoller(fetcher, { intervalMs: 100, onData });
    poller.start();

    await vi.advanceTimersByTimeAsync(350);
    // Ticks fire at 100/200/300, but the first fetch never settles, so
    // overlap protection must skip ticks 2 and 3 entirely.
    expect(fetcher).toHaveBeenCalledTimes(1);

    release("slow");
    await vi.advanceTimersByTimeAsync(100);
    expect(onData).toHaveBeenCalledWith("slow");
    expect(fetcher).toHaveBeenCalledTimes(2); // ticking resumed
  });

  it("rejects invalid intervals up front", () => {
    expect(() => createPoller(async () => 1, { intervalMs: 0, onData: vi.fn() })).toThrow(
      RangeError
    );
    expect(() => createPoller(async () => 1, { intervalMs: -5, onData: vi.fn() })).toThrow(
      RangeError
    );
    expect(() =>
      createPoller(async () => 1, { intervalMs: Number.POSITIVE_INFINITY, onData: vi.fn() })
    ).toThrow(RangeError);
  });
});
