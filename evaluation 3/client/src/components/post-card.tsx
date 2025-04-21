import { Post, User } from "@shared/schema";
import { formatDistance } from "date-fns";

type PostCardProps = {
  post: Post;
  author?: User;
};

export function PostCard({ post, author }: PostCardProps) {
  // Get initials for avatar
  const getInitials = () => {
    if (!author?.name) return "U";
    
    const nameParts = author.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Format date
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long", 
      day: "numeric", 
      year: "numeric"
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-neutral-800 hover:text-primary-600">
            {post.title}
          </h3>
          <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-full">
            {post.category}
          </span>
        </div>
        <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
          {post.content}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-xs font-medium text-primary-700">{getInitials()}</span>
            </div>
            <span className="ml-2 text-xs text-neutral-500">{author?.name || "Unknown Author"}</span>
          </div>
          <span className="text-xs text-neutral-500">
            {post.createdAt ? formatDate(post.createdAt) : "Recent"}
          </span>
        </div>
      </div>
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
        <div className="flex justify-between">
          <button className="text-sm font-medium text-primary-600 hover:text-primary-800">
            Read more
          </button>
          <div className="flex space-x-2">
            <button className="text-neutral-400 hover:text-neutral-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
            <button className="text-neutral-400 hover:text-neutral-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
