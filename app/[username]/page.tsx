'use client';

import { useState, useEffect } from 'react';
import { supabase, Model } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Tag, Calendar, Download, Heart, ExternalLink, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export default function PortfolioPage() {
  const params = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.username) {
      fetchPortfolio(params.username as string);
    }
  }, [params.username, user]);

  const fetchPortfolio = async (username: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Check if viewing own profile
      const isOwnProfile = user?.id === profileData.id;

      // Fetch models - show all models if viewing own profile, otherwise only public
      let query = supabase
        .from('models')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (!isOwnProfile) {
        query = query.eq('is_public', true);
      }

      const { data: modelsData, error: modelsError } = await query;

      if (modelsError) throw modelsError;
      setModels(modelsData || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          User not found
        </h1>
        <Link
          href="/models"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Browse Models
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-4xl font-bold text-gray-400">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.username}
                </h1>
                <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>

              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center justify-center sm:justify-start space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {models.length}
                  </span>{' '}
                  public models
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {formatDate(profile.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {user?.id === profile.id ? 'My Models' : 'Public Models'}
          </h2>

          {models.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-12 text-center">
              <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {user?.id === profile.id ? 'No models yet' : 'No public models yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.id === profile.id 
                  ? "You haven't created any models. Head to My Account to get started!"
                  : "This user hasn't published any models."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.id}`}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Preview Image */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                    {model.preview_image_url ? (
                      <Image
                        src={model.preview_image_url}
                        alt={model.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Tag className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    {/* Private Badge */}
                    {!model.is_public && user?.id === profile.id && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {model.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {model.description}
                    </p>

                    {/* Tags */}
                    {model.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {model.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {model.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{model.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {model.likes_count}
                        </div>
                        <div className="flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          {model.downloads_count}
                        </div>
                      </div>
                      <div className="text-xs">
                        {formatDate(model.created_at)}
                      </div>
                    </div>

                    {/* Demo Badge */}
                    {model.demo_type && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Interactive Demo
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
