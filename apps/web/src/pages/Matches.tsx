import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ArrowLeft, CheckCircle2, Info, User, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Matches = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', id],
    queryFn: async () => {
      const res = await apiClient.get(`/matches/${id}`);
      return res.data.data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (donationId: string) => {
      const res = await apiClient.post('/matches/confirm', { assistanceRequestId: id, donationId });
      return res.data;
    },
    onSuccess: () => {
      alert("Muvaffaqiyatli bog'landi! Yordamingiz uchun tashakkur.");
      navigate('/dashboard');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error?.message || 'Xatolik yuz berdi');
    }
  });

  if (isLoading) {
    return <div className="text-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-forest mx-auto"></div></div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-500 font-medium">Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/requests" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tavsiya etilgan yechimlar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Ushbu yordam so'roviga mos kelishi mumkin bo'lgan ehsonlar</p>
        </div>
      </div>

      {data?.request?.requester && (
        <div className="bg-brand-sage/10 dark:bg-brand-sage/5 border border-brand-sage/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Yordam so'rovchi ma'lumotlari:</h2>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-4">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm">
                  <User className="h-5 w-5 text-brand-forest dark:text-brand-sage" />
                </div>
                {data.request.requester.firstName} {data.request.requester.lastName}
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm">
                  <Phone className="h-5 w-5 text-brand-forest dark:text-brand-sage" />
                </div>
                {data.request.requester.phone}
              </div>
            </div>
          </div>
        </div>
      )}

      {data?.matches?.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Info className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Mos keluvchi ehsonlar topilmadi</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.matches?.map((match: any) => (
            <div key={match.donation.id} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">{match.donation.title}</h3>
                  <span className="bg-brand-sage/10 text-brand-forest dark:text-brand-sage text-xs font-semibold px-2.5 py-1 rounded-full">
                    {match.donation.category}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{match.donation.description}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Nima uchun mos?</h4>
                  <ul className="space-y-2">
                    {match.explanations.map((expl: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-4 w-4 text-brand-sage mt-0.5 shrink-0" />
                        <span>{expl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl md:w-64 flex flex-col items-center justify-center shrink-0 border border-gray-100 dark:border-gray-600 w-full md:w-auto">
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Moslik darajasi</div>
                <div className="text-5xl font-black text-brand-forest dark:text-brand-sage mb-4">{match.score}%</div>
                
                <button 
                  onClick={() => confirmMutation.mutate(match.donation.id)}
                  disabled={confirmMutation.isPending}
                  className="w-full bg-brand-forest text-white font-medium py-3 rounded-xl hover:bg-brand-sage transition-colors disabled:opacity-50"
                >
                  {confirmMutation.isPending ? 'Kuting...' : "Tasdiqlash va Bog'lash"}
                </button>
                <div className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                  Ushbu yordam so'rovini qondirish uchun o'z ehsoningizni taklif qilyapsiz.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
