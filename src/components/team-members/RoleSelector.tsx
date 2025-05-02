
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberRole } from "@/hooks/useProjectInvitesDialog";

interface RoleSelectorProps {
  value: MemberRole;
  onChange: (value: MemberRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">Select Role</h3>
      <Select value={value} onValueChange={(value: MemberRole) => onChange(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select role *" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        <strong>Owner:</strong> Full control over the project, including deletion.
        <br />
        <strong>Admin:</strong> Can manage tasks and team members, but cannot delete the project.
      </p>
    </div>
  );
}
