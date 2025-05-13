import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBookingSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { addDays, format, isBefore, parseISO } from "date-fns";

const formSchema = insertBookingSchema;

type BookingFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isSubmitting: boolean;
  packageDetails?: {
    name: string;
    basePrice: number;
    duration: string;
    inclusions: string;
    exclusions: string;
  };
  // Add prop for default host ID
  defaultHostId?: number;
  // Add prop to control whether host selection is shown
  showHostSelection?: boolean;
};

type Host = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export function BookingForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  packageDetails,
  defaultHostId = 1, // Default to host ID 1 if not provided
  showHostSelection = false, // Hide host selection by default
}: BookingFormProps) {
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [numberOfDays, setNumberOfDays] = useState<number>(0);
  const [dateError, setDateError] = useState<string | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: hosts = [] } = useQuery<Host[]>({
    queryKey: ["/api/hosts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/hosts");
      return await res.json();
    },
    enabled: showHostSelection, // Only fetch hosts if selection is enabled
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: packageDetails?.name || "Package Booking",
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(addDays(today, 1), "yyyy-MM-dd"),
      guests: "2",
      price: "0",
      notes: "",
      status: "pending",
      hostId: defaultHostId, // Use the provided default host ID
    },
  });

  // Watch form values and update price
  useEffect(() => {
    const startDate = form.getValues("startDate");
    const endDate = form.getValues("endDate");

    if (
      startDate &&
      endDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(startDate) &&
      /^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      if (isBefore(start, today)) {
        setDateError("Start date cannot be in the past");
        setNumberOfDays(0);
        setCalculatedPrice(0);
        form.setValue("price", "0", { shouldValidate: false });
        return;
      }

      if (isBefore(end, start)) {
        setDateError("End date must be after start date");
        setNumberOfDays(0);
        setCalculatedPrice(0);
        form.setValue("price", "0", { shouldValidate: false });
        return;
      }

      setDateError(null);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (days > 0) {
        setNumberOfDays(days);
        const basePrice = packageDetails?.basePrice || 5000;
        const total = basePrice * days;
        setCalculatedPrice(total);
        if (form.getValues("price") !== total.toString()) {
          form.setValue("price", total.toString(), { shouldValidate: false });
        }
      } else {
        setNumberOfDays(0);
        setCalculatedPrice(0);
        form.setValue("price", "0", { shouldValidate: false });
      }
    } else {
      setNumberOfDays(0);
      setCalculatedPrice(0);
      form.setValue("price", "0", { shouldValidate: false });
    }
  }, [form.watch("startDate"), form.watch("endDate")]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (dateError) {
      return;
    }

    const formData = {
      ...data,
      title: packageDetails?.name || "Package Booking",
      guests: data.guests || "2",
      price: calculatedPrice.toString(),
      notes:
        data.notes ||
        `Package: ${packageDetails?.name}\nDuration: ${numberOfDays} days\nInclusions: ${packageDetails?.inclusions}`,
      status: "pending" as const,
      hostId: data.hostId, // Will use the default host ID
    };

    onSubmit(formData);
  };

  const getMinDate = (field: "startDate" | "endDate") => {
    if (field === "startDate") {
      return format(today, "yyyy-MM-dd");
    }
    
    const startDate = form.getValues("startDate");
    if (startDate) {
      const start = parseISO(startDate);
      return isBefore(start, today) ? format(today, "yyyy-MM-dd") : startDate;
    }
    
    return format(today, "yyyy-MM-dd");
  };

  // Get the default host name for display
  const defaultHostName = hosts.find(host => host.id === defaultHostId)?.name || "Host";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Your Stay</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {packageDetails && (
              <div className="space-y-2">
                <p className="font-semibold">Package Details:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {packageDetails.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Base Price: ₹{packageDetails.basePrice} per day
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Standard Duration: {packageDetails.duration}
                </p>
              </div>
            )}

            {/* Only show host selection if enabled */}
            {showHostSelection ? (
              <FormField
                control={form.control}
                name="hostId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border rounded"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        {hosts.map((host) => (
                          <option key={host.id} value={host.id}>
                            {host.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              // Show the default host as read-only text
              <div className="space-y-2">
                <FormLabel>Host</FormLabel>
                <div className="p-2 border rounded bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm">{defaultHostName}</p>
                  <input type="hidden" {...form.register("hostId")} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        min={getMinDate("startDate")}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        min={getMinDate("endDate")}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {dateError && (
              <p className="text-sm font-medium text-destructive">{dateError}</p>
            )}

            {numberOfDays > 0 && (
              <div className="space-y-2">
                <p className="font-semibold">Booking Summary:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Number of Days: {numberOfDays}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Price: ₹{calculatedPrice}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || numberOfDays === 0 || !!dateError}
              >
                {isSubmitting ? "Creating..." : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}