export const FEATURE_PERMISSION_MAP = {
  dashboard: '1',
  objectives: '2',
  documents: '2',
  photos: '3',
  hierachy: '3',
  message: '4',
  help: '4',
  setting: '1'
} as const;

export type FeaturePermissionKey = keyof typeof FEATURE_PERMISSION_MAP;

