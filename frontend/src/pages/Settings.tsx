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
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
      } catch (err: any) {
        setError(err.message || "Unexpected error occurred");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

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
    } catch (err: any) {
      setError(err.message || "Unexpected error while saving");
      alert(`Error saving profile: ${err.message}`);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("settings.title")}</h1>
        <p className="text-gray-600">{t("settings.subtitle")}</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 shrink-0">
          <Card className="p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center w-full text-left px-4 py-3 rounded-lg ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </Card>
        </div>
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {t("settings.profileInformation")}
              </h2>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-4 text-gray-600">Loading profile...</span>
                </div>
              ) : error ? (
                <div className="text-center text-red-500">Error: {error}</div>
              ) : (
                <>
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-10 w-10 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" disabled={!isEditing}>
                        {t("settings.changePhoto")}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, GIF or PNG. Max size 1MB.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">{t("settings.defaultAddress")}</h3>
                    <Input
                      label={t("settings.streetAddress")}
                      name="streetAddress"
                      value={profileData.streetAddress}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="mt-6 flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={handleCancelEdit} className="mr-2">
                          {t("settings.cancel")}
                        </Button>
                        <Button 
                          variant="primary"
                          onClick={handleSaveProfile}
                          disabled={saving || loading}
                        >
                          {saving ? 'Saving...' : t("settings.saveChanges")}
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" onClick={() => setIsEditing(true)}>
                        {t("settings.editProfile")}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {t("settings.notificationPreferences")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <h3 className="font-medium">{t("settings.assessmentReports")}</h3>
                    <p className="text-sm text-gray-600">
                      {t("settings.assessmentReportsDesc")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <h3 className="font-medium">{t("settings.rainfallAlerts")}</h3>
                    <p className="text-sm text-gray-600">
                      {t("settings.rainfallAlertsDesc")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <h3 className="font-medium">{t("settings.newsUpdates")}</h3>
                    <p className="text-sm text-gray-600">
                      {t("settings.newsUpdatesDesc")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <h3 className="font-medium">{t("settings.maintenanceReminders")}</h3>
                    <p className="text-sm text-gray-600">
                      {t("settings.maintenanceRemindersDesc")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-4">{t("settings.notificationChannels")}</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input id="email-notifications" type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" defaultChecked />
                    <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                      {t("settings.email")}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="sms-notifications" type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                    <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-700">
                      {t("settings.sms")}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="push-notifications" type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300" defaultChecked />
                    <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
                      {t("settings.push")}
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="primary">{t("settings.savePreferences")}</Button>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {t("settings.appearanceSettings")}
              </h2>
              <div className="mb-6">
                <h3 className="font-medium mb-4">{t("settings.theme")}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-blue-600 rounded-lg p-3 cursor-pointer">
                    <div className="h-20 bg-white rounded mb-2"></div>
                    <div className="flex items-center">
                      <input id="light-theme" type="radio" name="theme" className="h-4 w-4 text-blue-600" defaultChecked />
                      <label htmlFor="light-theme" className="ml-2 block text-sm">
                        {t("settings.light")}
                      </label>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3 cursor-pointer">
                    <div className="h-20 bg-gray-900 rounded mb-2"></div>
                    <div className="flex items-center">
                      <input id="dark-theme" type="radio" name="theme" className="h-4 w-4 text-blue-600" />
                      <label htmlFor="dark-theme" className="ml-2 block text-sm">
                        {t("settings.dark")}
                      </label>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3 cursor-pointer">
                    <div className="h-20 bg-gradient-to-b from-white to-gray-900 rounded mb-2"></div>
                    <div className="flex items-center">
                      <input id="system-theme" type="radio" name="theme" className="h-4 w-4 text-blue-600" />
                      <label htmlFor="system-theme" className="ml-2 block text-sm">
                        {t("settings.system")}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-4">{t("settings.textSize")}</h3>
                <div className="flex items-center">
                  <span className="text-sm mr-3">A</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    defaultValue="3"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg ml-3">A</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="primary">{t("settings.applyChanges")}</Button>
              </div>
            </Card>
          )}

          {activeTab === 'language' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">{t("settings.languageSettings")}</h2>
              <div className="mb-6">
                <h3 className="font-medium mb-4">{t("settings.appLanguage")}</h3>
                <select
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                >
                  {lngs.map((lng) => (
                    <option key={lng.code} value={lng.code}>
                      {lng.native}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-4">{t("settings.region")}</h3>
                <select className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="us">United States</option>
                  <option value="eu">European Union</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                  <option value="in">India</option>
                </select>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-4">Date Format</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input id="mdy" type="radio" name="date-format" className="h-4 w-4 text-blue-600" defaultChecked />
                    <label htmlFor="mdy" className="ml-2 block text-sm">
                      MM/DD/YYYY (06/15/2023)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="dmy" type="radio" name="date-format" className="h-4 w-4 text-blue-600" />
                    <label htmlFor="dmy" className="ml-2 block text-sm">
                      DD/MM/YYYY (15/06/2023)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="ymd" type="radio" name="date-format" className="h-4 w-4 text-blue-600" />
                    <label htmlFor="ymd" className="ml-2 block text-sm">
                      YYYY/MM/DD (2023/06/15)
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-4">Measurement Units</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input id="metric" type="radio" name="units" className="h-4 w-4 text-blue-600" defaultChecked />
                    <label htmlFor="metric" className="ml-2 block text-sm">
                      Metric (meters, liters, mm)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="imperial" type="radio" name="units" className="h-4 w-4 text-blue-600" />
                    <label htmlFor="imperial" className="ml-2 block text-sm">
                      Imperial (feet, gallons, inches)
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveLanguage} variant="primary">{t("settings.savePreferences")}</Button>
              </div>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">{t("settings.privacy")}</h2>
              
              <div className="mb-6">
                <h3 className="font-medium mb-4">Data Collection & Usage</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 mb-3">
                    We collect and use your data to provide personalized rainwater harvesting assessments and improve our services. 
                    This includes location data, property information, and usage patterns.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Allow data collection for personalized insights</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-4">Location Services</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-sm">Precise Location</p>
                      <p className="text-xs text-gray-600">Required for accurate rainfall calculations and assessments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-sm">Background Location</p>
                      <p className="text-xs text-gray-600">For weather alerts and maintenance reminders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-4">Data Sharing</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-sm">Anonymous Usage Analytics</p>
                      <p className="text-xs text-gray-600">Help us improve the app with anonymized usage data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-sm">Third-party Integrations</p>
                      <p className="text-xs text-gray-600">Weather services and mapping providers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-4">Account Management</h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm">
                    Download My Data
                  </Button>
                  <Button variant="outline" size="sm">
                    Delete Account
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Account deletion will permanently remove all your data and cannot be undone.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="primary">Save Privacy Settings</Button>
              </div>
            </Card>
          )}

          {activeTab === 'help' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">{t("settings.help")}</h2>
              
              <div className="mb-6">
                <h3 className="font-medium mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">How do I start a rainwater harvesting assessment?</h4>
                    <p className="text-sm text-gray-600">
                      Go to the Assessment page from the main navigation. Enter your property details, 
                      and our system will calculate your rainwater harvesting potential based on local rainfall data.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">What information do I need for an accurate assessment?</h4>
                    <p className="text-sm text-gray-600">
                      You'll need your property address, roof area (or we can calculate it), roof type, 
                      and any existing water collection systems. The more details you provide, the more accurate your assessment will be.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">How accurate are the rainfall predictions?</h4>
                    <p className="text-sm text-gray-600">
                      Our predictions use historical weather data and real-time meteorological information. 
                      Accuracy is typically 85-95% for monthly and seasonal forecasts.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">Can I export my assessment results?</h4>
                    <p className="text-sm text-gray-600">
                      Yes! You can download your assessment as a PDF report from the Results page. 
                      This includes all calculations, recommendations, and implementation guidelines.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-4">Contact Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MailIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium mb-1">Email Support</h4>
                    <p className="text-sm text-gray-600 mb-3">Get help via email within 24 hours</p>
                    <Button variant="outline" size="sm" fullWidth>
                      Send Email
                    </Button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquareIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-1">Live Chat</h4>
                    <p className="text-sm text-gray-600 mb-3">Chat with our support team</p>
                    <Button variant="outline" size="sm" fullWidth>
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-4">Resources</h3>
                <div className="space-y-2">
                  <Button variant="outline" fullWidth>
                    📖 User Guide & Tutorials
                  </Button>
                  <Button variant="outline" fullWidth>
                    🎥 Video Tutorials
                  </Button>
                  <Button variant="outline" fullWidth>
                    📋 Installation Guidelines
                  </Button>
                  <Button variant="outline" fullWidth>
                    🔧 Maintenance Best Practices
                  </Button>
                  <Button variant="outline" fullWidth>
                    🌍 Community Forum
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Need More Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Our support team is available Monday-Friday, 9 AM - 6 PM EST. 
                  For urgent technical issues, use the live chat feature.
                </p>
                <div className="flex space-x-2">
                  <Button variant="primary" size="sm">
                    Schedule Call
                  </Button>
                  <Button variant="outline" size="sm">
                    Report Bug
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'about' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">About RainWise</h2>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <div className="text-blue-600 text-2xl">💧</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">RainWise v2.1.0</h3>
                    <p className="text-gray-600">Empowering Water Conservation Through Technology</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Our Mission</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  RainWise is dedicated to making rainwater harvesting accessible and efficient for everyone. 
                  We combine advanced meteorological data, GIS mapping, and intelligent algorithms to provide 
                  personalized assessments that help users maximize their water conservation potential.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Personalized Rainwater Assessments</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Real-time Weather Integration</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Interactive Map Explorer</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Cost-Benefit Analysis</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Installation Guidelines</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Maintenance Reminders</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Our Impact</h3>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-700">50K+</div>
                      <div className="text-xs text-gray-600">Active Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">120M</div>
                      <div className="text-xs text-gray-600">Liters Saved</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-cyan-700">15K+</div>
                      <div className="text-xs text-gray-600">Systems Installed</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Development Team</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Swarup Chanda</strong> - Lead Developer & Project Manager</p>
                  <p><strong>Pragyan Das</strong> - Backend Developer & DevOps Handling</p>
                  <p><strong>Environmental Engineering Team</strong> - Technical Advisors</p>
                  <p><strong>NIT Silchar</strong> - Research & Development</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Contact & Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MailIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">rainwise@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 text-gray-500">📱</div>
                    <span className="text-gray-700">+91 XXX XXX 7277</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 text-gray-500">🌐</div>
                    <span className="text-gray-700">rainwise.app</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 text-gray-500">🏛️</div>
                    <span className="text-gray-700">NIT Silchar, Assam</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>© 2024 RainWise. All rights reserved.</span>
                  <span>Built with ❤️ for sustainable water management</span>
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