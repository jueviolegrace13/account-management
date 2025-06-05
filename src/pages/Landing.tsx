import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Key } from 'lucide-react';
import AuthForm from '../components/auth/AuthForm';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Section */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <Key size={32} className="text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold ml-2">AccountHub</h1>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Manage All Your Accounts in One Place
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Securely store and manage your accounts, set reminders, and collaborate with assistants - all in one powerful platform.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Auth Form */}
          <div className="flex-1 w-full max-w-md">
            <AuthForm />
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Account Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Store and organize all your account credentials securely in one place.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Smart Reminders</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Never miss important dates with our intelligent reminder system.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Team Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Assign accounts to assistants and manage permissions efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;