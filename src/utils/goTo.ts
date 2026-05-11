import { router } from '@/router';

export const goToMovie = (slug: string | undefined) => {
    router.push({ name: 'movie-detail', params: { slug } });
};

export const goToUser = (username: string | undefined) => {
    router.push({ name: 'user-profile', params: { slug: username } });
};

export const goToMovieList = (user: string | undefined, slug: string | undefined) => {
    router.push({ name: 'movie-list', params: { user, slug } });
}

export const goToPerson = (slug: string | undefined) => {
    router.push({ name: 'celebrity', params: { slug } });
};