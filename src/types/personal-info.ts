import type { ID } from "./common";
import type { ImageMeta } from "./image";
import type { PhotoStyle } from "./theme";

export interface LinkItem {
  id: ID;
  label: string;
  url: string;
}

/**
 * Per-field visibility flags. Hidden fields keep their stored value but are not
 * rendered in any template, so toggling never destroys data.
 */
export interface PersonalInfoFieldVisibility {
  jobTitle: boolean;
  phone: boolean;
  links: boolean;
  email: boolean;
  location: boolean;
  photo: boolean;
  dateOfBirth: boolean;
  nationality: boolean;
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  phone: string;
  location: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  links: LinkItem[];
  profileImage: ImageMeta | null;
  uppercaseName: boolean;
  photoStyle: PhotoStyle;
  fieldVisibility: PersonalInfoFieldVisibility;
}
