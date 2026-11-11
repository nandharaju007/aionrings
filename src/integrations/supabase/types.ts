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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bench_photos: {
        Row: {
          chart_version: number | null
          confirmation_method: string
          confirmed_size: number
          created_at: string
          error_half_sizes: number | null
          est_high: number | null
          est_low: number | null
          est_size: number | null
          finger: string
          hand: string
          id: string
          projected_width_mm: number | null
          quality_flags: string[]
          ran_at: string | null
          storage_path: string
        }
        Insert: {
          chart_version?: number | null
          confirmation_method: string
          confirmed_size: number
          created_at?: string
          error_half_sizes?: number | null
          est_high?: number | null
          est_low?: number | null
          est_size?: number | null
          finger: string
          hand: string
          id?: string
          projected_width_mm?: number | null
          quality_flags?: string[]
          ran_at?: string | null
          storage_path: string
        }
        Update: {
          chart_version?: number | null
          confirmation_method?: string
          confirmed_size?: number
          created_at?: string
          error_half_sizes?: number | null
          est_high?: number | null
          est_low?: number | null
          est_size?: number | null
          finger?: string
          hand?: string
          id?: string
          projected_width_mm?: number | null
          quality_flags?: string[]
          ran_at?: string | null
          storage_path?: string
        }
        Relationships: []
      }
      bulk_reservations: {
        Row: {
          business_name: string
          contact_person: string
          created_at: string
          email: string
          estimated_quantity: number
          id: string
          notes: string | null
          partner_code: string | null
          partner_name: string | null
          phone: string
          reservation_number: string
          size_breakdown: Json | null
          status: string
        }
        Insert: {
          business_name: string
          contact_person: string
          created_at?: string
          email: string
          estimated_quantity: number
          id?: string
          notes?: string | null
          partner_code?: string | null
          partner_name?: string | null
          phone: string
          reservation_number?: string
          size_breakdown?: Json | null
          status?: string
        }
        Update: {
          business_name?: string
          contact_person?: string
          created_at?: string
          email?: string
          estimated_quantity?: number
          id?: string
          notes?: string | null
          partner_code?: string | null
          partner_name?: string | null
          phone?: string
          reservation_number?: string
          size_breakdown?: Json | null
          status?: string
        }
        Relationships: []
      }
      data_sources: {
        Row: {
          commercial_use: string
          contents: string | null
          created_at: string
          has_ring_sizes: string
          id: string
          licence: string
          link: string | null
          name: string
          notes: string | null
          reviewed_by: string | null
          reviewed_on: string | null
        }
        Insert: {
          commercial_use?: string
          contents?: string | null
          created_at?: string
          has_ring_sizes?: string
          id?: string
          licence?: string
          link?: string | null
          name: string
          notes?: string | null
          reviewed_by?: string | null
          reviewed_on?: string | null
        }
        Update: {
          commercial_use?: string
          contents?: string | null
          created_at?: string
          has_ring_sizes?: string
          id?: string
          licence?: string
          link?: string | null
          name?: string
          notes?: string | null
          reviewed_by?: string | null
          reviewed_on?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          code: string
          contact_email: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          code: string
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          code?: string
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      reservation_audit_log: {
        Row: {
          changed_by: string | null
          changed_by_email: string | null
          created_at: string
          field: string
          id: string
          new_value: string | null
          old_value: string | null
          reservation_id: string
        }
        Insert: {
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          field: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reservation_id: string
        }
        Update: {
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          field?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_audit_log_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_totals: {
        Row: {
          id: boolean
          total_reservations: number
          total_rings: number
        }
        Insert: {
          id?: boolean
          total_reservations?: number
          total_rings?: number
        }
        Update: {
          id?: boolean
          total_reservations?: number
          total_rings?: number
        }
        Relationships: []
      }
      reservations: {
        Row: {
          address: string
          admin_notes: string | null
          carrier: string | null
          city: string
          country: string
          created_at: string
          delivered_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          partner_code: string | null
          partner_name: string | null
          phone: string
          quantity: number
          referral_source: string | null
          reservation_number: string
          ring_color: string | null
          ring_size: string
          shipped_at: string | null
          state: string
          status: string
          tracking_number: string | null
          zip_code: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          carrier?: string | null
          city: string
          country: string
          created_at?: string
          delivered_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          partner_code?: string | null
          partner_name?: string | null
          phone: string
          quantity?: number
          referral_source?: string | null
          reservation_number?: string
          ring_color?: string | null
          ring_size: string
          shipped_at?: string | null
          state: string
          status?: string
          tracking_number?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          carrier?: string | null
          city?: string
          country?: string
          created_at?: string
          delivered_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          partner_code?: string | null
          partner_name?: string | null
          phone?: string
          quantity?: number
          referral_source?: string | null
          reservation_number?: string
          ring_color?: string | null
          ring_size?: string
          shipped_at?: string | null
          state?: string
          status?: string
          tracking_number?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      sizing_settings: {
        Row: {
          chart_version: number
          id: boolean
          pass_min_photos: number
          pass_min_share: number
          show_sizes: boolean
          size_chart: Json
          updated_at: string
        }
        Insert: {
          chart_version?: number
          id?: boolean
          pass_min_photos?: number
          pass_min_share?: number
          show_sizes?: boolean
          size_chart?: Json
          updated_at?: string
        }
        Update: {
          chart_version?: number
          id?: boolean
          pass_min_photos?: number
          pass_min_share?: number
          show_sizes?: boolean
          size_chart?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
