export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          xp: number;
          level: number;
          coins: number;
          streak: number;
          last_activity: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          xp?: number;
          level?: number;
          coins?: number;
          streak?: number;
          last_activity?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          xp?: number;
          level?: number;
          coins?: number;
          streak?: number;
          last_activity?: string | null;
          updated_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          score: number | null;
          time_spent: number | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          score?: number | null;
          time_spent?: number | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          completed?: boolean;
          score?: number | null;
          time_spent?: number | null;
          completed_at?: string | null;
        };
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          xp_earned: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score: number;
          xp_earned: number;
          completed_at?: string;
        };
        Update: {
          score?: number;
          xp_earned?: number;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: Record<string, never>;
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          sign_id: string;
          accuracy: number;
          duration: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sign_id: string;
          accuracy: number;
          duration: number;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
  };
}
