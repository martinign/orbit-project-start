
export type StickyNote = {
  id: string;
  title: string;
  content: string | null;
  color: string;
  position: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  x_position?: number;
  y_position?: number;
  rotation?: number;
};
