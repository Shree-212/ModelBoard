'use client';

import { useState, useEffect } from 'react';
import { supabase, Model } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Search, Tag } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

export default function ModelsPage() {
  const { user } = useAuth();
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, [user]);

  useEffect(() => {
    filterModels();
  }, [searchQuery, selectedTag, models]);

  const fetchModels = async () => {
    try {
      // The models page should ONLY show public models
      // Private models should only be visible on the owner's portfolio page and My Account
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterModels = () => {
    let filtered = [...models];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (model) =>
          model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter((model) =>
        model.tags.includes(selectedTag)
      );
    }

    setFilteredModels(filtered);
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    models.forEach((model) => {
      model.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore AI Models
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover and test machine learning models from the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Tags Filter */}
          {getAllTags().length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {getAllTags().map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Models Grid */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {models.length === 0
                ? 'No models available yet. Be the first to upload one!'
                : 'No models match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <Link
                key={model.id}
                href={`/models/${model.id}`}
                className="group bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200 dark:border-gray-800"
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
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {model.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
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
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{model.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {formatDate(model.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
