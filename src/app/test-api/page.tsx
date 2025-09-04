"use client";
import React, { useState } from 'react';
import { useQuestions, useUserInfo, useWineRecommendations, useFoods } from '@/lib/hooks';
import { useNotification } from '@/lib/useNotification';
import LoginForm from '@/components/LoginForm';
import Button from '@/components/Button';
import Notification from '@/components/Notification';

export default function TestApiPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { notifications, showSuccess, showError, removeNotification } = useNotification();
    
    // Vérifier si l'utilisateur est connecté
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            setIsAuthenticated(!!token);
        }
    }, []);

    // Hooks pour tester l'API
    const { data: userInfo, isLoading: userLoading, error: userError } = useUserInfo();
    const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuestions();
    const { data: recommendations, isLoading: recLoading, error: recError } = useWineRecommendations();
    const { data: foods, isLoading: foodsLoading, error: foodsError } = useFoods();

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
        }
        setIsAuthenticated(false);
        showSuccess('Déconnexion réussie');
    };

    const handleTestConnection = async () => {
        try {
            const response = await fetch('http://vps.virtualsomm.ch:8081/questions');
            if (response.ok) {
                showSuccess('Connexion à l\'API réussie !');
            } else {
                showError(`Erreur de connexion: ${response.status}`);
            }
        } catch (error) {
            showError('Erreur de connexion à l\'API');
        }
    };

    if (!isAuthenticated) {
        return (
            <div>
                <LoginForm />
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        type={notification.type}
                        message={notification.message}
                        isVisible={true}
                        onClose={() => removeNotification(notification.id)}
                        duration={notification.duration}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Test de l'API VirtualSomm</h1>
                        <Button
                            onClick={handleLogout}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Déconnexion
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Test de connexion */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">Test de connexion</h3>
                            <Button
                                onClick={handleTestConnection}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Tester la connexion
                            </Button>
                        </div>

                        {/* Informations utilisateur */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-green-900 mb-2">Informations utilisateur</h3>
                            {userLoading ? (
                                <p className="text-green-700">Chargement...</p>
                            ) : userError ? (
                                <p className="text-red-600">Erreur: {userError.message}</p>
                            ) : (
                                <div className="text-green-700">
                                    <p><strong>Username:</strong> {userInfo?.username}</p>
                                    <p><strong>Email:</strong> {userInfo?.email || 'Non spécifié'}</p>
                                </div>
                            )}
                        </div>

                        {/* Questions */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-purple-900 mb-2">Questions</h3>
                            {questionsLoading ? (
                                <p className="text-purple-700">Chargement...</p>
                            ) : questionsError ? (
                                <p className="text-red-600">Erreur: {questionsError.message}</p>
                            ) : (
                                <div className="text-purple-700">
                                    <p><strong>Nombre de questions:</strong> {questions?.length || 0}</p>
                                    {questions && questions.length > 0 && (
                                        <p><strong>Première question:</strong> {questions[0].title.fr || questions[0].title.en}</p>
                                    )}
                                </div>
                            )}
                        </div>

                                                 {/* Recommandations */}
                         <div className="bg-orange-50 p-4 rounded-lg">
                             <h3 className="font-semibold text-orange-900 mb-2">Recommandations de vins</h3>
                             {recLoading ? (
                                 <p className="text-orange-700">Chargement...</p>
                             ) : recError ? (
                                 <p className="text-red-600">Erreur: {recError.message}</p>
                             ) : (
                                 <div className="text-orange-700">
                                     <p><strong>Nombre de recommandations:</strong> {recommendations?.length || 0}</p>
                                     {recommendations && recommendations.length > 0 && (
                                         <p><strong>Meilleur vin:</strong> {recommendations[0].name}</p>
                                     )}
                                 </div>
                             )}
                         </div>

                         {/* Aliments */}
                         <div className="bg-yellow-50 p-4 rounded-lg">
                             <h3 className="font-semibold text-yellow-900 mb-2">Aliments</h3>
                             {foodsLoading ? (
                                 <p className="text-yellow-700">Chargement...</p>
                             ) : foodsError ? (
                                 <p className="text-red-600">Erreur: {foodsError.message}</p>
                             ) : (
                                 <div className="text-yellow-700">
                                     <p><strong>Nombre de catégories d'aliments:</strong> {foods ? Object.keys(foods).length : 0}</p>
                                     {foods && Object.keys(foods).length > 0 && (
                                         <p><strong>Première catégorie:</strong> {Object.keys(foods)[0]}</p>
                                     )}
                                 </div>
                             )}
                         </div>
                    </div>
                </div>

                {/* Affichage des données brutes */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Données brutes de l'API</h2>
                    
                    <div className="space-y-6">
                        {/* Questions */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Questions (premières 3)</h3>
                            <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                                <pre className="text-sm text-gray-700">
                                    {questionsLoading ? 'Chargement...' : 
                                     questionsError ? `Erreur: ${questionsError.message}` :
                                     JSON.stringify(questions?.slice(0, 3), null, 2)}
                                </pre>
                            </div>
                        </div>

                                                 {/* Recommandations */}
                         <div>
                             <h3 className="font-semibold text-gray-900 mb-2">Recommandations de vins</h3>
                             <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                                 <pre className="text-sm text-gray-700">
                                     {recLoading ? 'Chargement...' : 
                                      recError ? `Erreur: ${recError.message}` :
                                      JSON.stringify(recommendations, null, 2)}
                                 </pre>
                             </div>
                         </div>

                         {/* Aliments */}
                         <div>
                             <h3 className="font-semibold text-gray-900 mb-2">Aliments</h3>
                             <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                                 <pre className="text-sm text-gray-700">
                                     {foodsLoading ? 'Chargement...' : 
                                      foodsError ? `Erreur: ${foodsError.message}` :
                                      JSON.stringify(foods, null, 2)}
                                 </pre>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    type={notification.type}
                    message={notification.message}
                    isVisible={true}
                    onClose={() => removeNotification(notification.id)}
                    duration={notification.duration}
                />
            ))}
        </div>
    );
}
