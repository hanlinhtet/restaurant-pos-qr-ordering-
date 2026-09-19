"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Clock, LayoutGrid, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  const handleGetStarted = () => {
    toast.success("Welcome! Redirecting to your dashboard...");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutGrid className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">POS System</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Documentation</Link>
              <Button onClick={handleGetStarted} asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-16">
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                Manage your restaurant with <br />
                <span className="text-gradient">modern efficiency</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                The enterprise-grade multi-tenant POS system designed for modern food businesses. 
                Scale your operations from one branch to hundreds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-12 px-8 text-lg" onClick={handleGetStarted} asChild>
                  <Link href="/register">
                    Launch App <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                  View Demo
                </Button>
              </div>
            </motion.div>

            {/* Feature Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-8 mt-24 text-left"
            >
              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Tenant Isolation</h3>
                <p className="text-muted-foreground">Secure data separation for every business and branch in your ecosystem.</p>
              </div>
              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-time Analytics</h3>
                <p className="text-muted-foreground">Monitor sales, inventory, and staff performance across all locations instantly.</p>
              </div>
              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Queue System</h3>
                <p className="text-muted-foreground">Optimize kitchen workflow and customer wait times with automated dispatch.</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <LayoutGrid className="text-white w-4 h-4" />
            </div>
            <span className="font-bold">POS System</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Enterprise POS SaaS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
