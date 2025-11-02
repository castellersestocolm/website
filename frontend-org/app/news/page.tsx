"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEvents } from "@/library/api/services/event";
import type { Event } from "@/types/api";

export default function NewsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents({ is_public: true });
        setEvents(data.results || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Latest News & Events</h1>
          <p className="text-xl text-muted-foreground">
            Stay updated with our latest activities, events, and announcements
          </p>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No news available at the moment. Check back soon!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    {event.event_type && (
                      <Badge variant="secondary">{event.event_type}</Badge>
                    )}
                  </div>
                  <CardDescription>
                    {new Date(event.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="line-clamp-3 text-muted-foreground">
                    {event.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/news/${event.id}`}>Read More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
