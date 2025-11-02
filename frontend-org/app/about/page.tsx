import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">About Us</h1>
          <p className="text-xl text-muted-foreground">
            Learn about Les Quatre Barres - Casal Català d&apos;Estocolm
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Who We Are</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Les Quatre Barres is the Catalan cultural association in Stockholm 
              (Casal Català d&apos;Estocolm). We bring together Catalans and friends 
              of Catalan culture living in Sweden to celebrate our language, 
              traditions, and heritage.
            </p>
            <p>
              Since 1978, our association has been a home away from home for the 
              Catalan community in Stockholm, organizing cultural events, celebrations, 
              and activities that keep our traditions alive in Scandinavia.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Throughout the year, we organize a variety of events and activities:
            </p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>
                <strong>Diada Nacional de Catalunya</strong> - Celebrating Catalonia&apos;s 
                National Day every September 11th
              </li>
              <li>
                <strong>Calçotades</strong> - Traditional spring onion barbecues
              </li>
              <li>
                <strong>L&apos;Esplai Català</strong> - Catalan children&apos;s activities 
                and language learning
              </li>
              <li>
                <strong>Castellers d&apos;Estocolm</strong> - Our human towers group, 
                practicing the UNESCO-recognized tradition
              </li>
              <li>
                <strong>Film screenings</strong> - Catalan cinema and documentaries
              </li>
              <li>
                <strong>Cultural seminars</strong> - Discussions on Catalan history, 
                literature, and current affairs
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside">
              <li>Promote and preserve Catalan language and culture</li>
              <li>Create a welcoming community for Catalans in Sweden</li>
              <li>Organize cultural and social events</li>
              <li>Support Catalan education and children&apos;s activities</li>
              <li>Foster connections between Sweden and Catalonia</li>
              <li>Celebrate Catalan traditions and heritage</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
