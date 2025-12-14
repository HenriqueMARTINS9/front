"use client";
import React, { useState } from 'react';
import { useLogin, useRegister } from '@/lib/hooks';
import { useNotification } from '@/lib/useNotification';
import Button from '../common/Button';
import InputField from '../common/InputField';

export default function LoginForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    
    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const { showSuccess, showError } = useNotification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (isLogin) {
                await loginMutation.mutateAsync({ username, password });
                showSuccess('Connexion réussie !');
            } else {
                await registerMutation.mutateAsync({ username, password, email });
                showSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                setIsLogin(true);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Une erreur est survenue';
            showError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Connexion' : 'Inscription'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isLogin ? 'Connectez-vous à votre compte VirtualSomm' : 'Créez votre compte VirtualSomm'}
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <InputField
                            type="text"
                            value={username}
                            onChange={setUsername}
                            label="Nom d'utilisateur"
                            placeholder="Entrez votre nom d'utilisateur"
                            required
                            colors={{
                                background: 'bg-white',
                                border: 'border-gray-300',
                                text: 'text-gray-900',
                                placeholder: 'placeholder-gray-500',
                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB]',
                                label: 'text-gray-700'
                            }}
                        />
                        
                        {!isLogin && (
                            <InputField
                                type="email"
                                value={email}
                                onChange={setEmail}
                                label="Email"
                                placeholder="Entrez votre email"
                                colors={{
                                    background: 'bg-white',
                                    border: 'border-gray-300',
                                    text: 'text-gray-900',
                                    placeholder: 'placeholder-gray-500',
                                    focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB]',
                                    label: 'text-gray-700'
                                }}
                            />
                        )}
                        
                        <InputField
                            type="password"
                            value={password}
                            onChange={setPassword}
                            label="Mot de passe"
                            placeholder="Entrez votre mot de passe"
                            required
                            colors={{
                                background: 'bg-white',
                                border: 'border-gray-300',
                                text: 'text-gray-900',
                                placeholder: 'placeholder-gray-500',
                                focus: 'focus:outline-none focus:ring-2 focus:ring-[#F4EBFF] focus:border-[#D6BBFB]',
                                label: 'text-gray-700'
                            }}
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={loginMutation.isPending || registerMutation.isPending}
                            className="w-full bg-[#7C3AED] text-white hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:ring-offset-2 transition-colors duration-200"
                        >
                            {loginMutation.isPending || registerMutation.isPending ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {isLogin ? 'Connexion...' : 'Inscription...'}
                                </div>
                            ) : (
                                isLogin ? 'Se connecter' : 'S\'inscrire'
                            )}
                        </Button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#7C3AED] hover:text-[#6D28D9] text-sm font-medium"
                        >
                            {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
