import { useLanguage } from '@/hooks/useLanguage';

export function IndianBanner() {
  const { t } = useLanguage();
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-tricolor p-1 shadow-glow mb-8">
      <div className="relative rounded-xl bg-card p-6 md:p-8">
        {/* Decorative patterns */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" />
            <circle cx="50" cy="50" r="15" fill="currentColor" className="text-primary" />
          </svg>
        </div>
        
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" />
            <circle cx="50" cy="50" r="15" fill="currentColor" className="text-secondary" />
          </svg>
        </div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-fresh flex items-center justify-center shadow-glow animate-pulse-glow">
              <span className="text-2xl">🇮🇳</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient-tricolor">
              {t('banner.welcome')}
            </h2>
            <div className="w-12 h-12 rounded-full bg-gradient-fresh flex items-center justify-center shadow-glow animate-pulse-glow">
              <span className="text-2xl">🏪</span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            {t('banner.subtitle')}
          </p>
          
          {/* Decorative dots */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <div className="w-3 h-3 rounded-full bg-card border-2 border-primary"></div>
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
