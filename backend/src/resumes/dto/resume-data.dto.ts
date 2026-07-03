import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type {
  BackgroundPatternId,
  CalendarSystem,
  CertificationItem,
  Direction,
  EducationItem,
  EmploymentPeriod,
  ExperienceItem,
  FontFamilyId,
  ImageCrop,
  ImageMeta,
  LanguageItem,
  LanguageLevel,
  LinkItem,
  PageBackgroundMode,
  PersonalInfo,
  PersonalInfoFieldVisibility,
  PhotoStyle,
  ProjectItem,
  RemovableSectionType,
  ResponsibilityItem,
  ResumeData,
  SectionMeta,
  SkillGroup,
  SkillItem,
  SummaryContent,
  TemplateId,
  ThemeId,
  ThemeSettings,
} from '@resume/types';
import {
  BACKGROUND_PATTERNS,
  CALENDAR_SYSTEMS,
  DIRECTIONS,
  FONT_FAMILIES,
  LANGUAGE_LEVELS,
  LOCALES,
  PAGE_BACKGROUND_MODES,
  PHOTO_STYLES,
  SECTION_TYPES,
  TEMPLATE_IDS,
  THEME_IDS,
} from '../resume.constants';

// --- image -----------------------------------------------------------------

export class ImageCropDto implements ImageCrop {
  @IsNumber() x!: number;
  @IsNumber() y!: number;
  @IsNumber() width!: number;
  @IsNumber() height!: number;
  @IsNumber() zoom!: number;
}

export class ImageMetaDto implements ImageMeta {
  @IsString() id!: string;
  @IsString() url!: string;
  @IsString() originalUrl!: string;
  @IsNumber() width!: number;
  @IsNumber() height!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageCropDto)
  crop!: ImageCropDto | null;
}

// --- personal info ---------------------------------------------------------

export class LinkItemDto implements LinkItem {
  @IsString() id!: string;
  @IsString() label!: string;
  @IsString() url!: string;
}

export class PersonalInfoFieldVisibilityDto implements PersonalInfoFieldVisibility {
  @IsBoolean() jobTitle!: boolean;
  @IsBoolean() phone!: boolean;
  @IsBoolean() links!: boolean;
  @IsBoolean() email!: boolean;
  @IsBoolean() location!: boolean;
  @IsBoolean() photo!: boolean;
  @IsBoolean() dateOfBirth!: boolean;
  @IsBoolean() nationality!: boolean;
}

export class PersonalInfoDto implements PersonalInfo {
  @IsString() fullName!: string;
  @IsString() jobTitle!: string;
  @IsString() phone!: string;
  @IsString() location!: string;
  @IsString() email!: string;
  @IsString() dateOfBirth!: string;
  @IsString() nationality!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkItemDto)
  links!: LinkItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageMetaDto)
  profileImage!: ImageMetaDto | null;

  @IsBoolean() uppercaseName!: boolean;

  @IsIn(PHOTO_STYLES)
  photoStyle!: PhotoStyle;

  @ValidateNested()
  @Type(() => PersonalInfoFieldVisibilityDto)
  fieldVisibility!: PersonalInfoFieldVisibilityDto;
}

// --- summary ---------------------------------------------------------------

export class SummaryContentDto implements SummaryContent {
  @IsString() html!: string;
}

// --- experience ------------------------------------------------------------

export class EmploymentPeriodDto implements EmploymentPeriod {
  @IsString() start!: string;
  @IsString() end!: string;
  @IsBoolean() current!: boolean;
}

export class ResponsibilityItemDto implements ResponsibilityItem {
  @IsString() id!: string;
  @IsString() text!: string;
}

export class ExperienceItemDto implements ExperienceItem {
  @IsString() id!: string;
  @IsString() jobTitle!: string;
  @IsString() companyName!: string;

  @ValidateNested()
  @Type(() => EmploymentPeriodDto)
  period!: EmploymentPeriodDto;

  @IsString() city!: string;
  @IsString() projectLink!: string;
  @IsString() projectDescription!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponsibilityItemDto)
  responsibilities!: ResponsibilityItemDto[];
}

