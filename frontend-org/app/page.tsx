import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <main className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Frontend Org
          </h1>
          <p className="text-muted-foreground text-lg">
            Built with Next.js and shadcn/ui components
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Learn the basics of this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is a Next.js application with shadcn/ui components. Start
                building your application by editing the files in the app
                directory.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full">
                Learn More
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Components <Badge variant="secondary">New</Badge>
              </CardTitle>
              <CardDescription>Beautiful UI components</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                shadcn/ui provides a collection of re-usable components built
                with Tailwind CSS and Radix UI.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" className="flex-1">
                View Docs
              </Button>
              <Button variant="secondary" className="flex-1">
                Browse
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deploy</CardTitle>
              <CardDescription>
                Ready for production <Badge>Docker</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This application is configured with Docker for easy deployment.
                Use the provided Dockerfiles for production builds.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full">
                Deploy Now
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
            <CardDescription>
              Continue building your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline">1</Badge>
              <p className="text-sm">
                Add more shadcn/ui components with{" "}
                <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
                  npx shadcn@latest add
                </code>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">2</Badge>
              <p className="text-sm">
                Create new pages and routes in the{" "}
                <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
                  app
                </code>{" "}
                directory
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">3</Badge>
              <p className="text-sm">
                Customize the theme in{" "}
                <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
                  app/globals.css
                </code>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">
              View Documentation
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
