import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { StatsCard } from "@/components/stats-card";
import { BookingCard } from "@/components/booking-card";
import { PostCard } from "@/components/post-card";
import { Booking, Post, User } from "@shared/schema";
import { 
  CalendarDays, 
  Eye, 
  Clock,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch user's bookings
  const { 
    data: bookings, 
    isLoading: isLoadingBookings 
  } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user
  });
  
  // Fetch posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts 
  } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    enabled: !!user
  });
  
  // Function to show booking details (in real app would navigate to details page)
  const handleViewBooking = (id: number) => {
    console.log(`View booking with ID: ${id}`);
  };
  
  // Function to handle booking deletion/cancellation
  const handleDeleteBooking = (id: number) => {
    console.log(`Delete booking with ID: ${id}`);
  };
  
  // Filter to get only user's posts
  const userPosts = posts?.filter(post => post.userId === user?.id) || [];
  
  return (
    <Layout 
      title={`Welcome to Trekking Tales, ${user?.name || 'Traveler'}!`} 
      subtitle="Here's an overview of your recent activity."
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Active Bookings"
          value={bookings?.length || 0}
          icon={<CalendarDays />}
          bgColor="bg-primary-100"
          textColor="text-primary-600"
        />
        
        <StatsCard
          title="Travel Posts"
          value={userPosts.length || 0}
          icon={<Eye />}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        
        <StatsCard
          title="Days Active"
          value={user ? Math.floor((new Date().getTime() - new Date(user.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) : 0}
          icon={<Clock />}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
      </div>
      
      {/* Bookings and Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          
          <CardContent className="px-0 py-0">
            {isLoadingBookings ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {bookings.slice(0, 3).map(booking => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    onView={handleViewBooking} 
                    onDelete={handleDeleteBooking} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                <p>No bookings found</p>
                <p className="text-sm mt-2">Start planning your next adventure!</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
            <div className="ml-auto">
              <Link href="/bookings">
                <Button variant="link" className="text-sm font-medium text-primary-600">
                  View all bookings
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        {/* Recent Posts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Recent Posts</CardTitle>
          </CardHeader>
          
          <CardContent className="px-0 py-0">
            {isLoadingPosts ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userPosts && userPosts.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {userPosts.slice(0, 3).map(post => (
                  <div key={post.id} className="p-6">
                    <h4 className="text-base font-medium text-neutral-800">{post.title}</h4>
                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-neutral-500">
                        Posted on {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                      <Link href={`/posts/${post.id}`}>
                        <Button variant="link" className="text-sm font-medium text-primary-600 p-0">
                          Read more
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                <p>No posts found</p>
                <p className="text-sm mt-2">Share your travel experiences with the community!</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
            <div className="ml-auto">
              <Link href="/posts">
                <Button variant="link" className="text-sm font-medium text-primary-600">
                  View all posts
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
