import { TrendingUp, Megaphone, DollarSign, Users } from "lucide-react";

export function PromoSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/10 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Revenue Booster
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Turn Your Music Into a
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Revenue Stream
              </span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Instead of paying to hear ads from Spotify or other platforms, use that airtime for <span className="text-foreground font-medium">your own internal promotions</span>. Announce special offers, highlight products, or share announcements—directly to customers while they're in your store.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-xl bg-card/80 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-accent" />
                  <span className="text-3xl font-bold text-accent">+10%</span>
                </div>
                <p className="text-sm text-muted-foreground">Average monthly revenue increase from in-store promotions</p>
              </div>
              <div className="p-5 rounded-xl bg-card/80 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold text-primary">100%</span>
                </div>
                <p className="text-sm text-muted-foreground">Audience reach—every customer in your venue hears your message</p>
              </div>
            </div>

            {/* Key points */}
            <ul className="space-y-3">
              {[
                "Promote daily specials and limited-time offers",
                "Highlight new products or services",
                "Share loyalty program updates",
                "Make announcements without interrupting service"
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl">
              {/* Promo Card Preview */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Promotion Manager</h4>
                    <p className="text-sm text-muted-foreground">Schedule your in-store messages</p>
                  </div>
                </div>

                {/* Sample Promos */}
                <div className="space-y-4">
                  {[
                    {
                      title: "Happy Hour Special",
                      time: "4:00 PM - 7:00 PM",
                      message: "Half price appetizers and $5 draft beers!",
                      plays: 24,
                      active: true
                    },
                    {
                      title: "Weekend Brunch",
                      time: "Sat-Sun 10:00 AM",
                      message: "Unlimited mimosas with any entrée",
                      plays: 18,
                      active: true
                    },
                    {
                      title: "Loyalty Points",
                      time: "Every 30 min",
                      message: "Earn double points this week!",
                      plays: 32,
                      active: false
                    }
                  ].map((promo, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border transition-all ${
                        promo.active
                          ? "bg-accent/5 border-accent/30"
                          : "bg-muted/30 border-border/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-sm">{promo.title}</h5>
                          <p className="text-xs text-muted-foreground">{promo.time}</p>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          promo.active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {promo.active ? "Active" : "Paused"}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">"{promo.message}"</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        {promo.plays} plays today
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Promo Button */}
                <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-border hover:border-accent/50 hover:bg-accent/5 text-muted-foreground hover:text-accent transition-all text-sm font-medium">
                  + Add New Promotion
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
