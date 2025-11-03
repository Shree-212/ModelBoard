'use client';

import { useState, useEffect } from 'react';
import { supabase, Model } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Tag, Calendar, Download, Heart, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ModelDemo from '@/components/ModelDemo';

export default function ModelDetailPage() {
  const params = useParams();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchModel(params.id as string);
    }
  }, [params.id]);

  const fetchModel = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setModel(data);
    } catch (error) {
      console.error('Error fetching model:', error);
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

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Model not found
        </h1>
        <Link
          href="/models"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Back to Models
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          href="/models"
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Models
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          {/* Preview Image */}
          <div className="relative h-64 sm:h-96 bg-gray-200 dark:bg-gray-800">
            {model.preview_image_url ? (
              <Image
                src={model.preview_image_url}
                alt={model.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Tag className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Title and Stats */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {model.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(model.created_at)}
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  {model.likes_count} likes
                </div>
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  {model.downloads_count} downloads
                </div>
              </div>
            </div>

            {/* Tags */}
            {model.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {model.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {model.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {model.notebook_url && (
                <a
                  href={model.notebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Notebook
                </a>
              )}

              {model.model_file_url && (
                <a
                  href={model.model_file_url}
                  download
                  className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Model
                </a>
              )}
            </div>

            {/* Demo Widget */}
            {model.demo_type && (
              <ModelDemo
                modelId={model.id}
                demoType={model.demo_type}
                apiEndpoint={model.api_endpoint}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
