import { CreditCard, Settings, Play, Check } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: CreditCard,
    title: "Sign Up & Subscribe",
    description: "Create your account and choose your plan. No credit card required for the free trial.",
    highlight: "2 minutes"
  },
  {
    number: "02",
    icon: Settings,
    title: "Set Your Preferences",
    description: "Tell us about your venue, select your preferred genres, and set your atmosphere—the AI handles the rest.",
    highlight: "2 minutes"
  },
  {
    number: "03",
    icon: Play,
    title: "Press Play & Forget",
    description: "Your AI-curated music starts playing immediately. No maintenance needed—it runs 24/7 automatically.",
    highlight: "Instant"
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Play className="w-4 h-4" />
            Simple Setup
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Up and Running in
            <br />
            <span className="text-primary">Under 5 Minutes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No technical expertise required. No hardware to install. No IT department needed.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="relative p-8 rounded-2xl bg-card/80 border border-border/50 hover:border-primary/30 transition-all group">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Time Highlight */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium">
                    <Check className="w-4 h-4" />
                    {step.highlight}
                  </div>
                </div>

                {/* Arrow for mobile/tablet */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <div className="w-px h-8 bg-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-16 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-accent/10 border border-border/50 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">No downloads</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">No hardware</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">No maintenance</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">No training needed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
