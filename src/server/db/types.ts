export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.1 (d3f7cba)";
  };
  ticket: {
    Tables: {
      artists: {
        Row: {
          id: string;
          image: string;
          name: string;
          slug: string;
          upcoming_shows: number;
        };
        Insert: {
          id: string;
          image: string;
          name: string;
          slug: string;
          upcoming_shows: number;
        };
        Update: {
          id?: string;
          image?: string;
          name?: string;
          slug?: string;
          upcoming_shows?: number;
        };
        Relationships: [];
      };
      event_artists: {
        Row: {
          artist_id: string;
          event_id: string;
        };
        Insert: {
          artist_id: string;
          event_id: string;
        };
        Update: {
          artist_id?: string;
          event_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_artists_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_artists_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "event_meta";
            referencedColumns: ["id"];
          },
        ];
      };
      event_meta: {
        Row: {
          event_category: string;
          id: string;
          is_time_tbd: boolean;
          local_datetime: string;
          name: string;
          updated_at: string;
          utc_datetime: string;
          venue_city: string;
          venue_extended_address: string | null;
          venue_latitude: number | null;
          venue_longitude: number | null;
          venue_name: string;
          venue_state: string;
          venue_street_address: string;
          venue_timezone: string;
        };
        Insert: {
          event_category: string;
          id: string;
          is_time_tbd?: boolean;
          local_datetime: string;
          name: string;
          updated_at?: string;
          utc_datetime: string;
          venue_city: string;
          venue_extended_address?: string | null;
          venue_latitude?: number | null;
          venue_longitude?: number | null;
          venue_name: string;
          venue_state: string;
          venue_street_address: string;
          venue_timezone: string;
        };
        Update: {
          event_category?: string;
          id?: string;
          is_time_tbd?: boolean;
          local_datetime?: string;
          name?: string;
          updated_at?: string;
          utc_datetime?: string;
          venue_city?: string;
          venue_extended_address?: string | null;
          venue_latitude?: number | null;
          venue_longitude?: number | null;
          venue_name?: string;
          venue_state?: string;
          venue_street_address?: string;
          venue_timezone?: string;
        };
        Relationships: [];
      };
      event_metrics: {
        Row: {
          event_id: string;
          fetch_date: string;
          min_price_prefee: number;
          min_price_total: number;
          popularity_score: number | null;
          search_score: number | null;
          trending_score: number | null;
        };
        Insert: {
          event_id: string;
          fetch_date: string;
          min_price_prefee: number;
          min_price_total: number;
          popularity_score?: number | null;
          search_score?: number | null;
          trending_score?: number | null;
        };
        Update: {
          event_id?: string;
          fetch_date?: string;
          min_price_prefee?: number;
          min_price_total?: number;
          popularity_score?: number | null;
          search_score?: number | null;
          trending_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_metrics_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "event_meta";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  ticket: {
    Enums: {},
  },
} as const;
