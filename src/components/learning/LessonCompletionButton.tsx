import { useEffect, useState } from 'react';
import {
  isLessonCompleted,
  loadProgress,
  subscribeProgress,
  toggleLessonCompleted,
} from '../../utils/progress';

interface Props {
  readonly lessonId: string;
  readonly lessonTitle: string;
}

export default function LessonCompletionButton({
  lessonId,
  lessonTitle,
}: Props) {
  const [completed, setCompleted] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    setCompleted(isLessonCompleted(loadProgress(), lessonId));
    return subscribeProgress((progress) => {
      setCompleted(isLessonCompleted(progress, lessonId));
    });
  }, [lessonId]);

  const handleToggle = () => {
    const result = toggleLessonCompleted(lessonId);
    setCompleted(result.completed);
    setStorageWarning(!result.persisted);
  };

  return (
    <div className="vl-widget" style={{ marginBlock: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <p className="vl-widget__eyebrow">Learning Progress</p>
          <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {completed
              ? `✓ Completed: ${lessonTitle}`
              : `Finished reading "${lessonTitle}"?`}
          </p>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
            Progress is saved locally on this browser and device (not synced
            across devices).
          </p>
        </div>

        <button
          type="button"
          className={`vl-btn ${completed ? 'vl-btn--teal' : 'vl-btn--primary'}`}
          aria-pressed={completed}
          onClick={handleToggle}
        >
          {completed ? '✓ Marked Complete (Undo)' : 'Mark Lesson Complete'}
        </button>
      </div>

      {storageWarning && (
        <p className="vl-notice" role="status" style={{ marginTop: '0.75rem' }}>
          Browser local storage is unavailable or blocked, so completion state
          cannot persist after closing this page.
        </p>
      )}
    </div>
  );
}
