export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          id: number
          open_library_key: string | null
          title: string
          author_name: string
          cover_url: string | null
          description: string | null
          isbn: string | null
          page_count: number | null
          first_publish_year: number | null
          created_at: string
        }
        Insert: {
          open_library_key?: string | null
          title: string
          author_name: string
          cover_url?: string | null
          description?: string | null
          isbn?: string | null
          page_count?: number | null
          first_publish_year?: number | null
          created_at?: string
        }
        Update: {
          open_library_key?: string | null
          title?: string
          author_name?: string
          cover_url?: string | null
          description?: string | null
          isbn?: string | null
          page_count?: number | null
          first_publish_year?: number | null
        }
        Relationships: []
      }
      clubs: {
        Row: {
          id: number
          name: string
          description: string | null
          is_public: boolean
          invite_code: string | null
          created_by: string | null
          current_book_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          is_public?: boolean
          invite_code?: string | null
          created_by?: string | null
          current_book_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          is_public?: boolean
          invite_code?: string | null
          created_by?: string | null
          current_book_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clubs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clubs_current_book_id_fkey"
            columns: ["current_book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      club_members: {
        Row: {
          id: number
          club_id: number
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          club_id: number
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          club_id?: number
          user_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          id: number
          book_id: number
          club_id: number
          title: string
          chapter_number: number
          start_page: number | null
          end_page: number | null
          created_at: string
        }
        Insert: {
          book_id: number
          club_id: number
          title: string
          chapter_number: number
          start_page?: number | null
          end_page?: number | null
          created_at?: string
        }
        Update: {
          book_id?: number
          club_id?: number
          title?: string
          chapter_number?: number
          start_page?: number | null
          end_page?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          id: number
          user_id: string
          book_id: number
          club_id: number
          current_chapter: number
          current_page: number | null
          percent_complete: number
          last_read_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          book_id: number
          club_id: number
          current_chapter?: number
          current_page?: number | null
          percent_complete?: number
          last_read_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          book_id?: number
          club_id?: number
          current_chapter?: number
          current_page?: number | null
          percent_complete?: number
          last_read_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          id: number
          club_id: number
          book_id: number | null
          chapter_id: number | null
          author_id: string
          title: string
          content: string | null
          created_at: string
        }
        Insert: {
          club_id: number
          book_id?: number | null
          chapter_id?: number | null
          author_id: string
          title: string
          content?: string | null
          created_at?: string
        }
        Update: {
          club_id?: number
          book_id?: number | null
          chapter_id?: number | null
          author_id?: string
          title?: string
          content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          id: number
          discussion_id: number
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          discussion_id: number
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          discussion_id?: number
          author_id?: string
          content?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      annotations: {
        Row: {
          id: number
          user_id: string
          book_id: number
          club_id: number
          chapter_number: number
          page_number: number | null
          highlighted_text: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          book_id: number
          club_id: number
          chapter_number: number
          page_number?: number | null
          highlighted_text?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          book_id?: number
          club_id?: number
          chapter_number?: number
          page_number?: number | null
          highlighted_text?: string | null
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "annotations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_rooms: {
        Row: {
          id: number
          club_id: number
          name: string
          is_active: boolean
          started_at: string
          ended_at: string | null
        }
        Insert: {
          club_id: number
          name: string
          is_active?: boolean
          started_at?: string
          ended_at?: string | null
        }
        Update: {
          club_id?: number
          name?: string
          is_active?: boolean
          ended_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_rooms_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_club_member: {
        Args: { p_club_id: number }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
