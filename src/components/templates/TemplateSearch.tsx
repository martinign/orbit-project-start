
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface TemplateSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TemplateSearch: React.FC<TemplateSearchProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative w-64">
      <Input
        type="text"
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9"
      />
      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
    </div>
  );
};

export default TemplateSearch;
