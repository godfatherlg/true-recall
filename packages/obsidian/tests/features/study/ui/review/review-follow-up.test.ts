import { describe, expect, it } from "vitest";

import type { SemanticGradingResult } from "@true-recall/core/types";

import type { AssistantContextCard } from "../../../../../src/features/assistant/ui/ai-context-source";
import {
	buildReviewFollowUpContext,
	hasGradingGaps,
	revealedReviewAttempt,
} from "../../../../../src/features/study/ui/review/helpers/review-follow-up";

const CARD: AssistantContextCard = {
	id: "card-1",
	noteId: "note-1",
	question: "What is **TCP**?",
	answer: "A connection-oriented transport protocol",
	sourceUid: "uid-1",
	sourceNotePath: "Net/TCP.md",
	fsrs: { noteTypeId: "builtin-basic" },
};

const RESULT: SemanticGradingResult = {
	verdict: "partial",
	teacherComment: "Half right.",
	covered: ["transport layer"],
	missing: ["connection-oriented"],
	errors: [],
	suggestedRating: "hard",
};

describe("buildReviewFollowUpContext", () => {
	it("carries the card and the graded attempt", () => {
		const context = buildReviewFollowUpContext(CARD, {
			typedAnswer: "  a transport thing  ",
			semanticResult: RESULT,
		});

		expect(context.card?.cardId).toBe("card-1");
		expect(context.activeNotePath).toBe("Net/TCP.md");
		expect(context.reviewAttempt).toEqual({
			typedAnswer: "a transport thing",
			verdict: "partial",
			teacherComment: "Half right.",
			covered: ["transport layer"],
			missing: ["connection-oriented"],
			errors: [],
		});
	});

	it("omits grading fields when semantic grading did not run", () => {
		const context = buildReviewFollowUpContext(CARD, {
			typedAnswer: "guess",
			semanticResult: null,
		});

		expect(context.reviewAttempt).toEqual({ typedAnswer: "guess" });
	});
});

describe("revealedReviewAttempt", () => {
	it("gives the typed answer and grading once the answer is revealed", () => {
		expect(
			revealedReviewAttempt(
				{ typedAnswer: " a transport thing ", semanticResult: RESULT },
				true,
			),
		).toEqual({
			typedAnswer: "a transport thing",
			verdict: "partial",
			teacherComment: "Half right.",
			covered: ["transport layer"],
			missing: ["connection-oriented"],
			errors: [],
		});
	});

	it("gives nothing before the reveal or without a typed answer", () => {
		expect(
			revealedReviewAttempt(
				{ typedAnswer: "guess", semanticResult: RESULT },
				false,
			),
		).toBeUndefined();
		expect(
			revealedReviewAttempt({ typedAnswer: "   ", semanticResult: null }, true),
		).toBeUndefined();
	});
});

describe("hasGradingGaps", () => {
	it("shows Cards from gaps when something was missed or wrong", () => {
		expect(hasGradingGaps(RESULT)).toBe(true);
		expect(hasGradingGaps({ missing: [], errors: ["U = R"] })).toBe(true);
	});

	it("hides it without gaps or without a grading", () => {
		expect(hasGradingGaps({ missing: [], errors: [] })).toBe(false);
		expect(hasGradingGaps({ missing: ["  "], errors: [""] })).toBe(false);
		expect(hasGradingGaps(null)).toBe(false);
		expect(hasGradingGaps(undefined)).toBe(false);
	});
});
