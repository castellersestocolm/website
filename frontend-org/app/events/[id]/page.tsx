"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Users, Clock } from "lucide-react";
import { getEvent } from "@/library/api/services/event";
import { useAuth } from "../../src/contexts/AuthContext";
import type { Event } from "@/types/api";

export default function EventDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const id = parseInt(params.id as string);
        const data = await getEvent(id);
        setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Event not found</p>
            <Button asChild variant="outline">
              <Link href="/events">Back to Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canRegister =
    event.registration_deadline &&
    new Date(event.registration_deadline) > new Date();

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" asChild>
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-3xl">{event.title}</CardTitle>
                {event.event_type && (
                  <Badge className="text-sm">{event.event_type}</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Calendar className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {event.end_date && (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Clock className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">End Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.end_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>
              )}

              {event.max_participants && (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Users className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      Maximum {event.max_participants} participants
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">About this Event</h3>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            {event.registration_deadline && (
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <p className="font-medium">Registration Deadline</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.registration_deadline).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {user ? (
                canRegister ? (
                  <Button size="lg" className="flex-1">
                    Register for Event
                  </Button>
                ) : (
                  <Button size="lg" disabled className="flex-1">
                    Registration Closed
                  </Button>
                )
              ) : (
                <Button size="lg" asChild className="flex-1">
                  <Link href="/auth">Sign in to Register</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
