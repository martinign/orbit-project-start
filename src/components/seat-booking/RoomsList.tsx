
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Room } from "./types";

interface RoomsListProps {
  rooms: Room[];
  selectedRoom: string | null;
  onSelectRoom: (roomId: string) => void;
}

const RoomsList = ({ rooms, selectedRoom, onSelectRoom }: RoomsListProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Rooms</CardTitle>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No rooms available in this office
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => (
              <Button
                key={room.id}
                variant={selectedRoom === room.id ? "default" : "outline"}
                className={`w-full justify-start ${
                  selectedRoom === room.id ? "bg-blue-500 hover:bg-blue-600 text-white" : ""
                }`}
                onClick={() => onSelectRoom(room.id)}
              >
                <div className="flex flex-col items-start">
                  <span>{room.name}</span>
                  <span className="text-xs opacity-70">
                    Capacity: {room.capacity} seats
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomsList;
