import {
  Music,
  Sparkles,
  Clock,
  Shield,
  Globe,
  Zap,
  BanIcon,
  Brain
} from "lucide-react";

const features = [
  {
    icon: Music,
    title: "100,000+ Curated Tracks",
    description: "Access a massive library of licensed, high-quality music spanning every genre and mood for any business atmosphere."
  },
  {
    icon: Brain,
    title: "AI-Powered Mixing",
    description: "Our AI creates perfect playlists based on your venue type, time of day, and brand preferences. No manual management needed."
  },
  {
    icon: BanIcon,
    title: "Zero Third-Party Ads",
    description: "Completely eliminate unwanted ads from major streaming platforms. Your customers hear only your music and your messages."
  },
  {
    icon: Clock,
    title: "Fully Automated",
    description: "Set your preferences once and let the AI handle everything. No daily management, no playlist switching, no staff intervention."
  },
  {
    icon: Globe,
    title: "Web-Based Platform",
    description: "No downloads, no installation, no additional hardware. Works on any device with a browser. Set up in under 5 minutes."
  },
  {
    icon: Shield,
    title: "Business-Grade Licensing",
    description: "All music is properly licensed for commercial use. Stay compliant and avoid costly copyright issues."
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "From signup to playing music in minutes. Immediate access after payment with no waiting period or complex onboarding."
  },
  {
    icon: Sparkles,
    title: "Multi-Location Ready",
    description: "Manage all your locations from a single dashboard. Different playlists for different venues, all centrally controlled."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Why BeatLogic.ai
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Everything Your Business Needs,
            <br />
            <span className="text-muted-foreground">Nothing It Doesn't</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete music solution designed specifically for businesses. Replace scattered tools and unreliable streaming services with one intelligent platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
