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
  readonly status: 'planned' | 'in-progress' | 'available';
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
      'Inputs, predictions, and uncertainty',
    ],
    status: 'planned',
  },
  {
    id: 'machine-learning',
    stage: 2,
    title: 'Machine Learning',
    shortLabel: 'Stage 2',
    summary:
      'Discover how models turn measurable features into decision boundaries, why margins matter, and what separates memorizing from generalizing.',
    sampleTopics: [
      'Features, labels, and decision boundaries',
      'Support Vector Machines (SVM) intuition',
      'Training error vs. generalization',
    ],
    status: 'planned',
  },
  {
    id: 'deep-learning',
    stage: 3,
    title: 'Deep Learning',
    shortLabel: 'Stage 3',
    summary:
      'See how stacked layers of simple weighted connections combine small signals into richer concepts and adjust through feedback.',
    sampleTopics: [
      'From a single neuron to layered networks',
      'Weights, biases, and activations',
      'How feedback improves predictions',
    ],
    status: 'planned',
  },
  {
    id: 'computer-vision',
    stage: 4,
    title: 'Computer Vision',
    shortLabel: 'Stage 4',
    summary:
      'Understand how computers represent photographs as grids of pixel numbers and detect edges, textures, and shapes using sliding filters.',
    sampleTopics: [
      'Images as grids of numbers',
      'Edge detection and convolution filters',
      'Hierarchical visual features in CNNs',
    ],
    status: 'planned',
  },
  {
    id: 'generative-ai',
    stage: 5,
    title: 'Generative AI & Large Language Models',
    shortLabel: 'Stage 5',
    summary:
      'Explore how modern generative models predict next tokens, weigh context with attention, and connect language with visual understanding.',
    sampleTopics: [
      'Tokens and next-step prediction',
      'Attention as selective focus',
      'Capabilities and limits of generative AI',
    ],
    status: 'planned',
  },
] as const;
