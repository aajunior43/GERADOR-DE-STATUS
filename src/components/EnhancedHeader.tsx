'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, Home, Plus, History, Heart, User, Settings, Moon, Sun, MessageCircle } from 'lucide-react';

const EnhancedHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Criar', href: '/#creator-section', icon: Plus },
    { label: 'Histórico', href: '/history', icon: History },
    { label: 'Favoritos', href: '/favorites', icon: Heart },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Aqui você pode adicionar a lógica para mudar o tema
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled 
        ? 'glass-effect border-b border-glass backdrop-blur-xl' 
        : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Aprimorado */}
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative p-3 rounded-2xl bg-gradient-primary shadow-glow-blue transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Sparkles className="h-7 w-7 text-white animate-pulse" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-50 blur-md -z-10"></div>
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-1">
              <h1 className="text-2xl font-bold text-white-pure">
                Status<span className="text-gradient-primary">AI</span>
              </h1>
              <p className="text-xs text-gray-medium tracking-wider uppercase">Creator Studio</p>
            </div>
          </div>

          {/* Desktop Navigation Melhorado */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="group relative flex items-center space-x-2 px-5 py-3 text-gray-light hover:text-white transition-all duration-300 font-medium rounded-2xl hover:bg-white/5 active:scale-95"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative">
                    {item.label}
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary rounded-full transition-all duration-300 group-hover:w-full"></div>
                  </span>
                </a>
              );
            })}
            
            {/* Toggle Modo Escuro Aprimorado */}
            <button
              onClick={toggleDarkMode}
              className="group p-3 rounded-2xl text-gray-light hover:text-white transition-all duration-300 hover:bg-white/5 active:scale-90 relative overflow-hidden"
            >
              <div className="relative z-10">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
            </button>
          </div>

          {/* Mobile Menu Button Aprimorado */}
          <button
            className="md:hidden group relative p-3 rounded-2xl text-gray-light hover:text-white transition-all duration-300 hover:bg-white/10 active:scale-90"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="relative z-10">
              <div className={`transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180 scale-90' : ''}`}>
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
          </button>
        </div>

        {/* Mobile Menu Melhorado */}
        <div
          className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="glass-card m-4 p-6 border border-glass">
            <div className="space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center space-x-4 px-4 py-4 text-gray-light hover:text-white transition-all duration-300 font-medium rounded-xl hover:bg-white/5 active:scale-95"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    <div className="w-2 h-2 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                );
              })}
              
              {/* Divisor */}
              <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              {/* Toggle Modo Escuro Mobile */}
              <button
                onClick={() => {
                  toggleDarkMode();
                  setIsMobileMenuOpen(false);
                }}
                className="group flex items-center space-x-4 w-full px-4 py-4 text-gray-light hover:text-white transition-all duration-300 font-medium rounded-xl hover:bg-white/5 active:scale-95"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </div>
                <span className="flex-1">{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
                <div className="w-2 h-2 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default EnhancedHeader;
