import { api } from "@/composables/useAPI";
import type { ReactionResponse } from "@/types";

export const getReviewReactions = async (id: number) => {
    try {
        const { data }: { data: ReactionResponse } = await api.get(`reviews/${id}/reactions/`);
        return data;
    } catch (error: any) {
        throw error;
    }
};

export const getCommentReactions = async (reviewId: number, commentId: number) => {
    try {
        const { data }: { data: ReactionResponse } = await api.get(`reviews/${reviewId}/comments/${commentId}/reactions/`);
        return data;
    } catch (error: any) {
        throw error;
    }
};

export const postReactionApi = async (reviewId: number, type: string, commentId?: number) => {
    try {
        if (commentId) {
            const { data } = await api.post(`reviews/${reviewId}/comments/${commentId}/reactions/`, { emoji_code: type });
            return data;
        }
        const { data } = await api.post(`reviews/${reviewId}/reactions/`, { emoji_code: type });
        return data;
    } catch (error: any) {
        throw error;
    }
};

export const deleteReactionApi = async (reviewId: number, id: number, commentId?: number) => {
    try {
        if (commentId) {
            const { data } = await api.delete(`reviews/${reviewId}/comments/${commentId}/reactions/${id}/`);
            return data;
        }
        const { data } = await api.delete(`reviews/${reviewId}/reactions/${id}/`);
        return data;
    } catch (error: any) {
        throw error;
    }
};

export const fetchComments = async (reviewId: number, lastId?: number, limit = 10) => {
    try {
        const { data } = await api.get(`reviews/${reviewId}/comments/`, { params: { last_id: lastId, limit } });
        return data;
    } catch (error: any) {
        throw error;
    }
}

export const postComment = async (reviewId: number, content: string) => {
    try {
        const { data } = await api.post(`reviews/${reviewId}/comments/`, { content });
        return data;
    } catch (error: any) {
        throw error;
    }
}

export const replyComment = async (reviewId: number, commentId: number, content: string) => {
    try {
        const { data } = await api.post(`reviews/${reviewId}/comments/${commentId}/replies/`, { content });
        return data;
    } catch (error: any) {
        throw error;
    }
}

export const getCommentReplies = async (reviewId: number, commentId: number, lastId?: number, limit = 5) => {
    try {
        const { data } = await api.get(`reviews/${reviewId}/comments/${commentId}/replies/`, { params: { last_id: lastId, limit } });
        return data;
    } catch (error: any) {
        throw error;
    }
}

export const getReviewTranslation = async (reviewId: number) => {
    try {
        const { data } = await api.get(`reviews/${reviewId}/translations/`);
        return data;
    }
    catch (error: any) {
        throw error;
    }
}

export const getCommentTranslation = async (reviewId: number, commentId: number) => {
    try {
        const { data } = await api.get(`reviews/${reviewId}/comments/${commentId}/translations/`);
        return data;
    }
    catch (error: any) {
        throw error;
    }
}