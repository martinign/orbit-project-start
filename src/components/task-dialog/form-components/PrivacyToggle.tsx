
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PrivacyToggleProps {
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
}

const PrivacyToggle = ({ isPrivate, setIsPrivate }: PrivacyToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="is-private"
        checked={isPrivate}
        onCheckedChange={setIsPrivate}
      />
      <Label htmlFor="is-private">Private {isPrivate ? "(only visible to you)" : ""}</Label>
    </div>
  );
};

export default PrivacyToggle;
