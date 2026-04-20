import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";

// ── IntersectionObserver mock ─────────────────────────────────────────────────
type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let activeCallback: IOCallback | null = null;
let activeObservedEl: Element | null = null;
const mockObserve = vi.fn((el: Element) => {
  activeObservedEl = el;
});
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IOCallback, _options: IntersectionObserverInit) {
    activeCallback = callback;
  }
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
}

const triggerIntersection = (isIntersecting: boolean) => {
  activeCallback?.([{ isIntersecting } as IntersectionObserverEntry]);
};

// ── Wrapper component ───────────────────────────────────────────────
const buildWrapper = (callback: () => void) =>
  defineComponent({
    setup() {
      const { sentinelRef } = useInfiniteScroll(callback);
      return { sentinelRef };
    },
    template: `<div><div ref="sentinelRef" data-testid="sentinel" /></div>`,
  });

// ─────────────────────────────────────────────────────────────────────────────
describe("useInfiniteScroll", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    activeCallback = null;
    activeObservedEl = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("initialization", () => {
    it("Before mounting, sentinelRef.value is null", () => {
      mount(
        defineComponent({
          setup() {
            const composable = useInfiniteScroll(vi.fn());
            expect(composable.sentinelRef.value).toBeNull();
            return composable;
          },
          template: `<div><div ref="sentinelRef" /></div>`,
        }),
      );
    });

    it("creates an IntersectionObserver when the sentinelRef is assigned to an element", async () => {
      const observerSpy = vi.spyOn(globalThis, "IntersectionObserver" as never);
      mount(buildWrapper(vi.fn()));
      await nextTick();

      expect(observerSpy).toHaveBeenCalledTimes(1);
    });

    it("creates the observer with root: null and threshold: 0.1", async () => {
      const observerSpy = vi.spyOn(globalThis, "IntersectionObserver" as never);
      mount(buildWrapper(vi.fn()));
      await nextTick();

      const [, options] = observerSpy.mock.calls[0] as unknown[] as [
        unknown,
        IntersectionObserverInit,
      ];
      expect(options).toEqual({ root: null, threshold: 0.1 });
    });

    it("calls observe() with the sentinel element from the DOM", async () => {
      mount(buildWrapper(vi.fn()));
      await nextTick();

      expect(mockObserve).toHaveBeenCalledTimes(1);
      expect(activeObservedEl).toBeInstanceOf(HTMLElement);
    });
  });

  describe("callback invocation", () => {
    it("calls the callback when the sentinel intersects (isIntersecting: true)", async () => {
      const callback = vi.fn();
      mount(buildWrapper(callback));
      await nextTick();

      triggerIntersection(true);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("does not call the callback when isIntersecting is false", async () => {
      const callback = vi.fn();
      mount(buildWrapper(callback));
      await nextTick();

      triggerIntersection(false);

      expect(callback).not.toHaveBeenCalled();
    });

    it("calls the callback each time the element re-intersects", async () => {
      const callback = vi.fn();
      mount(buildWrapper(callback));
      await nextTick();

      triggerIntersection(true); // +1
      triggerIntersection(false); // 0
      triggerIntersection(true); // +1
      triggerIntersection(true); // +1

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("does not call the callback when the array of entries is empty (entry is undefined)", async () => {
      const callback = vi.fn();
      mount(buildWrapper(callback));
      await nextTick();

      activeCallback?.([]);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("stop (disconnect)", () => {
    it("disconnects the observer when sentinelRef passes to null", async () => {
      const wrapper = mount(buildWrapper(vi.fn()));
      await nextTick();

      wrapper.vm.sentinelRef = null;
      await nextTick();

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it("disconnects the previous observer before creating a new one (stop within start)", async () => {
      const wrapper = mount(buildWrapper(vi.fn()));
      await nextTick();

      const newEl = document.createElement("div");
      wrapper.vm.sentinelRef = newEl;
      await nextTick();

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
      expect(mockObserve).toHaveBeenCalledTimes(2); // mounted call + new call
    });
  });

  describe("cleanup on unmount", () => {
    it("disconnects the observer when unmounting the component", async () => {
      const wrapper = mount(buildWrapper(vi.fn()));
      await nextTick();

      expect(mockDisconnect).not.toHaveBeenCalled();

      wrapper.unmount();

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it("does not throw an error if the component is unmounted before sentinelRef is assigned", () => {
      const wrapper = mount(
        defineComponent({
          setup() {
            useInfiniteScroll(vi.fn());
          },
          template: `<div />`,
        }),
      );

      expect(() => wrapper.unmount()).not.toThrow();
    });

    it("does not call the callback after unmounting", async () => {
      const callback = vi.fn();
      const wrapper = mount(buildWrapper(callback));
      await nextTick();

      wrapper.unmount();

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("sentinelRef watch reactivity", () => {
    it("starts observing when sentinelRef changes from null to an element", async () => {
      mount(buildWrapper(vi.fn()));
      await nextTick();

      expect(mockObserve).toHaveBeenCalledTimes(1);
      expect(activeObservedEl).not.toBeNull();
    });

    it("the new observer receives the callback correctly after an element change", async () => {
      const callback = vi.fn();
      const wrapper = mount(buildWrapper(callback));
      await nextTick();

      const newEl = document.createElement("div");
      wrapper.vm.sentinelRef = newEl;
      await nextTick();

      triggerIntersection(true);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
