import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import OverviewPage from "@/pages/overview-page";
import BookingsPage from "@/pages/bookings-page";
import PostsPage from "@/pages/posts-page";
import AdminPage from "@/pages/admin-page";
import DestinationsPage from "@/pages/destinations-page";
import DestinationDetailPage from "@/pages/destination-detail-page";
import ProfilePage from "@/pages/profile-page";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Toaster />
          <Switch>
            {/* Public Routes */}
            <Route path="/auth" component={AuthPage} />
            <Route path="/destinations" component={DestinationsPage} />
            <Route path="/destination/:id" component={DestinationDetailPage} />

            {/* Protected Routes (Traveler & Admin) */}
            <ProtectedRoute path="/dashboard" component={DashboardPage} />
            <ProtectedRoute path="/bookings" component={BookingsPage} roles={["traveler", "admin"]} />
            <ProtectedRoute path="/posts" component={PostsPage} roles={["traveler", "admin"]} />
            <ProtectedRoute path="/profile" component={ProfilePage} roles={["traveler", "admin"]} />

            {/* Admin Only Routes */}
            <ProtectedRoute path="/admin" component={AdminPage} roles={["admin"]} />

            {/* Default Route */}
            <Route path="/" component={OverviewPage} />
            <ProtectedRoute path="/destinations" component={DestinationsPage} roles={["traveler", "admin"]} />
            <Route component={NotFound} />
          </Switch>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;