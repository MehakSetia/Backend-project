import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { PostForm } from "@/components/post-form";
import { PostCard } from "@/components/post-card";
import { Post, InsertPost, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PenLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PostsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [postFilter, setPostFilter] = useState("all");
  
  // Fetch all posts
  const { 
    data: posts = [], 
    isLoading: isLoadingPosts,
    isError: isPostsError,
    error: postsError 
  } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });
  
  // Fetch all users for author information
  const { 
    data: users = [], 
    isLoading: isLoadingUsers
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  
  // Add post mutation
  const addPostMutation = useMutation({
    mutationFn: async (post: InsertPost) => {
      const res = await apiRequest("POST", "/api/posts", post);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsPostFormOpen(false);
      toast({
        title: "Post published",
        description: "Your travel post has been successfully published.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error publishing post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter and search posts
  const filteredPosts = posts.filter(post => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    let matchesFilter = true;
    if (postFilter === "my") {
      matchesFilter = post.userId === user?.id;
    } else if (postFilter === "recent") {
      // Already sorted by date in the query, so this filter shows all posts
      matchesFilter = true;
    } else if (postFilter === "oldest") {
      // Just keep all and will sort them later
      matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });
  
  // Sort posts based on filter
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (postFilter === "oldest") {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    // Default: recent first
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
  
  // Handle add post form submission
  const handleAddPost = (data: InsertPost) => {
    addPostMutation.mutate(data);
  };
  
  // Get author for a post
  const getAuthor = (userId: number) => {
    return users.find(u => u.id === userId);
  };
  
  return (
    <Layout 
      title="Travel Posts" 
      subtitle="Share your travel experiences and read about others' adventures."
    >
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Button onClick={() => setIsPostFormOpen(true)}>
          <PenLine className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>
      
      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="post-filter" className="block text-sm font-medium text-neutral-700 mb-1">Filter By</label>
            <Select value={postFilter} onValueChange={setPostFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="my">My Posts</SelectItem>
                <SelectItem value="recent">Recent First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="post-search" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                id="post-search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Posts Grid */}
      {isLoadingPosts || isLoadingUsers ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : isPostsError ? (
        <div className="p-8 text-center text-red-500">
          <p>Error loading posts: {postsError?.message}</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">No posts found</h3>
          <p className="text-neutral-600 mb-6">Be the first to share your travel experiences with the community!</p>
          <Button onClick={() => setIsPostFormOpen(true)}>Create a Post</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              author={getAuthor(post.userId)}
            />
          ))}
        </div>
      )}
      
      {/* Post Form Dialog */}
      <PostForm 
        isOpen={isPostFormOpen}
        onClose={() => setIsPostFormOpen(false)}
        onSubmit={handleAddPost}
        isSubmitting={addPostMutation.isPending}
      />
    </Layout>
  );
}
