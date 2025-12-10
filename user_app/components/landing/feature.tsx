import { CheckCircle, MapPin, Clock, DollarSign, Shield, Users } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: CheckCircle,
      title: "Easy Booking",
      description: "Book your tickets in just a few clicks",
    },
    {
      icon: MapPin,
      title: "100+ Routes",
      description: "Extensive network covering major cities",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get live tracking and notifications",
    },
    {
      icon: DollarSign,
      title: "Best Prices",
      description: "Competitive fares with special discounts",
    },
    {
      icon: Shield,
      title: "Safe Travel",
      description: "Verified drivers and maintained buses",
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Dedicated customer service team",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">Zytra Bus?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the best in bus travel with our comprehensive services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-border"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                    <IconComponent size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
