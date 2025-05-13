import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { BookingForm } from "@/components/booking-form";

const destinationData: Record<string, { title: string, fileName: string }> = {
  "shimla": { title: "Shimla Travel Guide", fileName: "shimla.html" },
  "rameshwaram": { title: "Rameshwaram Tour", fileName: "rameshwaram.html" },
  "goa": { title: "Goa Trip Planner", fileName: "Goa.html" },
  "jaipur": { title: "Jaipur Travel Guide", fileName: "jaipur.html" },
  "mountain": { title: "Mountain Destinations", fileName: "mountain.html" },
  "mountains": { title: "Mountain Destinations", fileName: "mountain.html" },
  "beach": { title: "Beach Destinations", fileName: "beaches.html" },
  "beaches": { title: "Beach Destinations", fileName: "beaches.html" },
  // "dwarika": { title: "Dwarika Travel Guide", fileName: "dawarika.html" },
  "dawarika": { title: "Dwarika Travel Guide", fileName: "dawarika.html" },
  "monument": { title: "Indian Monuments", fileName: "monument.html" },
  "monuments": { title: "Indian Monuments", fileName: "monument.html" },
  "india": { title: "India Overview", fileName: "indiaov.html" },
  "india-overview": { title: "India Overview", fileName: "indiaov.html" },
};

interface Package {
  id: number;
  destinationId: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  inclusions: string;
  exclusions: string;
}

export default function DestinationDetailPage() {
  const [match, params] = useRoute('/destination/:id');
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState<boolean>(true);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const destinationId = params?.id || "";
  const destination = destinationData[destinationId];

  const { data: packages, isLoading: isLoadingPackages } = useQuery<Package[]>({
    queryKey: ['packages', destinationId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/packages?destinationId=${destinationId}`);
      return await res.json();
    },
    enabled: !!destinationId
  });

  useEffect(() => {
    if (!destination) {
      setLoading(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [destination]);

  const handleBookPackage = async (data: any) => {
    if (!selectedPackage) return;
    
    try {
      const bookingData = {
        title: `${destination.title} - ${selectedPackage.name}`,
        startDate: data.startDate,
        endDate: data.endDate,
        guests: "2",
        price: data.price,
        notes: data.notes || `Package: ${selectedPackage.name}\nDuration: ${selectedPackage.duration}\nInclusions: ${selectedPackage.inclusions}`,
        status: 'pending',
        hostId: 2,
        userId: user?.id || 4
      };
      
      await apiRequest("POST", "/api/bookings", bookingData);
      toast({
        title: "Booking Created",
        description: "Your package has been booked successfully!",
      });
      setIsBookingFormOpen(false);
      navigate('/bookings');
    } catch (error) {
      console.error('Failed to create booking:', error);
      toast({
        title: "Error",
        description: "Failed to book package. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!match || !destination) {
    return (
      <Layout title="Destination Not Found">
        <Card className="p-6 text-center">
          <h2 className="text-xl mb-4">The destination you're looking for could not be found.</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title={destination.title} subtitle="Plan your perfect trip">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <Card className="p-6 dark:bg-gray-800">
            <div className="overflow-hidden">
              <iframe
                src={`/assets/${destination.fileName}`}
                title={destination.title}
                className="w-full min-h-[600px] border-0"
                style={{ height: 'calc(100vh - 300px)' }}
              />
            </div>
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={() => {
                  setSelectedPackage({
                    id: 1,
                    destinationId,
                    name: `${destination.title} Standard Package`,
                    description: "Standard package for your stay",
                    duration: "3 days, 2 nights",
                    price: "15000",
                    inclusions: "Accommodation, Breakfast, Local Sightseeing",
                    exclusions: "Lunch, Dinner, Personal Expenses"
                  });
                  setIsBookingFormOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 shadow-lg"
                size="lg"
              >
                🏨 Book Your Stay Now
              </Button>
            </div>
          </Card>

          {/* Available Packages */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Available Packages</h2>
            {isLoadingPackages ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : packages && packages.length > 0 ? (
              packages.map((pkg) => (
                <Card key={pkg.id} className="p-6">
                  <CardHeader>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-300">{pkg.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold">Duration</p>
                          <p>{pkg.duration}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Price</p>
                          <p className="text-primary font-bold">{pkg.price}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">Inclusions</p>
                        <p className="text-gray-600 dark:text-gray-300">{pkg.inclusions}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Exclusions</p>
                        <p className="text-gray-600 dark:text-gray-300">{pkg.exclusions}</p>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setIsBookingFormOpen(true);
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                      >
                        Book This Package
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">No packages available for this destination yet.</p>
              </Card>
            )}
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline" 
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Back to Destinations
            </Button>
          </div>

          <BookingForm
            isOpen={isBookingFormOpen}
            onClose={() => setIsBookingFormOpen(false)}
            onSubmit={handleBookPackage}
            isSubmitting={false}
            packageDetails={selectedPackage ? {
              name: selectedPackage.name,
              basePrice: parseInt(selectedPackage.price),
              duration: selectedPackage.duration,
              inclusions: selectedPackage.inclusions,
              exclusions: selectedPackage.exclusions
            } : undefined}
          />
        </div>
      )}
    </Layout>
  );
}