'use client';

import { useState } from 'react';
import { DemoType } from '@/lib/supabase';
import { Play, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ModelDemoProps {
  modelId: string;
  demoType: DemoType;
  apiEndpoint?: string | null;
}

export default function ModelDemo({ modelId, demoType, apiEndpoint }: ModelDemoProps) {
  const [input, setInput] = useState('');
  const [context, setContext] = useState(''); // For question-answering
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!input.trim() && demoType !== 'question-answering') {
      setError('Please provide input');
      return;
    }

    if (demoType === 'question-answering' && (!input.trim() || !context.trim())) {
      setError('Please provide both question and context');
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      let requestInput = input;
      
      if (demoType === 'question-answering') {
        requestInput = JSON.stringify({ question: input, context });
      }

      const response = await fetch('/api/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: apiEndpoint,
          input: requestInput,
          demoType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Inference failed');
      }

      setOutput(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = () => {
    switch (demoType) {
      case 'image-to-text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image URL
            </label>
            <div className="space-y-2">
              <input
                type="url"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
              {input && (
                <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={input}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={() => setError('Invalid image URL')}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'question-answering':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Context
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                placeholder="Provide the context/passage where the answer can be found..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the context..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {demoType === 'text-to-image' ? 'Text Prompt' : 'Input Text'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              placeholder={getPlaceholder(demoType)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        );
    }
  };

  const renderOutput = () => {
    if (!output) return null;

    if (output.type === 'image') {
      return (
        <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <img src={output.output} alt="Generated" className="w-full h-auto" />
        </div>
      );
    }

    if (output.type === 'classification') {
      return (
        <div className="space-y-2">
          {output.output.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span className="text-gray-900 dark:text-white font-medium">
                {item.label}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(item.score * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {(item.score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
          {output.output}
        </p>
        {output.score && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Confidence: {(output.score * 100).toFixed(1)}%
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Try This Model
      </h2>

      <div className="space-y-4">
        {/* Input Section */}
        {renderInput()}

        {/* Run Button */}
        <button
          onClick={handleRun}
          disabled={loading}
          className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              Run Model
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="flex items-start space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Output
            </label>
            {renderOutput()}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Model: {output.model}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getPlaceholder(demoType: DemoType): string {
  switch (demoType) {
    case 'text-to-text':
      return 'Enter text to summarize...';
    case 'text-to-image':
      return 'Describe the image you want to generate...';
    case 'sentiment-analysis':
      return 'Enter text to analyze sentiment...';
    default:
      return 'Enter your text here...';
  }
}
