import { useState } from "preact/hooks";

import { Clickable } from "@true-recall/obsidian/components";
import { t } from "@true-recall/obsidian/i18n";

interface TypeInFollowUpProps {
	/** Queues the question; returns false when it could not be queued. */
	onSubmit: (question: string) => boolean;
	queuedCount: number;
	/** "Cards from gaps" next to the input; hidden when absent. */
	onCardsFromGaps?: () => void;
}

/** One-shot capture input shown after a type-in answer is revealed. Questions
 * are queued to the AI inbox and answered after the session; deliberately not
 * a chat so the review flow keeps its momentum. Never autofocused, so rating
 * shortcuts keep working until the user clicks in. */
export function TypeInFollowUp({
	onSubmit,
	queuedCount,
	onCardsFromGaps,
}: TypeInFollowUpProps) {
	const [value, setValue] = useState("");

	const submit = () => {
		const trimmed = value.trim();
		if (trimmed === "") return;
		if (onSubmit(trimmed)) setValue("");
	};

	return (
		<div class="ep:w-full ep:max-w-md ep:mx-auto ep:mt-6 ep:flex ep:flex-col ep:gap-1.5">
			<div class="ep:flex ep:items-center ep:gap-3">
				<input
					type="text"
					class="ep:w-full ep:min-w-0 ep:flex-1 ep:px-0 ep:py-1 ep:text-ui-small ep:text-obs-muted ep:text-center ep:bg-transparent ep:border-0 ep:border-b ep:border-obs-border ep:rounded-none ep:shadow-none ep:focus:border-obs-interactive ep:focus:shadow-none ep:transition-colors"
					placeholder="Ask AI a follow-up… (answered after the session)"
					value={value}
					onInput={(e) => setValue((e.target as HTMLInputElement).value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							e.stopPropagation();
							submit();
						}
						if (e.key === "Escape") {
							(e.target as HTMLInputElement).blur();
						}
					}}
				/>
				{onCardsFromGaps && (
					<Clickable
						class="true-recall-gap-cards ep:shrink-0 ep:whitespace-nowrap ep:py-1 ep:text-ui-small ep:text-obs-muted ep:hover:text-obs-normal ep:transition-colors"
						aria-label={t(
							"New cards for what your answer missed, skipping points you already have cards for",
						)}
						onClick={(e) => {
							// Blur so Enter and the rating keys go back to the review.
							(e.currentTarget as HTMLElement | null)?.blur();
							onCardsFromGaps();
						}}
					>
						{t("Cards from gaps")}
					</Clickable>
				)}
			</div>
			{queuedCount > 0 && (
				<span class="ep:text-ui-smaller ep:text-obs-faint ep:text-center">
					{queuedCount} queued · waiting in the AI Inbox
				</span>
			)}
		</div>
	);
}
