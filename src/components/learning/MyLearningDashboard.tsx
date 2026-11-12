import { useEffect, useState } from 'react';
import type { LessonSummary } from '../../utils/lessons';
import {
  clearProgress,
  createEmptyProgress,
  isPersistenceAvailable,
  loadProgress,
  subscribeProgress,
  toggleLessonCompleted,
  type VisionLabProgress,
} from '../../utils/progress';
import type { LearningTrackInfo } from '../../utils/tracks';

interface Props {
  readonly lessons: readonly LessonSummary[];
  readonly tracks: readonly LearningTrackInfo[];
  readonly exploreHref: string;
  readonly roadmapHref: string;
}

export default function MyLearningDashboard({
  lessons,
  tracks,
  exploreHref,
  roadmapHref,
}: Props) {
  const [progress, setProgress] = useState<VisionLabProgress>(
    createEmptyProgress
  );
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setStorageAvailable(isPersistenceAvailable());
    setProgress(loadProgress());
    return subscribeProgress((next) => {
      setProgress(next);
      setStorageAvailable(isPersistenceAvailable());
    });
  }, []);

  const publishedIds = new Set(lessons.map((lesson) => lesson.id));
  const completedIds = progress.completedLessonIds.filter((id) =>
    publishedIds.has(id)
  );
  const completedSet = new Set(completedIds);

  const totalLessons = lessons.length;
  const completedCount = completedIds.length;
  const completionPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const savedQuizEntries = lessons
    .map((lesson) => ({
      lesson,
      record: progress.quizScores[lesson.id],
    }))
    .filter(
      (
        item
      ): item is {
        lesson: LessonSummary;
        record: NonNullable<(typeof item)['record']>;
      } => Boolean(item.record)
    );

  const allCompleted = totalLessons > 0 && completedCount === totalLessons;
  const nextLesson =
    lessons.find((lesson) => !completedSet.has(lesson.id)) ?? null;

  const hasStarted = completedCount > 0 || savedQuizEntries.length > 0;

  const handleToggleLesson = (lessonId: string) => {
    const { progress: next, persisted } = toggleLessonCompleted(lessonId);
    setProgress(next);
    setStorageAvailable(persisted && isPersistenceAvailable());
  };

  const handleResetProgress = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    const { progress: next, persisted } = clearProgress();
    setProgress(next);
    setStorageAvailable(persisted && isPersistenceAvailable());
    setConfirmClear(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {storageAvailable ? (
        <div className="vl-notice vl-notice--info">
          Your completed lessons and quiz scores are stored{' '}
          <strong>only in this browser on this device</strong>. VisionLab
          collects no personal information and does not synchronize across
          devices.
        </div>
      ) : (
        <div className="vl-notice" role="status">
          <strong>Session-only fallback active:</strong> Browser local storage
          is unavailable, blocked, or failed to save. Your progress still
          updates live in this session, but it{' '}
          <strong>will not persist after reloading or closing the browser</strong>
          .
        </div>
      )}

      {/* Overview summary */}
      <section className="vl-widget" aria-labelledby="my-learning-overview">
        <div className="vl-widget__header">
          <div>
            <p className="vl-widget__eyebrow">Overview</p>
            <h2 id="my-learning-overview" className="vl-widget__title">
              Your learning progress
            </h2>
          </div>
          <span className="vl-badge vl-badge--accent">
            {completedCount} of {totalLessons} lessons completed ({completionPct}
            %)
          </span>
        </div>

        <div
          className="vl-progress-bar"
          role="progressbar"
          aria-valuenow={completionPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall lesson completion percentage"
          style={{ marginBottom: '1.25rem' }}
        >
          <div
            className="vl-progress-bar__fill"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Total published lessons
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {totalLessons}
            </p>
          </div>
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Completed lessons
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {completedCount}
            </p>
          </div>
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Saved quiz checks
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {savedQuizEntries.length}
            </p>
          </div>
        </div>

        {!hasStarted && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px dashed var(--color-border-strong)',
              marginBottom: '1rem',
            }}
          >
            <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>
              You have not recorded any completed lessons or quizzes yet.
            </p>
            <p style={{ fontSize: '0.92rem', marginTop: '0.25rem' }}>
              Start with Stage 1 on the guided roadmap, or open any topic from
              Explore Lessons.
            </p>
          </div>
        )}

        {allCompleted && (
          <div
            className="vl-notice vl-notice--info"
            role="status"
            style={{ marginBottom: '1rem' }}
          >
            <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>
              All published lessons completed!
            </p>
            <p style={{ fontSize: '0.92rem', marginTop: '0.25rem' }}>
              You have completed all {totalLessons} currently published VisionLab
              lessons across the 5 tracks. Explore any lesson to review or check
              upcoming topics on the roadmap.
            </p>
          </div>
        )}

        <div className="vl-btn-row">
          {allCompleted ? (
            <>
              <a href={exploreHref} className="vl-btn vl-btn--primary">
                Explore All Lessons
              </a>
              <a href={roadmapHref} className="vl-btn">
                View Full Roadmap
              </a>
            </>
          ) : (
            <>
              {nextLesson && (
                <a href={nextLesson.href} className="vl-btn vl-btn--primary">
                  {hasStarted
                    ? `Continue: ${nextLesson.title}`
                    : `Start Learning: ${nextLesson.title}`}
                </a>
              )}
              <a href={roadmapHref} className="vl-btn">
                View Full Roadmap
              </a>
              <a href={exploreHref} className="vl-btn">
                Explore All Lessons
              </a>
            </>
          )}
        </div>
      </section>

      {/* Progress per track */}
      <section className="vl-widget" aria-labelledby="track-progress-heading">
        <div className="vl-widget__header">
          <div>
            <p className="vl-widget__eyebrow">Curriculum Tracks</p>
            <h2 id="track-progress-heading" className="vl-widget__title">
              Progress by track
            </h2>
          </div>
        </div>

        <div className="vl-card-grid">
          {tracks.map((track) => {
            const trackLessons = lessons.filter(
              (lesson) => lesson.track === track.id
            );
            const trackCompleted = trackLessons.filter((lesson) =>
              completedSet.has(lesson.id)
            ).length;
            const trackTotal = trackLessons.length;
            const pct =
              trackTotal > 0
                ? Math.round((trackCompleted / trackTotal) * 100)
                : 0;
            const trackHref = trackLessons[0]?.trackHref ?? roadmapHref;

            return (
              <article key={track.id} className="vl-lesson-card">
                <div className="vl-lesson-card__meta">
                  <span className="vl-badge vl-badge--accent">
                    {track.shortLabel}
                  </span>
                  <span>
                    {trackCompleted}/{trackTotal} completed ({pct}%)
                  </span>
                </div>

                <h3 className="vl-lesson-card__title">
                  <a href={trackHref}>{track.title}</a>
                </h3>

                <div className="vl-progress-bar" aria-hidden="true">
                  <div
                    className="vl-progress-bar__fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                  }}
                >
                  {trackLessons.map((lesson) => {
                    const done = completedSet.has(lesson.id);
                    return (
                      <li
                        key={lesson.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem',
                        }}
                      >
                        <a href={lesson.href}>{lesson.title}</a>
                        <button
                          type="button"
                          className={`vl-btn ${done ? 'vl-btn--teal' : ''}`}
                          style={{
                            minHeight: '1.9rem',
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.78rem',
                          }}
                          aria-pressed={done}
                          onClick={() => handleToggleLesson(lesson.id)}
                        >
                          {done ? '✓ Done' : 'Mark done'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* Saved Quiz Scores */}
      <section className="vl-widget" aria-labelledby="quiz-scores-heading">
        <div className="vl-widget__header">
          <div>
            <p className="vl-widget__eyebrow">Knowledge Checks</p>
            <h2 id="quiz-scores-heading" className="vl-widget__title">
              Saved quiz scores
            </h2>
          </div>
          {hasStarted && (
            <div className="vl-btn-row">
              <button
                type="button"
                className="vl-btn"
                onClick={handleResetProgress}
              >
                {confirmClear
                  ? 'Confirm: Clear all local progress'
                  : 'Reset local progress'}
              </button>
              {confirmClear && (
                <button
                  type="button"
                  className="vl-btn"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>

        {savedQuizEntries.length === 0 ? (
          <p>
            No quiz scores recorded yet. Complete the Knowledge Check at the
            end of any lesson to save your score here.
          </p>
        ) : (
          <div className="vl-card-grid">
            {savedQuizEntries.map(({ lesson, record }) => (
              <article key={lesson.id} className="vl-lesson-card">
                <div className="vl-lesson-card__meta">
                  <span className="vl-badge vl-badge--teal">
                    Score: {record.score} / {record.total} (
                    {record.total >= 1
                      ? Math.round((record.score / record.total) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <h3 className="vl-lesson-card__title">
                  <a href={lesson.href}>{lesson.title}</a>
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                  Last updated:{' '}
                  {new Date(record.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
