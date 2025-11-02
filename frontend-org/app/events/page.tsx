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
import { Calendar, MapPin, Users } from "lucide-react";
import { getEvents } from "@/library/api/services/event";
import type { Event } from "@/types/api";

export default function EventsPage() {
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
        <div className="text-center">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Upcoming Events</h1>
          <p className="text-xl text-muted-foreground">
            Join us for practices, performances, and community gatherings
          </p>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No upcoming events at the moment. Check back soon!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    {event.event_type && <Badge>{event.event_type}</Badge>}
                  </div>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.start_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                    {event.max_participants && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        Max {event.max_participants} participants
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="line-clamp-3 text-muted-foreground">
                    {event.description}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button asChild className="flex-1" variant="outline">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                  {event.registration_deadline &&
                    new Date(event.registration_deadline) > new Date() && (
                      <Button className="flex-1">Register</Button>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
