import React, { useState } from 'react';
import { ArrowLeft, Save, Bell, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    notificationsEmail: true,
    notificationsWeb: true,
    notificationsTasks: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save logic via API for settings
      console.log('Saving settings:', formData);
      setTimeout(() => {
        alert('Settings saved successfully!');
        setIsSaving(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-sm text-gray-600">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: UserIcon },
                { id: 'notifications', label: 'Notifications', icon: Bell },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                    activeTab === id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-800">
                      {user?.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <p className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-800">
                      {user?.email || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Role:</strong> {user?.role || 'User'}
                    </p>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        name="notificationsEmail"
                        checked={formData.notificationsEmail}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        name="notificationsWeb"
                        checked={formData.notificationsWeb}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Web Notifications</p>
                        <p className="text-sm text-gray-600">Receive in-app notifications</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        name="notificationsTasks"
                        checked={formData.notificationsTasks}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-800">Task Alerts</p>
                        <p className="text-sm text-gray-600">Notify me about task updates and deadlines</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};