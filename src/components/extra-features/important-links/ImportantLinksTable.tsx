
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Pencil, Trash } from 'lucide-react';

export interface ImportantLink {
  id: string;
  project_id: string;
  title: string;
  url: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface ImportantLinksTableProps {
  links: ImportantLink[];
  onEdit: (link: ImportantLink) => void;
  onDelete: (link: ImportantLink) => void;
}

export const ImportantLinksTable: React.FC<ImportantLinksTableProps> = ({ 
  links,
  onEdit,
  onDelete
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => (
          <TableRow key={link.id}>
            <TableCell className="font-medium">{link.title}</TableCell>
            <TableCell>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:underline"
              >
                {new URL(link.url).hostname}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {link.description || '—'}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(link)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDelete(link)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
