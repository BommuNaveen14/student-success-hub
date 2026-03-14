// Types for the Student Achievement Management System

export type UserRole = 'student' | 'admin' | 'parent';

export type AdmissionCategory = 'VSAT' | 'EAMCET' | 'JEE' | 'Management' | 'Sports' | 'Other';

export type StudentStatus = 'pending' | 'approved' | 'rejected';

export type AchievementType =
  | 'hackathon'
  | 'internship'
  | 'research'
  | 'technical'
  | 'cultural'
  | 'sports'
  | 'workshop'
  | 'seminar'
  | 'other';

export type DocumentType =
  | 'mark_memo'
  | 'aadhaar'
  | 'pan'
  | 'voter_id'
  | 'apaar_abc'
  | 'other';

export interface Student {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  admissionCategory: AdmissionCategory;
  program: string;
  branch: string;
  yearOfAdmission: number;
  currentYear: number;
  currentSemester: number;
  password: string;
  status: StudentStatus;
  createdAt: string;
  profilePhoto?: string;
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  type: AchievementType;
  academicYear: string;
  semester: number;
  date: string;
  certificateUrl?: string;
  organization: string;
  position?: string;
  createdAt: string;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  uploadedAt: string;
  verified: boolean;
}

export interface OTPRecord {
  phone: string;
  otp: string;
  expiresAt: number;
  studentId: string;
}
