import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="glass-card p-12 rounded-3xl max-w-md text-center">
        <h1 className="text-8xl font-black text-gradient mb-4 font-heading">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg" className="w-full rounded-full">
          <Link to="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
