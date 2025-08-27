'use client';

import React from 'react';
import Link from 'next/link';
import EnhancedHeader from '@/components/EnhancedHeader';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import EnhancedFooter from '@/components/EnhancedFooter';
import ImprovedCreator from '@/components/ImprovedCreator';
import HistorySection from '@/components/HistorySection';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <EnhancedHeader />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <div id="creator-section" className="relative">
          <div className="absolute top-4 right-4 z-50">
            <Link 
              href="/prompt-demo"
              className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-300 text-sm"
            >
              Ver Demonstração do Prompt
            </Link>
          </div>
          <ImprovedCreator />
        </div>
        <HistorySection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      
      <EnhancedFooter />
    </div>
  );
}