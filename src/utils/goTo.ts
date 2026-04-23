import { router } from '@/router';

export const goToMovie = (slug: string | undefined) => {
    router.push({ name: 'Movie', params: { slug } });
};

export const goToUser = (username: string | undefined) => {
    router.push({ name: 'user-profile', params: { slug:username } });
};