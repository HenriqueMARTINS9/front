'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurantLogin, useTestRestaurants } from '@/lib/hooks';
import { useNotification } from '@/lib/useNotification';
import Button from '@/components/Button';
import InputField from '@/components/InputField';

export default function RestaurantLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showTestCredentials, setShowTestCredentials] = useState(false);
    const router = useRouter();
    
    const restaurantLoginMutation = useRestaurantLogin();
    const { data: testRestaurants } = useTestRestaurants();
    const { showSuccess, showError } = useNotification();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await restaurantLoginMutation.mutateAsync({ email, password });
            showSuccess('Connexion réussie ! Bienvenue dans votre espace restaurant.');
            router.push('/home');
        } catch (error: any) {
            const errorMessage = error.message || 'Une erreur est survenue lors de la connexion';
            showError(errorMessage);
        }
    };

    const fillTestCredentials = (restaurantEmail: string, restaurantPassword: string) => {
        setEmail(restaurantEmail);
        setPassword(restaurantPassword);
        setShowTestCredentials(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Connexion Restaurant
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Connectez-vous à votre espace restaurant VirtualSomm
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <InputField
                            type="email"
                            value={email}
                            onChange={setEmail}
                            label="Email du restaurant"
                            placeholder="restaurant@virtualsomm.ch"
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
                            disabled={restaurantLoginMutation.isPending}
                            className="w-full bg-[#7C3AED] text-white hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:ring-offset-2 transition-colors duration-200"
                        >
                            {restaurantLoginMutation.isPending ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Connexion...
                                </div>
                            ) : (
                                'Se connecter'
                            )}
                        </Button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setShowTestCredentials(!showTestCredentials)}
                            className="text-[#7C3AED] hover:text-[#6D28D9] text-sm font-medium"
                        >
                            {showTestCredentials ? 'Masquer' : 'Afficher'} les identifiants de test
                        </button>
                    </div>

                    {showTestCredentials && testRestaurants && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Identifiants de test disponibles :
                            </h3>
                            <div className="space-y-2">
                                {testRestaurants.map((restaurant) => (
                                    <div key={restaurant.id} className="text-xs">
                                        <div className="font-medium text-gray-900">{restaurant.name}</div>
                                        <div className="text-gray-600">
                                            Email: {restaurant.email}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fillTestCredentials(restaurant.email, 'resto123')}
                                            className="text-[#7C3AED] hover:text-[#6D28D9] underline"
                                        >
                                            Utiliser ces identifiants
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                <p>Mot de passe pour tous : <strong>resto123</strong></p>
                                <p className="mt-1">Ou utilisez les mots de passe spécifiques :</p>
                                <ul className="list-disc list-inside ml-2">
                                    <li>Bistrot du Lac : <strong>bistrot456</strong></li>
                                    <li>Café des Arts : <strong>cafe789</strong></li>
                                    <li>Brasserie Moderne : <strong>brasserie012</strong></li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                            Connexion utilisateur standard
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
