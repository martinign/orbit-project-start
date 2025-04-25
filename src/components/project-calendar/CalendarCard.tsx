
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface CalendarCardProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  hasEditAccess: boolean;
}

export function CalendarCard({ selectedDate, onSelect, hasEditAccess }: CalendarCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>
          {hasEditAccess 
            ? "Click a date to create an event" 
            : "Select a date to view events"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelect}
          className={cn(
            "pointer-events-auto",
            hasEditAccess && "hover:cursor-pointer"
          )}
        />
      </CardContent>
    </Card>
  );
}
