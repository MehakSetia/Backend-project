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
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

// Use the insertBookingSchema directly without extending it
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
};

type Host = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export function BookingForm({ isOpen, onClose, onSubmit, isSubmitting, packageDetails }: BookingFormProps) {
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [numberOfDays, setNumberOfDays] = useState<number>(0);

  // Fetch available hosts
  const { data: hosts = [] } = useQuery<Host[]>({
    queryKey: ["/api/hosts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/hosts");
      return await res.json();
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: packageDetails?.name || "Package Booking",
      startDate: "",
      endDate: "",
      guests: "2",
      price: "0",
      notes: "",
      status: "pending",
      hostId: hosts[0]?.id || 1
    },
  });

  // Calculate price when dates change
  useEffect(() => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    
    if (startDate && endDate && packageDetails) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      setNumberOfDays(days);
      
      // Calculate price based on number of days
      const basePrice = packageDetails.basePrice;
      const calculatedPrice = basePrice * days;
      setCalculatedPrice(calculatedPrice);
      form.setValue("price", calculatedPrice.toString());
    }
  }, [form.watch("startDate"), form.watch("endDate"), packageDetails]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const formData = {
      ...data,
      title: packageDetails?.name || "Package Booking",
      guests: data.guests || "2",
      price: calculatedPrice.toString(),
      notes: data.notes || `Package: ${packageDetails?.name}\nDuration: ${numberOfDays} days\nInclusions: ${packageDetails?.inclusions}`,
      status: "pending" as const,
      hostId: data.hostId
    };
    
    console.log('Submitting booking data:', formData);
    onSubmit(formData);
  };

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

            <FormField
              control={form.control}
              name="hostId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Host</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a host" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hosts.map((host) => (
                        <SelectItem key={host.id} value={host.id.toString()}>
                          {host.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              <Button type="submit" disabled={isSubmitting || numberOfDays === 0}>
                {isSubmitting ? "Creating..." : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
