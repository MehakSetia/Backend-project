import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Layout } from "@/components/layout";
import { BookingForm } from "@/components/booking-form";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Booking, InsertBooking } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  highlights: string[];
  bestTimeToVisit: string;
  averagePrice: string;
}

export default function DestinationPage() {
  const { id } = useParams<{ id: string }>();
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: destination, isLoading, isError } = useQuery<Destination>({
    queryKey: ["/api/destinations", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/destinations/${id}`);
      return await res.json();
    },
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bookings");
      return await res.json();
    },
  });

  // Find the booking for this destination by matching the name
  const destinationBooking = bookings.find(b => b.title === destination?.name);
  console.log("Destination:", destination);
  console.log("Bookings:", bookings);
  console.log("Destination Booking:", destinationBooking);

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      console.log("Deleting booking:", bookingId);
      const res = await apiRequest("DELETE", `/api/bookings/${bookingId}`);
      if (!res.ok) {
        throw new Error(`Failed to delete booking: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      console.log("Booking deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking deleted",
        description: "The booking has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error deleting booking",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeleteBooking = (bookingId: number) => {
    console.log("Deleting booking:", bookingId);
    deleteBookingMutation.mutate(bookingId);
  };

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async (data: { id: number; status: string }) => {
      console.log("Updating booking status:", data);
      try {
        const res = await apiRequest("PATCH", `/api/bookings/${data.id}/status`, { status: data.status });
        if (!res.ok) {
          throw new Error(`Failed to update booking status: ${res.statusText}`);
        }
        const updatedBooking = await res.json();
        console.log("Updated booking:", updatedBooking);
        return updatedBooking;
      } catch (error) {
        console.error("Error in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: (updatedBooking) => {
      console.log("Booking status updated successfully:", updatedBooking);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating booking status:", error);
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleViewDetails = (booking: Booking) => {
    console.log("Viewing details for booking:", booking);
    toast({
      title: "Booking Details",
      description: (
        <div className="space-y-2">
          <p><strong>Title:</strong> {booking.title}</p>
          <p><strong>Status:</strong> {booking.status}</p>
          <p><strong>Start Date:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> {booking.guests}</p>
          <p><strong>Price:</strong> ${booking.price}</p>
          {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
        </div>
      ),
    });
  };

  const handleCancelBooking = (bookingId: number) => {
    console.log("Cancelling booking:", bookingId);
    updateBookingStatusMutation.mutate({ id: bookingId, status: "cancelled" });
  };

  const handleAddBooking = async (data: InsertBooking) => {
    try {
      const bookingData = {
        ...data,
        title: destination?.name || "New Booking",
        status: "pending",
        userId: user?.id || 4, // Use current user's ID
        hostId: data.hostId
      };
      
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      const newBooking = await res.json();
      
      toast({
        title: "Booking created",
        description: "Your booking has been created successfully.",
      });
      
      setIsBookingFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    } catch (error) {
      toast({
        title: "Error creating booking",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout title="Error">
        <div className="text-center text-red-500">
          <p>Failed to load destination details</p>
        </div>
      </Layout>
    );
  }

  if (!destination) {
    return (
      <Layout title="Not Found">
        <div className="text-center">
          <p>Destination not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={destination.name}>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-8">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-white mb-4">{destination.name}</h1>
            <Button
              onClick={() => setIsBookingFormOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white text-xl px-10 py-8 shadow-lg"
              size="lg"
            >
              🏨 Book Your Stay Now
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="prose max-w-none mb-8">
          <p className="text-lg">{destination.description}</p>
        </div>

        {/* Highlights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {destination.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                  {highlight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                Best Time to Visit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{destination.bestTimeToVisit}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 text-primary-600 mr-2" />
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{destination.averagePrice}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/destinations")}
          >
            Back to Destinations
          </Button>
          
          {destinationBooking ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(destinationBooking)}
              >
                View Details
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteBooking(destinationBooking.id)}
              >
                Delete Booking
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsBookingFormOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Book Your Stay
            </Button>
          )}
        </div>

        {/* Booking Form */}
        <BookingForm
          isOpen={isBookingFormOpen}
          onClose={() => setIsBookingFormOpen(false)}
          onSubmit={handleAddBooking}
          isSubmitting={false}
        />
      </div>
    </Layout>
  );
} 