import type { ImageMeta, PersonalInfo, ThemeSettings } from '@resume/types';
import { buildPersonalInfoData, buildThemeData } from './resume.serializer';
import { createDefaultResumeData } from './resume-default.factory';

describe('resume write builders', () => {
  it('maps every ThemeSettings field to explicit columns', () => {
    const theme: ThemeSettings = {
      themeId: 'sage',
      pageBackground: 'white',
      backgroundPattern: 'dotGrid',
      backgroundIntensity: 0.9,
      dateCalendar: 'gregorian',
      fontFamily: 'inter',
      fontScale: 1.1,
      lineHeight: 1.6,
      pageMargin: 18,
      sectionSpacing: 8,
      columnIntensity: 1.2,
      columnWidth: 'large',
      showSectionIcons: true,
      showSectionSeparators: true,
      atsMode: true,
    };
    expect(buildThemeData(theme)).toEqual(theme);
  });

  describe('buildPersonalInfoData photo columns', () => {
    const base: PersonalInfo = {
      fullName: 'Sara',
      jobTitle: 'Engineer',
      phone: '',
      location: '',
      email: '',
      dateOfBirth: '',
      nationality: '',
      militaryService: '',
      links: [],
      profileImage: null,
      uppercaseName: true,
      photoStyle: 'square',
      imageSide: 'right',
      fieldVisibility: {
        jobTitle: true,
        phone: false,
        links: true,
        email: false,
        location: true,
        photo: false,
        dateOfBirth: true,
        nationality: false,
        militaryService: false,
      },
    };

    it('nulls all photo columns when there is no profile image', () => {
      const data = buildPersonalInfoData(base);
      expect(data.photoMetaId).toBeNull();
      expect(data.photoUrl).toBeNull();
      expect(data.photoCropZoom).toBeNull();
      // Field-visibility flags map across to fv* columns.
      expect(data.fvPhone).toBe(false);
      expect(data.fvDateOfBirth).toBe(true);
      expect(data.photoStyle).toBe('square');
    });

    it('writes image columns and leaves crop null when crop is null', () => {
      const image: ImageMeta = {
        id: 'img-1',
        url: 'https://cdn/x.png',
        originalUrl: 'https://cdn/x-orig.png',
        width: 400,
        height: 300,
        crop: null,
      };
      const data = buildPersonalInfoData({ ...base, profileImage: image });
      expect(data.photoMetaId).toBe('img-1');
      expect(data.photoWidth).toBe(400);
      expect(data.photoCropX).toBeNull();
      expect(data.photoCropZoom).toBeNull();
    });

    it('writes crop columns when crop is present', () => {
      const image: ImageMeta = {
        id: 'img-2',
        url: 'https://cdn/y.png',
        originalUrl: 'https://cdn/y.png',
        width: 200,
        height: 200,
        crop: { x: 5, y: 6, width: 100, height: 110, zoom: 1.5 },
      };
      const data = buildPersonalInfoData({ ...base, profileImage: image });
      expect(data.photoCropX).toBe(5);
      expect(data.photoCropY).toBe(6);
      expect(data.photoCropWidth).toBe(100);
      expect(data.photoCropHeight).toBe(110);
      expect(data.photoCropZoom).toBe(1.5);
    });
  });
});

describe('createDefaultResumeData', () => {
  it('produces a complete, schema-valid resume', () => {
    const resume = createDefaultResumeData();
    expect(resume.sections).toHaveLength(8);
    expect(resume.sections.map((s) => s.type)).toEqual([
      'summary',
      'experience',
      'skills',
      'education',
      'projects',
      'languages',
      'certifications',
      'achievements',
    ]);
    expect(resume.experience).toHaveLength(4);
    expect(resume.experience.every((e) => e.responsibilities.length === 2)).toBe(true);
    expect(resume.education).toHaveLength(4);
    expect(resume.skills).toHaveLength(1);
    expect(resume.skills[0].skills).toHaveLength(1);
    // Skills display defaults: visible group title, mid-scale level, tag row
    // with no level meter and the line meter pre-selected for when it turns on.
    expect(resume.skills[0].showTitle).toBe(true);
    expect(resume.skills[0].skills[0].level).toBe(3);
    expect(
      resume.sections.every(
        (s) =>
          s.skillDisplayMode === 'row' && s.skillShowLevel === false && s.skillMeterVariant === 'line',
      ),
    ).toBe(true);
    expect(resume.languages).toHaveLength(1);
    expect(resume.achievements).toHaveLength(2);
    // No pre-filled example content anywhere — everything placeholder-driven.
    expect(resume.experience.every((e) => e.jobTitle === '' && e.companyName === '')).toBe(true);
    expect(resume.education.every((e) => e.degree === '' && e.university === '')).toBe(true);
    expect(resume.theme.themeId).toBe('indigo');
    expect(resume.personalInfo.profileImage).toBeNull();
    // Every section carries a sequential order starting at 0.
    expect(resume.sections.map((s) => s.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('applies overrides', () => {
    const resume = createDefaultResumeData({ title: 'X', templateId: 'double-column', locale: 'en' });
    expect(resume.title).toBe('X');
    expect(resume.templateId).toBe('double-column');
    expect(resume.locale).toBe('en');
  });
});
