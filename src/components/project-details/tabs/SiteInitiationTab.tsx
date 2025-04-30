
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface SiteInitiationTabProps {
  projectId: string;
}

export const SiteInitiationTab: React.FC<SiteInitiationTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Initiation Tracker</CardTitle>
        <CardDescription>
          Track the progress of site initiation activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Site Selection</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Apr 15, 2025</TableCell>
              <TableCell>John Doe</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Regulatory Submission</TableCell>
              <TableCell>In Progress</TableCell>
              <TableCell>May 10, 2025</TableCell>
              <TableCell>Jane Smith</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Site Training</TableCell>
              <TableCell>Not Started</TableCell>
              <TableCell>May 20, 2025</TableCell>
              <TableCell>Not Assigned</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
