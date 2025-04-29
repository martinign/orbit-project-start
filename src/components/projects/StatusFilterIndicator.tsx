
import { Button } from "@/components/ui/button";

interface StatusFilterIndicatorProps {
  statusFilter: string;
  onClearFilter: () => void;
}

const StatusFilterIndicator = ({ statusFilter, onClearFilter }: StatusFilterIndicatorProps) => {
  if (!statusFilter) return null;
  
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm">Filtered by status:</span>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusFilter === 'active' ? 'bg-green-100 text-green-800' : 
        statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
        statusFilter === 'completed' ? 'bg-blue-100 text-blue-800' : 
        statusFilter === 'cancelled' ? 'bg-red-100 text-red-800' : 
        'bg-gray-100 text-gray-800'
      }`}>
        {statusFilter}
      </span>
      <Button variant="ghost" size="sm" onClick={onClearFilter} className="h-6 px-2 text-xs">
        Clear
      </Button>
    </div>
  );
};

export default StatusFilterIndicator;
