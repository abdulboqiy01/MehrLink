import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAssistanceRequestSchema, CreateAssistanceRequestDTO } from '@mehrlink/shared';
import { PlusCircle, Link as LinkIcon, HandHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const AssistanceRequests = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const res = await apiClient.get('/assistance-requests');
      return res.data.data.items;
    },
    enabled: !!user
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(CreateAssistanceRequestSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateAssistanceRequestDTO) => {
      const res = await apiClient.post('/assistance-requests', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      setIsModalOpen(false);
      reset();
    }
  });

  if (!user) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('requests.login_required')}</h2>
      </div>
    );
  }

  const urgencyMap: Record<string, { label: string, color: string }> = {
    LOW: { label: t('requests.urgency.LOW'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
    MEDIUM: { label: t('requests.urgency.MEDIUM'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
    HIGH: { label: t('requests.urgency.HIGH'), color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
    CRITICAL: { label: t('requests.urgency.CRITICAL'), color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  };

  const requestStatusMap: Record<string, { label: string, color: string }> = {
    PENDING: { label: t('dashboard.statuses.PENDING'), color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    REVIEWING: { label: t('requests.statuses.REVIEWING'), color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    APPROVED: { label: t('dashboard.statuses.APPROVED'), color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    IN_PROGRESS: { label: t('requests.statuses.IN_PROGRESS'), color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    RESOLVED: { label: t('requests.statuses.RESOLVED'), color: 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    REJECTED: { label: t('dashboard.statuses.REJECTED'), color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  };

  const displayData = user.role === 'USER' 
    ? data?.filter((item: any) => item.requesterId === user.id)
    : data?.filter((item: any) => item.status === 'PENDING');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.role === 'USER' ? t('requests.my_title') : t('requests.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {user.role === 'USER' ? t('requests.my_subtitle') : t('requests.subtitle')}
          </p>
        </div>
        {(user.role === 'USER' || user.role === 'ADMIN') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-forest text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-brand-sage transition-colors"
          >
            <PlusCircle className="h-5 w-5" /> {t('requests.add_new')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-white dark:bg-gray-800 h-48 rounded-2xl border border-gray-100 dark:border-gray-700"></div>)}
        </div>
      ) : displayData?.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <HandHeart className="h-12 w-12 text-brand-sage mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">{t('requests.not_found')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('requests.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayData?.map((item: any) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors duration-200">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${urgencyMap[item.urgency]?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                {urgencyMap[item.urgency]?.label || item.urgency}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${requestStatusMap[item.status]?.color || 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                {requestStatusMap[item.status]?.label || item.status}
              </span>
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{item.description}</p>
            
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">📍 {item.location}</div>
              {user.role === 'ADMIN' || user.role === 'VOLUNTEER' ? (
                <Link to={`/matches/${item.id}`} className="text-sm bg-brand-sage/10 text-brand-forest dark:text-brand-sage font-medium px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-brand-sage/20 transition-colors">
                  <HandHeart className="h-4 w-4" /> {t('requests.help_button')}
                </Link>
              ) : null}
            </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-8 relative transition-colors duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              &#x2715;
            </button>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{t('requests.modal_title')}</h2>
            <form onSubmit={handleSubmit((d: any) => mutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('requests.form_title')}</label>
                <input {...register('title')} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('requests.form_desc')}</label>
                <textarea {...register('description')} rows={3} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest"></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('requests.form_location')}</label>
                  <input {...register('location')} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest" />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('requests.form_urgency')}</label>
                  <select {...register('urgency')} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest">
                    <option value="LOW">{t('requests.urgency.LOW')}</option>
                    <option value="MEDIUM">{t('requests.urgency.MEDIUM')}</option>
                    <option value="HIGH">{t('requests.urgency.HIGH')}</option>
                    <option value="CRITICAL">{t('requests.urgency.CRITICAL')}</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full bg-brand-forest text-white rounded-xl py-3 font-medium hover:bg-brand-sage transition-colors disabled:opacity-70 mt-4"
              >
                {mutation.isPending ? t('requests.submitting') : t('requests.submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistanceRequests;
