import { isExperienceItemAtBoundary } from "@/lib/pagination";
import { createDefaultResume } from "@/lib/resume/createDefaultResume";
import { createId } from "@/lib/utils/id";
import type { ExperienceItem, ResponsibilityItem } from "@/types";
import type { ResumeSlice, SliceCreator } from "../types";

const touch = () => new Date().toISOString();

/** The section's normal empty entry — the exact shape addExperience persists —
 *  parameterized so the boundary path can seed exactly one bullet line. */
const emptyExperienceItem = (responsibilities: ResponsibilityItem[]): ExperienceItem => ({
  id: createId(),
  jobTitle: "",
  companyName: "",
  period: { start: "", end: "", current: false },
  city: "",
  projectLink: "",
  projectDescription: "",
  link: "",
  linkVisible: true,
  responsibilities,
});

export const createResumeSlice: SliceCreator<ResumeSlice> = (set, get) => ({
  resume: createDefaultResume(),

  setResume: (resume) => set({ resume }),

  updatePersonalInfo: (patch) =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: { ...state.resume.personalInfo, ...patch },
        updatedAt: touch(),
      },
    })),

  setProfileImage: (image) =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: { ...state.resume.personalInfo, profileImage: image },
        updatedAt: touch(),
      },
    })),

  removeProfileImage: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: { ...state.resume.personalInfo, profileImage: null },
        updatedAt: touch(),
      },
    })),

  setPhotoStyle: (style) =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: { ...state.resume.personalInfo, photoStyle: style },
        updatedAt: touch(),
      },
    })),

  setImageSide: (side) =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: { ...state.resume.personalInfo, imageSide: side },
        updatedAt: touch(),
      },
    })),

  toggleField: (field) =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: {
          ...state.resume.personalInfo,
          fieldVisibility: {
            ...state.resume.personalInfo.fieldVisibility,
            [field]: !state.resume.personalInfo.fieldVisibility[field],
          },
        },
        updatedAt: touch(),
      },
    })),

  setUppercaseName: (enabled) =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: { ...state.resume.personalInfo, uppercaseName: enabled },
        updatedAt: touch(),
      },
    })),

  addLink: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: {
          ...state.resume.personalInfo,
          links: [...state.resume.personalInfo.links, { id: createId(), label: "", url: "" }],
        },
        updatedAt: touch(),
      },
    })),

  updateLink: (id, patch) =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: {
          ...state.resume.personalInfo,
          links: state.resume.personalInfo.links.map((link) =>
            link.id === id ? { ...link, ...patch } : link,
          ),
        },
        updatedAt: touch(),
      },
    })),

  removeLink: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: {
          ...state.resume.personalInfo,
          links: state.resume.personalInfo.links.filter((link) => link.id !== id),
        },
        updatedAt: touch(),
      },
    })),

  updateSummary: (html) =>
    set((state) => ({
      resume: { ...state.resume, summary: { html }, updatedAt: touch() },
    })),

  addExperience: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: [
          ...state.resume.experience,
          // A fresh entry starts with two empty bullet lines to invite content.
          emptyExperienceItem([
            { id: createId(), text: "" },
            { id: createId(), text: "" },
          ]),
        ],
        updatedAt: touch(),
      },
    })),

  updateExperience: (id, patch) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
        updatedAt: touch(),
      },
    })),

  removeExperience: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.filter((item) => item.id !== id),
        updatedAt: touch(),
      },
    })),

  addResponsibility: (experienceId) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((item) =>
          item.id === experienceId
            ? {
                ...item,
                responsibilities: [...item.responsibilities, { id: createId(), text: "" }],
              }
            : item,
        ),
        updatedAt: touch(),
      },
    })),

  addResponsibilityAfter: (experienceId, afterId) => {
    // Product rule: an entry that has filled down to the page's bottom margin is
    // "full for this page" — it never grows (which would relocate it to the next
    // page). Enter on it creates a NEW sibling entry right after it instead; the
    // packer then lands that entry on the next page while this one stays put.
    // The verdict is a pure simulation over the active template's pagination
    // model (see lib/pagination/itemBoundary.ts). This branch lives ONLY inside
    // this user-triggered action — the auto-seed path (addResponsibility, fired
    // when a list loads empty) and the layout/render pass can never reach it, so
    // items are never created by pagination itself.
    if (isExperienceItemAtBoundary(get().resume, experienceId)) {
      const bulletId = createId();
      set((state) => {
        const index = state.resume.experience.findIndex((item) => item.id === experienceId);
        const experience = [...state.resume.experience];
        experience.splice(index + 1, 0, emptyExperienceItem([{ id: bulletId, text: "" }]));
        return { resume: { ...state.resume, experience, updatedAt: touch() } };
      });
      return bulletId;
    }

    const newId = createId();
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((item) => {
          if (item.id !== experienceId) return item;
          const index = item.responsibilities.findIndex((r) => r.id === afterId);
          const next = [...item.responsibilities];
          // Insert right after the current line (or at the end if not found),
          // preserving order; the rest shift down by one.
          next.splice(index < 0 ? next.length : index + 1, 0, { id: newId, text: "" });
          return { ...item, responsibilities: next };
        }),
        updatedAt: touch(),
      },
    }));
    return newId;
  },

  updateResponsibility: (experienceId, responsibilityId, text) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((item) =>
          item.id === experienceId
            ? {
                ...item,
                responsibilities: item.responsibilities.map((responsibility) =>
                  responsibility.id === responsibilityId
                    ? { ...responsibility, text }
                    : responsibility,
                ),
              }
            : item,
        ),
        updatedAt: touch(),
      },
    })),

  removeResponsibility: (experienceId, responsibilityId) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((item) =>
          item.id === experienceId
            ? {
                ...item,
                responsibilities: item.responsibilities.filter(
                  (responsibility) => responsibility.id !== responsibilityId,
                ),
              }
            : item,
        ),
        updatedAt: touch(),
      },
    })),

  addSkillGroup: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: [...state.resume.skills, { id: createId(), name: "", showTitle: true, skills: [] }],
        updatedAt: touch(),
      },
    })),

  updateSkillGroup: (id, patch) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.map((group) =>
          group.id === id ? { ...group, ...patch } : group,
        ),
        updatedAt: touch(),
      },
    })),

  removeSkillGroup: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.filter((group) => group.id !== id),
        updatedAt: touch(),
      },
    })),

  addSkill: (groupId) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.map((group) =>
          group.id === groupId
            ? { ...group, skills: [...group.skills, { id: createId(), name: "", level: 3 }] }
            : group,
        ),
        updatedAt: touch(),
      },
    })),

  addSkillAfter: (groupId, afterId) => {
    const newId = createId();
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.map((group) => {
          if (group.id !== groupId) return group;
          const index = group.skills.findIndex((skill) => skill.id === afterId);
          const next = [...group.skills];
          // Insert right after the current line (or at the end if not found),
          // preserving order; the rest shift down by one.
          next.splice(index < 0 ? next.length : index + 1, 0, { id: newId, name: "", level: 3 });
          return { ...group, skills: next };
        }),
        updatedAt: touch(),
      },
    }));
    return newId;
  },

  updateSkill: (groupId, skillId, name) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.map((group) =>
          group.id === groupId
            ? {
                ...group,
                skills: group.skills.map((skill) =>
                  skill.id === skillId ? { ...skill, name } : skill,
                ),
              }
            : group,
        ),
        updatedAt: touch(),
      },
    })),

  removeSkill: (groupId, skillId) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.map((group) =>
          group.id === groupId
            ? { ...group, skills: group.skills.filter((skill) => skill.id !== skillId) }
            : group,
        ),
        updatedAt: touch(),
      },
    })),

  addEducation: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: [
          ...state.resume.education,
          {
            id: createId(),
            degree: "",
            university: "",
            startDate: "",
            endDate: "",
            gpa: "",
            achievements: "",
            city: "",
          },
        ],
        updatedAt: touch(),
      },
    })),

  updateEducation: (id, patch) =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
        updatedAt: touch(),
      },
    })),

  removeEducation: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.filter((item) => item.id !== id),
        updatedAt: touch(),
      },
    })),

  addProject: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: [
          ...state.resume.projects,
          { id: createId(), name: "", role: "", link: "", linkVisible: true, description: "" },
        ],
        updatedAt: touch(),
      },
    })),

  updateProject: (id, patch) =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: state.resume.projects.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
        updatedAt: touch(),
      },
    })),

  removeProject: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: state.resume.projects.filter((item) => item.id !== id),
        updatedAt: touch(),
      },
    })),

  addLanguage: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        languages: [
          ...state.resume.languages,
          { id: createId(), name: "", level: 3, showBars: true, showLevelText: true },
        ],
        updatedAt: touch(),
      },
    })),

  updateLanguage: (id, patch) =>
    set((state) => ({
      resume: {
        ...state.resume,
        languages: state.resume.languages.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
        updatedAt: touch(),
      },
    })),

  setSkillLevel: (groupId, skillId, level) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.map((group) =>
          group.id === groupId
            ? {
                ...group,
                skills: group.skills.map((skill) =>
                  skill.id === skillId ? { ...skill, level } : skill,
                ),
              }
            : group,
        ),
        updatedAt: touch(),
      },
    })),

  setLanguageLevel: (id, level) =>
    set((state) => ({
      resume: {
        ...state.resume,
        languages: state.resume.languages.map((item) =>
          item.id === id ? { ...item, level } : item,
        ),
        updatedAt: touch(),
      },
    })),

  removeLanguage: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        languages: state.resume.languages.filter((item) => item.id !== id),
        updatedAt: touch(),
      },
    })),

  addCertification: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: [
          ...state.resume.certifications,
          { id: createId(), name: "", issuer: "", date: "" },
        ],
        updatedAt: touch(),
      },
    })),

  updateCertification: (id, patch) =>
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: state.resume.certifications.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
        updatedAt: touch(),
      },
    })),

  removeCertification: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        certifications: state.resume.certifications.filter((item) => item.id !== id),
        updatedAt: touch(),
      },
    })),

  addAchievement: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        achievements: [...state.resume.achievements, { id: createId(), title: "", description: "" }],
        updatedAt: touch(),
      },
    })),

  updateAchievement: (id, patch) =>
    set((state) => ({
      resume: {
        ...state.resume,
        achievements: state.resume.achievements.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
        updatedAt: touch(),
      },
    })),

  removeAchievement: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        achievements: state.resume.achievements.filter((item) => item.id !== id),
        updatedAt: touch(),
      },
    })),
});
