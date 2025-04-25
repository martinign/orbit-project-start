
import { Badge } from "@/components/ui/badge";

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
    default:
      return <Badge className="bg-gray-500">{status || 'Not Set'}</Badge>;
  }
};
