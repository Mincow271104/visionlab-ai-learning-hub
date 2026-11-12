/**
 * Local-only browser progress persistence for VisionLab.
 *
 * - Versioned JSON schema (`version: 1`) stored under `visionlab-progress-v1`.
 * - Safe during Astro static SSR (never accesses `window` or `localStorage` on server).
 * - Falls back cleanly if storage is blocked, full, or contains malformed JSON.
 * - Stores no personal information; progress stays on the current browser/device only.
 */

export const PROGRESS_STORAGE_KEY = 'visionlab-progress-v1';
export const PROGRESS_CHANGE_EVENT = 'visionlab:progress-change';

export interface QuizScoreRecord {
  readonly score: number;
  readonly total: number;
  readonly updatedAt: string;
}

export interface VisionLabProgress {
  readonly version: 1;
  readonly completedLessonIds: readonly string[];
  readonly quizScores: Readonly<Record<string, QuizScoreRecord>>;
}

export function createEmptyProgress(): VisionLabProgress {
  return {
    version: 1,
    completedLessonIds: [],
    quizScores: {},
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates and normalizes untrusted JSON parsed from localStorage.
 * Returns a clean `VisionLabProgress` object or an empty state if invalid.
 */
export function parseAndValidateProgress(raw: unknown): VisionLabProgress {
  if (!isPlainObject(raw) || raw.version !== 1) {
    return createEmptyProgress();
  }

  const completedSet = new Set<string>();
  if (Array.isArray(raw.completedLessonIds)) {
    for (const item of raw.completedLessonIds) {
      if (typeof item === 'string' && item.trim().length > 0) {
        completedSet.add(item);
      }
    }
  }

  const quizScores: Record<string, QuizScoreRecord> = {};
  if (isPlainObject(raw.quizScores)) {
    for (const [lessonId, record] of Object.entries(raw.quizScores)) {
      if (!lessonId || !isPlainObject(record)) continue;
      const { score, total, updatedAt } = record;
      if (
        typeof score === 'number' &&
        Number.isFinite(score) &&
        typeof total === 'number' &&
        Number.isFinite(total) &&
        total > 0 &&
        score >= 0 &&
        score <= total &&
        typeof updatedAt === 'string' &&
        updatedAt.length > 0
      ) {
        quizScores[lessonId] = {
          score: Math.floor(score),
          total: Math.floor(total),
          updatedAt,
        };
      }
    }
  }

  return {
    version: 1,
    completedLessonIds: Array.from(completedSet),
    quizScores,
  };
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isLocalStorageAvailable(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const probeKey = '__visionlab_storage_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function loadProgress(): VisionLabProgress {
  const storage = getStorage();
  if (!storage) {
    return createEmptyProgress();
  }

  try {
    const rawText = storage.getItem(PROGRESS_STORAGE_KEY);
    if (!rawText) {
      return createEmptyProgress();
    }
    const parsed: unknown = JSON.parse(rawText);
    return parseAndValidateProgress(parsed);
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(next: VisionLabProgress): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  const sanitized = parseAndValidateProgress(next);

  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(
      new CustomEvent<VisionLabProgress>(PROGRESS_CHANGE_EVENT, {
        detail: sanitized,
      })
    );
    return true;
  } catch {
    return false;
  }
}

export function isLessonCompleted(
  progress: VisionLabProgress,
  lessonId: string
): boolean {
  return progress.completedLessonIds.includes(lessonId);
}

export function setLessonCompleted(
  lessonId: string,
  completed: boolean
): { progress: VisionLabProgress; persisted: boolean } {
  const current = loadProgress();
  const nextSet = new Set(current.completedLessonIds);

  if (completed) {
    nextSet.add(lessonId);
  } else {
    nextSet.delete(lessonId);
  }

  const next: VisionLabProgress = {
    version: 1,
    completedLessonIds: Array.from(nextSet),
    quizScores: current.quizScores,
  };

  const persisted = saveProgress(next);
  return { progress: next, persisted };
}

export function toggleLessonCompleted(lessonId: string): {
  progress: VisionLabProgress;
  completed: boolean;
  persisted: boolean;
} {
  const current = loadProgress();
  const nextCompleted = !isLessonCompleted(current, lessonId);
  const { progress, persisted } = setLessonCompleted(lessonId, nextCompleted);
  return { progress, completed: nextCompleted, persisted };
}

export function saveQuizScore(
  lessonId: string,
  score: number,
  total: number
): { progress: VisionLabProgress; persisted: boolean } {
  const current = loadProgress();
  const safeTotal = Math.max(1, Math.floor(total));
  const safeScore = Math.min(safeTotal, Math.max(0, Math.floor(score)));

  const next: VisionLabProgress = {
    version: 1,
    completedLessonIds: current.completedLessonIds,
    quizScores: {
      ...current.quizScores,
      [lessonId]: {
        score: safeScore,
        total: safeTotal,
        updatedAt: new Date().toISOString(),
      },
    },
  };

  const persisted = saveProgress(next);
  return { progress: next, persisted };
}

export function clearProgress(): {
  progress: VisionLabProgress;
  persisted: boolean;
} {
  const empty = createEmptyProgress();
  const persisted = saveProgress(empty);
  return { progress: empty, persisted };
}

/**
 * Subscribes to progress updates (both same-tab custom events and cross-tab storage events).
 */
export function subscribeProgress(
  listener: (progress: VisionLabProgress) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleCustom = (event: Event) => {
    const customEvent = event as CustomEvent<VisionLabProgress>;
    if (customEvent.detail) {
      listener(parseAndValidateProgress(customEvent.detail));
    } else {
      listener(loadProgress());
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === PROGRESS_STORAGE_KEY || event.key === null) {
      listener(loadProgress());
    }
  };

  window.addEventListener(PROGRESS_CHANGE_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(PROGRESS_CHANGE_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}
