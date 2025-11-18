'use client'

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { 
  Star, 
  Search, 
  TrendingUp, 
  MapPin, 
  Users, 
  BarChart3, 
  Target,
  Globe,
  ArrowRight,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  CheckCircle,
  Eye,
  Zap,
  Menu,
  X
} from "lucide-react"

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Traffic & Market')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = ['Traffic & Market', 'SEO', 'Local', 'Content', 'Social', 'Advertising', 'PR']

  const features = [
    {
      title: "Get Organic Leads",
      description: "Cutrank competitors, Audit site, Dominate AI answers",
      icon: <Target className="h-5 w-5 text-gray-600" />
    },
    {
      title: "Watch the Competition", 
      description: "Traffic sources, keyword tracking, benchmark charts",
      icon: <BarChart3 className="h-5 w-5 text-gray-600" />
    },
    {
      title: "Show Up on Maps",
      description: "Business performance, reviews, local SEO stats", 
      icon: <MapPin className="h-5 w-5 text-gray-600" />
    }
  ]

  const ratings = [
    { name: "Capterra", rating: 4.5 },
    { name: "Crozdesk", rating: 4.7 },
    { name: "G2", rating: 4.6 }
  ]

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white flex items-center justify-center">
                <Image src="/logo.png" alt="logo" width={28} height={28} className="object-contain" />
              </div>
              <span className="ml-2 text-base sm:text-lg font-semibold text-gray-900">MarketingAI</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <a href="#products" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Products</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Pricing</a>
              <a href="#resources" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Resources</a>
              <a href="#company" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Company</a>
              <a href="#app-center" className="text-gray-600 hover:text-gray-900 text-sm font-medium">App Center</a>
            </nav>
            
            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Login</Link>
              <Link href="/signup">
                <Button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 text-sm font-medium rounded-md">
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-3">
                <a href="#products" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-2 hover:bg-gray-50 rounded">Products</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-2 hover:bg-gray-50 rounded">Pricing</a>
                <a href="#resources" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-2 hover:bg-gray-50 rounded">Resources</a>
                <a href="#company" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-2 hover:bg-gray-50 rounded">Company</a>
                <a href="#app-center" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-2 hover:bg-gray-50 rounded">App Center</a>
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link href="/login" className="block text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-2 hover:bg-gray-50 rounded">Login</Link>
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 text-sm font-medium rounded-md">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
                The Leading AI-Powered Marketing Platform
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
                Simple, scalable, and powerful tools for SEO, content, and growth.
              </p>
              
              <div className="max-w-lg mx-auto px-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="url"
                    placeholder="Enter your website URL"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="flex-1 h-11 sm:h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md text-sm sm:text-base"
                  />
                  <Button className="bg-gray-800 hover:bg-gray-900 text-white px-6 sm:px-8 h-11 sm:h-12 rounded-md font-medium text-sm sm:text-base whitespace-nowrap">
                    Get Insights
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Proven Strategies</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-12 sm:mb-16 px-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === tab 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-gray-50 border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex items-start mb-4">
                    <div className="p-2 bg-white rounded-md mr-3 shadow-sm flex-shrink-0">
                      {feature.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Growth Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  The growth engine for Enterprises
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  Automate SEO, forecast ROI, and optimize search strategies at scale.
                </p>
                <Button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-md font-medium text-sm sm:text-base w-full sm:w-auto">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Dashboard Mockup */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-12 sm:h-16 bg-gray-100 rounded"></div>
                    <div className="h-12 sm:h-16 bg-gray-100 rounded"></div>
                    <div className="h-12 sm:h-16 bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-20 sm:h-24 bg-gray-100 rounded"></div>
                  <div className="flex space-x-2">
                    <div className="h-2 bg-gray-200 rounded flex-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ratings Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 lg:gap-16">
              {ratings.map((rating, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(rating.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{rating.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div>
                <blockquote className="text-xl sm:text-2xl font-medium text-gray-900 mb-6 sm:mb-8 leading-relaxed">
                  &quot;This platform changed the trajectory and success of my business. I&apos;m a lifelong user at this point.&quot;
                </blockquote>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">2900%</div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium">traffic growth</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">4x</div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium">revenue increase</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">#1</div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium">Top choice in local area</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center order-first lg:order-last">
                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Your growth starts here
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 leading-relaxed">
              Try our toolkits free for 7 days. Cancel anytime.
            </p>
            <Button className="bg-gray-800 hover:bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-md w-full sm:w-auto">
              Start my free trial
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <Image src="/logo.png" alt="logo" width={24} height={24} />
                <span className="ml-2 text-lg font-semibold">MarketingAI</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The leading AI-powered marketing platform for SEO, content, and growth.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Semrush</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Help</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Community</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Webinars</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 MarketingAI. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}