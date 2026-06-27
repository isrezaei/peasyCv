/**
 * The two ad placements the advertisement modal draws from. Every modal shows
 * exactly ONE ad, picked at random from this pair (see {@link pickAdModalId}).
 */
export const AD_MODAL_IDS = [
  "pos-article-display-card-120133",
  "pos-article-display-111915",
] as const;

/** One random ad id per modal open. */
export function pickAdModalId(): string {
  return AD_MODAL_IDS[Math.floor(Math.random() * AD_MODAL_IDS.length)];
}
