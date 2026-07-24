/**
 * Allowed values for the union-typed ResumeData fields. Shared by the validation
 * DTOs (IsIn), the Swagger enums and the server-side default factory so they all
 * stay in lockstep with the frontend contract.
 */
import type {
  BackgroundPatternId,
  CalendarSystem,
  ColumnWidthId,
  FontFamilyId,
  LanguageLevel,
  LanguageMeterVariant,
  ImageSide,
  MonthFormat,
  PageBackgroundMode,
  PhotoStyle,
  RemovableSectionType,
  SkillDisplayMode,
  SkillMeterVariant,
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
  'achievements',
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
  'navyGold',
  'crimsonCopper',
  'violetOrange',
  'midnightMint',
  'azurePeach',
  'charcoalLemon',
  'charcoalAmber',
  'smokyCoral',
  'charcoalJade',
  'purpleRose',
  'inkFuchsia',
  'graphiteGold',
  'greenBlue',
  'pinky',
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

export const PHOTO_STYLES: PhotoStyle[] = ['round', 'square', 'sharp'];

export const IMAGE_SIDES: ImageSide[] = ['left', 'right'];

export const CALENDAR_SYSTEMS: CalendarSystem[] = ['jalali', 'hijri', 'gregorian'];

export const COLUMN_WIDTHS: ColumnWidthId[] = ['small', 'medium', 'large', 'xlarge'];

export const LANGUAGE_LEVELS: LanguageLevel[] = [1, 2, 3, 4, 5];

export const LANGUAGE_METER_VARIANTS: LanguageMeterVariant[] = ['bars', 'dots', 'pill', 'line'];

export const SKILL_DISPLAY_MODES: SkillDisplayMode[] = ['row', 'list'];

// The skill meter reuses the Languages meter shapes, minus the pill.
export const SKILL_METER_VARIANTS: SkillMeterVariant[] = ['bars', 'dots', 'line'];

export const MONTH_FORMATS: MonthFormat[] = ['name', 'number'];
