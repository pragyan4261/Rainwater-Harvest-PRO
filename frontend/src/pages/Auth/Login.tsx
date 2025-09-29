import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {  MailIcon, LockIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch<{ token: string; message?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
        auth: false
      });
      if (data?.token) {
        login(data.token);
        navigate('/dashboard');
      } else {
        setError(data?.message || 'Login failed');
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message); else setError('Login failed');
    }
  };

 const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const handleGoogleLogin = () => {
    window.location.href = `${url}/api/auth/google`;
  };

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  return (
    <MainLayout hideNavbar>
      {/* Background with gradient and animated patterns */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
        </div>

        <div className="relative flex flex-col items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-md">
            {/* Logo and brand section */}
            <div className="text-center mb-8">
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
                RainWise
              </h1>
              <p className="text-gray-600 text-lg">Welcome back to your water conservation journey</p>
            </div>

            {/* Main form card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">Sign in to continue your sustainability journey</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  icon={<MailIcon size={18} />}
                  required
                  value={form.email}
                  onChange={handleChange}
                />
                
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  icon={<LockIcon size={18} />}
                  required
                  value={form.password}
                  onChange={handleChange}
                />

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input 
                      id="remember-me" 
                      name="remember-me" 
                      type="checkbox" 
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2" 
                    />
                    <label htmlFor="remember-me" className="text-sm text-gray-700 font-medium">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="text-red-400 mr-3">⚠️</div>
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Sign in button */}
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  Sign In
                </Button>
              </form>

              {/* Social login divider */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Social login buttons */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    aria-label="Continue with Google"
                    onClick={handleGoogleLogin}
                    className="group relative w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
                    </svg>
                    Google
                  </button>
                  <button 
                    type="button" 
                    aria-label="Continue with Facebook" 
                    className="group relative w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path>
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>
            </div>

            {/* Sign up link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default Login;