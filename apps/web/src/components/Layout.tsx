import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Heart, User, LogOut, Menu, Moon, Sun, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const getPageTitle = (pathname: string, lang: 'uz' | 'ru' | 'en') => {
      if (pathname === '/') {
        return lang === 'ru' ? 'Главная' : lang === 'en' ? 'Home' : 'Bosh sahifa';
      }
      if (pathname.startsWith('/donations')) {
        return lang === 'ru' ? 'Пожертвования' : lang === 'en' ? 'Donations' : 'Ehsonlar';
      }
      if (pathname.startsWith('/requests')) {
        return lang === 'ru' ? 'Запросы о помощи' : lang === 'en' ? 'Requests' : "Yordam so'rovlari";
      }
      if (pathname.startsWith('/dashboard')) {
        return lang === 'ru' ? 'Личный кабинет' : lang === 'en' ? 'Dashboard' : 'Shaxsiy kabinet';
      }
      if (pathname.startsWith('/login')) {
        return lang === 'ru' ? 'Вход' : lang === 'en' ? 'Login' : 'Kirish';
      }
      if (pathname.startsWith('/register')) {
        return lang === 'ru' ? 'Регистрация' : lang === 'en' ? 'Register' : "Ro'yxatdan o'tish";
      }
      if (pathname.startsWith('/matches')) {
        return lang === 'ru' ? 'Совпадения' : lang === 'en' ? 'Matches' : 'Mosliklar';
      }
      return '';
    };

    const pageTitle = getPageTitle(location.pathname, language);
    document.title = pageTitle ? `MehrLink — ${pageTitle}` : 'MehrLink';
  }, [location.pathname, language]);

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => 
    `text-sm font-medium transition-colors ${isActive(path) ? 'text-brand-forest' : 'text-gray-600 hover:text-brand-sage'}`;

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-brand-forest fill-brand-forest" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">MehrLink</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {user?.role === 'VOLUNTEER' ? (
              <>
                <Link to="/donations" className={linkClass('/donations')}>{t('nav.donations')}</Link>
                <Link to="/requests" className={linkClass('/requests')}>{t('nav.requests')}</Link>
              </>
            ) : user?.role === 'USER' ? (
              <>
                <Link to="/donations" className={linkClass('/donations')}>{t('nav.donations')}</Link>
                <Link to="/requests" className={linkClass('/requests')}>{t('nav.requests')}</Link>
              </>
            ) : (
              <>
                <Link to="/donations" className={linkClass('/donations')}>{t('nav.donations')}</Link>
                <Link to="/requests" className={linkClass('/requests')}>{t('nav.requests')}</Link>
              </>
            )}
            
            <div className="flex items-center gap-4 border-l pl-4 border-gray-200 dark:border-gray-700">
              <button onClick={toggleTheme} className="text-gray-500 hover:text-brand-forest dark:text-gray-400 dark:hover:text-brand-sage">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <div className="relative group">
                <button className="flex items-center gap-1 text-gray-500 hover:text-brand-forest dark:text-gray-400 dark:hover:text-brand-sage">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm uppercase font-medium">{language}</span>
                </button>
                <div className="absolute right-0 mt-2 w-24 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button onClick={() => setLanguage('uz')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">UZ</button>
                  <button onClick={() => setLanguage('ru')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">RU</button>
                  <button onClick={() => setLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">EN</button>
                </div>
              </div>

              {user ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-brand-forest dark:hover:text-brand-sage">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{user.firstName}</span>
                  </Link>
                  <button onClick={logout} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-forest">{t('nav.login')}</Link>
                  <Link to="/register" className="text-sm font-medium bg-brand-forest text-white px-4 py-2 rounded-full hover:bg-brand-sage transition-colors">{t('nav.register') || "Ro'yxatdan o'tish"}</Link>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4">
            {user?.role === 'VOLUNTEER' ? (
              <>
                <Link to="/donations" className="block text-gray-600 font-medium">Mening e'hsonlarim</Link>
                <Link to="/requests" className="block text-gray-600 font-medium">Yordamga muhtojlar</Link>
              </>
            ) : user?.role === 'USER' ? (
              <>
                <Link to="/donations" className="block text-gray-600 font-medium">Mavjud e'hsonlar</Link>
                <Link to="/requests" className="block text-gray-600 font-medium">Yordam so'rash</Link>
              </>
            ) : (
              <>
                <Link to="/donations" className="block text-gray-600 font-medium">E'hsonlar</Link>
                <Link to="/requests" className="block text-gray-600 font-medium">Yordam so'rash</Link>
              </>
            )}
            {user ? (
              <>
                <Link to="/dashboard" className="block text-gray-600 font-medium">Shaxsiy kabinet</Link>
                <button onClick={logout} className="block text-red-600 font-medium w-full text-left">Chiqish</button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <Link to="/login" className="block text-gray-600 font-medium text-center border rounded-md py-2">Kirish</Link>
                <Link to="/register" className="block bg-brand-forest text-white font-medium text-center rounded-md py-2">Ro'yxatdan o'tish</Link>
              </div>
            )}
          </div>
        )}
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-brand-forest" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">MehrLink</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">Yaxshilikni birga manziliga yetkazamiz.</p>
          <div className="text-sm text-gray-400 dark:text-gray-500">© 2026 Barcha huquqlar himoyalangan.</div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
