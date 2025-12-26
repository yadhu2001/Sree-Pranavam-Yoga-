import { useEffect, useState } from 'react';
import {
  Brain, Moon, Heart, Flame, CloudRain, Users,
  Activity, Sparkles, Zap, HeartHandshake, Shield,
  Circle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const iconMap: Record<string, any> = {
  Brain,
  Moon,
  Heart,
  Flame,
  CloudRain,
  Users,
  Activity,
  Sparkles,
  Zap,
  HeartHandshake,
  Shield,
  Circle
};

interface Hero {
  title: string;
  subtitle: string;
  background_image: string;
}

interface Solution {
  id: string;
  title: string;
  icon: string;
  slug: string;
}

interface PageSettings {
  [key: string]: string;
}

interface HeroSectionProps {
  onNavigate?: (path: string) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const [hero, setHero] = useState<Hero | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [settings, setSettings] = useState<PageSettings>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [heroData, solutionsData, settingsData] = await Promise.all([
      supabase
        .from('hero_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .limit(1)
        .maybeSingle(),
      supabase
        .from('solutions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      supabase.from('page_settings').select('key, value').eq('page', 'hero'),
    ]);

    if (heroData.data) setHero(heroData.data);
    if (solutionsData.data) setSolutions(solutionsData.data);
    if (settingsData.data) {
      const settingsMap = settingsData.data.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as PageSettings);
      setSettings(settingsMap);
    }
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Circle;
  };

  const handleSolutionClick = (slug: string) => {
    if (onNavigate) {
      onNavigate(`/solutions/${slug}`);
    }
  };

  if (!hero) return null;

  return (
    <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero.background_image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
          {hero.title}
        </h1>
        <div
          className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto animate-fade-in-delay"
          dangerouslySetInnerHTML={{ __html: hero.subtitle }}
        />

        {solutions.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-white mb-8 animate-fade-in-delay-2">
              {getSetting('solutions_heading', 'Find a solution for...')}
            </h3>

            <div className="relative overflow-hidden">
              <div className="flex gap-4 animate-scroll-slow">
                {[...solutions, ...solutions].map((solution, index) => {
                  const IconComponent = getIconComponent(solution.icon);
                  return (
                    <div
                      key={`${solution.id}-${index}`}
                      onClick={() => handleSolutionClick(solution.slug)}
                      className="flex-shrink-0 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all duration-300 cursor-pointer group border border-white/20"
                    >
                      <IconComponent className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      <span className="text-white text-sm font-medium text-center px-2">
                        {solution.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.2s backwards;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.4s backwards;
        }

        .animate-scroll-slow {
          animation: scroll-slow 30s linear infinite;
        }

        .animate-scroll-slow:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
