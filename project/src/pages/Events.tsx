import { useEffect, useState } from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadPageSettings, PageSettings, createGetSetting } from '../utils/pageSettings';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  end_date: string | null;
  image_url: string;
  registration_url: string;
  is_featured: boolean;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [settings, setSettings] = useState<PageSettings>({});

  useEffect(() => {
    loadEvents();
    loadSettings();
  }, []);

  const loadEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .order('event_date', { ascending: true });
    if (data) setEvents(data);
  };

  const loadSettings = async () => {
    const data = await loadPageSettings('events');
    setSettings(data);
  };

  const getSetting = createGetSetting(settings);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{getSetting('page_heading', 'Upcoming Events')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getSetting('page_subheading', 'Join us for transformative workshops, retreats, and celebrations')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition ${
                event.is_featured ? 'lg:col-span-2' : ''
              }`}
            >
              <div className={`grid ${event.is_featured ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                <img
                  src={event.image_url}
                  alt={event.title}
                  className={`w-full ${event.is_featured ? 'h-full' : 'h-64'} object-cover`}
                />
                <div className="p-6">
                  {event.is_featured && (
                    <span className="inline-block text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-full mb-3">
                      {getSetting('featured_badge', 'Featured Event')}
                    </span>
                  )}
                  {isUpcoming(event.event_date) && (
                    <span className="inline-block text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full mb-3 ml-2">
                      {getSetting('upcoming_badge', 'Upcoming')}
                    </span>
                  )}
                  <h3 className={`font-bold mb-3 ${event.is_featured ? 'text-3xl' : 'text-2xl'}`}>
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-gray-600">
                      <Calendar size={20} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{formatDate(event.event_date)}</p>
                        {event.end_date && <p className="text-sm">to {formatDate(event.end_date)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={20} className="flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div
                    className="text-gray-700 mb-6"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                  {event.registration_url && (
                    <a
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                    >
                      {getSetting('register_button', 'Register Now')} <ExternalLink size={18} className="ml-2" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">{getSetting('no_events_message', 'No upcoming events at this time. Check back soon!')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
