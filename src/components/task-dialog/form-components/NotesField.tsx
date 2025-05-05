
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesFieldProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesField = ({ notes, setNotes }: NotesFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        placeholder="Additional notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />
    </div>
  );
};

export default NotesField;
