import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRegistrationSchema, UserRegistrationDTO } from '@mehrlink/shared';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<UserRegistrationDTO>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      role: 'USER' // default value
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: UserRegistrationDTO) => {
    try {
      setApiError('');
      const res = await apiClient.post('/auth/register', data);
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers['retry-after'];
        const seconds = retryAfter ? parseInt(retryAfter, 10) : 30;
        setCooldown(seconds);
        setApiError(`Juda ko‘p urinish. Iltimos, ${seconds} soniyadan keyin qayta urinib ko‘ring.`);
      } else {
        setApiError(err.response?.data?.error?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ro'yxatdan o'tish</h1>
        <p className="text-gray-500 mt-2">MehrLink oilasiga qo'shiling</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{apiError}</div>}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Maqsadingizni tanlang</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue('role', 'VOLUNTEER')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${selectedRole === 'VOLUNTEER' ? 'border-brand-forest bg-brand-forest/5' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="font-semibold text-gray-900 mb-1">Yordam beruvchi</div>
              <div className="text-xs text-gray-500">Ehson qilish yoki kuryerlik qilishni xohlayman</div>
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'USER')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${selectedRole === 'USER' ? 'border-brand-forest bg-brand-forest/5' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="font-semibold text-gray-900 mb-1">Yordam oluvchi</div>
              <div className="text-xs text-gray-500">Moddiy yordam yoki buyumlarga ehtiyojim bor</div>
            </button>
          </div>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
            <input 
              {...register('firstName')} 
              className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-brand-forest focus:border-brand-forest transition-colors"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Familiya</label>
            <input 
              {...register('lastName')} 
              className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-brand-forest focus:border-brand-forest transition-colors"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqam</label>
          <input 
            {...register('phone')} 
            placeholder="+998901234567" 
            className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-brand-forest focus:border-brand-forest transition-colors"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
          <input 
            type="password"
            {...register('password')} 
            className="w-full border-gray-300 rounded-xl px-4 py-3 border focus:ring-brand-forest focus:border-brand-forest transition-colors"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || cooldown > 0}
          className="w-full bg-brand-forest text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-brand-sage transition-colors disabled:opacity-70 mt-4"
        >
          {isSubmitting ? 'Kutilmoqda...' : cooldown > 0 ? `${cooldown} soniya kuting` : "Ro'yxatdan o'tish"} <UserPlus className="h-4 w-4" />
        </button>
      </form>
      
      <p className="text-center mt-6 text-sm text-gray-600">
        Akkauntingiz bormi? <Link to="/login" className="text-brand-forest font-semibold hover:underline">Kirish</Link>
      </p>
    </div>
  );
};

export default Register;
