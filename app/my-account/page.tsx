'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Model, DemoType } from '@/lib/supabase';
import { uploadFile, deleteFile, validateImageFile, validateModelFile } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon, File } from 'lucide-react';

export default function MyAccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myModels, setMyModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    preview_image_url: '',
    preview_image_path: '',
    model_file_url: '',
    model_file_path: '',
    notebook_url: '',
    is_public: true,
    demo_type: 'text-to-text' as DemoType,
    api_endpoint: '',
  });
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const previewImageInputRef = useRef<HTMLInputElement>(null);
  const modelFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      fetchMyModels();
    }
  }, [user, authLoading, router]);

  const fetchMyModels = async () => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (model?: Model) => {
    if (model) {
      setEditingModel(model);
      setFormData({
        title: model.title,
        description: model.description,
        tags: model.tags.join(', '),
        preview_image_url: model.preview_image_url || '',
        preview_image_path: model.preview_image_path || '',
        model_file_url: model.model_file_url || '',
        model_file_path: model.model_file_path || '',
        notebook_url: model.notebook_url || '',
        is_public: model.is_public,
        demo_type: model.demo_type,
        api_endpoint: model.api_endpoint || '',
      });
    } else {
      setEditingModel(null);
      setFormData({
        title: '',
        description: '',
        tags: '',
        preview_image_url: '',
        preview_image_path: '',
        model_file_url: '',
        model_file_path: '',
        notebook_url: '',
        is_public: true,
        demo_type: 'text-to-text',
        api_endpoint: '',
      });
    }
    setPreviewImageFile(null);
    setModelFile(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingModel(null);
    setPreviewImageFile(null);
    setModelFile(null);
    setUploadProgress('');
    setFormData({
      title: '',
      description: '',
      tags: '',
      preview_image_url: '',
      preview_image_path: '',
      model_file_url: '',
      model_file_path: '',
      notebook_url: '',
      is_public: true,
      demo_type: 'text-to-text',
      api_endpoint: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress('');

    try {
      let previewImageUrl = formData.preview_image_url;
      let previewImagePath = formData.preview_image_path;
      let modelFileUrl = formData.model_file_url;
      let modelFilePath = formData.model_file_path;

      // Upload preview image if new file selected
      if (previewImageFile) {
        setUploadProgress('Uploading preview image...');
        const result = await uploadFile(previewImageFile, 'model-previews', user!.id);
        
        if (result.error) {
          alert(`Preview image upload failed: ${result.error}`);
          setSaving(false);
          return;
        }
        
        // Delete old preview image if updating
        if (editingModel && editingModel.preview_image_path) {
          await deleteFile('model-previews', editingModel.preview_image_path);
        }
        
        previewImageUrl = result.url;
        previewImagePath = result.path;
      }

      // Upload model file if new file selected
      if (modelFile) {
        setUploadProgress('Uploading model file...');
        const result = await uploadFile(modelFile, 'model-files', user!.id);
        
        if (result.error) {
          alert(`Model file upload failed: ${result.error}`);
          setSaving(false);
          return;
        }
        
        // Delete old model file if updating
        if (editingModel && editingModel.model_file_path) {
          await deleteFile('model-files', editingModel.model_file_path);
        }
        
        modelFileUrl = result.url;
        modelFilePath = result.path;
      }

      setUploadProgress('Saving model...');

      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const modelData = {
        title: formData.title,
        description: formData.description,
        tags: tagsArray,
        preview_image_url: previewImageUrl || null,
        preview_image_path: previewImagePath || null,
        model_file_url: modelFileUrl || null,
        model_file_path: modelFilePath || null,
        notebook_url: formData.notebook_url || null,
        is_public: formData.is_public,
        demo_type: formData.demo_type,
        api_endpoint: formData.api_endpoint || null,
        user_id: user?.id,
      };

      if (editingModel) {
        // Update existing model
        const { error } = await supabase
          .from('models')
          .update(modelData)
          .eq('id', editingModel.id);

        if (error) throw error;
      } else {
        // Create new model
        const { error } = await supabase
          .from('models')
          .insert([modelData]);

        if (error) throw error;
      }

      await fetchMyModels();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Failed to save model. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) {
      return;
    }

    try {
      // Find the model to get file paths
      const modelToDelete = myModels.find(m => m.id === id);
      
      // Delete from database
      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete files from storage
      if (modelToDelete?.preview_image_path) {
        await deleteFile('model-previews', modelToDelete.preview_image_path);
      }
      if (modelToDelete?.model_file_path) {
        await deleteFile('model-files', modelToDelete.model_file_path);
      }

      await fetchMyModels();
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Failed to delete model. Please try again.');
    }
  };

  const handlePreviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      setPreviewImageFile(file);
    }
  };

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateModelFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      setModelFile(file);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Account
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage your AI models
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Model
          </button>
        </div>

        {/* Model Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingModel ? 'Edit Model' : 'Create New Model'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="e.g., NLP, Vision, Audio"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview Image
                    </label>
                    <div className="space-y-2">
                      {/* File Upload */}
                      <div className="flex items-center space-x-2">
                        <input
                          ref={previewImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePreviewImageChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => previewImageInputRef.current?.click()}
                          className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </button>
                        {previewImageFile && (
                          <span className="text-sm text-green-600 dark:text-green-400">
                            ✓ {previewImageFile.name}
                          </span>
                        )}
                      </div>
                      {/* OR URL Input */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">OR provide URL</span>
                        </div>
                      </div>
                      <input
                        type="url"
                        value={formData.preview_image_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preview_image_url: e.target.value,
                          })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500">JPG, PNG, GIF, WebP (Max 5MB)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Model File
                    </label>
                    <div className="space-y-2">
                      {/* File Upload */}
                      <div className="flex items-center space-x-2">
                        <input
                          ref={modelFileInputRef}
                          type="file"
                          accept=".pt,.pth,.bin,.h5,.hdf5,.onnx,.pkl,.safetensors,.zip,.tar,.gz"
                          onChange={handleModelFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => modelFileInputRef.current?.click()}
                          className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <File className="h-4 w-4 mr-2" />
                          Upload Model File
                        </button>
                        {modelFile && (
                          <span className="text-sm text-green-600 dark:text-green-400">
                            ✓ {modelFile.name}
                          </span>
                        )}
                      </div>
                      {/* OR URL Input */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">OR provide URL</span>
                        </div>
                      </div>
                      <input
                        type="url"
                        value={formData.model_file_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            model_file_url: e.target.value,
                          })
                        }
                        placeholder="https://example.com/model.h5 or HuggingFace model ID"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500">.pt, .pth, .h5, .onnx, .safetensors, etc. (Max 500MB)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notebook URL
                    </label>
                    <input
                      type="url"
                      value={formData.notebook_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notebook_url: e.target.value,
                        })
                      }
                      placeholder="https://colab.research.google.com/..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Demo Type *
                    </label>
                    <select
                      required
                      value={formData.demo_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demo_type: e.target.value as DemoType,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="text-to-text">Text to Text (Summarization)</option>
                      <option value="image-to-text">Image to Text (Captioning)</option>
                      <option value="text-to-image">Text to Image (Generation)</option>
                      <option value="sentiment-analysis">Sentiment Analysis</option>
                      <option value="question-answering">Question Answering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom API Endpoint (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.api_endpoint}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          api_endpoint: e.target.value,
                        })
                      }
                      placeholder="Leave empty to use default HuggingFace models"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_public: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="is_public" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Make this model public (visible to everyone)
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {uploadProgress || 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Model
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      disabled={saving}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Models List */}
        {myModels.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              You haven't created any models yet.
            </p>
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Model
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myModels.map((model) => (
              <div
                key={model.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {model.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        model.is_public 
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {model.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {model.description}
                    </p>
                    {model.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {model.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenForm(model)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
