import type { ID } from "./common";

export interface CertificationItem {
  id: ID;
  name: string;
  issuer: string;
  date: string;
}
