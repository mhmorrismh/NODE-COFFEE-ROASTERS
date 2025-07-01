import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { Button } from "~/components/ui/button";

import { Badge } from "~/components/ui/badge";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/my-app";
import { Link } from "react-router";
import { Node } from "~/components/logos";
import { ChatModal } from "~/components/ui/chat-modal";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My App - Premium Features | React Starter Kit" },
    { name: "description", content: "Access your premium application features and tools." },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const subscriptionData = await fetchQuery(api.subscriptions.checkUserSubscriptionStatus, {
    userId,
  }).catch((error) => {
    console.error("Failed to fetch subscription data:", error);
    return null;
  });

  // Redirect if user doesn't have active subscription
  if (!subscriptionData?.hasActiveSubscription) {
    throw new Response("Subscription Required", { status: 403 });
  }

  return {
    hasActiveSubscription: subscriptionData.hasActiveSubscription,
  };
}

export default function MyApp({ loaderData }: Route.ComponentProps) {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Node />
              </Link>
              <Badge variant="secondary" className="ml-3">
                Premium
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/">Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Coffee Analysis Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-stone-200 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-8">
              Discover Your Coffee's Story
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Simply snap a photo of your coffee package and get expert tasting notes, flavor profiles, and brewing recommendations instantly.
            </p>
            
            {/* Main Action Button */}
            <div className="mb-8">
              <Button 
                size="lg" 
                className="px-12 py-6 text-lg font-semibold bg-slate-700 hover:bg-slate-800 text-slate-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setIsChatModalOpen(true)}
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Analyze Coffee
              </Button>
            </div>
            
            {/* Bottom Text */}
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Works with any coffee packages or bags in store
            </p>
          </div>
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              Understand the Story
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Get detailed insights about your coffee on all our products
            </p>Get your analysis now
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Flavor Profile</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Detailed breakdown of tasting notes and flavor characteristics</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Brewing Guide</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Personalized brewing recommendations for optimal extraction</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Origin Story</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Learn about the coffee's origin, processing, and roasting details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatModalOpen} 
        onClose={() => setIsChatModalOpen(false)} 
      />
    </div>
  );
} 