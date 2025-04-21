import { Booking } from "@shared/schema";
import { formatDistance } from "date-fns";

type BookingCardProps = {
  booking: Booking;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
};

export function BookingCard({ booking, onView, onDelete }: BookingCardProps) {
  // Parse dates from string to Date objects
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  
  // Format dates for display
  const formattedStartDate = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  
  const formattedEndDate = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  
  // Calculate duration
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Get status color
  const getStatusColor = (status: string) => {
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
    <div className="flex items-start p-6 border-b border-neutral-200">
      <div className="flex-shrink-0 mt-1">
        <div className="bg-primary-100 rounded-md p-2">
          <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
      </div>
      <div className="ml-4 flex-1">
        <div className="flex justify-between">
          <h4 className="text-base font-medium text-neutral-800">{booking.title}</h4>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-600">{formattedStartDate} - {formattedEndDate}</p>
        <div className="mt-2 flex justify-between">
          <p className="text-sm font-medium text-neutral-500">{booking.guests}</p>
          <p className="text-sm font-semibold text-neutral-800">${booking.price}</p>
        </div>
        <div className="mt-3 flex justify-end space-x-2">
          <button 
            onClick={() => onView(booking.id)} 
            className="text-xs font-medium text-primary-600 hover:text-primary-800">
            View details
          </button>
          <button 
            onClick={() => onDelete(booking.id)} 
            className="text-xs font-medium text-red-600 hover:text-red-800">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
