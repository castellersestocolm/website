"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, Trophy, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-primary/10 to-background py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to Les Quatre Barres
            </h1>
            <p className="text-xl text-muted-foreground">
              Casal Català d&apos;Estocolm - The Catalan cultural association in
              Stockholm. Join us to celebrate Catalan culture, language, and
              traditions.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/join">
                  Become a Member
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Join Us?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Cultural Events</CardTitle>
                <CardDescription>
                  Celebrate Catalan traditions throughout the year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  From La Diada to calçotades, participate in authentic Catalan
                  celebrations, festivals, and cultural activities in Stockholm.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Vibrant Community</CardTitle>
                <CardDescription>
                  Connect with Catalans and Catalan culture enthusiasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join a welcoming community that promotes Catalan language,
                  culture, and traditions in Sweden. All are welcome!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Castellers d&apos;Estocolm</CardTitle>
                <CardDescription>
                  Human towers - UNESCO cultural heritage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Part of Les Quatre Barres, our castellers group practices the
                  tradition of building human towers, recognized by UNESCO.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Latest News</h2>
            <Button variant="outline" asChild>
              <Link href="/news">View All</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Diada Nacional de Catalunya 2025</CardTitle>
                <CardDescription>August 27, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join us on September 13th at Sickla Strand to celebrate
                  Catalonia&apos;s National Day with food, activities, and
                  community!
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Picnic de Fi de Temporada</CardTitle>
                <CardDescription>June 11, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  End of season picnic at Tantolunden on June 14th. Bring your
                  own food and enjoy castellers exhibition!
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Assemblea General 2025</CardTitle>
                <CardDescription>March 31, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The General Assembly took place on March 15th. A new board was
                  approved with re-elected President and Vice-President.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-lg opacity-90">
              Join Les Quatre Barres today and become part of the Catalan
              community in Stockholm.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/join">Register Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
