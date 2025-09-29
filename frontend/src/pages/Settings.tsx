import React, { useState, useEffect } from 'react';
import { UserIcon, BellIcon, GlobeIcon, MoonIcon, ShieldIcon, HelpCircleIcon, MailIcon, MessageSquareIcon, InfoIcon } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useTranslation } from "react-i18next";

const lngs = [
  { code: "en", native: "English (US)" },
  { code: "hi", native: "Hindi (हिन्दी)" },
];

// Custom CSS for slider styling
const customStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #14b8a6);
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    border: 2px solid white;
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #14b8a6);
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    border: 2px solid white;
  }
`;

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<string>(i18n.language || "en");
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });
  // State to hold a copy of the original data for 'Cancel' functionality
  const [initialProfileData, setInitialProfileData] = useState({ ...profileData }); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleSaveLanguage = () => {
    i18n.changeLanguage(selectedLang);
    localStorage.setItem("preferredLanguage", selectedLang);
  };

  const [activeTab, setActiveTab] = useState('profile');
  const tabs = [{
    id: 'profile',
    name: t("settings.profile"),
    icon: <UserIcon size={18} />
  }, {
    id: 'notifications',
    name: t("settings.notifications"),
    icon: <BellIcon size={18} />
  }, {
    id: 'language',
    name: t("settings.language"),
    icon: <GlobeIcon size={18} />
  }, {
    id: 'appearance',
    name: t("settings.appearance"),
    icon: <MoonIcon size={18} />
  }, {
    id: 'privacy',
    name: t("settings.privacy"),
    icon: <ShieldIcon size={18} />
  }, {
    id: 'help',
    name: t("settings.help"),
    icon: <HelpCircleIcon size={18} />
  }, {
    id: 'about',
    name: "About",
    icon: <InfoIcon size={18} />
  }];
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  // Fetches user data from the backend when the component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile data");
        }

        setProfileData(data || {});
        setInitialProfileData(data || {}); // Store initial data
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unexpected error occurred";
        setError(errorMessage);
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [API_URL]);

  // Handles input changes and updates the state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Sends the updated profile data to the backend
  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated. Please log in.");
      }

      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save changes");
      }

      alert("Profile saved successfully!");
      setIsEditing(false); // Exit editing mode on successful save
      setInitialProfileData(profileData); // Update initial data with saved data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error while saving";
      setError(errorMessage);
      alert(`Error saving profile: ${errorMessage}`);
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  // Reverts changes and exits editing mode
  const handleCancelEdit = () => {
    setProfileData(initialProfileData); // Revert to original data
    setIsEditing(false); // Exit editing mode
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">{t("settings.title")}</h1>
          <p className="text-blue-100 text-lg">{t("settings.subtitle")}</p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-72 shrink-0">
          <Card className="p-1 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`flex items-center w-full text-left px-5 py-4 rounded-xl transition-all duration-200 group ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:shadow-sm'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={`mr-4 transition-transform duration-200 ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                  }`}>
                    {tab.icon}
                  </span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {t("settings.profileInformation")}
                  </h2>
                  <p className="text-gray-600">Update your personal information and preferences</p>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Profile Complete</span>
                    </div>
                  )}
                </div>
              </div>
              {loading ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0 left-0"></div>
                  </div>
                  <span className="mt-4 text-gray-600 font-medium">Loading your profile...</span>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                    <div className="text-red-600 text-xl mb-2">⚠️</div>
                    <h3 className="text-red-800 font-medium mb-2">Error Loading Profile</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
                    <div className="flex items-center">
                      <div className="relative mr-6">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                          <UserIcon className="h-12 w-12 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {profileData.firstName && profileData.lastName 
                            ? `${profileData.firstName} ${profileData.lastName}` 
                            : 'Welcome to RainWise'}
                        </h3>
                        <p className="text-gray-600 mb-3">{profileData.email || 'No email provided'}</p>
                        <div className="flex items-center space-x-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={!isEditing}
                            className="bg-white/80 border-gray-200 hover:bg-white"
                          >
                            📷 {t("settings.changePhoto")}
                          </Button>
                          <span className="text-xs text-gray-500">
                            JPG, GIF or PNG. Max size 1MB.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label={t("settings.firstName")}
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        <Input
                          label={t("settings.lastName")}
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        <Input
                          label={t("settings.email")}
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          disabled={true} // Email is typically not editable
                        />
                        <Input
                          label={t("settings.phoneNumber")}
                          type="tel"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                        {t("settings.defaultAddress")}
                      </h4>
                      <div className="space-y-6">
                        <Input
                          label={t("settings.streetAddress")}
                          name="streetAddress"
                          value={profileData.streetAddress}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Input
                            label={t("settings.city")}
                            name="city"
                            value={profileData.city}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                          <Input
                            label={t("settings.state")}
                            name="state"
                            value={profileData.state}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                          <Input
                            label={t("settings.zipCode")}
                            name="zipCode"
                            value={profileData.zipCode}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                    {isEditing ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          ❌ {t("settings.cancel")}
                        </Button>
                        <Button 
                          variant="primary"
                          onClick={handleSaveProfile}
                          disabled={saving || loading}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                        >
                          {saving ? '💾 Saving...' : `✅ ${t("settings.saveChanges")}`}
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="primary" 
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                      >
                        ✏️ {t("settings.editProfile")}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {t("settings.notificationPreferences")}
                </h2>
                <p className="text-gray-600">Customize how and when you receive notifications</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                    Notification Types
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-4 px-4 bg-white/70 rounded-xl border border-white/50">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <div className="text-blue-600 text-lg">📊</div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{t("settings.assessmentReports")}</h4>
                          <p className="text-sm text-gray-600">
                            {t("settings.assessmentReportsDesc")}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Assessment Reports" />
                        <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4 px-4 bg-white/70 rounded-xl border border-white/50">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-4">
                          <div className="text-green-600 text-lg">🌧️</div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{t("settings.rainfallAlerts")}</h4>
                          <p className="text-sm text-gray-600">
                            {t("settings.rainfallAlertsDesc")}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Rainfall Alerts" />
                        <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4 px-4 bg-white/70 rounded-xl border border-white/50">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-4">
                          <div className="text-purple-600 text-lg">📰</div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{t("settings.newsUpdates")}</h4>
                          <p className="text-sm text-gray-600">
                            {t("settings.newsUpdatesDesc")}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" aria-label="News Updates" />
                        <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-violet-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4 px-4 bg-white/70 rounded-xl border border-white/50">
                      <div className="flex items-center">
                        <div className="bg-orange-100 p-2 rounded-lg mr-4">
                          <div className="text-orange-600 text-lg">🔧</div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{t("settings.maintenanceReminders")}</h4>
                          <p className="text-sm text-gray-600">
                            {t("settings.maintenanceRemindersDesc")}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Maintenance Reminders" />
                        <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-gray-500 rounded-full mr-3"></div>
                    {t("settings.notificationChannels")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/80 rounded-xl p-4 border border-white/50">
                      <div className="flex items-center mb-3">
                        <MailIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-gray-800">Email</h4>
                      </div>
                      <div className="flex items-center">
                        <input id="email-notifications" type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                        <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                          {t("settings.email")}
                        </label>
                      </div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-white/50">
                      <div className="flex items-center mb-3">
                        <MessageSquareIcon className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-gray-800">SMS</h4>
                      </div>
                      <div className="flex items-center">
                        <input id="sms-notifications" type="checkbox" className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                        <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-700">
                          {t("settings.sms")}
                        </label>
                      </div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-white/50">
                      <div className="flex items-center mb-3">
                        <BellIcon className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-medium text-gray-800">Push</h4>
                      </div>
                      <div className="flex items-center">
                        <input id="push-notifications" type="checkbox" className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" defaultChecked />
                        <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
                          {t("settings.push")}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <Button 
                  variant="primary"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  💾 {t("settings.savePreferences")}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {t("settings.appearanceSettings")}
                </h2>
                <p className="text-gray-600">Customize the look and feel of your application</p>
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-purple-500 rounded-full mr-3"></div>
                    {t("settings.theme")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative group cursor-pointer">
                      <div className="border-2 border-blue-600 rounded-2xl p-4 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative overflow-hidden rounded-lg mb-4">
                          <div className="h-24 bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
                            <div className="text-4xl">☀️</div>
                          </div>
                          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                            <div className="w-3 h-3 flex items-center justify-center text-xs">✓</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input id="light-theme" type="radio" name="theme" className="h-4 w-4 text-blue-600 focus:ring-blue-500" defaultChecked />
                          <label htmlFor="light-theme" className="ml-3 block text-sm font-medium text-gray-800">
                            {t("settings.light")} Theme
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="relative group cursor-pointer">
                      <div className="border-2 border-gray-200 hover:border-gray-800 rounded-2xl p-4 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative overflow-hidden rounded-lg mb-4">
                          <div className="h-24 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                            <div className="text-4xl">🌙</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input id="dark-theme" type="radio" name="theme" className="h-4 w-4 text-gray-800 focus:ring-gray-600" />
                          <label htmlFor="dark-theme" className="ml-3 block text-sm font-medium text-gray-800">
                            {t("settings.dark")} Theme
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="relative group cursor-pointer">
                      <div className="border-2 border-gray-200 hover:border-indigo-600 rounded-2xl p-4 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative overflow-hidden rounded-lg mb-4">
                          <div className="h-24 bg-gradient-to-br from-white via-gray-400 to-gray-900 flex items-center justify-center">
                            <div className="text-4xl">🔄</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input id="system-theme" type="radio" name="theme" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500" />
                          <label htmlFor="system-theme" className="ml-3 block text-sm font-medium text-gray-800">
                            {t("settings.system")} Default
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                    {t("settings.textSize")}
                  </h3>
                  <div className="bg-white/70 rounded-xl p-6 border border-white/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">Small</span>
                      <span className="text-lg font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">Large</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        defaultValue="3"
                        className="w-full h-3 bg-gradient-to-r from-green-200 to-teal-200 rounded-lg appearance-none cursor-pointer slider"
                        title="Text Size Slider"
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Compact</span>
                        <span>Default</span>
                        <span>Comfortable</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">Preview: This is how your text will appear with the selected size.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                    Accessibility Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">High Contrast</h4>
                          <p className="text-sm text-gray-600">Enhance text visibility</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" aria-label="High Contrast Mode" />
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                        </label>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">Reduced Motion</h4>
                          <p className="text-sm text-gray-600">Minimize animations</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" aria-label="Reduced Motion" />
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <Button 
                  variant="primary"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  🎨 {t("settings.applyChanges")}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'language' && (
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("settings.languageSettings")}</h2>
                <p className="text-gray-600">Customize language and regional preferences</p>
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></div>
                    {t("settings.appLanguage")}
                  </h3>
                  <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                    <select
                      className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 font-medium"
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      title="Select Application Language"
                    >
                      {lngs.map((lng) => (
                        <option key={lng.code} value={lng.code}>
                          {lng.native}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-600 mt-2">The interface language will change after saving</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></div>
                    {t("settings.region")}
                  </h3>
                  <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                    <select 
                      className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 font-medium"
                      title="Select Region"
                    >
                      <option value="us">🇺🇸 United States</option>
                      <option value="eu">🇪🇺 European Union</option>
                      <option value="uk">🇬🇧 United Kingdom</option>
                      <option value="ca">🇨🇦 Canada</option>
                      <option value="au">🇦🇺 Australia</option>
                      <option value="in">🇮🇳 India</option>
                    </select>
                    <p className="text-sm text-gray-600 mt-2">Regional settings affect date formats and measurements</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-rose-500 rounded-full mr-3"></div>
                    Date Format
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/70 rounded-xl p-4 border border-white/50 hover:bg-white transition-all">
                      <div className="flex items-center">
                        <input id="mdy" type="radio" name="date-format" className="h-4 w-4 text-rose-600 focus:ring-rose-500" defaultChecked />
                        <label htmlFor="mdy" className="ml-3 block text-sm font-medium text-gray-800">
                          <div className="font-semibold">MM/DD/YYYY</div>
                          <div className="text-gray-600 text-xs">06/15/2023</div>
                        </label>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 border border-white/50 hover:bg-white transition-all">
                      <div className="flex items-center">
                        <input id="dmy" type="radio" name="date-format" className="h-4 w-4 text-rose-600 focus:ring-rose-500" />
                        <label htmlFor="dmy" className="ml-3 block text-sm font-medium text-gray-800">
                          <div className="font-semibold">DD/MM/YYYY</div>
                          <div className="text-gray-600 text-xs">15/06/2023</div>
                        </label>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 border border-white/50 hover:bg-white transition-all">
                      <div className="flex items-center">
                        <input id="ymd" type="radio" name="date-format" className="h-4 w-4 text-rose-600 focus:ring-rose-500" />
                        <label htmlFor="ymd" className="ml-3 block text-sm font-medium text-gray-800">
                          <div className="font-semibold">YYYY/MM/DD</div>
                          <div className="text-gray-600 text-xs">2023/06/15</div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-amber-500 rounded-full mr-3"></div>
                    Measurement Units
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded-xl p-6 border border-white/50 hover:bg-white transition-all">
                      <div className="flex items-start">
                        <input id="metric" type="radio" name="units" className="h-4 w-4 text-amber-600 focus:ring-amber-500 mt-1" defaultChecked />
                        <label htmlFor="metric" className="ml-4 block">
                          <div className="font-semibold text-gray-800 mb-1">Metric System</div>
                          <div className="text-sm text-gray-600">
                            <div>• Meters, kilometers</div>
                            <div>• Liters, milliliters</div>
                            <div>• Millimeters rainfall</div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-6 border border-white/50 hover:bg-white transition-all">
                      <div className="flex items-start">
                        <input id="imperial" type="radio" name="units" className="h-4 w-4 text-amber-600 focus:ring-amber-500 mt-1" />
                        <label htmlFor="imperial" className="ml-4 block">
                          <div className="font-semibold text-gray-800 mb-1">Imperial System</div>
                          <div className="text-sm text-gray-600">
                            <div>• Feet, miles</div>
                            <div>• Gallons, ounces</div>
                            <div>• Inches rainfall</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <Button 
                  onClick={handleSaveLanguage} 
                  variant="primary"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                >
                  🌍 {t("settings.savePreferences")}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("settings.privacy")}</h2>
                <p className="text-gray-600">Manage your data privacy and security preferences</p>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                    Data Collection & Usage
                  </h3>
                  <div className="bg-white/70 rounded-xl p-6 border border-white/50">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ShieldIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                          We collect and use your data to provide personalized rainwater harvesting assessments and improve our services. 
                          This includes location data, property information, and usage patterns.
                        </p>
                        <div className="flex items-center justify-between bg-white rounded-lg p-4 border">
                          <span className="text-sm font-medium text-gray-800">Allow data collection for personalized insights</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Allow Data Collection" />
                            <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                    Location Services
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <div className="text-green-600 text-lg">📍</div>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">Precise Location</p>
                            <p className="text-xs text-gray-600">Required for accurate rainfall calculations and assessments</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Precise Location" />
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                        </label>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-yellow-100 p-2 rounded-lg">
                            <div className="text-yellow-600 text-lg">🔄</div>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">Background Location</p>
                            <p className="text-xs text-gray-600">For weather alerts and maintenance reminders</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" aria-label="Background Location" />
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-purple-500 rounded-full mr-3"></div>
                    Data Sharing
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <div className="text-purple-600 text-lg">📊</div>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">Anonymous Usage Analytics</p>
                            <p className="text-xs text-gray-600">Help us improve the app with anonymized usage data</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Anonymous Usage Analytics" />
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                        </label>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 border border-white/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <div className="text-indigo-600 text-lg">🔗</div>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">Third-party Integrations</p>
                            <p className="text-xs text-gray-600">Weather services and mapping providers</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked aria-label="Third-party Integrations" />
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-blue-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-red-500 rounded-full mr-3"></div>
                    Account Management
                  </h3>
                  <div className="bg-white/70 rounded-xl p-6 border border-white/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      >
                        📥 Download My Data
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        🗑️ Delete Account
                      </Button>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-xs text-yellow-800 flex items-start">
                        <span className="mr-2 mt-0.5">⚠️</span>
                        Account deletion will permanently remove all your data and cannot be undone. Please download your data before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <Button 
                  variant="primary"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  🔒 Save Privacy Settings
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'help' && (
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("settings.help")}</h2>
                <p className="text-gray-600">Get assistance and learn more about RainWise</p>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        question: "How do I start a rainwater harvesting assessment?",
                        answer: "Go to the Assessment page from the main navigation. Enter your property details, and our system will calculate your rainwater harvesting potential based on local rainfall data.",
                        icon: "🚀"
                      },
                      {
                        question: "What information do I need for an accurate assessment?",
                        answer: "You'll need your property address, roof area (or we can calculate it), roof type, and any existing water collection systems. The more details you provide, the more accurate your assessment will be.",
                        icon: "📋"
                      },
                      {
                        question: "How accurate are the rainfall predictions?",
                        answer: "Our predictions use historical weather data and real-time meteorological information. Accuracy is typically 85-95% for monthly and seasonal forecasts.",
                        icon: "🎯"
                      },
                      {
                        question: "Can I export my assessment results?",
                        answer: "Yes! You can download your assessment as a PDF report from the Results page. This includes all calculations, recommendations, and implementation guidelines.",
                        icon: "📄"
                      }
                    ].map((faq, index) => (
                      <div key={index} className="bg-white/70 rounded-xl p-6 border border-white/50 hover:bg-white transition-all">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                            <span className="text-lg">{faq.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                    Contact Support
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/70 rounded-xl p-6 text-center border border-white/50 hover:bg-white transition-all group">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                        <MailIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">Email Support</h4>
                      <p className="text-sm text-gray-600 mb-4">Get help via email within 24 hours</p>
                      <Button variant="outline" size="sm" fullWidth className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        📧 Send Email
                      </Button>
                    </div>
                    <div className="bg-white/70 rounded-xl p-6 text-center border border-white/50 hover:bg-white transition-all group">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                        <MessageSquareIcon className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">Live Chat</h4>
                      <p className="text-sm text-gray-600 mb-4">Chat with our support team</p>
                      <Button variant="outline" size="sm" fullWidth className="border-green-200 text-green-700 hover:bg-green-50">
                        💬 Start Chat
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-purple-500 rounded-full mr-3"></div>
                    Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: "📖", title: "User Guide & Tutorials", desc: "Step-by-step instructions" },
                      { icon: "🎥", title: "Video Tutorials", desc: "Visual learning resources" },
                      { icon: "📋", title: "Installation Guidelines", desc: "Setup and implementation" },
                      { icon: "🔧", title: "Maintenance Best Practices", desc: "Keep your system running" },
                      { icon: "🌍", title: "Community Forum", desc: "Connect with other users" },
                      { icon: "📊", title: "Case Studies", desc: "Real-world examples" }
                    ].map((resource, index) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        fullWidth
                        className="bg-white/70 border-purple-200 text-purple-700 hover:bg-purple-50 justify-start h-auto py-3"
                      >
                        <span className="text-lg mr-3">{resource.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">{resource.title}</div>
                          <div className="text-xs text-purple-600">{resource.desc}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <HelpCircleIcon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">Need More Help?</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Our support team is available Monday-Friday, 9 AM - 6 PM EST. 
                        For urgent technical issues, use the live chat feature.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="primary" 
                          size="sm"
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                          📞 Schedule Call
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          🐛 Report Bug
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'about' && (
            <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">About RainWise</h2>
                <p className="text-gray-600">Learn more about our mission and the team behind RainWise</p>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <div className="text-blue-600 text-4xl">💧</div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">RainWise v2.1.0</h3>
                  <p className="text-gray-600 text-lg mb-4">Empowering Water Conservation Through Technology</p>
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Active & Updated</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                    Our Mission
                  </h3>
                  <div className="bg-white/70 rounded-xl p-6 border border-white/50">
                    <p className="text-gray-700 leading-relaxed">
                      RainWise is dedicated to making rainwater harvesting accessible and efficient for everyone. 
                      We combine advanced meteorological data, GIS mapping, and intelligent algorithms to provide 
                      personalized assessments that help users maximize their water conservation potential while 
                      contributing to a sustainable future.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-purple-500 rounded-full mr-3"></div>
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: "🎯", text: "Personalized Rainwater Assessments" },
                      { icon: "🌧️", text: "Real-time Weather Integration" },
                      { icon: "🗺️", text: "Interactive Map Explorer" },
                      { icon: "💰", text: "Cost-Benefit Analysis" },
                      { icon: "📋", text: "Installation Guidelines" },
                      { icon: "🔔", text: "Maintenance Reminders" },
                      { icon: "📊", text: "Performance Analytics" },
                      { icon: "🌱", text: "Environmental Impact Tracking" }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-white/70 rounded-lg p-3 border border-white/50">
                        <span className="text-lg">{feature.icon}</span>
                        <span className="text-sm font-medium text-gray-800">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-cyan-500 rounded-full mr-3"></div>
                    Our Impact
                  </h3>
                  <div className="bg-white/70 rounded-xl p-6 border border-white/50">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div className="group hover:scale-105 transition-transform">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">50K+</div>
                        <div className="text-xs text-gray-600 font-medium">Active Users</div>
                        <div className="text-xs text-gray-500">Worldwide</div>
                      </div>
                      <div className="group hover:scale-105 transition-transform">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">120M</div>
                        <div className="text-xs text-gray-600 font-medium">Liters Saved</div>
                        <div className="text-xs text-gray-500">This Year</div>
                      </div>
                      <div className="group hover:scale-105 transition-transform">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">15K+</div>
                        <div className="text-xs text-gray-600 font-medium">Systems Installed</div>
                        <div className="text-xs text-gray-500">And Growing</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
                    Development Team
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Swarup Chanda", role: "Lead Developer & Project Manager", emoji: "👨‍💻" },
                      { name: "Pragyan Das", role: "Backend Developer & DevOps Handling", emoji: "⚙️" },
                      { name: "Environmental Engineering Team", role: "Technical Advisors", emoji: "🌿" },
                      { name: "NIT Silchar", role: "Research & Development", emoji: "🎓" }
                    ].map((member, index) => (
                      <div key={index} className="bg-white/70 rounded-xl p-4 border border-white/50 hover:bg-white transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{member.emoji}</div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{member.name}</h4>
                            <p className="text-sm text-gray-600">{member.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-slate-500 rounded-full mr-3"></div>
                    Contact & Support
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: <MailIcon className="h-5 w-5" />, label: "Email", value: "rainwise@gmail.com", color: "blue" },
                      { icon: <div className="h-5 w-5 flex items-center justify-center text-sm">📱</div>, label: "Phone", value: "+91 XXX XXX 7277", color: "green" },
                      { icon: <div className="h-5 w-5 flex items-center justify-center text-sm">🌐</div>, label: "Website", value: "rainwise.app", color: "purple" },
                      { icon: <div className="h-5 w-5 flex items-center justify-center text-sm">🏛️</div>, label: "Institution", value: "NIT Silchar, Assam", color: "orange" }
                    ].map((contact, index) => (
                      <div key={index} className="bg-white/70 rounded-xl p-4 border border-white/50 hover:bg-white transition-all">
                        <div className="flex items-center space-x-3">
                          <div className={`text-${contact.color}-600`}>{contact.icon}</div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">{contact.label}</div>
                            <div className="text-sm text-gray-800 font-medium">{contact.value}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800 to-slate-800 rounded-2xl p-6 text-center">
                  <div className="text-white space-y-3">
                    <div className="flex justify-center items-center space-x-2 text-sm">
                      <span>© 2024 RainWise. All rights reserved.</span>
                      <span className="text-gray-400">•</span>
                      <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                        Built with ❤️ for sustainable water management
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Committed to environmental sustainability and water conservation
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;