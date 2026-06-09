/** Simplified Supabase Database type for the StartupOS schema */

export interface Database {
  public: {
    Tables: {
      blueprints: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          idea: string;
          industry: string;
          stage: string;
          blueprint: Record<string, unknown>;
          interview_data: Record<string, unknown>;
          visibility: "private" | "public";
          share_token: string | null;
          public_sections: string[];
          public_views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          idea: string;
          industry: string;
          stage: string;
          blueprint: Record<string, unknown>;
          interview_data: Record<string, unknown>;
          visibility?: "private" | "public";
          share_token?: string | null;
          public_sections?: string[];
          public_views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          idea?: string;
          industry?: string;
          stage?: string;
          blueprint?: Record<string, unknown>;
          interview_data?: Record<string, unknown>;
          visibility?: "private" | "public";
          share_token?: string | null;
          public_sections?: string[];
          public_views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blueprints_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables = Database["public"]["Tables"];
export type Blueprint = Tables["blueprints"]["Row"];
export type BlueprintInsert = Tables["blueprints"]["Insert"];
