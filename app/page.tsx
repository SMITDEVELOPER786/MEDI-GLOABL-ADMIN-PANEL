import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  Users,
  Calendar,
  Package,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Globe,
  Award,
  Lock,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
                  MediGlobal
                </span>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">
                  Healthcare Platform
                </p>
              </div>
            </div>
           
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6">
        <section className="py-12 sm:py-16 md:py-24 text-center">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
                <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Enterprise-Grade Healthcare Management</span>
                <span className="sm:hidden">Healthcare Management</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground font-[family-name:var(--font-heading)] leading-tight">
                MediGlobal
                <span className="block text-accent mt-1 sm:mt-2">Admin Dashboard</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-[family-name:var(--font-body)]">
                The world`s most advanced healthcare platform management system. Streamline operations, ensure
                compliance, and deliver exceptional patient care.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm">
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-card border border-border rounded-lg px-2 sm:px-4 py-2 sm:py-3">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                <span className="font-medium text-foreground">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-card border border-border rounded-lg px-2 sm:px-4 py-2 sm:py-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1" />
                <span className="font-medium text-foreground">99.99% Uptime</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-card border border-border rounded-lg px-2 sm:px-4 py-2 sm:py-3">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-chart-3" />
                <span className="font-medium text-foreground">Global</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 bg-card border border-border rounded-lg px-2 sm:px-4 py-2 sm:py-3">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2" />
                <span className="font-medium text-foreground">24/7 Support</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 sm:py-16 md:py-20">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)] mb-4 sm:mb-6">
              Comprehensive Platform Management
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage your healthcare platform with enterprise-grade security, compliance, and
              performance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            <Card className="border border-border bg-card hover:shadow-2xl hover:border-accent/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                <div className="mx-auto mb-4 sm:mb-6 p-3 sm:p-4 bg-accent/10 rounded-2xl w-fit group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg">
                  Advanced user registration approval system with detailed profile reviews, role-based access controls,
                  and comprehensive audit trails
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card hover:shadow-2xl hover:border-chart-1/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                <div className="mx-auto mb-4 sm:mb-6 p-3 sm:p-4 bg-chart-1/10 rounded-2xl w-fit group-hover:bg-chart-1/20 group-hover:scale-110 transition-all duration-300">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-chart-1" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
                  Smart Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg">
                  AI-powered consultation booking system with real-time availability, automated reminders, and
                  intelligent resource optimization
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card hover:shadow-2xl hover:border-chart-3/20 transition-all duration-500 group relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                <div className="mx-auto mb-4 sm:mb-6 p-3 sm:p-4 bg-chart-3/10 rounded-2xl w-fit group-hover:bg-chart-3/20 group-hover:scale-110 transition-all duration-300">
                  <Package className="h-8 w-8 sm:h-10 sm:w-10 text-chart-3" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
                  Device Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg">
                  Comprehensive medical device management with supplier verification, quality assurance workflows, and
                  compliance tracking
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 sm:py-20 md:py-24">
          <div className="max-w-3xl mx-auto">
            <Card className="border border-border bg-card shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-chart-1/10" />
              <CardHeader className="text-center pb-6 sm:pb-8 relative z-10">
                <div className="mx-auto mb-6 sm:mb-8 p-4 sm:p-6 bg-accent/10 rounded-3xl w-fit">
                  <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-accent" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[family-name:var(--font-heading)] mb-4">
                  Ready to Transform Healthcare?
                </CardTitle>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Join thousands of healthcare professionals who trust MediGlobal for their platform management needs
                </p>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 relative z-10">
                <Link href="/admin" className="block">
                  <Button
                    className="w-full h-12 sm:h-16 text-base sm:text-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                    size="lg"
                  >
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-4" />
                    <span className="hidden sm:inline">Access Admin Dashboard</span>
                    <span className="sm:hidden">Admin Dashboard</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>


              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-16 sm:mt-20 md:mt-24">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-bold text-foreground font-[family-name:var(--font-heading)]">
                  MediGlobal
                </span>
                <p className="text-xs sm:text-sm text-muted-foreground">Healthcare Platform</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              © 2024 MediGlobal. Transforming healthcare through innovative platform management.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link href="#" className="hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                Security
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
