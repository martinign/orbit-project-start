
import React from "react";
import BasicInfoSection from "./form-components/BasicInfoSection";
import ProjectSelector from "./form-components/ProjectSelector";
import StatusAndPrioritySection from "./form-components/StatusAndPrioritySection";
import WorkdayCodeSelector from "./form-components/WorkdayCodeSelector";
import AssigneeSelector from "./form-components/AssigneeSelector";
import DueDatePicker from "./form-components/DueDatePicker";
import NotesField from "./form-components/NotesField";
import PrivacyToggle from "./form-components/PrivacyToggle";
import FormActions from "./form-components/FormActions";
import TaskFileUploadField from "./form-components/TaskFileUploadField";
import { TeamMember } from "@/hooks/useTeamMembers";
import { WorkdayCodeOption } from "@/utils/workdayCombinedUtils";

interface Project {
  id: string;
  project_number: string;
  Sponsor: string;
}

interface TaskFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  status: string;
  setStatus: (status: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  selectedProject?: string;
  setSelectedProject?: (projectId: string) => void;
  dueDate?: Date;
  setDueDate: (date: Date | undefined) => void;
  notes: string;
  setNotes: (notes: string) => void;
  assignedTo: string;
  setAssignedTo: (memberId: string) => void;
  selectedWorkdayCode: string;
  setSelectedWorkdayCode: (codeId: string) => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  // File attachment props
  fileAttachment?: File | null;
  setFileAttachment?: (file: File | null) => void;
  fileName?: string;
  setFileName?: (name: string) => void;
  fileType?: string;
  setFileType?: (type: string) => void;
  fileSize?: number | null;
  setFileSize?: (size: number | null) => void;
  teamMembers?: TeamMember[];
  projects?: Project[];
  workdayCodes?: WorkdayCodeOption[];
  hasFixedProject: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onOpenTemplateDialog?: () => void;
  mode: "create" | "edit";
}

export const TaskForm: React.FC<TaskFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  status,
  setStatus,
  priority,
  setPriority,
  selectedProject,
  setSelectedProject,
  dueDate,
  setDueDate,
  notes,
  setNotes,
  assignedTo,
  setAssignedTo,
  selectedWorkdayCode,
  setSelectedWorkdayCode,
  isPrivate,
  setIsPrivate,
  // File attachment props
  fileAttachment = null,
  setFileAttachment = () => {},
  fileName = '',
  setFileName = () => {},
  fileType = '',
  setFileType = () => {},
  fileSize = null,
  setFileSize = () => {},
  teamMembers = [],
  projects = [],
  workdayCodes = [],
  hasFixedProject,
  isSubmitting,
  onSubmit,
  onClose,
  onOpenTemplateDialog,
  mode,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <BasicInfoSection
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        mode={mode}
        onOpenTemplateDialog={onOpenTemplateDialog}
      />

      {!hasFixedProject && setSelectedProject && (
        <ProjectSelector
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          projects={projects}
          hasFixedProject={hasFixedProject}
        />
      )}

      <StatusAndPrioritySection
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
      />

      <WorkdayCodeSelector
        selectedWorkdayCode={selectedWorkdayCode}
        setSelectedWorkdayCode={setSelectedWorkdayCode}
        workdayCodes={workdayCodes}
      />

      <AssigneeSelector
        assignedTo={assignedTo}
        setAssignedTo={setAssignedTo}
        teamMembers={teamMembers}
      />

      <DueDatePicker dueDate={dueDate} setDueDate={setDueDate} />

      <TaskFileUploadField
        fileAttachment={fileAttachment}
        setFileAttachment={setFileAttachment}
        setFileName={setFileName}
        setFileType={setFileType}
        setFileSize={setFileSize}
        existingFileName={fileName}
        existingFileType={fileType}
        existingFileSize={fileSize}
        isSubmitting={isSubmitting}
      />

      <NotesField notes={notes} setNotes={setNotes} />

      <PrivacyToggle isPrivate={isPrivate} setIsPrivate={setIsPrivate} />

      <FormActions
        onClose={onClose}
        isSubmitting={isSubmitting}
        mode={mode}
      />
    </form>
  );
};

export default TaskForm;
