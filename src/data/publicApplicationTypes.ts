/** طلب تقديم من الزوار — يُخزَّن محلياً ويُراجع من لوحة التحكم */

export type ApplicationFormSnapshot = {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  birthSummaryLine: string;
  ageSummaryLine: string;
  countryCode: string;
  discord: string;
  previousCities: string;
  experience: string;
  lawsAccepted: boolean;
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ApplicationRecord = {
  id: string;
  /** مفتاح المسار /apply/:role */
  roleKey: string;
  targetTitle: string;
  status: ApplicationStatus;
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  /** ملاحظة اختيارية من المراجع عند القرار */
  note?: string;
  snapshot: ApplicationFormSnapshot;
};
