import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Student,
  Achievement,
  StudentDocument,
  OTPRecord,
  UserRole,
  StudentStatus,
} from '@/types';

interface AuthState {
  currentUser: { role: UserRole; id: string; name: string } | null;
  login: (role: UserRole, id: string, name: string) => void;
  logout: () => void;
}

interface StudentStore {
  students: Student[];
  achievements: Achievement[];
  documents: StudentDocument[];
  otpRecords: OTPRecord[];

  // Student actions
  registerStudent: (student: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  getStudentById: (id: string) => Student | undefined;
  getStudentByRegNo: (regNo: string) => Student | undefined;
  getStudentByParentPhone: (phone: string) => Student | undefined;

  // Achievement actions
  addAchievement: (achievement: Achievement) => void;
  getAchievementsByStudentId: (studentId: string) => Achievement[];
  deleteAchievement: (id: string) => void;

  // Document actions
  addDocument: (doc: StudentDocument) => void;
  getDocumentsByStudentId: (studentId: string) => StudentDocument[];
  deleteDocument: (id: string) => void;

  // Admin actions
  approveStudent: (id: string) => void;
  rejectStudent: (id: string) => void;
  getPendingStudents: () => Student[];
  getAllStudents: () => Student[];

  // OTP actions
  generateOTP: (phone: string) => string | null;
  verifyOTP: (phone: string, otp: string) => Student | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (role, id, name) => set({ currentUser: { role, id, name } }),
      logout: () => set({ currentUser: null }),
    }),
    { name: 'auth-storage' }
  )
);

export const useStudentStore = create<StudentStore>()(
  persist(
    (set, get) => ({
      students: [],
      achievements: [],
      documents: [],
      otpRecords: [],

      registerStudent: (student) =>
        set((state) => ({ students: [...state.students, student] })),

      updateStudent: (id, data) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),

      getStudentById: (id) => get().students.find((s) => s.id === id),

      getStudentByRegNo: (regNo) =>
        get().students.find(
          (s) => s.registrationNumber.toLowerCase() === regNo.toLowerCase()
        ),

      getStudentByParentPhone: (phone) =>
        get().students.find((s) => s.parentPhone === phone),

      addAchievement: (achievement) =>
        set((state) => ({
          achievements: [...state.achievements, achievement],
        })),

      getAchievementsByStudentId: (studentId) =>
        get().achievements.filter((a) => a.studentId === studentId),

      deleteAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.filter((a) => a.id !== id),
        })),

      addDocument: (doc) =>
        set((state) => ({ documents: [...state.documents, doc] })),

      getDocumentsByStudentId: (studentId) =>
        get().documents.filter((d) => d.studentId === studentId),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      approveStudent: (id) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, status: 'approved' as StudentStatus } : s
          ),
        })),

      rejectStudent: (id) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, status: 'rejected' as StudentStatus } : s
          ),
        })),

      getPendingStudents: () =>
        get().students.filter((s) => s.status === 'pending'),

      getAllStudents: () => get().students,

      generateOTP: (phone) => {
        const student = get().getStudentByParentPhone(phone);
        if (!student) return null;
        if (student.status !== 'approved') return null;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        set((state) => ({
          otpRecords: [
            ...state.otpRecords.filter((r) => r.phone !== phone),
            {
              phone,
              otp,
              expiresAt: Date.now() + 5 * 60 * 1000,
              studentId: student.id,
            },
          ],
        }));
        return otp;
      },

      verifyOTP: (phone, otp) => {
        const record = get().otpRecords.find(
          (r) => r.phone === phone && r.otp === otp && r.expiresAt > Date.now()
        );
        if (!record) return null;
        set((state) => ({
          otpRecords: state.otpRecords.filter((r) => r.phone !== phone),
        }));
        return get().getStudentById(record.studentId) || null;
      },
    }),
    { name: 'student-storage' }
  )
);
