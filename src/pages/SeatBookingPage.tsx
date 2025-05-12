
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Building, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import RoomsList from "@/components/seat-booking/RoomsList";
import SeatGrid from "@/components/seat-booking/SeatGrid";
import { offices, rooms, getSeatsForRoom } from "@/components/seat-booking/data/mockData";

const SeatBookingPage = () => {
  const [selectedOffice, setSelectedOffice] = useState(offices[0].id);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Record<string, string[]>>({});
  
  // Filter rooms by selected office
  const officeRooms = rooms.filter(room => room.officeId === selectedOffice);
  
  // Get seats for the selected room
  const seats = selectedRoom ? getSeatsForRoom(selectedRoom, date) : [];

  // When office changes, reset selected room
  useEffect(() => {
    setSelectedRoom(officeRooms.length > 0 ? officeRooms[0].id : null);
  }, [selectedOffice]);

  // When date changes, reset selected seat
  useEffect(() => {
    setSelectedSeat(null);
  }, [date]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(seatId === selectedSeat ? null : seatId);
  };

  const handleBookSeat = () => {
    if (selectedSeat && selectedRoom) {
      const dateKey = format(date, 'yyyy-MM-dd');
      
      setBookings(prev => {
        const updatedBookings = { ...prev };
        if (!updatedBookings[dateKey]) {
          updatedBookings[dateKey] = [];
        }
        updatedBookings[dateKey] = [...updatedBookings[dateKey], selectedSeat];
        return updatedBookings;
      });

      alert(`Seat ${selectedSeat} booked for ${format(date, 'PPPP')}`);
      setSelectedSeat(null);
    }
  };

  const selectedOfficeData = offices.find(office => office.id === selectedOffice);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Seat Booking</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Office & Date Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Office Location</label>
                <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select office" />
                  </SelectTrigger>
                  <SelectContent>
                    {offices.map(office => (
                      <SelectItem key={office.id} value={office.id}>
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                          {office.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Booking Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <RoomsList 
          rooms={officeRooms} 
          selectedRoom={selectedRoom} 
          onSelectRoom={setSelectedRoom} 
        />
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>
              {selectedOfficeData?.name} - {selectedRoom ? rooms.find(r => r.id === selectedRoom)?.name : 'No Room Selected'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRoom ? (
              <div className="space-y-4">
                <SeatGrid 
                  seats={seats}
                  selectedSeat={selectedSeat}
                  onSeatSelect={handleSeatSelect}
                  date={date}
                />
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                      <span className="text-sm">Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm">Selected</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                      <span className="text-sm">Booked</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="default" 
                    disabled={!selectedSeat} 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleBookSeat}
                  >
                    Book Selected Seat
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Please select a room to view available seats
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeatBookingPage;
