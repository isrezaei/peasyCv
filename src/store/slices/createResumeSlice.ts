import { createDefaultResume } from "@/lib/resume/createDefaultResume";
import { createId } from "@/lib/utils/id";
import type { ResumeSlice, SliceCreator } from "../types";

const touch = () => new Date().toISOString();

export const createResumeSlice: SliceCreator<ResumeSlice> = (set) => ({
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
          {
            id: createId(),
            jobTitle: "",
            companyName: "",
            period: { start: "", end: "", current: false },
            city: "",
            projectLink: "",
            projectDescription: "",
            // A fresh entry starts with two empty bullet lines to invite content.
            responsibilities: [
              { id: createId(), text: "" },
              { id: createId(), text: "" },
            ],
          },
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
        skills: [...state.resume.skills, { id: createId(), name: "", skills: [] }],
        updatedAt: touch(),
      },
    })),

  updateSkillGroup: (id, name) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.map((group) => (group.id === id ? { ...group, name } : group)),
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
            ? { ...group, skills: [...group.skills, { id: createId(), name: "" }] }
            : group,
        ),
        updatedAt: touch(),
      },
    })),

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
          { id: createId(), name: "", role: "", link: "", description: "" },
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
        languages: [...state.resume.languages, { id: createId(), name: "", level: 3 }],
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
});
