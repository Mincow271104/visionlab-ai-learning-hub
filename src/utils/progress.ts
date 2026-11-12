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

let inMemoryProgress: VisionLabProgress = createEmptyProgress();
let usingInMemoryFallback = false;

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
        Number.isInteger(score) &&
        typeof total === 'number' &&
        Number.isFinite(total) &&
        Number.isInteger(total) &&
        total >= 1 &&
        score >= 0 &&
        score <= total &&
        typeof updatedAt === 'string' &&
        updatedAt.trim().length > 0 &&
        !Number.isNaN(Date.parse(updatedAt))
      ) {
        quizScores[lessonId] = {
          score,
          total,
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

function emitProgressChange(progress: VisionLabProgress): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<VisionLabProgress>(PROGRESS_CHANGE_EVENT, {
      detail: progress,
    })
  );
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

export function isPersistenceAvailable(): boolean {
  return !usingInMemoryFallback && isLocalStorageAvailable();
}

export function loadProgress(): VisionLabProgress {
  if (usingInMemoryFallback) {
    return inMemoryProgress;
  }

  const storage = getStorage();
  if (!storage) {
    usingInMemoryFallback = true;
    return inMemoryProgress;
  }

  let rawText: string | null = null;
  try {
    rawText = storage.getItem(PROGRESS_STORAGE_KEY);
  } catch {
    usingInMemoryFallback = true;
    return inMemoryProgress;
  }

  if (!rawText) {
    inMemoryProgress = createEmptyProgress();
    return inMemoryProgress;
  }

  try {
    const parsed: unknown = JSON.parse(rawText);
    const validated = parseAndValidateProgress(parsed);
    inMemoryProgress = validated;
    return validated;
  } catch {
    inMemoryProgress = createEmptyProgress();
    return inMemoryProgress;
  }
}

export function saveProgress(next: VisionLabProgress): boolean {
  const sanitized = parseAndValidateProgress(next);
  inMemoryProgress = sanitized;

  const storage = getStorage();
  if (!storage) {
    usingInMemoryFallback = true;
    emitProgressChange(sanitized);
    return false;
  }

  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(sanitized));
    usingInMemoryFallback = false;
    emitProgressChange(sanitized);
    return true;
  } catch {
    usingInMemoryFallback = true;
    emitProgressChange(sanitized);
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
  const safeTotal = Number.isFinite(total)
    ? Math.max(1, Math.floor(total))
    : 1;
  const safeScore = Number.isFinite(score)
    ? Math.min(safeTotal, Math.max(0, Math.floor(score)))
    : 0;

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
      usingInMemoryFallback = false;
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
