import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Bell, CheckSquare, Clock, Inbox, FileText, Star, Heart, Gift } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await apiClient.get('/notifications')).data.data,
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => (await apiClient.get('/tasks')).data.data,
  });

  const { data: claims } = useQuery({
    queryKey: ['claims'],
    queryFn: async () => (await apiClient.get('/claims')).data.data,
  });

  const updateClaimMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/claims/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    }
  });

  const claimStatusMap: Record<string, { label: string, color: string }> = {
    PENDING: { label: t('dashboard.statuses.PENDING'), color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    APPROVED: { label: t('dashboard.statuses.APPROVED'), color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    REJECTED: { label: t('dashboard.statuses.REJECTED'), color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    FULFILLED: { label: t('dashboard.statuses.FULFILLED'), color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
  };

  const myRequests = claims?.filter((c: any) => c.claimerId === user?.id) || [];
  const incomingRequests = claims?.filter((c: any) => c.donation?.donorId === user?.id) || [];

  // Gamification (Karma & Impact)
  const fulfilledClaims = incomingRequests.filter((c: any) => c.status === 'FULFILLED');
  const totalHelped = fulfilledClaims.length;
  const totalItemsDonated = fulfilledClaims.reduce((acc: number, c: any) => acc + (c.quantity || 1), 0);
  const karmaPoints = totalHelped * 50 + totalItemsDonated * 10;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-6 transition-colors duration-200">
        <div className="h-24 w-24 bg-brand-sage/20 rounded-full flex items-center justify-center text-3xl font-bold text-brand-forest dark:text-brand-sage">
          {user?.firstName[0]}{user?.lastName[0]}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.greeting')}, {user?.firstName}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.your_role')}: <span className="font-semibold text-brand-forest dark:text-brand-sage">{user?.role === 'VOLUNTEER' ? t('dashboard.role_volunteer') : user?.role === 'USER' ? t('dashboard.role_user') : user?.role}</span></p>
        </div>
      </div>

      {user?.role === 'VOLUNTEER' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-3xl border border-yellow-100 dark:border-yellow-900/30 flex items-center gap-4 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm text-yellow-500">
              <Star className="h-8 w-8 fill-current" />
            </div>
            <div>
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide">{t('dashboard.stats.karma')}</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{karmaPoints}</h3>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-4 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm text-rose-500">
              <Heart className="h-8 w-8 fill-current" />
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-500 uppercase tracking-wide">{t('dashboard.stats.helped')}</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{totalHelped}</h3>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-sage/10 to-brand-forest/5 dark:from-brand-sage/10 dark:to-brand-forest/10 p-6 rounded-3xl border border-brand-sage/20 flex items-center gap-4 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm text-brand-forest dark:text-brand-sage">
              <Gift className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-forest dark:text-brand-sage uppercase tracking-wide">{t('dashboard.stats.items')}</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{totalItemsDonated}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recipient Dashboard: My Requests */}
        {(user?.role === 'USER' || user?.role === 'ADMIN') && (
          <section className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6 text-brand-forest dark:text-brand-sage" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.my_requests')}</h2>
            </div>
            
            <div className="space-y-4">
              {myRequests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('dashboard.no_requests')}</p>
              ) : (
                myRequests.map((claim: any) => (
                  <div key={claim.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{claim.donation?.title}</h4>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${claimStatusMap[claim.status]?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {claimStatusMap[claim.status]?.label || claim.status}
                      </span>
                    </div>
                    
                    {(claim.status === 'APPROVED' || claim.status === 'FULFILLED') && claim.donation?.donor && (
                      <div className="mt-2 p-3 bg-brand-sage/10 dark:bg-brand-sage/5 rounded-lg border border-brand-sage/20">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                          Bog'lanish uchun (Donor):
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">{claim.donation.donor.firstName} {claim.donation.donor.lastName}</span>
                        </p>
                        <p className="text-sm font-semibold text-brand-forest dark:text-brand-sage mt-0.5">
                          {claim.donation.donor.phone}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" /> {new Date(claim.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Donor Dashboard: Incoming Requests */}
        {(user?.role === 'VOLUNTEER' || user?.role === 'ADMIN') && (
          <section className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-2 mb-6">
              <Inbox className="h-6 w-6 text-brand-forest dark:text-brand-sage" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.incoming_requests')}</h2>
            </div>
            
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('dashboard.no_incoming')}</p>
              ) : (
                incomingRequests.map((claim: any) => (
                  <div key={claim.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-3 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{claim.donation?.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-medium">{t('dashboard.requester')}:</span> {claim.contactName || claim.claimer?.firstName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{t('dashboard.phone')}:</span> {claim.contactPhone || claim.claimer?.phone}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${claimStatusMap[claim.status]?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {claimStatusMap[claim.status]?.label || claim.status}
                      </span>
                    </div>
                    
                    {claim.status === 'PENDING' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateClaimMutation.mutate({ id: claim.id, status: 'APPROVED' })} className="flex-1 bg-brand-forest text-white py-1.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">{t('dashboard.accept')}</button>
                        <button onClick={() => updateClaimMutation.mutate({ id: claim.id, status: 'REJECTED' })} className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">{t('dashboard.reject')}</button>
                      </div>
                    )}
                    {claim.status === 'APPROVED' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateClaimMutation.mutate({ id: claim.id, status: 'CANCELLED' })} className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">{t('dashboard.cancel')}</button>
                        <button onClick={() => updateClaimMutation.mutate({ id: claim.id, status: 'FULFILLED' })} className="flex-1 bg-brand-sage text-white py-1.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors">{t('dashboard.finish')}</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Notifications (Everyone) */}
        <section className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-6 w-6 text-brand-sage" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.notifications')}</h2>
          </div>
          <div className="space-y-4">
            {notifications?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('dashboard.no_notifications')}</p>
            ) : (
              notifications?.map((notif: any) => (
                <div key={notif.id} className={`p-4 rounded-xl border ${notif.isRead ? 'bg-gray-50 border-gray-100 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400' : 'bg-brand-sage/5 border-brand-sage/20 text-gray-900 dark:bg-brand-sage/10 dark:text-gray-200'}`}>
                  <h4 className="font-semibold text-sm mb-1">{notif.title}</h4>
                  <p className="text-sm opacity-90">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
