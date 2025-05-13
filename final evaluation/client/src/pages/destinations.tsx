import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  highlights: string[];
  bestTimeToVisit: string;
  averagePrice: string;
}

export default function DestinationsPage() {
  const { data: destinations = [], isLoading, isError } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/destinations");
      return await res.json();
    }
  });

  if (isLoading) {
    return (
      <Layout title="Loading Destinations">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout title="Error">
        <div className="text-center text-red-500">
          <p>Error loading destinations</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Explore Destinations">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Explore Destinations</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Link to={`/destination/${destination.id}`} key={destination.id}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <h2 className="text-xl font-bold text-white">{destination.name}</h2>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {destination.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{destination.highlights[0]}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
} 