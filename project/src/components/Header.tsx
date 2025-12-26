import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadPageSettings, PageSettings as HeaderPageSettings, createGetSetting } from '../utils/pageSettings';

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  parent_id: string | null;
  children?: NavigationItem[];
}

interface Program {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
}

interface SiteSettings {
  site_name: string;
  tagline: string;
}

interface HeaderProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export default function Header({ onNavigate, currentPath }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pageSettings, setPageSettings] = useState<HeaderPageSettings>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadNavigation();
    loadPrograms();
    loadSettings();
    loadHeaderSettings();
  }, []);

  const loadNavigation = async () => {
    const { data } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (data) {
      const parentItems = data.filter(item => !item.parent_id);
      const navWithChildren = parentItems.map(parent => ({
        ...parent,
        children: data.filter(item => item.parent_id === parent.id)
      }));
      setNavigation(navWithChildren);
    }
  };

  const loadPrograms = async () => {
    const { data } = await supabase
      .from('programs')
      .select('id, title, slug, is_published')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (data) setPrograms(data);
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('site_name, tagline')
      .maybeSingle();
    if (data) setSettings(data);
  };

  const loadHeaderSettings = async () => {
    const data = await loadPageSettings('header');
    setPageSettings(data);
  };

  const getSetting = createGetSetting(pageSettings);

  const handleNavigate = (url: string) => {
    onNavigate(url);
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const isProgramsLink = (url: string) => {
    return url === '/programs' || url.startsWith('/programs');
  };

  const getProgramsChildren = () => {
    // Only show dropdown if there are 2 or more programs
    if (programs.length >= 2) {
      return programs.map(program => ({
        id: program.id,
        label: program.title,
        url: `/programs/${program.slug || program.id}`,
        parent_id: null
      }));
    }
    // Return empty array for 0 or 1 program (no dropdown)
    return [];
  };

  const handleProgramsClick = (url: string) => {
    // If exactly 1 program, go directly to it
    if (programs.length === 1) {
      const singleProgram = programs[0];
      handleNavigate(`/programs/${singleProgram.slug || singleProgram.id}`);
    } else {
      // For 0 programs or multiple programs, go to programs page
      handleNavigate(url);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNavigate('/')}
            className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition"
          >
            {settings?.site_name || 'Wellness Center'}
          </button>

          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const programsChildren = isProgramsLink(item.url) ? getProgramsChildren() : [];
              const hasDropdown = (item.children && item.children.length > 0) || programsChildren.length > 0;

              return (
                <div key={item.id} className="relative group">
                  {hasDropdown ? (
                    <div>
                      <button
                        onClick={() => {
                          if (isProgramsLink(item.url) && programsChildren.length === 0) {
                            handleProgramsClick(item.url);
                          } else {
                            handleNavigate(item.url);
                          }
                        }}
                        className={`flex items-center gap-1 text-gray-700 hover:text-primary-600 transition font-medium ${
                          currentPath === item.url || currentPath.startsWith(item.url) ? 'text-primary-600' : ''
                        }`}
                      >
                        {item.label}
                        <ChevronDown size={16} />
                      </button>
                      {(item.children?.length > 0 || programsChildren.length > 0) && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                          <div className="py-2">
                            {programsChildren.length > 0
                              ? programsChildren.map((child) => (
                                  <button
                                    key={child.id}
                                    onClick={() => handleNavigate(child.url)}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition"
                                  >
                                    {child.label}
                                  </button>
                                ))
                              : item.children?.map((child) => (
                                  <button
                                    key={child.id}
                                    onClick={() => handleNavigate(child.url)}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition"
                                  >
                                    {child.label}
                                  </button>
                                ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (isProgramsLink(item.url)) {
                          handleProgramsClick(item.url);
                        } else {
                          handleNavigate(item.url);
                        }
                      }}
                      className={`text-gray-700 hover:text-primary-600 transition font-medium ${
                        currentPath === item.url ? 'text-primary-600' : ''
                      }`}
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              );
            })}
            <button
              onClick={() => handleNavigate('/admin')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              {getSetting('admin_button', 'Admin')}
            </button>
          </nav>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navigation.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleNavigate(item.url)}
                    className={`flex-1 text-left px-4 py-2 text-gray-700 hover:bg-primary-50 rounded transition ${
                      currentPath === item.url ? 'text-primary-600 bg-primary-50' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                  {item.children && item.children.length > 0 && (
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                      className="px-3 py-2"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>
                {item.children && item.children.length > 0 && openDropdown === item.id && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleNavigate(child.url)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded transition"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => handleNavigate('/admin')}
              className="block w-full text-left px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            >
              {getSetting('admin_button', 'Admin')}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
