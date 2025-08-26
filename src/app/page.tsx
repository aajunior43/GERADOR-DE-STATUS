'use client';

import React from 'react';
import ImprovedCreator from '@/components/ImprovedCreator';
import SimpleFooter from '@/components/SimpleFooter';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <ImprovedCreator />
      <SimpleFooter />
    </div>
  );
}