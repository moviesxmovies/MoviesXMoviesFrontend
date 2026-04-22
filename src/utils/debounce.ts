function debounce(fn: Function, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export default debounce;
