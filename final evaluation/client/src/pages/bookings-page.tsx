import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { BookingForm } from "@/components/booking-form";
import { Booking, InsertBooking } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarPlus, Search, Filter, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [deleteBookingId, setDeleteBookingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Fetch user's bookings
  const { 
    data: bookings = [], 
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  // Add booking mutation
  const addBookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const res = await apiRequest("POST", "/api/bookings", {
        ...booking,
        status: user?.role === 'admin' ? 'confirmed' : 'pending'
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      refetch();
      setIsBookingFormOpen(false);
      toast({
        title: "Booking added",
        description: "Your booking has been successfully added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding booking",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async (data: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${data.id}/status`, { status: data.status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/bookings/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to delete booking: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      refetch(); // Force a refetch
      setDeleteBookingId(null);
      toast({
        title: "Booking deleted",
        description: "The booking has been successfully deleted.",
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

  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guests.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || 
      booking.status.toLowerCase() === statusFilter.toLowerCase();

    // Date filter
    let matchesDate = true;
    if (dateFilter === "upcoming") {
      matchesDate = new Date(booking.startDate) >= new Date();
    } else if (dateFilter === "past") {
      matchesDate = new Date(booking.endDate) < new Date();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Handle add booking form submission
  const handleAddBooking = (data: InsertBooking) => {
    addBookingMutation.mutate(data);
  };

  // Handle view booking details
  const handleViewBookingDetails = (id: number) => {
    const booking = bookings.find(b => b.id === id);
    toast({
      title: booking?.title,
      description: `Date: ${booking?.startDate} to ${booking?.endDate}, Guests: ${booking?.guests}, Price: {booking?.price}`,
    });
  };

  // Handle confirm delete booking
  const handleConfirmDeleteBooking = (id: number) => {
    setDeleteBookingId(id);
  };

  // Handle delete booking
  const handleDeleteBooking = () => {
    if (deleteBookingId) {
      deleteBookingMutation.mutate(deleteBookingId);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Get status class for badge
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <Layout 
      title="Manage Your Bookings" 
      subtitle="View and manage all your travel bookings in one place."
    >
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          {user?.role === 'admin' ? 'Manage all bookings' : 'View your bookings'}
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setIsBookingFormOpen(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Add New Booking
          </Button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="booking-status" className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="booking-date" className="block text-sm font-medium text-neutral-700 mb-1">Date Range</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="next3Months">Next 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="booking-search" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                id="booking-search"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            <p>Error loading bookings: {error?.message}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <p className="mb-2">No bookings found</p>
            <p className="text-sm">Try changing your filters or create a new booking</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Details</TableHead>
                  <TableHead>Date & Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-md flex items-center justify-center">
                          <CalendarPlus className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">{booking.title}</div>
                          <div className="text-sm text-neutral-500">{booking.guests}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-neutral-900">
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.status)}`}>
                        {user?.role === 'admin' ? (
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateBookingStatusMutation.mutate({ id: booking.id, status: value })}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          booking.status
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-900">
                      ₹{booking.price}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost" 
                        size="sm" 
                        className="text-primary-600 hover:text-primary-900 mr-2"
                        onClick={() => handleViewBookingDetails(booking.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleConfirmDeleteBooking(booking.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Booking Form Dialog */}
      <BookingForm 
        isOpen={isBookingFormOpen}
        onClose={() => setIsBookingFormOpen(false)}
        onSubmit={handleAddBooking}
        isSubmitting={addBookingMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteBookingId} onOpenChange={() => setDeleteBookingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBooking}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}