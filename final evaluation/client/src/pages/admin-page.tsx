import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { User, Booking, Post } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

import { 
  Users, 
  CalendarDays, 
  FileText, 
  Activity, 
  Search, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  Award,
  DollarSign,
  TrendingUp,
  Users as UsersIcon
} from "lucide-react";

// Add RevenueData type
interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: Record<string, number>;
  revenueByHost: Record<number, number>;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");  // Changed default tab to overview
  
  // States for filtering users
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSortFilter, setUserSortFilter] = useState("newest");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  
  // States for filtering logs
  const [logFilter, setLogFilter] = useState("all");
  const [logDate, setLogDate] = useState("");
  
  // Confirmation state
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  // Fetch users
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    isError: isUsersError,
    error: usersError,
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
  });

  // Fetch all bookings
  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
    isError: isBookingsError,
    error: bookingsError,
  } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: !!user && user.role === "admin" && activeTab === "bookings",
  });

  // Fetch all posts
  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    isError: isPostsError,
    error: postsError,
  } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    enabled: !!user && user.role === "admin" && activeTab === "posts",
  });

  // Fetch revenue data
  const {
    data: revenueData,
    isLoading: isLoadingRevenue,
    isError: isRevenueError,
  } = useQuery<RevenueData>({
    queryKey: ["/api/admin/revenue"],
    enabled: !!user && user.role === "admin",
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setUserToDelete(null);
      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Role filter
    const matchesRole =
      userRoleFilter === "all" || user.role === userRoleFilter;

    // Search filter
    const matchesSearch =
      userSearchQuery === "" ||
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (userSortFilter === "newest") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (userSortFilter === "oldest") {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    } else if (userSortFilter === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Handle user actions
  const handleViewUserDetails = (id: number) => {
    const selectedUser = users.find((user) => user.id === id);
    if (selectedUser) {
      toast({
        title: selectedUser.name,
        description: `Email: ${selectedUser.email}, Role: ${selectedUser.role}, Joined: ${formatDate(selectedUser.createdAt || new Date())}`,
      });
    }
  };

  const handleEditUser = (id: number) => {
    toast({
      title: "Edit User",
      description: "User editing functionality would open in a modal here.",
    });
  };

  const handleConfirmDeleteUser = (id: number) => {
    setUserToDelete(id);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete);
    }
  };

  // Handle booking actions
  const handleViewBookingDetails = (id: number) => {
    const selectedBooking = bookings.find((booking) => booking.id === id);
    if (selectedBooking) {
      toast({
        title: selectedBooking.title,
        description: `Dates: ${selectedBooking.startDate} to ${selectedBooking.endDate}, Guests: ${selectedBooking.guests}, Price: $${selectedBooking.price}`,
      });
    }
  };

  const handleUpdateBookingStatus = (id: number) => {
    toast({
      title: "Update Booking Status",
      description: "Booking status update functionality would open in a modal here.",
    });
  };

  const handleConfirmDeleteBooking = (id: number) => {
    setBookingToDelete(id);
  };

  // Handle post actions
  const handleViewPost = (id: number) => {
    const selectedPost = posts.find((post) => post.id === id);
    if (selectedPost) {
      toast({
        title: selectedPost.title,
        description: `Category: ${selectedPost.category}, Content: ${selectedPost.content.substring(0, 100)}...`,
      });
    }
  };

  const handleFeaturePost = (id: number) => {
    toast({
      title: "Feature Post",
      description: "Post featuring functionality would be implemented here.",
    });
  };

  const handleConfirmDeletePost = (id: number) => {
    setPostToDelete(id);
  };

  // Get user name by ID
  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  // Handle logs download
  const handleDownloadLogs = () => {
    toast({
      title: "Download Logs",
      description: "Log download functionality would be implemented here.",
    });
  };

  return (
    <Layout title="Admin Dashboard" subtitle="Manage users, bookings, and content.">
      <div className="container mx-auto py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <span className="h-4 w-4 text-muted-foreground">₹</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingRevenue ? "Loading..." : formatCurrency(revenueData?.totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From all confirmed bookings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {isLoadingRevenue ? (
                      <p>Loading...</p>
                    ) : (
                      Object.entries(revenueData?.monthlyRevenue || {})
                        .sort((a, b) => b[0].localeCompare(a[0]))
                        .slice(0, 3)
                        .map(([month, revenue]) => (
                          <div key={month} className="flex justify-between text-sm">
                            <span>{month}</span>
                            <span className="font-medium">{formatCurrency(revenue)}</span>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Hosts by Revenue</CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {isLoadingRevenue ? (
                      <p>Loading...</p>
                    ) : (
                      Object.entries(revenueData?.revenueByHost || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([hostId, revenue]) => (
                          <div key={hostId} className="flex justify-between text-sm">
                            <span>Host #{hostId}</span>
                            <span className="font-medium">{formatCurrency(revenue)}</span>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab Content */}
          <TabsContent value="users">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="user-role-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                    Role
                  </label>
                  <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="traveler">Traveler</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="user-sort" className="block text-sm font-medium text-neutral-700 mb-1">
                    Sort By
                  </label>
                  <Select value={userSortFilter} onValueChange={setUserSortFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Newest First" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="user-search" className="block text-sm font-medium text-neutral-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <Input
                      id="user-search"
                      placeholder="Search users..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                {isLoadingUsers ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                ) : isUsersError ? (
                  <div className="p-8 text-center text-red-500">
                    <p>Error loading users: {usersError?.message}</p>
                  </div>
                ) : sortedUsers.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <p>No users found matching your criteria</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-700">
                                    {user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U"}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                                  <div className="text-sm text-neutral-500">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-neutral-900 capitalize">{user.role}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-neutral-900">
                                {formatDate(user.createdAt || new Date())}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary-600 hover:text-primary-900"
                                onClick={() => handleViewUserDetails(user.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-neutral-600 hover:text-neutral-900"
                                onClick={() => handleEditUser(user.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleConfirmDeleteUser(user.id)}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab Content */}
          <TabsContent value="bookings">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-neutral-800 mb-4">All Bookings</h3>
                
                {isLoadingBookings ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                ) : isBookingsError ? (
                  <div className="p-8 text-center text-red-500">
                    <p>Error loading bookings: {bookingsError?.message}</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <p>No bookings found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="text-sm font-medium text-neutral-900">{booking.title}</div>
                              <div className="text-xs text-neutral-500">{booking.guests}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-neutral-900">
                                  {getUserName(booking.userId)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-neutral-900">
                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === "confirmed" 
                                  ? "bg-green-100 text-green-800" 
                                  : booking.status === "pending" 
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : "bg-red-100 text-red-800"
                              }`}>
                                {booking.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-neutral-900">
                              ₹{booking.price}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary-600 hover:text-primary-900"
                                onClick={() => handleViewBookingDetails(booking.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-neutral-600 hover:text-neutral-900"
                                onClick={() => handleUpdateBookingStatus(booking.id)}
                              >
                                <Edit className="h-4 w-4" />
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab Content */}
          <TabsContent value="posts">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-neutral-800 mb-4">All Posts</h3>

                {isLoadingPosts ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                ) : isPostsError ? (
                  <div className="p-8 text-center text-red-500">
                    <p>Error loading posts: {postsError?.message}</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <p>No posts found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Post Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Date Published</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div className="text-sm font-medium text-neutral-900">{post.title}</div>
                              <div className="text-xs text-neutral-500 truncate max-w-xs">
                                {post.content.length > 50 ? `${post.content.substring(0, 50)}...` : post.content}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium text-neutral-900">
                                {getUserName(post.userId)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-neutral-900">
                                {formatDate(post.createdAt || new Date())}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">
                                {post.category}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary-600 hover:text-primary-900"
                                onClick={() => handleViewPost(post.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-neutral-600 hover:text-neutral-900"
                                onClick={() => handleFeaturePost(post.id)}
                              >
                                <Award className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleConfirmDeletePost(post.id)}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Logs Tab Content */}
          <TabsContent value="logs">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-neutral-800 mb-4">System Logs</h3>

                <div className="mb-4">
                  <label htmlFor="log-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                    Filter
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Select value={logFilter} onValueChange={setLogFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="login">Login Events</SelectItem>
                        <SelectItem value="booking">Booking Events</SelectItem>
                        <SelectItem value="user">User Management</SelectItem>
                        <SelectItem value="post">Post Events</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      id="log-date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                    />
                    <Button>Apply Filters</Button>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-md p-4 h-96 overflow-auto font-mono text-sm">
                  <div className="text-neutral-800">[2023-05-15T09:30:45.123Z] - User logged in: john.doe@example.com (ID: 1)</div>
                  <div className="text-neutral-800">[2023-05-15T09:32:12.456Z] - Booking added by user 1</div>
                  <div className="text-neutral-800">[2023-05-15T10:15:22.789Z] - User logged in: jane.smith@example.com (ID: 2)</div>
                  <div className="text-neutral-800">[2023-05-15T10:18:33.987Z] - Post added by user 1: 10 Hidden Gems in Southeast Asia</div>
                  <div className="text-neutral-800">[2023-05-15T11:05:45.654Z] - User logged out: john.doe@example.com (ID: 1)</div>
                  <div className="text-neutral-800">[2023-05-15T13:22:11.321Z] - User logged in: alex.smith@example.com (ID: 3)</div>
                  <div className="text-neutral-800">[2023-05-15T13:25:46.987Z] - Booking deleted by user 3</div>
                  <div className="text-neutral-800">[2023-05-15T14:30:12.345Z] - User registered: new.user@example.com (ID: 4)</div>
                  <div className="text-neutral-800">[2023-05-15T15:45:33.876Z] - User logged in: new.user@example.com (ID: 4)</div>
                  <div className="text-neutral-800">[2023-05-15T15:48:22.112Z] - Booking added by user 4</div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    className="bg-neutral-600 hover:bg-neutral-700"
                    onClick={handleDownloadLogs}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={userToDelete !== null} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Booking Confirmation Dialog */}
      <AlertDialog open={bookingToDelete !== null} onOpenChange={() => setBookingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog open={postToDelete !== null} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}