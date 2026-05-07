export type Page = 'upload' | 'extraction' | 'action-plan' | 'risk-score' | 'dashboard';

export type FieldStatus = 'pending' | 'approved' | 'rejected' | 'editing';

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: FieldStatus;
  editValue?: string;
}

export interface VerifiedCaseData {
  caseNumber: string;
  courtName: string;
  dateOfOrder: string;
  keyDirections: string;
  responsibleDepartment: string;
  complianceDeadline: string;
  natureOfAction: string;
  appealLimitationPeriod: string;
  riskScore: number;
}

export interface CaseRow {
  id: string;
  caseId: string;
  court: string;
  department: string;
  deadline: string;
  riskScore: number;
  status: 'Pending' | 'Verified' | 'Completed';
}
