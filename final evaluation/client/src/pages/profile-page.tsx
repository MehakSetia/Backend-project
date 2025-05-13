
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <Layout title="Profile" subtitle="Manage your account settings">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                value={user?.name || ''} 
                readOnly={!isEditing}
                className={!isEditing ? 'bg-neutral-50' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                value={user?.email || ''} 
                readOnly={!isEditing}
                className={!isEditing ? 'bg-neutral-50' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input 
                value={user?.role || ''} 
                readOnly 
                className="bg-neutral-50"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              {isEditing && (
                <Button className="ml-2">
                  Save Changes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
