import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function OverviewPage() {
  return (
    <Layout title="Discover India">
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative z-10 text-center md:text-left md:w-1/2">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Discover India's Wonders
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                From the snow-capped Himalayas to the sun-kissed beaches, 
                embark on a journey through India's most breathtaking destinations.
              </p>
              
            </div>
          </div>
          <div className="absolute right-0 top-0 w-full md:w-1/2 h-full">
            <div className="h-full w-full bg-[url('/assets/indiaov_img/image.png')] bg-cover bg-center opacity-20 md:opacity-30"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-primary-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">Cultural Heritage</h3>
                <p className="text-gray-600 dark:text-gray-300">Explore ancient temples, historic monuments, and vibrant traditions.</p>
              </div>
              <div className="p-6 bg-primary-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">Natural Beauty</h3>
                <p className="text-gray-600 dark:text-gray-300">Discover diverse landscapes from mountains to beaches to forests.</p>
              </div>
              <div className="p-6 bg-primary-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">Adventure</h3>
                <p className="text-gray-600 dark:text-gray-300">Experience thrilling activities and unforgettable journeys.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Ready to Start Your Adventure?</h2>
            <Link href="/auth">
              <Button size="lg" className="bg-primary-600 text-white hover:bg-primary-700 border-2 border-white dark:border-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-bold px-8 rounded-full">
                Join Trekking Tales Now →
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
