import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateDonationSchema, CreateDonationDTO } from '@mehrlink/shared';
import { PlusCircle, Search, Gift } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Donations = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['donations', categoryFilter],
    queryFn: async () => {
      const res = await apiClient.get('/donations', { params: { category: categoryFilter || undefined } });
      return res.data.data.items;
    },
    enabled: !!user // Needs auth
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(CreateDonationSchema),
  });

  const { register: registerClaim, handleSubmit: handleSubmitClaim, reset: resetClaim, formState: { errors: claimErrors } } = useForm<any>();

  const mutation = useMutation({
    mutationFn: async (data: CreateDonationDTO) => {
      const res = await apiClient.post('/donations', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      setIsModalOpen(false);
      reset();
    }
  });

  const claimMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/claims', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      setClaimModalOpen(false);
      resetClaim();
      alert(t('donations.claim_success'));
    },
    onError: (err: any) => {
      alert(err.response?.data?.error?.message || 'Xatolik yuz berdi');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/donations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    }
  });

  const openClaimModal = (donation: any) => {
    setSelectedDonation(donation);
    resetClaim({
      donationId: donation.id,
      quantity: 1,
      contactName: user ? `${user.firstName} ${user.lastName}` : '',
      contactPhone: user?.phone || ''
    });
    setClaimModalOpen(true);
  };
  if (!user) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('donations.login_required')}</h2>
      </div>
    );
  }

  const donationStatusMap: Record<string, { label: string, color: string }> = {
    PENDING: { label: t('dashboard.statuses.PENDING'), color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    ACCEPTED: { label: t('dashboard.statuses.ACCEPTED'), color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    ASSIGNED_TO_VOLUNTEER: { label: 'Kuryer biriktirilgan', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    DELIVERED: { label: 'Yetkazildi', color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    COMPLETED: { label: t('dashboard.statuses.COMPLETED'), color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    CANCELLED: { label: t('dashboard.statuses.CANCELLED'), color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  };

  const displayData = user.role === 'VOLUNTEER' 
    ? data?.filter((item: any) => item.donorId === user.id) 
    : data?.filter((item: any) => item.status === 'PENDING');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.role === 'VOLUNTEER' ? t('donations.my_title') : t('donations.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {user.role === 'VOLUNTEER' ? t('donations.my_subtitle') : t('donations.subtitle')}
          </p>
        </div>
        {(user.role === 'VOLUNTEER' || user.role === 'ADMIN') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-forest text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-brand-sage transition-colors"
          >
            <PlusCircle className="h-5 w-5" /> {t('donations.add_new')}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 transition-colors duration-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder={t('donations.search')} 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl border focus:ring-brand-forest focus:border-brand-forest"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse bg-white dark:bg-gray-800 h-48 rounded-2xl border border-gray-100 dark:border-gray-700"></div>)}
        </div>
      ) : displayData?.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <Gift className="h-12 w-12 text-brand-sage mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">{t('donations.not_found')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('donations.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayData?.map((item: any) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-green-50 dark:bg-green-900/30 text-brand-forest dark:text-brand-sage text-xs font-semibold px-2.5 py-1 rounded-full">
                  {item.category}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${donationStatusMap[item.status]?.color || 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {donationStatusMap[item.status]?.label || item.status}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-3">{item.description}</p>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm mb-4">
                <div className="text-gray-500 dark:text-gray-400 font-medium">{t('donations.quantity')}: <span className="text-gray-900 dark:text-white">{item.quantity}</span></div>
                <div className="text-gray-400 dark:text-gray-500 text-xs">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {item.donorId !== user.id && item.status === 'PENDING' && item.quantity > 0 && (
                <button 
                  onClick={() => openClaimModal(item)}
                  className="mt-auto w-full bg-brand-sage/10 text-brand-forest dark:text-brand-sage font-medium py-2 rounded-xl hover:bg-brand-sage/20 transition-colors"
                >
                  {t('donations.get_button')}
                </button>
              )}
              {item.donorId === user.id && item.status === 'PENDING' && (
                <button 
                  onClick={() => {
                    if (window.confirm(t('dashboard.cancel') + '?')) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="mt-auto w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  {t('dashboard.cancel')}
                </button>
              )}
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
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{t('donations.modal_title')}</h2>
            <form onSubmit={handleSubmit((d: any) => mutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('donations.form_title')}</label>
                <input {...register('title')} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('donations.form_desc')}</label>
                <textarea {...register('description')} rows={3} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest"></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('donations.form_category')}</label>
                  <input {...register('category')} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest" />
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('donations.form_quantity')}</label>
                  <input type="number" {...register('quantity', { valueAsNumber: true })} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest" />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message as string}</p>}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full bg-brand-forest text-white rounded-xl py-3 font-medium hover:bg-brand-sage transition-colors disabled:opacity-70 mt-4"
              >
                {mutation.isPending ? t('donations.submitting') : t('donations.submit')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {claimModalOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-8 relative transition-colors duration-200">
            <button onClick={() => setClaimModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              &#x2715;
            </button>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">{t('donations.claim_modal_title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">"{selectedDonation.title}" {t('donations.claim_modal_desc')}</p>
            <form onSubmit={handleSubmitClaim((d: any) => claimMutation.mutate(d))} className="space-y-4">
              <input type="hidden" {...registerClaim('donationId')} />
              <input type="hidden" {...registerClaim('quantity', { valueAsNumber: true })} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('donations.claim_name')}</label>
                <input {...registerClaim('contactName')} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest" />
                {claimErrors.contactName && <p className="text-red-500 text-xs mt-1">{claimErrors.contactName.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('donations.claim_phone')}</label>
                <input {...registerClaim('contactPhone')} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest" />
                {claimErrors.contactPhone && <p className="text-red-500 text-xs mt-1">{claimErrors.contactPhone.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('donations.claim_reason')}</label>
                <textarea {...registerClaim('reason')} rows={2} className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2 border focus:ring-brand-forest"></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={claimMutation.isPending}
                className="w-full bg-brand-forest text-white rounded-xl py-3 font-medium hover:bg-brand-sage transition-colors disabled:opacity-70 mt-4"
              >
                {claimMutation.isPending ? t('donations.claim_submitting') : t('donations.claim_submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;
