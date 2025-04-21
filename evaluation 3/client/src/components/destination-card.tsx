import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type DestinationCardProps = {
  id: string;
  name: string;
  description: string;
  image: string;
  requiresAuth?: boolean; // Added prop to indicate if authentication is required
};

export function DestinationCard({ id, name, description, image, requiresAuth = false }: DestinationCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-slate-700">
      <div className="h-48 overflow-hidden">
        <img 
          src={`/assets/${image}`} 
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/assets/default-destination.jpg";
          }}
        />
      </div>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <div className="flex justify-between items-center w-full">
          <Link href={`/destination/${id}`}>
            <Button>View Details</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}