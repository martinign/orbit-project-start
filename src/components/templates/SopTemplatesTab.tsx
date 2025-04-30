
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SOPTemplate } from '@/components/templates/types';

interface SopTemplatesTabProps {
  templates: SOPTemplate[] | null;
  isLoading: boolean;
  searchQuery: string;
  selectionMode: boolean;
  onTemplateSelect?: (template: SOPTemplate, templateType: 'sop') => void;
}

const SopTemplatesTab: React.FC<SopTemplatesTabProps> = ({ 
  templates, 
  isLoading, 
  searchQuery, 
  selectionMode,
  onTemplateSelect
}) => {
  // Filter SOP templates based on search query
  const filteredTemplates = templates?.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.sop_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading SOPs...</div>
    );
  }

  if (!filteredTemplates || filteredTemplates.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">
          {searchQuery ? "No SOPs match your search criteria" : "No standard SOPs found"}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/3">Title</TableHead>
          <TableHead className="w-1/4">SOP ID</TableHead>
          <TableHead className="w-1/4">SOP Link</TableHead>
          {selectionMode && <TableHead className="w-1/6 text-right">Action</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTemplates.map((sop) => (
          <TableRow 
            key={sop.id} 
            className={selectionMode ? "cursor-pointer hover:bg-gray-50" : ""}
          >
            <TableCell className="font-medium">
              {sop.title}
            </TableCell>
            <TableCell className="whitespace-nowrap">{sop.sop_id || "—"}</TableCell>
            <TableCell>
              {sop.sop_link ? (
                <a 
                  href={sop.sop_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    // Prevent selection when clicking the link
                    if (selectionMode) e.stopPropagation();
                  }}
                >
                  View <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              ) : (
                "—"
              )}
            </TableCell>
            {selectionMode && (
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onTemplateSelect?.(sop, 'sop')}
                >
                  Select
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SopTemplatesTab;
