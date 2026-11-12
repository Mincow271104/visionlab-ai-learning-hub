/**
 * Canonical curriculum track definitions and lesson metadata constants.
 *
 * Keep track identifiers synchronized between the content collection schema,
 * content directory folders, and roadmap UI components.
 */

export const TRACK_IDS = [
  'ai-fundamentals',
  'machine-learning',
  'deep-learning',
  'computer-vision',
  'generative-ai',
] as const;

export type TrackId = (typeof TRACK_IDS)[number];

export const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const PUBLICATION_STATUSES = ['draft', 'published'] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export interface LearningTrackInfo {
  readonly id: TrackId;
  readonly stage: number;
  readonly title: string;
  readonly shortLabel: string;
  readonly summary: string;
  readonly sampleTopics: readonly string[];
}

export const LEARNING_TRACKS: readonly LearningTrackInfo[] = [
  {
    id: 'ai-fundamentals',
    stage: 1,
    title: 'AI Fundamentals',
    shortLabel: 'Stage 1',
    summary:
      'Build an intuitive mental model of what artificial intelligence is, how rule-based software differs from learning systems, and where computer vision fits.',
    sampleTopics: [
      'What makes software "intelligent"',
      'Rules vs. learning from examples',
      'Narrow AI capabilities and limits',
    ],
  },
  {
    id: 'machine-learning',
    stage: 2,
    title: 'Machine Learning',
    shortLabel: 'Stage 2',
    summary:
      'Discover how models turn measurable features into decision boundaries, why margins matter, and what separates memorizing from generalizing.',
    sampleTopics: [
      'Features, labels, and training loops',
      'Support Vector Machines and margins',
      'Nonlinear patterns and the kernel trick',
    ],
  },
  {
    id: 'deep-learning',
    stage: 3,
    title: 'Deep Learning',
    shortLabel: 'Stage 3',
    summary:
      'See how stacked layers of simple weighted connections combine small signals into richer concepts and adjust through feedback.',
    sampleTopics: [
      'Artificial neurons, weights, and biases',
      'Activation functions and hidden layers',
      'Forward passes and learning overview',
    ],
  },
  {
    id: 'computer-vision',
    stage: 4,
    title: 'Computer Vision',
    shortLabel: 'Stage 4',
    summary:
      'Understand how computers represent photographs as grids of pixel numbers, extract edges via convolutions, and estimate 3D scene depth.',
    sampleTopics: [
      'Pixels, RGB channels, and tensors',
      'Convolution filters and CNN intuition',
      'Monocular, stereo, and depth maps',
    ],
  },
  {
    id: 'generative-ai',
    stage: 5,
    title: 'Generative AI & Large Language Models',
    shortLabel: 'Stage 5',
    summary:
      'Explore how modern generative models break text into tokens, weigh context with attention, and predict responses step by step.',
    sampleTopics: [
      'Tokens and next-token prediction',
      'Context windows and attention intuition',
      'Hallucinations and responsible use',
    ],
  },
] as const;

export function getTrackById(id: TrackId): LearningTrackInfo {
  const found = LEARNING_TRACKS.find((track) => track.id === id);
  if (!found) {
    throw new Error(`Unknown track id: ${id}`);
  }
  return found;
}

export function getTrackStage(id: TrackId): number {
  return getTrackById(id).stage;
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
