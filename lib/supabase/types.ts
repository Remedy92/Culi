/**
 * Database types generated from Supabase schema
 * Run `npm run generate-types` to update
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          slug: string
          email: string
          tier: 'free' | 'professional' | 'premium'
          tier_expires_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          ai_settings: {
            learn_from_conversations: boolean
            personalization_level: string
            auto_update_menu: boolean
            allowed_models: string[]
          }
          monthly_conversations: number
          monthly_tokens_used: number
          usage_reset_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email: string
          tier?: 'free' | 'professional' | 'premium'
          tier_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          ai_settings?: {
            learn_from_conversations: boolean
            personalization_level: string
            auto_update_menu: boolean
            allowed_models: string[]
          }
          monthly_conversations?: number
          monthly_tokens_used?: number
          usage_reset_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string
          tier?: 'free' | 'professional' | 'premium'
          tier_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          ai_settings?: {
            learn_from_conversations: boolean
            personalization_level: string
            auto_update_menu: boolean
            allowed_models: string[]
          }
          monthly_conversations?: number
          monthly_tokens_used?: number
          usage_reset_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      menus: {
        Row: {
          id: string
          restaurant_id: string
          source_type: 'pdf' | 'image' | 'text' | 'api' | 'manual'
          source_url: string | null
          source_text: string | null
          extracted_data: Json
          extraction_confidence: number | null
          extraction_model: string | null
          extraction_timestamp: string | null
          menu_embedding: string | null // pgvector type
          menu_embedding_large: string | null // pgvector type
          embedding_model: string | null
          embedding_timestamp: string | null
          version: number
          is_active: boolean
          previous_version_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          source_type: 'pdf' | 'image' | 'text' | 'api' | 'manual'
          source_url?: string | null
          source_text?: string | null
          extracted_data?: Json
          extraction_confidence?: number | null
          extraction_model?: string | null
          extraction_timestamp?: string | null
          menu_embedding?: string | null
          menu_embedding_large?: string | null
          embedding_model?: string | null
          embedding_timestamp?: string | null
          version?: number
          is_active?: boolean
          previous_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          source_type?: 'pdf' | 'image' | 'text' | 'api' | 'manual'
          source_url?: string | null
          source_text?: string | null
          extracted_data?: Json
          extraction_confidence?: number | null
          extraction_model?: string | null
          extraction_timestamp?: string | null
          menu_embedding?: string | null
          menu_embedding_large?: string | null
          embedding_model?: string | null
          embedding_timestamp?: string | null
          version?: number
          is_active?: boolean
          previous_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          restaurant_id: string
          menu_id: string | null
          session_hash: string
          ip_country: string | null
          ip_region: string | null
          user_agent_hash: string | null
          question: string
          question_embedding: string | null
          question_embedding_large: string | null
          answer: string
          question_language: string | null
          answer_language: string | null
          model_used: string
          prompt_tokens: number | null
          completion_tokens: number | null
          total_tokens: number | null
          response_time_ms: number | null
          was_helpful: boolean | null
          follow_up_question: boolean
          confidence_score: number | null
          intents: Json
          entities: Json
          consent_given: boolean
          retention_days: number | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          menu_id?: string | null
          session_hash: string
          ip_country?: string | null
          ip_region?: string | null
          user_agent_hash?: string | null
          question: string
          question_embedding?: string | null
          question_embedding_large?: string | null
          answer: string
          question_language?: string | null
          answer_language?: string | null
          model_used: string
          prompt_tokens?: number | null
          completion_tokens?: number | null
          total_tokens?: number | null
          response_time_ms?: number | null
          was_helpful?: boolean | null
          follow_up_question?: boolean
          confidence_score?: number | null
          intents?: Json
          entities?: Json
          consent_given?: boolean
          retention_days?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          menu_id?: string | null
          session_hash?: string
          ip_country?: string | null
          ip_region?: string | null
          user_agent_hash?: string | null
          question?: string
          question_embedding?: string | null
          question_embedding_large?: string | null
          answer?: string
          question_language?: string | null
          answer_language?: string | null
          model_used?: string
          prompt_tokens?: number | null
          completion_tokens?: number | null
          total_tokens?: number | null
          response_time_ms?: number | null
          was_helpful?: boolean | null
          follow_up_question?: boolean
          confidence_score?: number | null
          intents?: Json
          entities?: Json
          consent_given?: boolean
          retention_days?: number | null
          created_at?: string
        }
      }
      menu_items_cache: {
        Row: {
          id: string
          menu_id: string
          restaurant_id: string
          name: string
          description: string | null
          category: string | null
          price: number | null
          currency: string
          allergens: string[] | null
          dietary_tags: string[] | null
          ingredients: string[] | null
          calories: number | null
          item_embedding: string | null
          item_embedding_large: string | null
          embedding_model: string | null
          extraction_confidence: number | null
          manually_verified: boolean
          times_queried: number
          last_queried_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          menu_id: string
          restaurant_id: string
          name: string
          description?: string | null
          category?: string | null
          price?: number | null
          currency?: string
          allergens?: string[] | null
          dietary_tags?: string[] | null
          ingredients?: string[] | null
          calories?: number | null
          item_embedding?: string | null
          item_embedding_large?: string | null
          embedding_model?: string | null
          extraction_confidence?: number | null
          manually_verified?: boolean
          times_queried?: number
          last_queried_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          menu_id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          category?: string | null
          price?: number | null
          currency?: string
          allergens?: string[] | null
          dietary_tags?: string[] | null
          ingredients?: string[] | null
          calories?: number | null
          item_embedding?: string | null
          item_embedding_large?: string | null
          embedding_model?: string | null
          extraction_confidence?: number | null
          manually_verified?: boolean
          times_queried?: number
          last_queried_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          restaurant_id: string
          insight_type: 'popular_question' | 'menu_correction' | 'pairing' | 'allergen_pattern' | 'dietary_preference' | 'language_pattern'
          pattern: string | null
          data: Json
          confidence: number | null
          times_used: number
          last_used_at: string | null
          is_verified: boolean
          verified_by: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          restaurant_id: string
          insight_type: 'popular_question' | 'menu_correction' | 'pairing' | 'allergen_pattern' | 'dietary_preference' | 'language_pattern'
          pattern?: string | null
          data: Json
          confidence?: number | null
          times_used?: number
          last_used_at?: string | null
          is_verified?: boolean
          verified_by?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          restaurant_id?: string
          insight_type?: 'popular_question' | 'menu_correction' | 'pairing' | 'allergen_pattern' | 'dietary_preference' | 'language_pattern'
          pattern?: string | null
          data?: Json
          confidence?: number | null
          times_used?: number
          last_used_at?: string | null
          is_verified?: boolean
          verified_by?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
      analytics_hourly: {
        Row: {
          restaurant_id: string
          hour: string
          conversation_count: number
          unique_sessions: number
          total_tokens_used: number
          avg_response_time_ms: number | null
          avg_confidence_score: number | null
          languages: Json
          top_intents: Json
          top_queried_items: string[] | null
          helpful_rate: number | null
        }
        Insert: {
          restaurant_id: string
          hour: string
          conversation_count?: number
          unique_sessions?: number
          total_tokens_used?: number
          avg_response_time_ms?: number | null
          avg_confidence_score?: number | null
          languages?: Json
          top_intents?: Json
          top_queried_items?: string[] | null
          helpful_rate?: number | null
        }
        Update: {
          restaurant_id?: string
          hour?: string
          conversation_count?: number
          unique_sessions?: number
          total_tokens_used?: number
          avg_response_time_ms?: number | null
          avg_confidence_score?: number | null
          languages?: Json
          top_intents?: Json
          top_queried_items?: string[] | null
          helpful_rate?: number | null
        }
      }
      session_salts: {
        Row: {
          date: string
          salt: string
          created_at: string
        }
        Insert: {
          date?: string
          salt?: string
          created_at?: string
        }
        Update: {
          date?: string
          salt?: string
          created_at?: string
        }
      }
      tier_limits: {
        Row: {
          tier: string
          monthly_conversations: number
          monthly_tokens: number
          languages_allowed: number
          custom_branding: boolean
          api_access: boolean
          analytics_retention_days: number
        }
        Insert: {
          tier: string
          monthly_conversations: number
          monthly_tokens: number
          languages_allowed: number
          custom_branding?: boolean
          api_access?: boolean
          analytics_retention_days?: number
        }
        Update: {
          tier?: string
          monthly_conversations?: number
          monthly_tokens?: number
          languages_allowed?: number
          custom_branding?: boolean
          api_access?: boolean
          analytics_retention_days?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_daily_salt: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      hash_session_id: {
        Args: {
          session_id: string
        }
        Returns: string
      }
      delete_expired_conversations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}