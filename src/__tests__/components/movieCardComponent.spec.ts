import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MovieCardComponent from "@/components/movieCardComponent.vue";
import type { Movie } from "@/types";

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockGoToMovie } = vi.hoisted(() => ({
  mockGoToMovie: vi.fn(),
}));

vi.mock("@/utils/goTo", () => ({
  goToMovie: mockGoToMovie,
}));

vi.mock("primevue", () => ({
  Skeleton: { template: "<div class='skeleton' />" },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleMovie: Movie = {
  id: 1,
  title: "Inception",
  slug: "inception",
  release_date: "2010-07-16",
  synopsis:
    "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
  cover: "https://example.com/inception.jpg",
  genres: [],
  awards: [],
  platforms: [],
  actors: [],
  directors: [],
};

// "delete" is a reserved word — use a wrapper object for the prop
function mountComponent(
  movie: Movie,
  loading?: boolean,
  canDelete?: boolean,
) {
  return mount(MovieCardComponent, {
    props: { movie, loading, delete: canDelete },
    global: {
      mocks: { $t: (key: string) => key },
    },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MovieCardComponent", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Props ──────────────────────────────────────────────────────────────────

  describe("Props", () => {
    it("accepts movie and loading props", () => {
      const wrapper = mountComponent(sampleMovie, false);
      expect(wrapper.props().movie).toEqual(sampleMovie);
      expect(wrapper.props().loading).toBe(false);
    });

    it("accepts delete prop as true", () => {
      const wrapper = mountComponent(sampleMovie, false, true);
      expect(wrapper.props().delete).toBe(true);
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("Loading state", () => {
    it("shows skeleton when loading is true", () => {
      const wrapper = mountComponent(sampleMovie, true);
      expect(wrapper.find(".skeleton").exists()).toBe(true);
    });

    it("hides movie card when loading is true", () => {
      const wrapper = mountComponent(sampleMovie, true);
      expect(wrapper.find(".movie-card-container").exists()).toBe(false);
    });

    it("hides skeleton when loading is false", () => {
      const wrapper = mountComponent(sampleMovie, false);
      expect(wrapper.find(".movie-card.skeleton").exists()).toBe(false);
    });

    it("shows movie card when loading is false", () => {
      const wrapper = mountComponent(sampleMovie, false);
      expect(wrapper.find(".movie-card-container").exists()).toBe(true);
    });
  });

  // ── Movie info ─────────────────────────────────────────────────────────────

  describe("Movie info", () => {
    it("displays the movie title", () => {
      const wrapper = mountComponent(sampleMovie, false);
      expect(wrapper.find(".movie-title").text()).toBe("Inception");
    });

    it("displays the release date", () => {
      const wrapper = mountComponent(sampleMovie, false);
      expect(wrapper.find(".movie-year").text()).toBe("2010-07-16");
    });

    it("renders the poster with correct src and alt", () => {
      const wrapper = mountComponent(sampleMovie, false);
      const img = wrapper.find(".movie-poster");
      expect(img.attributes("src")).toBe("https://example.com/inception.jpg");
      expect(img.attributes("alt")).toBe("Inception");
    });
  });

  // ── Delete button ──────────────────────────────────────────────────────────

  describe("Delete button", () => {
    it("shows delete button when delete=true and loading=false", () => {
      const wrapper = mountComponent(sampleMovie, false, true);
      expect(wrapper.find(".delete-btn").exists()).toBe(true);
    });

    it("hides delete button when delete=false", () => {
      const wrapper = mountComponent(sampleMovie, false, false);
      expect(wrapper.find(".delete-btn").exists()).toBe(false);
    });

    it("hides delete button when delete is not provided", () => {
      const wrapper = mountComponent(sampleMovie, false);
      expect(wrapper.find(".delete-btn").exists()).toBe(false);
    });

    it("emits removeMovie with the movie slug on delete click", async () => {
      const wrapper = mountComponent(sampleMovie, false, true);
      await wrapper.find(".delete-btn").trigger("click");
      expect(wrapper.emitted("removeMovie")).toBeTruthy();
      expect(wrapper.emitted("removeMovie")![0]).toEqual(["inception"]);
    });

    it("delete click does not trigger goToMovie", async () => {
      const wrapper = mountComponent(sampleMovie, false, true);
      await wrapper.find(".delete-btn").trigger("click");
      expect(mockGoToMovie).not.toHaveBeenCalled();
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  describe("Navigation", () => {
    it("calls goToMovie with the slug on card click", async () => {
      const wrapper = mountComponent(sampleMovie, false);
      await wrapper.find(".movie-card").trigger("click");
      expect(mockGoToMovie).toHaveBeenCalledWith("inception");
    });

    it("does not call goToMovie when loading", async () => {
      const wrapper = mountComponent(sampleMovie, true);
      // skeleton is shown, .movie-card is not present
      expect(wrapper.find(".movie-card-container").exists()).toBe(false);
      expect(mockGoToMovie).not.toHaveBeenCalled();
    });
  });
});