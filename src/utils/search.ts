import type { LessonSummary } from './lessons';
import type { DifficultyLevel, TrackId } from './tracks';

export interface LessonFilterCriteria {
  readonly query: string;
  readonly track: TrackId | 'all';
  readonly difficulty: DifficultyLevel | 'all';
}

/**
 * Filters lessons client-side using case-insensitive substring matching
 * across title, description, and tags, plus optional track and difficulty filters.
 */
export function filterLessons(
  lessons: readonly LessonSummary[],
  criteria: LessonFilterCriteria
): LessonSummary[] {
  const normalizedQuery = criteria.query.trim().toLowerCase();

  return lessons.filter((lesson) => {
    if (criteria.track !== 'all' && lesson.track !== criteria.track) {
      return false;
    }

    if (
      criteria.difficulty !== 'all' &&
      lesson.difficulty !== criteria.difficulty
    ) {
      return false;
    }

    if (normalizedQuery === '') {
      return true;
    }

    const inTitle = lesson.title.toLowerCase().includes(normalizedQuery);
    const inDescription = lesson.description
      .toLowerCase()
      .includes(normalizedQuery);
    const inTags = lesson.tags.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery)
    );
    const inTrack = lesson.trackTitle.toLowerCase().includes(normalizedQuery);

    return inTitle || inDescription || inTags || inTrack;
  });
}
