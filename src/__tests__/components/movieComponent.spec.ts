import { mount } from "@vue/test-utils";
import MovieComponent from "@/components/movieComponent.vue";
import type { Movie } from "@/types/movie";
import { describe, expect, it } from "vitest";

function mountComponent(movie: Movie, loading: boolean) {
  return mount(MovieComponent, {
    props: { movie, loading },
  });
}

const sampleMovie: Movie = {
  id: 1,
  title: "Inception",
  slug: "inception",
  release_date: "2010-07-16",
  synopsis:
    "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
  cover: "https://example.com/inception.jpg",
  genres: [{ id: 1, name: "Sci-Fi" }],
  awards: [],
  platforms: [{ id: 1, name: "Netflix" }],
  actors: [{ id: 1, name: "Leonardo DiCaprio" }],
  directors: [{ id: 2, name: "Christopher Nolan" }],
};

describe("MovieComponent rendering", () => {
  it("component accepts props", () => {
    const wrapper = mountComponent(sampleMovie, false);
    expect(wrapper.props().movie).toEqual(sampleMovie);
    expect(wrapper.props().loading).toBe(false);
  });
});
