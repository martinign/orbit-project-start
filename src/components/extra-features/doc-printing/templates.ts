
export interface TemplateOption {
  id: string;
  name: string;
}

export const projectDocTemplates: TemplateOption[] = [
  { id: 'project-summary', name: 'Project Summary' },
  { id: 'contact-list', name: 'Contact List' },
  { id: 'task-report', name: 'Task Status Report' },
];

export const studyDocTemplates: TemplateOption[] = [
  { id: 'protocol', name: 'Protocol Summary' },
  { id: 'site-status', name: 'Site Status Report' },
  { id: 'enrollment', name: 'Enrollment Report' },
];

export const adminDocTemplates: TemplateOption[] = [
  { id: 'team-directory', name: 'Team Directory' },
  { id: 'workday-codes', name: 'Workday Codes List' },
  { id: 'project-timeline', name: 'Project Timeline' },
];
