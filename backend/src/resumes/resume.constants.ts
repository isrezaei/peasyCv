/**
 * Allowed values for the union-typed ResumeData fields. Shared by the validation
 * DTOs (IsIn), the Swagger enums and the server-side default factory so they all
 * stay in lockstep with the frontend contract.
 */
import type {
  BackgroundPatternId,
  CalendarSystem,
  FontFamilyId,
  LanguageLevel,
  PageBackgroundMode,
  PhotoStyle,
  RemovableSectionType,
  TemplateId,
  ThemeId,
} from '@resume/types';

export const LOCALES = ['fa', 'en'] as const;

export const TEMPLATE_IDS: TemplateId[] = [
  'professional-single-column',
  'double-column',
  'sidebar-column',
  'aside-dark',
  'aside-photo',
  'timeline-panel',
  'header-band',
  'compact-duo',
  'ruled-single',
  'classic-centered',
];

export const SECTION_TYPES: RemovableSectionType[] = [
  'summary',
  'experience',
  'skills',
  'education',
  'projects',
  'languages',
  'certifications',
];

export const DIRECTIONS = ['rtl', 'ltr'] as const;

export const THEME_IDS: ThemeId[] = [
  'sage',
  'lavender',
  'skyBlue',
  'dustyRose',
  'mint',
  'softCoral',
  'peach',
  'ocean',
  'slate',
  'grey',
  'indigo',
];

export const PAGE_BACKGROUND_MODES: PageBackgroundMode[] = ['theme', 'white'];

export const BACKGROUND_PATTERNS: BackgroundPatternId[] = [
  'none',
  'blobs',
  'botanical',
  'bracketsRings',
  'chevronField',
  'concentricArcs',
  'dotGrid',
  'topoLines',
];

export const FONT_FAMILIES: FontFamilyId[] = [
  'vazirmatn',
  'ibmPlexArabic',
  'notoArabic',
  'cairo',
  'montserrat',
  'inter',
];

export const PHOTO_STYLES: PhotoStyle[] = ['round', 'square'];

export const CALENDAR_SYSTEMS: CalendarSystem[] = ['jalali', 'hijri', 'gregorian'];

export const LANGUAGE_LEVELS: LanguageLevel[] = [1, 2, 3, 4, 5];
