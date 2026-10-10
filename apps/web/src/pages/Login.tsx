import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserLoginSchema, UserLoginDTO } from '@mehrlink/shared';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserLoginDTO>({
    resolver: zodResolver(UserLoginSchema),
  });

  const onSubmit = async (data: UserLoginDTO) => {
    try {
      setApiError('');
      const res = await apiClient.post('/auth/login', data);
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setApiError(err.response?.data?.error?.message || 'Tizimga kirishda xatolik yuz berdi.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Xush kelibsiz</h1>
        <p className="text-gray-500 mt-2">Davom etish uchun tizimga kiring</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {apiError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{apiError}</div>}
        
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
          disabled={isSubmitting}
          className="w-full bg-brand-forest text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-brand-sage transition-colors disabled:opacity-70"
        >
          {isSubmitting ? 'Kirilmoqda...' : 'Kirish'} <LogIn className="h-4 w-4" />
        </button>
      </form>
      
      <p className="text-center mt-6 text-sm text-gray-600">
        Akkauntingiz yo'qmi? <Link to="/register" className="text-brand-forest font-semibold hover:underline">Ro'yxatdan o'tish</Link>
      </p>
    </div>
  );
};

export default Login;
