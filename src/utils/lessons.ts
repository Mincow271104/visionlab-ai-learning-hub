import { getCollection, type CollectionEntry } from 'astro:content';
import {
  getTrackById,
  getTrackStage,
  type DifficultyLevel,
  type TrackId,
} from './tracks';
import { withBase } from './url';

export type LessonEntry = CollectionEntry<'lessons'>;

export interface LessonSummary {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly track: TrackId;
  readonly trackTitle: string;
  readonly trackStage: number;
  readonly difficulty: DifficultyLevel;
  readonly estimatedMinutes: number;
  readonly order: number;
  readonly tags: readonly string[];
  readonly href: string;
  readonly trackHref: string;
}

/**
 * Returns the canonical URL path for a published lesson (respecting BASE_URL).
 */
export function getLessonHref(lessonId: string): string {
  const cleanId = lessonId.replace(/^\/+|\/+$/g, '');
  return withBase(`/lessons/${cleanId}/`);
}

/**
 * Returns the canonical URL path for a curriculum track page.
 */
export function getTrackHref(trackId: TrackId): string {
  return withBase(`/tracks/${trackId}/`);
}

/**
 * Sorts lessons by curriculum track stage first, then by `order` within the track.
 */
export function sortLessonsForRoadmap(
  lessons: readonly LessonEntry[]
): LessonEntry[] {
  return [...lessons].sort((a, b) => {
    const stageDiff = getTrackStage(a.data.track) - getTrackStage(b.data.track);
    if (stageDiff !== 0) return stageDiff;
    const orderDiff = a.data.order - b.data.order;
    if (orderDiff !== 0) return orderDiff;
    return a.data.title.localeCompare(b.data.title);
  });
}

/**
 * Fetches all published lessons sorted in guided roadmap order.
 * Draft lessons are strictly excluded from public routes and indexes.
 */
export async function getPublishedLessons(): Promise<LessonEntry[]> {
  const entries = await getCollection(
    'lessons',
    (entry) => entry.data.status === 'published'
  );
  return sortLessonsForRoadmap(entries);
}

/**
 * Filters published lessons belonging to a single track, sorted by order.
 */
export async function getPublishedLessonsByTrack(
  trackId: TrackId
): Promise<LessonEntry[]> {
  const all = await getPublishedLessons();
  return all.filter((entry) => entry.data.track === trackId);
}

/**
 * Converts a Content Collection entry into a serializable plain object
 * suitable for client islands (Explore search, My Learning dashboard).
 */
export function toLessonSummary(entry: LessonEntry): LessonSummary {
  const trackInfo = getTrackById(entry.data.track);
  return {
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    track: entry.data.track,
    trackTitle: trackInfo.title,
    trackStage: trackInfo.stage,
    difficulty: entry.data.difficulty,
    estimatedMinutes: entry.data.estimatedMinutes,
    order: entry.data.order,
    tags: entry.data.tags,
    href: getLessonHref(entry.id),
    trackHref: getTrackHref(entry.data.track),
  };
}

/**
 * Computes previous and next lessons along the guided roadmap sequence.
 */
export function getAdjacentLessons(
  lessons: readonly LessonEntry[],
  currentId: string
): { previous: LessonSummary | null; next: LessonSummary | null } {
  const index = lessons.findIndex((entry) => entry.id === currentId);
  if (index === -1) {
    return { previous: null, next: null };
  }
  const previous = index > 0 ? toLessonSummary(lessons[index - 1]) : null;
  const next =
    index < lessons.length - 1 ? toLessonSummary(lessons[index + 1]) : null;
  return { previous, next };
}
