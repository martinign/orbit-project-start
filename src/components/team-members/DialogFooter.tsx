import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
interface DialogFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}
export function DialogFooter({
  onCancel,
  onSubmit,
  isLoading,
  isDisabled
}: DialogFooterProps) {
  return <div className="flex justify-end space-x-2 mt-4">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSubmit} disabled={isLoading || isDisabled} className="\"bg-blue-500 hover:bg-blue-600 text-white\" ">
        {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
        Invite
      </Button>
    </div>;
}