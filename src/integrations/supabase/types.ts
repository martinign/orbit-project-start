export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      gantt_tasks: {
        Row: {
          created_at: string
          dependencies: string[] | null
          duration_days: number | null
          id: string
          project_id: string
          start_date: string | null
          task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dependencies?: string[] | null
          duration_days?: number | null
          id?: string
          project_id: string
          start_date?: string | null
          task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dependencies?: string[] | null
          duration_days?: number | null
          id?: string
          project_id?: string
          start_date?: string | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gantt_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gantt_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      member_invitations: {
        Row: {
          invitation_created_at: string
          invitation_recipient_id: string
          invitation_sender_id: string
          invitation_status: string
          invitation_updated_at: string
          member_invitation_id: string
          member_project_id: string
          member_role: string
          updated_at: string | null
        }
        Insert: {
          invitation_created_at?: string
          invitation_recipient_id: string
          invitation_sender_id: string
          invitation_status?: string
          invitation_updated_at?: string
          member_invitation_id?: string
          member_project_id: string
          member_role: string
          updated_at?: string | null
        }
        Update: {
          invitation_created_at?: string
          invitation_recipient_id?: string
          invitation_sender_id?: string
          invitation_status?: string
          invitation_updated_at?: string
          member_invitation_id?: string
          member_project_id?: string
          member_role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_invitations_member_project_id_fkey"
            columns: ["member_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          location: string | null
          role: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          role?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          role?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_attachments: {
        Row: {
          created_at: string
          created_by: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          project_id: string
          related_id: string
          related_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id: string
          related_id: string
          related_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string
          related_id?: string
          related_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          last_name: string | null
          location: string | null
          project_id: string
          role: string | null
          telephone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          last_name?: string | null
          location?: string | null
          project_id: string
          role?: string | null
          telephone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_name?: string | null
          location?: string | null
          project_id?: string
          role?: string | null
          telephone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_contacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_cra_list: {
        Row: {
          created_by: string
          created_date: string
          email: string | null
          end_date: string | null
          first_name: string
          full_name: string
          id: string
          last_name: string
          project_id: string
          status: string | null
          study_country: string | null
          study_site: string | null
          study_team_role: string | null
          updated_at: string
          user_id: string
          user_reference: string | null
          user_type: string | null
        }
        Insert: {
          created_by: string
          created_date?: string
          email?: string | null
          end_date?: string | null
          first_name: string
          full_name: string
          id?: string
          last_name: string
          project_id: string
          status?: string | null
          study_country?: string | null
          study_site?: string | null
          study_team_role?: string | null
          updated_at?: string
          user_id: string
          user_reference?: string | null
          user_type?: string | null
        }
        Update: {
          created_by?: string
          created_date?: string
          email?: string | null
          end_date?: string | null
          first_name?: string
          full_name?: string
          id?: string
          last_name?: string
          project_id?: string
          status?: string | null
          study_country?: string | null
          study_site?: string | null
          study_team_role?: string | null
          updated_at?: string
          user_id?: string
          user_reference?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_cra_list_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_csam_site: {
        Row: {
          address: string | null
          city_town: string | null
          country: string | null
          created_at: string
          id: string
          institution: string | null
          pi_name: string | null
          project_id: string
          province_state: string | null
          pxl_site_reference_number: string
          registered_in_srp: boolean | null
          role: string
          site_personnel_email_address: string | null
          site_personnel_fax: string | null
          site_personnel_name: string
          site_personnel_telephone: string | null
          starter_pack: boolean | null
          supplies_applied: boolean | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city_town?: string | null
          country?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          pi_name?: string | null
          project_id: string
          province_state?: string | null
          pxl_site_reference_number: string
          registered_in_srp?: boolean | null
          role: string
          site_personnel_email_address?: string | null
          site_personnel_fax?: string | null
          site_personnel_name: string
          site_personnel_telephone?: string | null
          starter_pack?: boolean | null
          supplies_applied?: boolean | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city_town?: string | null
          country?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          pi_name?: string | null
          project_id?: string
          province_state?: string | null
          pxl_site_reference_number?: string
          registered_in_srp?: boolean | null
          role?: string
          site_personnel_email_address?: string | null
          site_personnel_fax?: string | null
          site_personnel_name?: string
          site_personnel_telephone?: string | null
          starter_pack?: boolean | null
          supplies_applied?: boolean | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_csam_site_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_doc_requests: {
        Row: {
          created_at: string
          doc_amount: number
          doc_assigned_to: string | null
          doc_comments: string | null
          doc_delivery_address: string | null
          doc_description: string | null
          doc_due_date: string | null
          doc_file_name: string | null
          doc_file_path: string | null
          doc_file_size: number | null
          doc_file_type: string | null
          doc_process_number_range: string | null
          doc_project_id: string
          doc_request_type: string
          doc_selected_vendor: string | null
          doc_status: string
          doc_title: string
          doc_type: string
          doc_version: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_amount?: number
          doc_assigned_to?: string | null
          doc_comments?: string | null
          doc_delivery_address?: string | null
          doc_description?: string | null
          doc_due_date?: string | null
          doc_file_name?: string | null
          doc_file_path?: string | null
          doc_file_size?: number | null
          doc_file_type?: string | null
          doc_process_number_range?: string | null
          doc_project_id: string
          doc_request_type: string
          doc_selected_vendor?: string | null
          doc_status?: string
          doc_title: string
          doc_type: string
          doc_version?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_amount?: number
          doc_assigned_to?: string | null
          doc_comments?: string | null
          doc_delivery_address?: string | null
          doc_description?: string | null
          doc_due_date?: string | null
          doc_file_name?: string | null
          doc_file_path?: string | null
          doc_file_size?: number | null
          doc_file_type?: string | null
          doc_process_number_range?: string | null
          doc_project_id?: string
          doc_request_type?: string
          doc_selected_vendor?: string | null
          doc_status?: string
          doc_title?: string
          doc_type?: string
          doc_version?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_doc_requests_doc_project_id_fkey"
            columns: ["doc_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          project_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          project_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_features: {
        Row: {
          created_at: string
          enabled: boolean
          feature_name: string
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_name: string
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_name?: string
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_features_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_important_links: {
        Row: {
          created_at: string
          id: string
          link_description: string | null
          link_project_id: string
          link_title: string
          link_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_description?: string | null
          link_project_id: string
          link_title: string
          link_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_description?: string | null
          link_project_id?: string
          link_title?: string
          link_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_important_links_link_project_id_fkey"
            columns: ["link_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invitations: {
        Row: {
          created_at: string | null
          id: string
          invitee_id: string
          inviter_id: string
          permission_level: Database["public"]["Enums"]["project_member_permission"]
          project_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitee_id: string
          inviter_id: string
          permission_level?: Database["public"]["Enums"]["project_member_permission"]
          project_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invitee_id?: string
          inviter_id?: string
          permission_level?: Database["public"]["Enums"]["project_member_permission"]
          project_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notes: {
        Row: {
          content: string | null
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          is_private: boolean
          project_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_private?: boolean
          project_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_private?: boolean
          project_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_subtasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          parent_task_id: string
          status: string
          title: string
          updated_at: string
          user_id: string
          workday_code_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          parent_task_id: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          workday_code_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          parent_task_id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          workday_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_subtasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_subtasks_workday_code_id_fkey"
            columns: ["workday_code_id"]
            isOneToOne: false
            referencedRelation: "workday_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      project_task_updates: {
        Row: {
          content: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_task_updates_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          duration_days: number | null
          id: string
          is_gantt_task: boolean | null
          is_private: boolean
          notes: string | null
          priority: string
          project_id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          workday_code_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          duration_days?: number | null
          id?: string
          is_gantt_task?: boolean | null
          is_private?: boolean
          notes?: string | null
          priority?: string
          project_id: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          workday_code_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          duration_days?: number | null
          id?: string
          is_gantt_task?: boolean | null
          is_private?: boolean
          notes?: string | null
          priority?: string
          project_id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          workday_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_workday_code_id_fkey"
            columns: ["workday_code_id"]
            isOneToOne: false
            referencedRelation: "workday_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team_members: {
        Row: {
          created_at: string
          full_name: string
          id: string
          job_title: string | null
          last_name: string | null
          project_id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          job_title?: string | null
          last_name?: string | null
          project_id: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          job_title?: string | null
          last_name?: string | null
          project_id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_workday_codes: {
        Row: {
          created_at: string
          id: string
          project_id: string
          updated_at: string
          user_id: string
          workday_code_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
          workday_code_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
          workday_code_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_workday_codes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_workday_codes_workday_code_id_fkey"
            columns: ["workday_code_id"]
            isOneToOne: false
            referencedRelation: "workday_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_number: string
          project_type: string
          protocol_number: string | null
          protocol_title: string | null
          role: string
          Sponsor: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_number: string
          project_type?: string
          protocol_number?: string | null
          protocol_title?: string | null
          role?: string
          Sponsor?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_number?: string
          project_type?: string
          protocol_number?: string | null
          protocol_title?: string | null
          role?: string
          Sponsor?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pxl_sop_templates: {
        Row: {
          created_at: string
          id: string
          sop_id: string | null
          sop_link: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sop_id?: string | null
          sop_link?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sop_id?: string | null
          sop_link?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          additional_feedback: string | null
          created_at: string
          ease_of_use: number
          id: string
          improvement_area: string
          most_useful_feature: string
          task_management_satisfaction: number
          updated_at: string
          usage_frequency: string
          user_id: string
          workday_codes_usage: string
        }
        Insert: {
          additional_feedback?: string | null
          created_at?: string
          ease_of_use: number
          id?: string
          improvement_area: string
          most_useful_feature: string
          task_management_satisfaction: number
          updated_at?: string
          usage_frequency: string
          user_id: string
          workday_codes_usage: string
        }
        Update: {
          additional_feedback?: string | null
          created_at?: string
          ease_of_use?: number
          id?: string
          improvement_area?: string
          most_useful_feature?: string
          task_management_satisfaction?: number
          updated_at?: string
          usage_frequency?: string
          user_id?: string
          workday_codes_usage?: string
        }
        Relationships: []
      }
      task_status_history: {
        Row: {
          changed_at: string
          completion_date: string | null
          created_at: string
          id: string
          new_status: string
          previous_status: string | null
          task_id: string
          total_duration_days: number | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          completion_date?: string | null
          created_at?: string
          id?: string
          new_status: string
          previous_status?: string | null
          task_id: string
          total_duration_days?: number | null
          user_id: string
        }
        Update: {
          changed_at?: string
          completion_date?: string | null
          created_at?: string
          id?: string
          new_status?: string
          previous_status?: string | null
          task_id?: string
          total_duration_days?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_status_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          sop_id: string | null
          sop_link: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          sop_id?: string | null
          sop_link?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          sop_id?: string | null
          sop_link?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_assigned_hours: {
        Row: {
          assigned_hours: number
          created_at: string
          created_by: string
          id: string
          month: string
          project_id: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_hours: number
          created_at?: string
          created_by: string
          id?: string
          month: string
          project_id: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_hours?: number
          created_at?: string
          created_by?: string
          id?: string
          month?: string
          project_id?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_assigned_hours_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_assigned_hours_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      workday_codes: {
        Row: {
          activity: string
          created_at: string
          id: string
          task: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity: string
          created_at?: string
          id?: string
          task: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity?: string
          created_at?: string
          id?: string
          task?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workday_time_entries: {
        Row: {
          created_at: string
          date: string
          hours: number
          id: string
          notes: string | null
          task_id: string
          updated_at: string
          user_id: string
          workday_code_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          hours: number
          id?: string
          notes?: string | null
          task_id: string
          updated_at?: string
          user_id: string
          workday_code_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          hours?: number
          id?: string
          notes?: string | null
          task_id?: string
          updated_at?: string
          user_id?: string
          workday_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workday_time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workday_time_entries_workday_code_id_fkey"
            columns: ["workday_code_id"]
            isOneToOne: false
            referencedRelation: "workday_codes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_project_attachment_access: {
        Args: { object_id: string }
        Returns: boolean
      }
      get_task_project_id: {
        Args: { task_id: string }
        Returns: string
      }
      get_update_task_project_id: {
        Args: { task_id: string }
        Returns: string
      }
      has_project_access: {
        Args: { project_id: string }
        Returns: boolean
      }
      has_project_admin_access: {
        Args: { project_id: string }
        Returns: boolean
      }
      has_project_edit_access: {
        Args: { project_id: string }
        Returns: boolean
      }
      has_project_edit_permission: {
        Args: { project_id: string }
        Returns: boolean
      }
      has_project_read_permission: {
        Args: { project_id: string }
        Returns: boolean
      }
      is_project_team_member: {
        Args: { project_id: string }
        Returns: boolean
      }
    }
    Enums: {
      project_member_permission: "owner" | "admin" | "edit" | "read_only"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_member_permission: ["owner", "admin", "edit", "read_only"],
    },
  },
} as const
