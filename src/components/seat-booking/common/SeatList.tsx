
import React from "react";
import { Seat } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SeatListProps {
  seatsByRow: Record<string, Seat[]>;
  sortedRowIds: string[];
}

const SeatList: React.FC<SeatListProps> = ({ seatsByRow, sortedRowIds }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle>All Seats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedRowIds.map(rowId => (
            <div key={rowId} className="space-y-2">
              <h3 className="font-medium">Row {rowId}</h3>
              <ul className="space-y-1">
                {seatsByRow[rowId]
                  .sort((a, b) => a.number - b.number)
                  .map(seat => (
                    <li key={seat.id} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${seat.isBooked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span>
                        {seat.row}{seat.number} 
                        {seat.employeeName ? ` - ${seat.employeeName}` : ''} 
                        {seat.isBooked ? ' (Booked)' : ''}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeatList;
