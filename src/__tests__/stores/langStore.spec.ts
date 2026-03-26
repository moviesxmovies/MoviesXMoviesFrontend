import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLangStore } from "../../stores/langStore";
import { DEFAULT_LANGUAGE } from "../../repositories/i18n/i18nRepository";

const { mockPost, mockGet } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
}));

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

vi.mock("../../composables/useAPI", () => ({
  api: {
    post: mockPost,
    get: mockGet,
  },
}));

vi.mock("@/i18n", () => ({
  default: {
    global: {
      locale: { value: "en" },
    },
  },
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    token: "mock-token",
    refreshToken: "mock-refresh-token",
    isTokenExpired: vi.fn().mockReturnValue(false),
    setTokens: vi.fn(),
    logout: vi.fn(),
  })),
}));

describe("useLangStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("localStorage instanciates with the correct language", () => {
    localStorageMock.getItem.mockReturnValueOnce("es");
    const store = useLangStore();
    expect(store.language).toBe("es");
  });

  it('initializes with "en" if localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    const store = useLangStore();
    expect(store.language).toBe("en");
  });

  // SetLenguage
  it("setLanguage changes the language", () => {
    const store = useLangStore();
    store.setLanguage("es");
    expect(store.language).toBe("es");
  });

  it("setLanguage saves to localStorage", () => {
    const store = useLangStore();
    store.setLanguage("de");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("language", "de");
  });

  it("setLanguage updates i18n locale", async () => {
    const i18n = await import("@/i18n");
    const store = useLangStore();
    store.setLanguage("de");
    expect(i18n.default.global.locale.value).toBe("de");
  });

  // ChangeLanguage
  it("Should return 200 when changing language", async () => {
    mockPost.mockResolvedValueOnce({ status: 200 });
    const store = useLangStore();
    const spy = vi.spyOn(store, "setLanguage");

    await store.changeLanguage("fr");

    expect(mockPost).toHaveBeenCalledWith("/users/preferred-language/", {
      preferred_language: "fr",
    });
    expect(spy).toHaveBeenCalledWith("fr");
  });

  it("Should get language from localStorage when api fails", async () => {
    localStorageMock.getItem.mockReturnValue("de");
    mockGet.mockResolvedValueOnce({ status: 401, data: {} });
    const store = useLangStore();

    await store.fetchLanguage();

    expect(store.language).toBe("de");
  });

  it("Should get default language when api fails and localStorage is empty", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    mockGet.mockResolvedValueOnce({ status: 503, data: {} });
    const store = useLangStore();

    await store.fetchLanguage();

    expect(store.language).toBe("en");
  });

  it("Should get default language when language is not in available languages", async () => {
    localStorageMock.getItem.mockReturnValue("ch");
    mockGet.mockResolvedValueOnce({ status: 401, data: {} });
    const store = useLangStore();

    await store.fetchLanguage();

    expect(store.language).toBe("en");
  });

  //FetchLanguage
  it("should set default language when no token exists", async () => {
    localStorageMock.getItem.mockImplementation(() => null);
    const store = useLangStore();
    await store.fetchLanguage();
    expect(mockGet).not.toHaveBeenCalled();
    expect(store.language).toBe(DEFAULT_LANGUAGE);
  });

  it("should set default language when API returns no preferred_language", async () => {
    const store = useLangStore();
    mockGet.mockResolvedValueOnce({ data: {} });
    await store.fetchLanguage();
    expect(store.language).toBe(DEFAULT_LANGUAGE);
  });
});
