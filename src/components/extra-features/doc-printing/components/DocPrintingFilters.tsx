
import React from 'react';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocType, DocStatus } from '../api/docRequestsApi';

interface DocPrintingFiltersProps {
  activeDocType: DocType | 'all';
  setActiveDocType: (value: DocType | 'all') => void;
  filterStatus: DocStatus | 'all';
  setFilterStatus: (value: DocStatus | 'all') => void;
}

export const DocPrintingFilters: React.FC<DocPrintingFiltersProps> = ({
  activeDocType,
  setActiveDocType,
  filterStatus,
  setFilterStatus,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-gray-500" />
      <Select
        value={activeDocType}
        onValueChange={(value) => setActiveDocType(value as DocType | 'all')}
      >
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Document Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="SLB">SLB</SelectItem>
          <SelectItem value="general">General</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={filterStatus}
        onValueChange={(value) => setFilterStatus(value as DocStatus | 'all')}
      >
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