// --- skills ----------------------------------------------------------------

export class SkillItemDto implements SkillItem {
  @IsString() id!: string;
  @IsString() name!: string;
}

export class SkillGroupDto implements SkillGroup {
  @IsString() id!: string;
  @IsString() name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillItemDto)
  skills!: SkillItemDto[];
}

// --- education -------------------------------------------------------------

export class EducationItemDto implements EducationItem {
  @IsString() id!: string;
  @IsString() degree!: string;
  @IsString() university!: string;
  @IsString() startDate!: string;
  @IsString() endDate!: string;
  @IsString() gpa!: string;
  @IsString() achievements!: string;
  @IsString() city!: string;
}

// --- projects --------------------------------------------------------------

export class ProjectItemDto implements ProjectItem {
  @IsString() id!: string;
  @IsString() name!: string;
  @IsString() role!: string;
  @IsString() link!: string;
  @IsString() description!: string;
}

// --- languages -------------------------------------------------------------

export class LanguageItemDto implements LanguageItem {
  @IsString() id!: string;
  @IsString() name!: string;

  @IsIn(LANGUAGE_LEVELS)
  level!: LanguageLevel;
}

// --- certifications --------------------------------------------------------

export class CertificationItemDto implements CertificationItem {
  @IsString() id!: string;
  @IsString() name!: string;
  @IsString() issuer!: string;
  @IsString() date!: string;
}

// --- sections --------------------------------------------------------------

export class SectionMetaDto implements SectionMeta {
  @IsString() id!: string;

  @IsIn(SECTION_TYPES)
  type!: RemovableSectionType;

  @IsString() title!: string;
  @IsBoolean() visible!: boolean;

  @IsIn(DIRECTIONS)
  direction!: Direction;

  @IsInt() order!: number;
}

// --- theme -----------------------------------------------------------------

export class ThemeSettingsDto implements ThemeSettings {
  @IsIn(THEME_IDS)
  themeId!: ThemeId;

  @IsIn(PAGE_BACKGROUND_MODES)
  pageBackground!: PageBackgroundMode;

  @IsIn(BACKGROUND_PATTERNS)
  backgroundPattern!: BackgroundPatternId;

  @IsNumber()
  @Min(0.1)
  @Max(3)
  backgroundIntensity!: number;

  @IsIn(CALENDAR_SYSTEMS)
  dateCalendar!: CalendarSystem;

  @IsIn(FONT_FAMILIES)
  fontFamily!: FontFamilyId;

  @IsNumber()
  @Min(0.5)
  @Max(2)
  fontScale!: number;

  @IsNumber()
  @Min(1)
  @Max(3)
  lineHeight!: number;

  @IsNumber()
  @Min(0)
  @Max(60)
  pageMargin!: number;

  @IsNumber()
  @Min(0)
  @Max(40)
  sectionSpacing!: number;

  @IsNumber()
  @Min(0.1)
  @Max(3)
  columnIntensity!: number;
}

// --- resume (root) ---------------------------------------------------------

export class ResumeDataDto implements ResumeData {
  @IsString() id!: string;
  @IsString() title!: string;

  @IsIn(LOCALES)
  locale!: 'fa' | 'en';

  @IsIn(TEMPLATE_IDS)
  templateId!: TemplateId;

  @ValidateNested()
  @Type(() => ThemeSettingsDto)
  theme!: ThemeSettingsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionMetaDto)
  sections!: SectionMetaDto[];

  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo!: PersonalInfoDto;

  @ValidateNested()
  @Type(() => SummaryContentDto)
  summary!: SummaryContentDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  experience!: ExperienceItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillGroupDto)
  skills!: SkillGroupDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationItemDto)
  education!: EducationItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectItemDto)
  projects!: ProjectItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageItemDto)
  languages!: LanguageItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationItemDto)
  certifications!: CertificationItemDto[];

  // Server-authoritative; accepted in the payload but overwritten on write.
  @IsOptional()
  @IsString()
  createdAt!: string;

  @IsOptional()
  @IsString()
  updatedAt!: string;
}
