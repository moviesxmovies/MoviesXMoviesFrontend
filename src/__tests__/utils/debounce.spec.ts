import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import debounce from "@/utils/debounce";

const callback = vi.fn();
const debouncedFn = debounce(callback, 500);

describe("debounce utility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should execute the function after the specified delay", () => {
    debouncedFn();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should reset the timer if called again before the delay expires", () => {
    debouncedFn();
    
    vi.advanceTimersByTime(300);
    
    debouncedFn();

    vi.advanceTimersByTime(300);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should pass the correct arguments to the original function", () => {
    debouncedFn("hello", 123);
    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledWith("hello", 123);
  });

  it("should execute only the last call when multiple calls are made", () => {
    debouncedFn("first");
    debouncedFn("second");
    debouncedFn("third");

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("third");
  });
});