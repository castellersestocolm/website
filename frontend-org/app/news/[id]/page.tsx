"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { getEvent } from "@/library/api/services/event";
import type { Event } from "@/types/api";

export default function NewsDetailPage() {
  const params = useParams();
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
              <Link href="/news">Back to News</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" asChild>
          <Link href="/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-3xl">{event.title}</CardTitle>
                {event.event_type && (
                  <Badge variant="secondary" className="text-sm">
                    {event.event_type}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.max_participants && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Max {event.max_participants} participants</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="prose prose-neutral max-w-none">
              <p className="text-lg">{event.description}</p>
            </div>

            {event.registration_deadline && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Registration Deadline</p>
                <p className="text-muted-foreground">
                  {new Date(event.registration_deadline).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            )}

            {event.end_date && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">End Date</p>
                <p className="text-muted-foreground">
                  {new Date(event.end_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
