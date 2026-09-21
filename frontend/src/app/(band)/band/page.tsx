"use client";

import Link from "next/link";
import { Sparkles, Music, Star, ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/shared/HeroSection";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GradientBlob } from "@/components/shared/GradientBlob";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle background glow */}
      <GradientBlob
        className="top-0 left-0 w-[800px] h-[800px] opacity-20 mix-blend-screen"
        colors={["#ff5e8a", "transparent"]}
        intensity="low"
      />
      <GradientBlob
        className="bottom-0 right-0 w-[600px] h-[600px] opacity-20 mix-blend-screen"
        colors={["#ffc3a0", "transparent"]}
        intensity="low"
      />

      {/* Hero Section with Animated Content */}
      <HeroSection
        badge="🚀 The Future of Event Entertainment"
        title="Discover The Next <span>Music Stars</span> On Stage"
        subtitle="Direct bookings with real-time availability, secure escrow payments, and verified reviews. Hire world-class solo musicians and music bands for your corporate gigs, weddings, and private events."
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-3xl">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Link href="/band/marketplace/artists" className="w-full sm:w-auto block">
              <Button
                size="lg"
                className="w-full text-base font-bold h-12 px-6 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white hover:opacity-90 shadow-lg transition-all"
              >
                <Music className="mr-2 h-5 w-5" />
                Explore Bands
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Link href="/band/marketplace/venues" className="w-full sm:w-auto block">
              <Button
                size="lg"
                className="w-full text-base font-bold h-12 px-6 bg-secondary/50 border border-secondary hover:bg-secondary text-foreground shadow-sm transition-all"
              >
                <Globe className="mr-2 h-5 w-5" />
                Find Venues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Link href="/register" className="w-full sm:w-auto block">
              <Button
                size="lg"
                variant="secondary"
                className="w-full text-base font-bold h-12 px-6 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Register as Talent
              </Button>
            </Link>
          </motion.div>
        </div>
      </HeroSection>

      {/* Features Section */}
      <AnimatedSection className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">Why Choose EventHub?</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to book the perfect live band experience
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <AnimatedCard delay={0} className="h-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-card/50 backdrop-blur-md p-8 rounded-3xl text-left h-full border border-primary/20 hover:border-primary/50 group transition-all duration-500 card-3d"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                className="p-4 bg-gradient-to-r from-primary/20 to-brand-gradient-end/20 rounded-2xl w-16 h-16 flex items-center justify-center border border-primary/30 mb-6"
              >
                <Music className="h-7 w-7 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                Diverse Performers
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                From rock bands to jazz quartets, classical ensembles, and custom performance
                configurations tailored to your event.
              </p>
            </motion.div>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="h-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-card/50 backdrop-blur-md p-8 rounded-3xl text-left h-full border border-primary/20 hover:border-primary/50 group transition-all duration-500 card-3d"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                className="p-4 bg-gradient-to-r from-brand-gradient-end/20 to-primary/20 rounded-2xl w-16 h-16 flex items-center justify-center border border-brand-gradient-end/30 mb-6"
              >
                <ShieldCheck className="h-7 w-7 text-brand-gradient-end" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-gradient-end transition-colors">
                Secure Escrow Payouts
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your payments are held securely in escrow and released automatically only after
                successful gig completion.
              </p>
            </motion.div>
          </AnimatedCard>

          <AnimatedCard delay={0.4} className="h-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-card/50 backdrop-blur-md p-8 rounded-3xl text-left h-full border border-primary/20 hover:border-primary/50 group transition-all duration-500 card-3d"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                className="p-4 bg-gradient-to-r from-primary/20 to-brand-gradient-start/20 rounded-2xl w-16 h-16 flex items-center justify-center border border-primary/30 mb-6"
              >
                <Star className="h-7 w-7 text-brand-gradient-start" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-gradient-start transition-colors">
                Verified Ratings
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Read honest reviews from real clients, corporate event managers, and wedding
                organizers.
              </p>
            </motion.div>
          </AnimatedCard>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-card/50 backdrop-blur-md p-8 rounded-2xl text-center border border-primary/20 hover:border-primary/50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-5xl font-black mb-3 text-primary"
            >
              500+
            </motion.div>
            <p className="text-muted-foreground">Professional Bands</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-card/50 backdrop-blur-md p-8 rounded-2xl text-center border border-brand-gradient-end/20 hover:border-brand-gradient-end/50"
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-5xl font-black mb-3 text-brand-gradient-end"
            >
              1000+
            </motion.div>
            <p className="text-muted-foreground">Successful Bookings</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-card/50 backdrop-blur-md p-8 rounded-2xl text-center border border-primary/20 hover:border-primary/50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-5xl font-black mb-3 text-primary"
            >
              4.9★
            </motion.div>
            <p className="text-muted-foreground">Average Rating</p>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Call to Action Section */}
      <AnimatedSection
        className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center"
        direction="up"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-card/50 backdrop-blur-md p-12 md:p-16 rounded-3xl border border-primary/30 hover:border-primary/60 transition-all"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text text-transparent"
          >
            Ready to Find Your Perfect Band?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Browse through our curated selection of talented performers and book your next
            unforgettable event today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/band/marketplace/artists">
              <Button
                size="lg"
                className="text-lg font-bold px-8 py-6 h-auto bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white hover:opacity-90 shadow-xl hover:shadow-2xl transition-all"
              >
                <Zap className="mr-2 h-6 w-6" />
                Start Exploring Now
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Floating elements for visual interest */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="fixed bottom-10 right-10 pointer-events-none z-0 opacity-20"
      >
        <Sparkles className="h-20 w-20 text-primary" />
      </motion.div>
    </div>
  );
}
