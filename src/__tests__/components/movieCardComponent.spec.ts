import { mount } from "@vue/test-utils";
import MovieCardComponent from "@/components/movieCardComponent.vue";
import type { Movie } from "@/types/movie";
import { describe, expect, it } from "vitest";

function mountComponent(movie: Movie, loading: boolean) {
  return mount(MovieCardComponent, {
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
  genres: [],
  awards: [],
  platforms: [],
  actors: [],
  directors: [],
};

describe("MovieCardComponent rendering", () => {
  it("component accepts props", () => {
    const wrapper = mountComponent(sampleMovie, false);
    expect(wrapper.props().movie).toEqual(sampleMovie);
    expect(wrapper.props().loading).toEqual(false);
  });

  it("shows skeleton when loading is true", () => {
    const wrapper = mountComponent(sampleMovie, true);
    expect(wrapper.find(".skeleton").exists()).toBe(true);
  });

  it("shows movie title when loading is false", () => {
    const wrapper = mountComponent(sampleMovie, false);
    expect(wrapper.find(".movie-title").text()).toBe(sampleMovie.title);
  });
});
