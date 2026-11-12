import { useId, useMemo, useState } from 'react';
import type { LessonSummary } from '../../utils/lessons';
import { filterLessons } from '../../utils/search';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_LEVELS,
  type DifficultyLevel,
  type LearningTrackInfo,
  type TrackId,
} from '../../utils/tracks';

interface Props {
  readonly lessons: readonly LessonSummary[];
  readonly tracks: readonly LearningTrackInfo[];
}

export default function LessonExplorer({ lessons, tracks }: Props) {
  const baseId = useId();
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState<TrackId | 'all'>('all');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'all'>('all');

  const filteredLessons = useMemo(
    () => filterLessons(lessons, { query, track, difficulty }),
    [lessons, query, track, difficulty]
  );

  const hasActiveFilter =
    query.trim() !== '' || track !== 'all' || difficulty !== 'all';

  const handleReset = () => {
    setQuery('');
    setTrack('all');
    setDifficulty('all');
  };

  return (
    <div>
      <section
        className="vl-widget"
        aria-labelledby={`${baseId}-filters-heading`}
      >
        <div className="vl-widget__header">
          <div>
            <p className="vl-widget__eyebrow">Search &amp; Filter</p>
            <h2 id={`${baseId}-filters-heading`} className="vl-widget__title">
              Explore published lessons freely
            </h2>
          </div>
          <span className="vl-badge vl-badge--accent" aria-live="polite">
            Showing {filteredLessons.length} of {lessons.length} lessons
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            alignItems: 'end',
          }}
        >
          <div className="vl-field">
            <label htmlFor={`${baseId}-search`}>Search lessons</label>
            <input
              id={`${baseId}-search`}
              type="search"
              className="vl-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, topic, or tag (e.g. svm, pixels, llm)..."
            />
          </div>

          <div className="vl-field">
            <label htmlFor={`${baseId}-track`}>Track</label>
            <select
              id={`${baseId}-track`}
              className="vl-select"
              value={track}
              onChange={(event) =>
                setTrack(event.target.value as TrackId | 'all')
              }
            >
              <option value="all">All tracks</option>
              {tracks.map((item) => (
                <option key={item.id} value={item.id}>
                  Stage {item.stage}: {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="vl-field">
            <label htmlFor={`${baseId}-difficulty`}>Difficulty</label>
            <select
              id={`${baseId}-difficulty`}
              className="vl-select"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as DifficultyLevel | 'all')
              }
            >
              <option value="all">All difficulties</option>
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {DIFFICULTY_LABELS[level]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              className="vl-btn"
              disabled={!hasActiveFilter}
              onClick={handleReset}
              style={{ width: '100%' }}
            >
              Reset filters
            </button>
          </div>
        </div>
      </section>

      {filteredLessons.length === 0 ? (
        <div className="vl-widget" role="status">
          <h3 className="vl-widget__title" style={{ marginBottom: '0.5rem' }}>
            No matching lessons found
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Try clearing your search terms or resetting the track and difficulty
            filters to browse all {lessons.length} published lessons.
          </p>
          <button
            type="button"
            className="vl-btn vl-btn--primary"
            onClick={handleReset}
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="vl-card-grid">
          {filteredLessons.map((lesson) => (
            <article key={lesson.id} className="vl-lesson-card">
              <div className="vl-lesson-card__meta">
                <span className="vl-badge vl-badge--accent">
                  Stage {lesson.trackStage} · {lesson.trackTitle}
                </span>
                <span className="vl-badge">
                  {DIFFICULTY_LABELS[lesson.difficulty]}
                </span>
                <span>{lesson.estimatedMinutes} min read</span>
              </div>

              <h3 className="vl-lesson-card__title">
                <a href={lesson.href}>{lesson.title}</a>
              </h3>

              <p>{lesson.description}</p>

              <ul className="vl-lesson-card__tags" aria-label="Lesson tags">
                {lesson.tags.map((tag) => (
                  <li key={tag} className="vl-tag">
                    #{tag}
                  </li>
                ))}
              </ul>

              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <a
                  href={lesson.href}
                  style={{ fontWeight: 600, fontSize: '0.92rem' }}
                >
                  Open lesson &rarr;
                </a>
                <a
                  href={lesson.trackHref}
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  View track
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
