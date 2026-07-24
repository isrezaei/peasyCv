import {
  achievementSurvives,
  certificationSurvives,
  educationSurvives,
  experienceSurvives,
  hasText,
  isBlank,
  projectSurvives,
  skillGroupSurvives,
} from "@/lib/resume/emptyFields";
import type { ResumeData, SectionMeta } from "@/types";

// The emptiness predicate (`isBlank`) and the per-entry survival predicates are
// defined once in emptyFields.ts and shared with the download-time validation,
// so "what the PDF omits" and "what the editor flags as empty" can never drift.

/**
 * Prunes a résumé for the headless /print surface (the PDF pipeline), so nothing
 * empty ever paints:
 *
 * - items whose every text field is blank are dropped (the editor seeds blank
 *   entries for the user to fill — they are editing chrome, not content);
 * - blank leaf rows inside kept items (responsibility bullets, skill chips,
 *   personal links) are dropped, and an empty optional link flips `linkVisible`
 *   off so the shared `shouldRenderProjectLink` predicate hides the row;
 * - a section left with no content does not print at all — its meta is removed,
 *   so neither its heading nor its reserved space reaches the PDF;
 * - personal-info fields with blank values (and the photo without an image)
 *   flip their `fieldVisibility` off, hiding the orphan contact icons.
 *
 * Only /print consumes this. The pagination estimators read the SAME pruned
 * document from the store (`fieldVisibility`, item arrays, `linkVisible`), so
 * paint and reserve stay in lockstep by construction.
 */
export function prunePrintResume(resume: ResumeData): ResumeData {
  const experience = resume.experience
    .filter(experienceSurvives)
    .map((item) => ({
      ...item,
      linkVisible: item.linkVisible && !isBlank(item.link),
      responsibilities: item.responsibilities.filter((r) => !isBlank(r.text)),
    }));

  const skills = resume.skills
    .filter(skillGroupSurvives)
    .map((group) => ({ ...group, skills: group.skills.filter((s) => !isBlank(s.name)) }));

  const education = resume.education.filter(educationSurvives);

  const projects = resume.projects
    .filter(projectSurvives)
    .map((item) => ({ ...item, linkVisible: item.linkVisible && !isBlank(item.link) }));

  const languages = resume.languages.filter((item) => !isBlank(item.name));

  const certifications = resume.certifications.filter(certificationSurvives);

  const achievements = resume.achievements.filter(achievementSurvives);

  // A section with no surviving content loses its meta entirely, so the block
  // builders never emit its heading.
  const contentBySection: Record<SectionMeta["type"], boolean> = {
    summary: !isBlank(resume.summary.html),
    experience: experience.length > 0,
    skills: skills.length > 0,
    education: education.length > 0,
    projects: projects.length > 0,
    languages: languages.length > 0,
    certifications: certifications.length > 0,
    achievements: achievements.length > 0,
  };
  const sections = resume.sections.filter((section) => contentBySection[section.type]);

  const { personalInfo } = resume;
  const links = personalInfo.links.filter((link) => hasText(link.label, link.url));
  const { fieldVisibility } = personalInfo;

  return {
    ...resume,
    sections,
    personalInfo: {
      ...personalInfo,
      links,
      fieldVisibility: {
        ...fieldVisibility,
        jobTitle: fieldVisibility.jobTitle && !isBlank(personalInfo.jobTitle),
        phone: fieldVisibility.phone && !isBlank(personalInfo.phone),
        email: fieldVisibility.email && !isBlank(personalInfo.email),
        location: fieldVisibility.location && !isBlank(personalInfo.location),
        dateOfBirth: fieldVisibility.dateOfBirth && !isBlank(personalInfo.dateOfBirth),
        nationality: fieldVisibility.nationality && !isBlank(personalInfo.nationality),
        militaryService:
          fieldVisibility.militaryService && !isBlank(personalInfo.militaryService),
        links: fieldVisibility.links && links.length > 0,
        photo: fieldVisibility.photo && personalInfo.profileImage !== null,
      },
    },
    experience,
    skills,
    education,
    projects,
    languages,
    certifications,
    achievements,
  };
}
