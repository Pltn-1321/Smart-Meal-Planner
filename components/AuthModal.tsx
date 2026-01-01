import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

type AuthView = 'login' | 'register' | 'forgot-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const handleClose = () => {
    setCurrentView('login'); // Reset to login view when closing
    onClose();
  };

  const switchToLogin = () => setCurrentView('login');
  const switchToRegister = () => setCurrentView('register');
  const switchToForgotPassword = () => setCurrentView('forgot-password');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-semibold text-stone-900">Authentification</h1>
              <p className="text-xs text-stone-500">
                {currentView === 'login' && 'Connectez-vous à votre compte'}
                {currentView === 'register' && 'Créez votre nouveau compte'}
                {currentView === 'forgot-password' && 'Récupérez votre accès'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentView === 'login' && (
            <LoginForm
              onSwitchToRegister={switchToRegister}
              onSwitchToForgotPassword={switchToForgotPassword}
              onClose={handleClose}
            />
          )}

          {currentView === 'register' && (
            <RegisterForm
              onSwitchToLogin={switchToLogin}
              onClose={handleClose}
            />
          )}

          {currentView === 'forgot-password' && (
            <ForgotPasswordForm
              onSwitchToLogin={switchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
}
