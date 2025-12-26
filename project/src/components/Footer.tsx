import { useEffect, useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadPageSettings, PageSettings as FooterPageSettings, createGetSetting } from '../utils/pageSettings';

interface SiteSettings {
  site_name: string;
  footer_text: string;
  contact_email: string;
  contact_phone: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_youtube: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pageSettings, setPageSettings] = useState<FooterPageSettings>({});

  useEffect(() => {
    loadSettings();
    loadFooterSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    if (data) setSettings(data);
  };

  const loadFooterSettings = async () => {
    const data = await loadPageSettings('footer');
    setPageSettings(data);
  };

  const getSetting = createGetSetting(pageSettings);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-primary-400">
              {settings?.site_name || 'Wellness Center'}
            </h3>
            <p className="text-gray-400 mb-4">
              {settings?.footer_text || 'Transform your life through meditation, yoga, and holistic wellness practices.'}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{getSetting('quick_links_heading', 'Quick Links')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-primary-400 transition">Home</a></li>
              <li><a href="/programs" className="hover:text-primary-400 transition">Programs</a></li>
              <li><a href="/articles" className="hover:text-primary-400 transition">Articles</a></li>
              <li><a href="/events" className="hover:text-primary-400 transition">Events</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{getSetting('contact_heading', 'Contact Us')}</h4>
            <div className="space-y-4">
              {settings?.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center space-x-3 text-gray-400 hover:text-primary-400 transition group"
                >
                  <div className="bg-primary-600 p-2 rounded group-hover:bg-primary-500 transition">
                    <Mail size={20} className="text-white" />
                  </div>
                  <span className="break-all">{settings.contact_email}</span>
                </a>
              )}
              {settings?.contact_phone && (
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="flex items-center space-x-3 text-gray-400 hover:text-primary-400 transition group"
                >
                  <div className="bg-primary-600 p-2 rounded group-hover:bg-primary-500 transition">
                    <Phone size={20} className="text-white" />
                  </div>
                  <span>{settings.contact_phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} {settings?.site_name || 'Wellness Center'}. {getSetting('rights_text', 'All rights reserved.')}
          </p>
          <div className="flex space-x-6">
            <p className="text-gray-300 text-sm mr-2">Follow us:</p>
            {settings?.social_facebook && (
              <a
                href={settings.social_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary-400 transition transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
            )}
            {settings?.social_twitter && (
              <a
                href={settings.social_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary-400 transition transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
            )}
            {settings?.social_instagram && (
              <a
                href={settings.social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary-400 transition transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
            )}
            {settings?.social_youtube && (
              <a
                href={settings.social_youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary-400 transition transform hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube size={24} />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
