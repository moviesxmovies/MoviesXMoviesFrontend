import { vi, describe, it, expect, beforeEach } from "vitest";
import { getReviewReactions, getCommentReactions, postReactionApi, deleteReactionApi, fetchComments, getCommentReplies, postComment, replyComment, getCommentReplies } from "@/repositories/reviewRepository";



const { mockGet, mockPost, mockDelete } = vi.hoisted(() => ({
    mockGet: vi.fn(),
    mockPost: vi.fn(),
    mockDelete: vi.fn(),
}));

vi.mock("@/composables/useAPI", () => ({
    api: {
        get: mockGet,
        post: mockPost,
        delete: mockDelete,
    },
}));

describe("ReviewRepository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── getReviewReactions ───────────────────────────────────────────────────
    describe("getReviewReactions", () => {
        it("calls API with correct endpoint and returns reactions list", async () => {
            const reviewId = 1;
            const mockReactions = [
                { id: 1, type: "like", user: "user1" },
                { id: 2, type: "dislike", user: "user2" },
            ];

            mockGet.mockResolvedValueOnce({ data: mockReactions });

            const result = await getReviewReactions(reviewId);

            expect(mockGet).toHaveBeenCalledWith(`reviews/${reviewId}/reactions/`);
            expect(result).toEqual(mockReactions);
        });

        it("throws when getReviewReactions API fails", async () => {
            const reviewId = 1;
            const networkError = new Error("Network error");
            mockGet.mockRejectedValueOnce(networkError);

            await expect(getReviewReactions(reviewId)).rejects.toThrow("Network error");
        });
    });

    // ── getCommentReactions ───────────────────────────────────────────────────
    describe("getCommentReactions", () => {
        it("calls API with correct endpoint and returns reactions list", async () => {
            const reviewId = 1;
            const commentId = 2;
            const mockReactions = [
                { id: 1, type: "like", user: "user1" },
                { id: 2, type: "dislike", user: "user2" },
            ];

            mockGet.mockResolvedValueOnce({ data: mockReactions });

            const result = await getCommentReactions(reviewId, commentId);

            expect(mockGet).toHaveBeenCalledWith(`reviews/${reviewId}/comments/${commentId}/reactions/`);
            expect(result).toEqual(mockReactions);
        });

        it("throws when getCommentReactions API fails", async () => {
            const commentId = 1;
            const networkError = new Error("Network error");
            mockGet.mockRejectedValueOnce(networkError);

            await expect(getCommentReactions(commentId)).rejects.toThrow("Network error");
        });
    });

    // ── postReactionApi ───────────────────────────────────────────────────────
    describe("postReactionApi", () => {
        it("calls API with correct endpoint and payload", async () => {
            const commentId = 2;
            const reviewId = 1;
            const emoji_code = "like";

            mockPost.mockResolvedValueOnce({ data: {} });

            await postReactionApi(reviewId, emoji_code, commentId);
            expect(mockPost).toHaveBeenCalledWith(`reviews/${reviewId}/comments/${commentId}/reactions/`, { emoji_code: emoji_code });
        });

        it("throws when postReactionApi API fails", async () => {
            const networkError = new Error("Unauthorized");
            mockPost.mockRejectedValueOnce(networkError);

            await expect(postReactionApi(1, "like", 2)).rejects.toThrow("Unauthorized");
        });
        it("calls API without commentId for review reaction", async () => {
            const reviewId = 1;
            const emoji_code = "like";

            mockPost.mockResolvedValueOnce({ data: { success: true } });

            await postReactionApi(reviewId, emoji_code);

            expect(mockPost).toHaveBeenCalledWith(`reviews/${reviewId}/reactions/`, { emoji_code: emoji_code });
        });
    });

    // ── deleteReactionApi ─────────────────────────────────────────────────────
    describe("deleteReactionApi", () => {
        it("calls API with correct endpoint", async () => {
            const reactionId = 1;
            const reviewId = 10;

            mockDelete.mockResolvedValueOnce({ data: {} });

            await deleteReactionApi(reviewId, reactionId);

            expect(mockDelete).toHaveBeenCalledWith(`reviews/${reviewId}/reactions/${reactionId}/`);
        });

        it("throws when deleteReactionApi API fails", async () => {
            const networkError = new Error("Unauthorized");
            mockDelete.mockRejectedValueOnce(networkError);

            await expect(deleteReactionApi(1)).rejects.toThrow("Unauthorized");
        });
        it("calls API with commentId for comment reaction deletion", async () => {
            const reviewId = 10;
            const reactionId = 1;
            const commentId = 5;

            mockDelete.mockResolvedValueOnce({ data: {} });

            await deleteReactionApi(reviewId, reactionId, commentId);

            expect(mockDelete).toHaveBeenCalledWith(`reviews/${reviewId}/comments/${commentId}/reactions/${reactionId}/`);
        });
    });

    // ── fetchComments ─────────────────────────────────────────────────────
    describe("fetchComments", () => {
        it("calls API with correct endpoint and returns comments list", async () => {
            const reviewId = 1;
            const mockComments = [
                { id: 1, content: "Great review!", user: "user1" },
                { id: 2, content: "I disagree.", user: "user2" },
            ];

            mockGet.mockResolvedValueOnce({ data: mockComments });

            const result = await fetchComments(reviewId);

            expect(mockGet).toHaveBeenCalledWith(`reviews/${reviewId}/comments/`, { params: { last_id: undefined, limit: 10 } });
            expect(result).toEqual(mockComments);
        });

        it("throws when fetchComments API fails", async () => {
            const reviewId = 1;
            const networkError = new Error("Network error");
            mockGet.mockRejectedValueOnce(networkError);

            await expect(fetchComments(reviewId)).rejects.toThrow("Network error");
        });
    });

    // ── postComment ───────────────────────────────────────────────────────
    describe("postComment", () => {
        it("calls API with correct endpoint and payload", async () => {
            const reviewId = 1;
            const content = "This is a comment.";
            const parentId = null;

            mockPost.mockResolvedValueOnce({ data: {} });

            await postComment(reviewId, content);

            expect(mockPost).toHaveBeenCalledWith(`reviews/${reviewId}/comments/`, { content });
        });

        it("throws when postComment API fails", async () => {
            const reviewId = 1;
            const content = "This is a comment.";
            const parentId = null;
            const networkError = new Error("Unauthorized");
            mockPost.mockRejectedValueOnce(networkError);

            await expect(postComment(reviewId, content, parentId)).rejects.toThrow("Unauthorized");
        });
    });

    // ── replyComment ───────────────────────────────────────────────────────
    describe("replyComment", () => {
        it("calls API with correct endpoint and payload", async () => {
            const reviewId = 1;
            const content = "This is a reply.";
            const parentId = 2;

            mockPost.mockResolvedValueOnce({ data: {} });

            await replyComment(reviewId, parentId, content);

            expect(mockPost).toHaveBeenCalledWith(`reviews/${reviewId}/comments/${parentId}/replies/`, { content });
        });

        it("throws when replyComment API fails", async () => {
            const reviewId = 1;
            const content = "This is a reply.";
            const parentId = 2;
            const networkError = new Error("Unauthorized");
            mockPost.mockRejectedValueOnce(networkError);

            await expect(replyComment(reviewId, content, parentId)).rejects.toThrow("Unauthorized");
        });
    });

    // ── getCommentReplies ─────────────────────────────────────────────────────
    describe("getCommentReplies", () => {
        it("calls API with correct endpoint and returns replies list", async () => {
            const reviewId = 1;
            const commentId = 2;
            const mockReplies = [
                { id: 1, content: "I agree!", user: "user3" },
                { id: 2, content: "Not sure about that.", user: "user4" },
            ];

            mockGet.mockResolvedValueOnce({ data: mockReplies });

            const result = await getCommentReplies(reviewId, commentId);

            expect(mockGet).toHaveBeenCalledWith(`reviews/${reviewId}/comments/${commentId}/replies/`, { params: { last_id: undefined, limit: 5 } });
            expect(result).toEqual(mockReplies);
        });

        it("throws when getCommentReplies API fails", async () => {
            const reviewId = 1;
            const commentId = 2;
            const networkError = new Error("Network error");
            mockGet.mockRejectedValueOnce(networkError);

            await expect(getCommentReplies(reviewId, commentId)).rejects.toThrow("Network error");
        });
    });
});