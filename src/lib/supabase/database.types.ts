export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string | null;
          avatar_url: string | null;
          plan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname?: string | null;
          avatar_url?: string | null;
          plan?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string | null;
          avatar_url?: string | null;
          plan?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: string;
          source_image_url: string | null;
          cropped_image_url: string | null;
          cover_image_url: string | null;
          config: Json;
          pattern: Json | null;
          total_beads: number;
          color_count: number;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          status?: string;
          source_image_url?: string | null;
          cropped_image_url?: string | null;
          cover_image_url?: string | null;
          config?: Json;
          pattern?: Json | null;
          total_beads?: number;
          color_count?: number;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          status?: string;
          source_image_url?: string | null;
          cropped_image_url?: string | null;
          cover_image_url?: string | null;
          config?: Json;
          pattern?: Json | null;
          total_beads?: number;
          color_count?: number;
          is_favorite?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      material_recommendations: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          color_id: string;
          color_name: string;
          color_code: string;
          hex: string;
          required_count: number;
          recommended_count: number;
          spare_count: number;
          spare_rate: number;
          alternative_colors: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          color_id: string;
          color_name: string;
          color_code: string;
          hex: string;
          required_count: number;
          recommended_count: number;
          spare_count: number;
          spare_rate: number;
          alternative_colors?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          color_id?: string;
          color_name?: string;
          color_code?: string;
          hex?: string;
          required_count?: number;
          recommended_count?: number;
          spare_count?: number;
          spare_rate?: number;
          alternative_colors?: Json;
        };
        Relationships: [];
      };
      export_records: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          export_type: string;
          file_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          export_type: string;
          file_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          export_type?: string;
          file_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
