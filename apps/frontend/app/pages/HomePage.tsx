"use client";

import React from "react";
import { Activity, Bell, Shield, Clock, Server, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Activity className="h-16 w-16 text-blue-500 mx-auto mb-8" />
            <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
              Watch Tower
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Monitor your services 24/7 with real-time alerts and detailed analytics. Never miss a downtime again.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold">
                Live Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-gray-800 p-8 rounded-xl">
              <Bell className="h-12 w-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Instant Alerts</h3>
              <p className="text-gray-400">
                Get notified instantly via SMS, email, Slack, or Discord when your services go down.
              </p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl">
              <Shield className="h-12 w-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-semibold mb-4">99.9% Accuracy</h3>
              <p className="text-gray-400">
                Advanced monitoring algorithms ensure accurate detection with minimal false positives.
              </p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl">
              <Clock className="h-12 w-12 text-blue-500 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Historical Data</h3>
              <p className="text-gray-400">
                Access detailed uptime history and performance metrics from multiple locations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">99.99%</div>
              <div className="text-gray-400">Average Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">30s</div>
              <div className="text-gray-400">Alert Response Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">50k+</div>
              <div className="text-gray-400">Websites Monitored</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-gray-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Current Status</h2>
          <div className="space-y-4">
            {['API Endpoints', 'Web Dashboard', 'Notification Service', 'Analytics Engine'].map((service) => (
              <div key={service} className="flex items-center justify-between bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <Server className="h-6 w-6 text-blue-500" />
                  <span className="font-medium">{service}</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span>Operational</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2025 Watch Tower. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
