import { useEffect, useState } from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import HeroSection from '../components/HeroSection';

interface Program {
  id: string;
  title: string;
  description: string;
  image_url: string;
  level: string;
  duration: string;
}

interface Testimonial {
  id: string;
  name: string;
  title: string;
  content: string;
  image_url: string;
  rating: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FeatureSection {
  id: string;
  title: string;
  message: string;
  image_url: string;
  button_text: string;
  button_url: string;
}

interface PageSettings {
  [key: string]: string;
}

interface HomeProps {
  onNavigate: (path: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [featureSections, setFeatureSections] = useState<FeatureSection[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [settings, setSettings] = useState<PageSettings>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [programsData, testimonialsData, faqsData, featuresData, settingsData] = await Promise.all([
      supabase.from('programs').select('*').eq('is_published', true).eq('is_featured', true).limit(3),
      supabase.from('testimonials').select('*').eq('is_published', true).eq('is_featured', true).limit(3),
      supabase.from('faqs').select('*').eq('is_published', true).order('sort_order').limit(5),
      supabase.from('feature_sections').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('page_settings').select('key, value').eq('page', 'home'),
    ]);

    if (programsData.data) setPrograms(programsData.data);
    if (testimonialsData.data) setTestimonials(testimonialsData.data);
    if (faqsData.data) setFaqs(faqsData.data);
    if (featuresData.data) setFeatureSections(featuresData.data);
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

  return (
    <div className="min-h-screen">
      <HeroSection onNavigate={onNavigate} />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">{getSetting('featured_programs_heading', 'Featured Programs')}</h2>
          <p className="text-center text-gray-600 mb-12">{getSetting('featured_programs_subheading', 'Transform your life with our expertly designed programs')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div key={program.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                <img src={program.image_url} alt={program.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                      {program.level}
                    </span>
                    <span className="text-xs text-gray-500">{program.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                  <div
                    className="text-gray-600 mb-4"
                    dangerouslySetInnerHTML={{ __html: program.description }}
                  />
                  <button
                    onClick={() => onNavigate(`/programs/${program.id}`)}
                    className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center"
                  >
                    {getSetting('learn_more_button', 'Learn More')} <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate('/programs')}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              {getSetting('view_all_programs_button', 'View All Programs')}
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">{getSetting('testimonials_heading', 'What Our Students Say')}</h2>
          <p className="text-center text-gray-600 mb-12">{getSetting('testimonials_subheading', 'Real transformations from real people')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image_url}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <div
                  className="text-gray-700 italic"
                  dangerouslySetInnerHTML={{ __html: `&ldquo;${testimonial.content}&rdquo;` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {featureSections.map((feature) => (
        <section key={feature.id} className="py-16 bg-gradient-to-r from-primary-50 to-primary-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <img
                  src={feature.image_url}
                  alt={feature.title}
                  className="rounded-lg shadow-2xl w-full h-auto object-cover"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">{feature.title}</h2>
                <div
                  className="text-lg text-gray-700 mb-8 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: feature.message }}
                />
                {feature.button_text && feature.button_url && (
                  <button
                    onClick={() => onNavigate(feature.button_url)}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition text-lg font-semibold inline-flex items-center gap-2"
                  >
                    {feature.button_text}
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-4">{getSetting('faqs_heading', 'Frequently Asked Questions')}</h2>
          <p className="text-center text-gray-600 mb-12">{getSetting('faqs_subheading', 'Get answers to common questions')}</p>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left font-semibold flex justify-between items-center hover:bg-gray-50 transition"
                >
                  {faq.question}
                  <ChevronRight
                    className={`transform transition ${openFaq === faq.id ? 'rotate-90' : ''}`}
                  />
                </button>
                {openFaq === faq.id && (
                  <div
                    className="px-6 py-4 bg-gray-50 border-t text-gray-700"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
