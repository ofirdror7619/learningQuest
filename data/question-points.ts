export const BASE_POINTS_PER_LEVEL = 10;

export function getQuestionPointsForLevel(level: number): number {
  return Math.max(1, level) * BASE_POINTS_PER_LEVEL;
}
