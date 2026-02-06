import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Building2, Music, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] opacity-60" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-accent/20 blur-[100px] opacity-50" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Building2 className="w-4 h-4" />
            Built exclusively for businesses
          </div>

          {/* Main Headline */}
          <h1 className="animate-fade-in-up [animation-delay:100ms] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            AI-Powered Music
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              That Grows Your Business
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up [animation-delay:200ms] text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            100,000+ curated tracks. Zero unwanted ads. AI-automated playlists tailored to your venue.
            Replace third-party ads with your own promotions and boost revenue by <span className="text-accent font-semibold">+10% monthly</span>.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up [animation-delay:300ms] flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="h-14 px-8 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base border-border/50 hover:bg-card">
              <Play className="mr-2 w-5 h-5" />
              Book a Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="animate-fade-in-up [animation-delay:500ms] mt-16 pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground mb-6">Trusted by 500+ businesses worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              {/* Placeholder brand logos */}
              {["Hotels", "Restaurants", "Retail", "Gyms", "Spas"].map((brand, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="animate-fade-in-up [animation-delay:400ms] mt-20 relative">
          <div className="relative mx-auto max-w-5xl">
            {/* Dashboard Preview */}
            <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
                    app.beatlogicai.com
                  </div>
                </div>
              </div>

              {/* Dashboard Content Preview */}
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Now Playing</h3>
                    <p className="text-sm text-muted-foreground">Downtown Café • Evening Ambient</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-green-500 font-medium">Live</span>
                  </div>
                </div>

                {/* Visualizer */}
                <div className="h-24 md:h-32 flex items-end gap-1 mb-6">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary/80 to-accent/60 rounded-t-sm"
                      style={{
                        height: `${Math.random() * 60 + 20}%`,
                        animationDelay: `${i * 50}ms`
                      }}
                    />
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Tracks Today", value: "127", icon: Music },
                    { label: "Promos Played", value: "24", icon: Building2 },
                    { label: "AI Mix Score", value: "98%", icon: Sparkles }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <stat.icon className="w-5 h-5 text-primary mb-2" />
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Glow effect behind dashboard */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-3xl -z-10 opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
}
