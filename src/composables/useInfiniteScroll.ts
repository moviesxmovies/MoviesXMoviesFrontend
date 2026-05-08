import { onUnmounted, ref, watch, type Ref } from "vue";

export const useInfiniteScroll = (
  callback: () => void,
  root?: Ref<HTMLElement | null>,
) => {
  const sentinelRef = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  const start = (el: HTMLElement) => {
    stop();
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) callback();
      },
      {
        root: root?.value ?? null,
        threshold: 0.1,
      },
    );
    observer.observe(el);
  };

  const stop = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  watch(sentinelRef, (newEl) => {
    if (newEl) start(newEl);
    else stop();
  });

  onUnmounted(() => stop());

  return { sentinelRef };
};
