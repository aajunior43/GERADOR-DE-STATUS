'use client';

import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { Sparkles, Zap, Shield, Star } from 'lucide-react';

// Dynamic imports for better performance
const ImprovedCreator = dynamic(() => import('@/components/ImprovedCreator'), {
  loading: () => <CreatorSkeleton />,
  ssr: false,
});

const SimpleFooter = dynamic(() => import('@/components/SimpleFooter'), {
  loading: () => <FooterSkeleton />,
});

// Loading skeletons
const CreatorSkeleton = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-luxury mx-auto mb-4"></div>
      <p className="text-gray-light">Carregando criador de status...</p>
    </div>
  </div>
);

const FooterSkeleton = () => (
  <div className="h-20 bg-black-carbon animate-pulse"></div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <Shield className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white-pure mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-gray-light mb-4">
              Encontramos um problema inesperado. Por favor, recarregue a página ou tente novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gold-luxury text-black-deep px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Features section component
const FeaturesSection = () => (
  <section className="py-16 bg-gradient-to-b from-black to-gray-900">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white-pure mb-4">
          Por que escolher o StatusAI Creator?
        </h2>
        <p className="text-gray-light max-w-2xl mx-auto">
          Transforme suas ideias em status profissionais com tecnologia de IA avançada
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 glass-effect rounded-lg">
          <div className="mb-4">
            <Sparkles className="h-12 w-12 text-gold-luxury mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-white-pure mb-2">
            IA Inteligente
          </h3>
          <p className="text-gray-light">
            Tecnologia Gemini avançada para criar conteúdo único e inspirador
          </p>
        </div>
        
        <div className="text-center p-6 glass-effect rounded-lg">
          <div className="mb-4">
            <Zap className="h-12 w-12 text-gold-luxury mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-white-pure mb-2">
            Rápido e Fácil
          </h3>
          <p className="text-gray-light">
            Gere status profissionais em segundos com apenas alguns cliques
          </p>
        </div>
        
        <div className="text-center p-6 glass-effect rounded-lg">
          <div className="mb-4">
            <Star className="h-12 w-12 text-gold-luxury mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-white-pure mb-2">
            Design Profissional
          </h3>
          <p className="text-gray-light">
            Múltiplos estilos e formatos para todos os tipos de conteúdo
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        {/* Main content */}
        <Suspense fallback={<CreatorSkeleton />}>
          <ImprovedCreator />
        </Suspense>
        
        {/* Features section */}
        <FeaturesSection />
        
        {/* Footer */}
        <Suspense fallback={<FooterSkeleton />}>
          <SimpleFooter />
        </Suspense>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'transparent',
              padding: 0,
              margin: 0,
              boxShadow: 'none',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}