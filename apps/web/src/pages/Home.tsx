import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Shield, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const { t } = useLanguage();
  const { data: donations } = useQuery({
    queryKey: ['featuredDonations'],
    queryFn: async () => {
      const res = await apiClient.get('/donations?limit=3');
      return res.data.data.items;
    },
  });

  const { data: requests } = useQuery({
    queryKey: ['featuredRequests'],
    queryFn: async () => {
      const res = await apiClient.get('/assistance-requests?limit=3');
      return res.data.data.items;
    },
  });

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'LOW': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-700';
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div className="space-y-32 pb-16 relative">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-sage rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-forest rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative h-160 rounded-[3rem] overflow-hidden bg-gradient-to-br from-brand-forest via-emerald-900 to-gray-900 text-white shadow-2xl mt-4 border border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/80 to-transparent"></div>
        <div className="relative z-10 px-6 py-32 md:py-40 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight drop-shadow-md">
            {t('home.hero_title')}
          </h1>
          <p className="text-lg md:text-2xl text-brand-sage/90 mb-12 max-w-3xl mx-auto font-medium drop-shadow">
            {t('home.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link to="/donations" className="group bg-white text-brand-forest font-bold px-10 py-5 rounded-full shadow-xl hover:bg-gray-50 hover:scale-105 hover:shadow-2xl transition-all duration-300 flex items-center gap-3">
              {t('home.find_help')} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/requests" className="group bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold px-10 py-5 rounded-full hover:bg-white/20 hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center gap-3">
              {t('home.give_help')} <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-16 px-4 md:px-12 relative z-20">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700/50 text-center transform hover:-translate-y-2 transition-all duration-300 group">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-forest to-emerald-600 dark:from-brand-sage dark:to-emerald-400 mb-2 group-hover:scale-110 transition-transform duration-300">1,200+</div>
          <div className="text-gray-700 dark:text-gray-300 font-semibold text-lg">{t('home.stats_donations')}</div>
          
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700/50 text-center transform hover:-translate-y-2 transition-all duration-300 group">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-forest to-emerald-600 dark:from-brand-sage dark:to-emerald-400 mb-2 group-hover:scale-110 transition-transform duration-300">850+</div>
          <div className="text-gray-700 dark:text-gray-300 font-semibold text-lg">{t('home.stats_families')}</div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/50 dark:border-gray-700/50 text-center transform hover:-translate-y-2 transition-all duration-300 group">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-forest to-emerald-600 dark:from-brand-sage dark:to-emerald-400 mb-2 group-hover:scale-110 transition-transform duration-300">300+</div>
          <div className="text-gray-700 dark:text-gray-300 font-semibold text-lg">{t('home.stats_volunteers')}</div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-brand-forest dark:text-brand-sage font-bold tracking-wider uppercase text-sm">{t('home.how_it_works')}</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-3">Oddiy va Shaffof Tizim</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30 hover:-translate-y-4 hover:shadow-2xl transition-all duration-300 group">
            <div className="bg-white dark:bg-gray-800 w-20 h-20 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md mb-8 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('home.step1_title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{t('home.step1_desc')}</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-10 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30 hover:-translate-y-4 hover:shadow-2xl transition-all duration-300 group">
            <div className="bg-white dark:bg-gray-800 w-20 h-20 rounded-3xl flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-md mb-8 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('home.step2_title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{t('home.step2_desc')}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 hover:-translate-y-4 hover:shadow-2xl transition-all duration-300 group">
            <div className="bg-white dark:bg-gray-800 w-20 h-20 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md mb-8 group-hover:scale-110 transition-transform duration-300">
              <Heart className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('home.step3_title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{t('home.step3_desc')}</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto relative px-4 md:px-0">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{t('home.faq_title')}</h2>
        </div>
        <div className="space-y-4">
          <details className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer transition-colors duration-200">
            <summary className="font-semibold text-lg text-gray-900 dark:text-white marker:content-none flex justify-between items-center">
              {t('home.faq_q1')}
              <span className="text-brand-forest dark:text-brand-sage group-open:rotate-180 transition-transform duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </span>
            </summary>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('home.faq_a1')}
            </p>
          </details>

          <details className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer transition-colors duration-200">
            <summary className="font-semibold text-lg text-gray-900 dark:text-white marker:content-none flex justify-between items-center">
              {t('home.faq_q2')}
              <span className="text-brand-forest dark:text-brand-sage group-open:rotate-180 transition-transform duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </span>
            </summary>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('home.faq_a2')}
            </p>
          </details>

          <details className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer transition-colors duration-200">
            <summary className="font-semibold text-lg text-gray-900 dark:text-white marker:content-none flex justify-between items-center">
              {t('home.faq_q3')}
              <span className="text-brand-forest dark:text-brand-sage group-open:rotate-180 transition-transform duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </span>
            </summary>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('home.faq_a3')}
            </p>
          </details>
        </div>
      </section>

      {/* Featured Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('home.recent_donations')}</h2>
            <Link to="/donations" className="text-brand-forest dark:text-brand-sage font-medium hover:underline">{t('home.view_all')}</Link>
          </div>
          <div className="space-y-4">
            {donations?.map((item: any) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start transition-colors duration-200">
                <div>
                  <h3 className="font-semibold text-lg dark:text-white">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                </div>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs px-3 py-1 rounded-full font-medium">
                  {item.category}
                </span>
              </div>
            ))}
            {!donations && <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-2xl"></div>}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('home.urgent_needs')}</h2>
            <Link to="/requests" className="text-brand-forest dark:text-brand-sage font-medium hover:underline">{t('home.view_all')}</Link>
          </div>
          <div className="space-y-4">
            {requests?.map((req: any) => (
              <div key={req.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start transition-colors duration-200">
                <div>
                  <h3 className="font-semibold text-lg dark:text-white">{req.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{req.description}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getUrgencyStyle(req.urgency)}`}>
                  {t(`requests.urgency.${req.urgency}`) || req.urgency}
                </span>
              </div>
            ))}
            {!requests && <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-2xl"></div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
