import type {
	AssistantContext,
	AssistantReviewAttemptContext,
} from "@true-recall/core/ai/assistant";
import type { SemanticGradingResult } from "@true-recall/core/types";

import {
	type AssistantContextCard,
	assistantContextFromCard,
} from "@true-recall/obsidian/features/assistant/ui/ai-context-source";

/** Snapshot of the current type-in attempt used to seed a follow-up question. */
export interface ReviewFollowUpAttempt {
	typedAnswer: string;
	semanticResult: SemanticGradingResult | null;
}

/** Builds the assistant context for a follow-up question asked right after a
 * type-in answer was graded: the card plus the attempt and its verdict. */
export function buildReviewFollowUpContext(
	card: AssistantContextCard,
	attempt: ReviewFollowUpAttempt,
): AssistantContext {
	const context = assistantContextFromCard(card);
	context.reviewAttempt = toReviewAttemptContext(attempt);
	return context;
}

function toReviewAttemptContext(
	attempt: ReviewFollowUpAttempt,
): AssistantReviewAttemptContext {
	return {
		typedAnswer: attempt.typedAnswer.trim(),
		...(attempt.semanticResult
			? {
					verdict: attempt.semanticResult.verdict,
					teacherComment: attempt.semanticResult.teacherComment,
					covered: attempt.semanticResult.covered,
					missing: attempt.semanticResult.missing,
					errors: attempt.semanticResult.errors,
				}
			: {}),
	};
}

/**
 * "Cards from gaps" shows only when the grading names something the answer
 * missed or got wrong: those points are what the cards are made from.
 */
export function hasGradingGaps(
	result:
		| { missing?: readonly string[]; errors?: readonly string[] }
		| null
		| undefined,
): boolean {
	if (!result) return false;
	const nonEmpty = (points: readonly string[] | undefined) =>
		(points ?? []).some((p) => p.trim() !== "");
	return nonEmpty(result.missing) || nonEmpty(result.errors);
}

/**
 * The attempt to hand the AI with a question about the visible card: only
 * once the answer is revealed and something was typed, so a plain review
 * (or a card not yet answered) carries no attempt.
 */
export function revealedReviewAttempt(
	attempt: ReviewFollowUpAttempt,
	isAnswerRevealed: boolean,
): AssistantReviewAttemptContext | undefined {
	if (!isAnswerRevealed || attempt.typedAnswer.trim() === "") return undefined;
	return toReviewAttemptContext(attempt);
}
