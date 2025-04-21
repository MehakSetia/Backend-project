import { Layout } from "@/components/layout";
import { DestinationCard } from "@/components/destination-card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Define our destination data
const destinations = [
  {
    id: "goa",
    name: "Goa",
    description: "India's premier beach destination with sun, sand, and seafood.",
    image: "Goa_img/background.jpg"
  },
  {
    id: "jaipur",
    name: "Jaipur",
    description: "The Pink City, known for its palaces and vibrant culture.",
    image: "Jaipur_img/jaipur back.webp"
  },
  {
    id: "shimla",
    name: "Shimla",
    description: "Known for its colonial architecture and views of snow-capped Himalayas.",
    image: "shimla_img/shimla back (1).jpg"
  },
  {
    id: "rameshwaram",
    name: "Rameshwaram",
    description: "Famous for its temples and beautiful beaches.",
    image: "rameshwaram_img/r1.png"
  },
  {
    id: "beaches",
    name: "Beaches",
    description: "Explore India's stunning coastline and beach destinations.",
    image: "beach_img/img1.png"
  },
  {
    id: "monuments",
    name: "Monuments",
    description: "Discover India's rich history through its iconic monuments.",
    image: "monuments_img/hawa-mahal.jpg"
  },
  {
    id: "mountains",
    name: "Mountains",
    description: "Experience the majesty of India's mountain ranges.",
    image: "mountain_img/background.jpg"
  },
  {
    id: "dawarika",
    name: "Dawarika",
    description: "A spiritual journey through ancient temples and traditions.",
    image: "dawarika_img/img14.png"
  },
  {
    id: "india",
    name: "India Overview",
    description: "A comprehensive guide to exploring India's diverse landscapes.",
    image: "indiaov_img/image.png"
  }
];

export default function DestinationsPage() {
  const { user } = useAuth();

  return (
    <Layout title="Featured Destinations">
      {/* Welcome Hero Section for Guests */}
      {!user && (
        <div className="relative overflow-hidden mb-12 rounded-lg">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-8 md:p-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Welcome to Trekking Tales
              </h1>
              <p className="text-xl text-primary-100 mb-6">
                Discover incredible destinations across India. Plan your journey, share experiences, and connect with fellow travelers.
              </p>
              <div className="flex gap-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-primary-600 text-white hover:bg-primary-700 border-2 border-primary-600 dark:border-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-bold px-8 rounded-full">
                    Join Trekking Tales Today →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Destinations Section */}
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-primary-600 mb-2">
            Featured Destinations
          </h2>
          <p className="text-muted-foreground mb-6">
            Explore our handpicked collection of incredible places
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <DestinationCard 
              key={destination.id}
              id={destination.id}
              name={destination.name}
              description={destination.description}
              image={destination.image}
              requiresAuth={!user && ['bookings', 'reviews'].includes(destination.id)}
            />
          ))}
        </div>

        {/* Call to Action for Guests */}
        {!user && (
          <div className="mt-12 text-center p-8 bg-neutral-50 dark:bg-gray-800/50 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">
              Ready to start your journey?
            </h3>
            <p className="text-muted-foreground mb-6">
              Create an account to unlock full access to bookings, reviews, and personalized recommendations.
            </p>
            <Link href="/auth">
              <Button size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}