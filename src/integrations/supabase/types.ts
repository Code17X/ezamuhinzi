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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agricultural_locations: {
        Row: {
          address: string
          average_rating: number | null
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          phone: string | null
          services: string[] | null
          total_ratings: number | null
          type: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          address: string
          average_rating?: number | null
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          services?: string[] | null
          total_ratings?: number | null
          type: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          address?: string
          average_rating?: number | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          services?: string[] | null
          total_ratings?: number | null
          type?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      crop_diagnoses: {
        Row: {
          created_at: string | null
          crop_type: string | null
          diagnosis: string
          id: string
          image_url: string
          recommendations: string | null
          severity: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          crop_type?: string | null
          diagnosis: string
          id?: string
          image_url: string
          recommendations?: string | null
          severity?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          crop_type?: string | null
          diagnosis?: string
          id?: string
          image_url?: string
          recommendations?: string | null
          severity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      location_ratings: {
        Row: {
          created_at: string | null
          id: string
          location_id: string
          rating: number
          review: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_id: string
          rating: number
          review?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location_id?: string
          rating?: number
          review?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_ratings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "agricultural_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          category: string
          current_price: number
          id: string
          location: string
          price_factors: string[] | null
          product_name: string
          product_name_kinyarwanda: string
          trend: string
          trend_percentage: number | null
          unit: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          current_price: number
          id?: string
          location: string
          price_factors?: string[] | null
          product_name: string
          product_name_kinyarwanda: string
          trend: string
          trend_percentage?: number | null
          unit: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          current_price?: number
          id?: string
          location?: string
          price_factors?: string[] | null
          product_name?: string
          product_name_kinyarwanda?: string
          trend?: string
          trend_percentage?: number | null
          unit?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          category: string
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string
          price: number
          quantity: string | null
          status: string
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          price: number
          quantity?: string | null
          status?: string
          title: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          price?: number
          quantity?: string | null
          status?: string
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          crop_type: string | null
          farm_location: string | null
          harvest_quantity: string | null
          id: string
          image_urls: string[] | null
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          crop_type?: string | null
          farm_location?: string | null
          harvest_quantity?: string | null
          id?: string
          image_urls?: string[] | null
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          crop_type?: string | null
          farm_location?: string | null
          harvest_quantity?: string | null
          id?: string
          image_urls?: string[] | null
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          id: string
          market_price_id: string | null
          price: number
          recorded_at: string | null
        }
        Insert: {
          id?: string
          market_price_id?: string | null
          price: number
          recorded_at?: string | null
        }
        Update: {
          id?: string
          market_price_id?: string | null
          price?: number
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_market_price_id_fkey"
            columns: ["market_price_id"]
            isOneToOne: false
            referencedRelation: "market_prices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          crop_types: string[] | null
          experience_level: string | null
          farm_location: string | null
          farm_size: string | null
          farming_methods: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          sms_alerts_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crop_types?: string[] | null
          experience_level?: string | null
          farm_location?: string | null
          farm_size?: string | null
          farming_methods?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          sms_alerts_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crop_types?: string[] | null
          experience_level?: string | null
          farm_location?: string | null
          farm_size?: string | null
          farming_methods?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          sms_alerts_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veterinary_applications: {
        Row: {
          address: string
          business_name: string
          created_at: string | null
          description: string | null
          id: string
          latitude: number
          license_number: string | null
          longitude: number
          phone: string
          rejection_reason: string | null
          services: string[]
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address: string
          business_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          latitude: number
          license_number?: string | null
          longitude: number
          phone: string
          rejection_reason?: string | null
          services: string[]
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string
          business_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number
          license_number?: string | null
          longitude?: number
          phone?: string
          rejection_reason?: string | null
          services?: string[]
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
      app_role: "admin" | "veterinary" | "farmer"
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
      app_role: ["admin", "veterinary", "farmer"],
    },
  },
} as const
