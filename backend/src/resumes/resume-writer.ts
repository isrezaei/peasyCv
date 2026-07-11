import type { Prisma } from '@prisma/client';
import type { ResumeData } from '@resume/types';
import {
  buildAchievementRows,
  buildCertificationRows,
  buildEducationRows,
  buildExperienceCreateInput,
  buildLanguageRows,
  buildLinkRows,
  buildPersonalInfoData,
  buildProjectRows,
  buildSectionRows,
  buildSkillGroupCreateInput,
  buildThemeData,
} from './resume.serializer';

/**
 * Writes a full ResumeData payload to the database inside a caller-provided
 * transaction. Shared by ResumesService (CRUD) and the seed script.
 *
 *  - "create": inserts the Resume + 1:1 theme/personalInfo, then all children.
 *  - "replace": updates scalars, upserts theme/personalInfo, clears every child
 *    collection and recreates it — so the DB exactly mirrors the payload.
 */
export async function writeResumeData(
  tx: Prisma.TransactionClient,
  userId: string,
  id: string,
  payload: ResumeData,
  mode: 'create' | 'replace',
): Promise<void> {
  if (mode === 'create') {
    await tx.resume.create({
      data: {
        id,
        userId,
        title: payload.title,
        locale: payload.locale,
        templateId: payload.templateId,
        summaryHtml: payload.summary.html,
        theme: { create: buildThemeData(payload.theme) },
        personalInfo: { create: buildPersonalInfoData(payload.personalInfo) },
      },
    });
  } else {
    await tx.resume.update({
      where: { id },
      data: {
        title: payload.title,
        locale: payload.locale,
        templateId: payload.templateId,
        summaryHtml: payload.summary.html,
      },
    });
    const themeData = buildThemeData(payload.theme);
    await tx.resumeTheme.upsert({
      where: { resumeId: id },
      create: { resumeId: id, ...themeData },
      update: themeData,
    });
    const personalInfoData = buildPersonalInfoData(payload.personalInfo);
    await tx.resumePersonalInfo.upsert({
      where: { resumeId: id },
      create: { resumeId: id, ...personalInfoData },
      update: personalInfoData,
    });
    await Promise.all([
      tx.section.deleteMany({ where: { resumeId: id } }),
      tx.personalLink.deleteMany({ where: { resumeId: id } }),
      tx.experience.deleteMany({ where: { resumeId: id } }),
      tx.skillGroup.deleteMany({ where: { resumeId: id } }),
      tx.education.deleteMany({ where: { resumeId: id } }),
      tx.project.deleteMany({ where: { resumeId: id } }),
      tx.language.deleteMany({ where: { resumeId: id } }),
      tx.certification.deleteMany({ where: { resumeId: id } }),
      tx.achievement.deleteMany({ where: { resumeId: id } }),
    ]);
  }

  await Promise.all([
    tx.section.createMany({ data: buildSectionRows(id, payload.sections) }),
    tx.personalLink.createMany({ data: buildLinkRows(id, payload.personalInfo.links) }),
    tx.education.createMany({ data: buildEducationRows(id, payload.education) }),
    tx.project.createMany({ data: buildProjectRows(id, payload.projects) }),
    tx.language.createMany({ data: buildLanguageRows(id, payload.languages) }),
    tx.certification.createMany({ data: buildCertificationRows(id, payload.certifications) }),
    tx.achievement.createMany({ data: buildAchievementRows(id, payload.achievements) }),
  ]);

  for (let i = 0; i < payload.experience.length; i += 1) {
    await tx.experience.create({ data: buildExperienceCreateInput(id, payload.experience[i], i) });
  }
  for (let i = 0; i < payload.skills.length; i += 1) {
    await tx.skillGroup.create({ data: buildSkillGroupCreateInput(id, payload.skills[i], i) });
  }
}
