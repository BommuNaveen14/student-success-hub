export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          academic_year: string | null
          certificate_url: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          organization: string
          position: string | null
          semester: number | null
          student_id: string
          title: string
          type: Database["public"]["Enums"]["achievement_type"]
          user_id: string
        }
        Insert: {
          academic_year?: string | null
          certificate_url?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          organization: string
          position?: string | null
          semester?: number | null
          student_id: string
          title: string
          type: Database["public"]["Enums"]["achievement_type"]
          user_id: string
        }
        Update: {
          academic_year?: string | null
          certificate_url?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          organization?: string
          position?: string | null
          semester?: number | null
          student_id?: string
          title?: string
          type?: Database["public"]["Enums"]["achievement_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          file_path: string
          id: string
          name: string
          student_id: string
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          file_path: string
          id?: string
          name: string
          student_id: string
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          file_path?: string
          id?: string
          name?: string
          student_id?: string
          type?: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_records: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp: string
          phone: string
          student_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp: string
          phone: string
          student_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp?: string
          phone?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "otp_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string
          admission_category: Database["public"]["Enums"]["admission_category"]
          branch: string
          city: string
          created_at: string
          current_semester: number
          current_year: number
          date_of_birth: string
          email: string
          first_name: string
          gender: string
          id: string
          last_name: string
          parent_email: string | null
          parent_name: string
          parent_phone: string
          phone: string
          pincode: string
          profile_photo: string | null
          program: string
          registration_number: string
          state: string
          status: Database["public"]["Enums"]["student_status"]
          updated_at: string
          user_id: string
          year_of_admission: number
        }
        Insert: {
          address: string
          admission_category: Database["public"]["Enums"]["admission_category"]
          branch: string
          city: string
          created_at?: string
          current_semester?: number
          current_year?: number
          date_of_birth: string
          email: string
          first_name: string
          gender: string
          id?: string
          last_name: string
          parent_email?: string | null
          parent_name: string
          parent_phone: string
          phone: string
          pincode: string
          profile_photo?: string | null
          program: string
          registration_number: string
          state: string
          status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
          user_id: string
          year_of_admission: number
        }
        Update: {
          address?: string
          admission_category?: Database["public"]["Enums"]["admission_category"]
          branch?: string
          city?: string
          created_at?: string
          current_semester?: number
          current_year?: number
          date_of_birth?: string
          email?: string
          first_name?: string
          gender?: string
          id?: string
          last_name?: string
          parent_email?: string | null
          parent_name?: string
          parent_phone?: string
          phone?: string
          pincode?: string
          profile_photo?: string | null
          program?: string
          registration_number?: string
          state?: string
          status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
          user_id?: string
          year_of_admission?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_student_by_parent_phone: {
        Args: { _phone: string }
        Returns: {
          address: string
          admission_category: Database["public"]["Enums"]["admission_category"]
          branch: string
          city: string
          created_at: string
          current_semester: number
          current_year: number
          date_of_birth: string
          email: string
          first_name: string
          gender: string
          id: string
          last_name: string
          parent_email: string | null
          parent_name: string
          parent_phone: string
          phone: string
          pincode: string
          profile_photo: string | null
          program: string
          registration_number: string
          state: string
          status: Database["public"]["Enums"]["student_status"]
          updated_at: string
          user_id: string
          year_of_admission: number
        }[]
        SetofOptions: {
          from: "*"
          to: "students"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      achievement_type:
        | "hackathon"
        | "internship"
        | "research"
        | "technical"
        | "cultural"
        | "sports"
        | "workshop"
        | "seminar"
        | "other"
      admission_category:
        | "VSAT"
        | "EAMCET"
        | "JEE"
        | "Management"
        | "Sports"
        | "Other"
      app_role: "admin" | "student" | "parent"
      document_type:
        | "mark_memo"
        | "aadhaar"
        | "pan"
        | "voter_id"
        | "apaar_abc"
        | "other"
      student_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_type: [
        "hackathon",
        "internship",
        "research",
        "technical",
        "cultural",
        "sports",
        "workshop",
        "seminar",
        "other",
      ],
      admission_category: [
        "VSAT",
        "EAMCET",
        "JEE",
        "Management",
        "Sports",
        "Other",
      ],
      app_role: ["admin", "student", "parent"],
      document_type: [
        "mark_memo",
        "aadhaar",
        "pan",
        "voter_id",
        "apaar_abc",
        "other",
      ],
      student_status: ["pending", "approved", "rejected"],
    },
  },
} as const
