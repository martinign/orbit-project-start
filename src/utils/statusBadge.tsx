
import { Badge } from "@/components/ui/badge";

// CSS Variables for status colors
export const statusColors = {
  "completed": "var(--green-500)",
  "in progress": "var(--blue-500)",
  "pending": "var(--yellow-500)",
  "not started": "var(--gray-500)", // Changed from red-500 to gray-500
  "active": "var(--emerald-500)",
  "cancelled": "var(--red-500)",
  "stucked": "var(--red-500)"
};

export const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return <Badge className="bg-green-500">Completed</Badge>;
    case 'in progress':
      return <Badge className="bg-blue-500">In Progress</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">Pending</Badge>;
    case 'active':
      return <Badge className="bg-emerald-500">Active</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500">Cancelled</Badge>;
    case 'stucked':
      return <Badge className="bg-red-500">Stucked</Badge>;
    case 'not started':
      return <Badge className="bg-gray-500">Not Started</Badge>; // Changed from red-500 to gray-500
    default:
      return <Badge className="bg-gray-500">{status || 'Not Set'}</Badge>;
  }
};
