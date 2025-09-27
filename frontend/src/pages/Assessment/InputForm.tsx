import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CloudRainIcon,
  MapPinIcon,
  UsersIcon,
  UploadCloudIcon,
  CheckCircleIcon,
  LocateIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  BuildingIcon,
  TreesIcon,
  MapIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SendIcon,
  ActivityIcon,
} from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Dropdown from "../../components/ui/Dropdown";
import Button from "../../components/ui/Button";
import { useTranslation } from "react-i18next";
import { locationService, type StateDistrict } from "../../services/locationService";
import styles from "./InputForm.module.css";

const AssessmentInput: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  // States and districts data
  const [statesDistricts, setStatesDistricts] = useState<StateDistrict>({});
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // form data state
  const [formData, setFormData] = useState({
    name: "",
    dwellers: "",
    phone: "",
    email: "",
    roofArea: "",
    openSpace: "",
    roofType: "",
    soilType: "",
    address: "",
    state: "",
    district: "",
    latitude: "",
    longitude: "",
    rainfall: "",
  });

  const roofTypes = [
    { value: "metal", label: t("assessment.roofTypes.metal") },
    { value: "tile", label: t("assessment.roofTypes.tile") },
    { value: "concrete", label: t("assessment.roofTypes.concrete") },
    { value: "asphalt", label: t("assessment.roofTypes.asphalt") },
    { value: "thatch", label: t("assessment.roofTypes.thatch") },
  ];

  const soilTypes = [
    { value: "sandy", label: t("assessment.soilTypes.sandy") },
    { value: "loamy", label: t("assessment.soilTypes.loamy") },
    { value: "clay", label: t("assessment.soilTypes.clay") },
    { value: "silt", label: t("assessment.soilTypes.silt") },
    { value: "peaty", label: t("assessment.soilTypes.peaty") },
    { value: "chalky", label: t("assessment.soilTypes.chalky") },
  ];

  // Load states and districts on component mount
  useEffect(() => {
    const loadStatesDistricts = async () => {
      try {
        const data = await locationService.getStatesDistricts();
        setStatesDistricts(data);
      } catch (error) {
        console.error("Failed to load states and districts:", error);
      }
    };
    loadStatesDistricts();
  }, []);

  // Update available districts when state changes
  useEffect(() => {
    if (formData.state && statesDistricts[formData.state]) {
      setAvailableDistricts(statesDistricts[formData.state].districts);
      // Reset district when state changes
      if (formData.district && !statesDistricts[formData.state].districts.includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: "" }));
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.state, formData.district, statesDistricts]);

  // Create dropdown options for states
  const stateOptions = Object.keys(statesDistricts).map(stateName => ({
    value: stateName,
    label: stateName
  }));

  // Create dropdown options for districts
  const districtOptions = availableDistricts.map(district => ({
    value: district,
    label: district
  }));

  // Get current location using browser's Geolocation API
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        //setLocationError(errorMessage);
        //setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };


  // Validation logic for each step
  const isStepValid = () => {
    if (currentStep === 1) {
      return (
        formData.name.trim() &&
        formData.dwellers.trim() &&
        formData.phone.trim() &&
        formData.email.trim()
      );
    }
    if (currentStep === 2) {
      return (
        formData.roofArea.trim() &&
        formData.openSpace.trim() &&
        formData.roofType.trim() &&
        formData.soilType.trim()
      );
    }
    if (currentStep === 3) {
      return (
        formData.address.trim() &&
        formData.state.trim() &&
        formData.district.trim() &&
        formData.latitude.trim() &&
        formData.longitude.trim() &&
        formData.rainfall.trim()
      );
    }
    return false;
  };

  // navigation buttons
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        const token = localStorage.getItem("token"); // get from auth

  await fetch("/api/assessments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData), // <-- formData should have all fields
        });

        navigate("/results");
      } catch (error) {
        console.error("Failed to save assessment", error);
      }
    }
  };


  return (
    <MainLayout>
      {/* Enhanced Header Section */}
      <div className={`relative mb-8 -mx-6 -mt-6 px-6 pt-8 pb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100 ${styles.fadeInUp}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className={`flex items-center space-x-4 mb-4 ${styles.slideInLeft}`}>
           
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${styles.gradientText}`}>
                {t("assessment.title")}
              </h1>
              <p className="text-indigo-700 font-medium text-lg">
                {t("assessment.subtitle")}
              </p>
            </div>
          </div>
          
          {/* Progress Stats */}
          <div className={`flex items-center space-x-6 ${styles.slideInRight} ${styles.staggerDelay1}`}>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-70 rounded-full backdrop-blur-sm border border-white border-opacity-20">
              <ActivityIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                Step {currentStep} of 3
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-70 rounded-full backdrop-blur-sm border border-white border-opacity-20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">
                {Math.round(((currentStep - 1) / 3) * 100)}% Complete
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modern Stepper */}
      <div className={`mb-8 ${styles.fadeInUp} ${styles.staggerDelay2}`}>
        <Card className={`${styles.stepperCard} p-8 overflow-hidden shadow-2xl`}>
          <div className="flex items-center justify-between relative z-10">
            {[1, 2, 3].map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-14 h-14 rounded-2xl text-lg font-bold transition-all duration-500 transform ${
                      currentStep === step
                        ? `${styles.stepActive} text-white scale-110`
                        : currentStep > step
                        ? `${styles.stepCompleted} text-white`
                        : `${styles.stepIndicator} text-gray-600 hover:scale-105`
                    } ${styles.glowEffect}`}
                  >
                    {currentStep > step ? (
                      <CheckCircleIcon size={24} className="animate-bounce" />
                    ) : (
                      <span>{step}</span>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <span className={`text-sm font-semibold ${
                      currentStep >= step ? 'text-white' : 'text-gray-300'
                    }`}>
                      {step === 1
                        ? t("assessment.steps.basicInfo")
                        : step === 2
                        ? t("assessment.steps.propertyDetails")
                        : t("assessment.steps.location")}
                    </span>
                    {step === 1 && (
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <UserIcon className="h-3 w-3 text-gray-300" />
                        <PhoneIcon className="h-3 w-3 text-gray-300" />
                        <MailIcon className="h-3 w-3 text-gray-300" />
                      </div>
                    )}
                    {step === 2 && (
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <HomeIcon className="h-3 w-3 text-gray-300" />
                        <BuildingIcon className="h-3 w-3 text-gray-300" />
                        <TreesIcon className="h-3 w-3 text-gray-300" />
                      </div>
                    )}
                    {step === 3 && (
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <MapIcon className="h-3 w-3 text-gray-300" />
                        <CloudRainIcon className="h-3 w-3 text-gray-300" />
                        <LocateIcon className="h-3 w-3 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Connection Line */}
                {index < 2 && (
                  <div className="flex-1 px-4">
                    <div className="relative h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${
                          currentStep > step + 1
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 w-full'
                            : currentStep === step + 1
                            ? 'bg-gradient-to-r from-blue-400 to-indigo-500 w-1/2'
                            : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Enhanced Progress Bar */}
        <div className={`mt-6 ${styles.fadeInUp} ${styles.staggerDelay3}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Overall Progress</span>
            <span className="text-sm font-bold text-indigo-600">
              {Math.round(((currentStep - 1) / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 h-3 rounded-full shadow-inner overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${styles.progressBar} ${
                currentStep === 1 ? styles.progressWidth0 : 
                currentStep === 2 ? styles.progressWidth33 : 
                currentStep === 3 ? styles.progressWidth66 :
                styles.progressWidth100
              }`}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Form Sections */}
      <Card className={`${styles.modernCard} ${styles.formSection} p-8 shadow-2xl border-0`}>
        {/* Step 1: Enhanced Basic Info */}
        {currentStep === 1 && (
          <div className={`${styles.fadeInUp}`}>
            <div className="flex items-center space-x-4 mb-8">
              <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl ${styles.floatAnimation}`}>
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${styles.sectionTitle}`}>
                  {t("assessment.basicInfo.heading")}
                </h2>
                <p className="text-gray-600 font-medium">Tell us about yourself and your household</p>
              </div>
            </div>
            
            <div className={`${styles.formGrid} grid gap-6`}>
              <div className={styles.inputGroup}>
                <Input
                  name="name"
                  label={t("assessment.basicInfo.name")}
                  placeholder={t("assessment.basicInfo.namePlaceholder")}
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  icon={<UserIcon size={18} />}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <Input
                  name="dwellers"
                  label={t("assessment.basicInfo.dwellers")}
                  type="number"
                  placeholder={t("assessment.basicInfo.dwellersPlaceholder")}
                  icon={<UsersIcon size={18} />}
                  required
                  value={formData.dwellers}
                  onChange={(e) =>
                    setFormData({ ...formData, dwellers: e.target.value })
                  }
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles.inputGroup}>
                  <Input
                    name="phone"
                    label={t("assessment.basicInfo.phone")}
                    type="tel"
                    placeholder={t("assessment.basicInfo.phonePlaceholder")}
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    icon={<PhoneIcon size={18} />}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <Input
                    name="email"
                    label={t("assessment.basicInfo.email")}
                    type="email"
                    placeholder={t("assessment.basicInfo.emailPlaceholder")}
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    icon={<MailIcon size={18} />}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enhanced Property Details */}
        {currentStep === 2 && (
          <div className={`${styles.fadeInUp}`}>
            <div className="flex items-center space-x-4 mb-8">
              <div className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl ${styles.floatAnimation}`}>
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${styles.sectionTitle}`}>
                  {t("assessment.propertyDetails.heading")}
                </h2>
                <p className="text-gray-600 font-medium">Provide details about your property and roof specifications</p>
              </div>
            </div>
            
            <div className={`${styles.formGrid} grid gap-6`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles.inputGroup}>
                  <Input
                    name="roofArea"
                    label={t("assessment.propertyDetails.roofArea")}
                    type="number"
                    placeholder={t("assessment.propertyDetails.roofAreaPlaceholder")}
                    icon={<HomeIcon size={18} />}
                    required
                    value={formData.roofArea}
                    onChange={(e) =>
                      setFormData({ ...formData, roofArea: e.target.value })
                    }
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <Input
                    name="openSpace"
                    label={t("assessment.propertyDetails.openSpace")}
                    type="number"
                    placeholder={t("assessment.propertyDetails.openSpacePlaceholder")}
                    required
                    value={formData.openSpace}
                    onChange={(e) =>
                      setFormData({ ...formData, openSpace: e.target.value })
                    }
                    icon={<TreesIcon size={18} />}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles.inputGroup}>
                  <Dropdown
                    label={t("assessment.propertyDetails.roofType")}
                    options={roofTypes}
                    placeholder={t("assessment.propertyDetails.roofType")}
                    required
                    value={formData.roofType}
                    onChange={(val) =>
                      setFormData({ ...formData, roofType: val as string })
                    }
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <Dropdown
                    label={t("assessment.propertyDetails.soilType")}
                    options={soilTypes}
                    placeholder={t("assessment.propertyDetails.soilType")}
                    required
                    value={formData.soilType}
                    onChange={(val) =>
                      setFormData({ ...formData, soilType: val as string })
                    }
                  />
                </div>
              </div>
              
              {/* Enhanced File Upload Section (Placeholder) */}
              <div className={`${styles.inputGroup} mt-4`}>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  {t("assessment.propertyDetails.roofPhoto")} (Optional)
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors duration-300 bg-gradient-to-br from-gray-50 to-blue-50">
                  <div className={`flex flex-col items-center ${styles.floatAnimation}`}>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-4">
                      <UploadCloudIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-base text-gray-700 mb-2 font-medium">
                      {t("assessment.propertyDetails.dragDrop") || "Drag and drop your roof photo here"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("assessment.propertyDetails.orBrowse") || "or click to browse files"}
                    </p>
                    <div className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-lg">
                      Coming Soon
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Enhanced Location Details */}
        {currentStep === 3 && (
          <div className={`${styles.fadeInUp}`}>
            <div className="flex items-center space-x-4 mb-8">
              <div className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl ${styles.floatAnimation}`}>
                <MapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${styles.sectionTitle}`}>
                  {t("assessment.locationDetails.heading")}
                </h2>
                <p className="text-gray-600 font-medium">Specify your location and local weather conditions</p>
              </div>
            </div>
            
            <div className={`${styles.formGrid} grid gap-6`}>
              <div className={styles.inputGroup}>
                <Input
                  name="address"
                  label={t("assessment.locationDetails.address")}
                  placeholder={t("assessment.locationDetails.addressPlaceholder")}
                  icon={<MapPinIcon size={18} />}
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              
              {/* Enhanced State and District Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles.inputGroup}>
                  <Dropdown
                    label="State"
                    options={stateOptions}
                    placeholder="Select your state"
                    required
                    value={formData.state}
                    onChange={(val) =>
                      setFormData({ ...formData, state: val as string })
                    }
                  />
                </div>
                <div className={styles.inputGroup}>
                  <Dropdown
                    label="District"
                    options={districtOptions}
                    placeholder="Select your district"
                    required
                    value={formData.district}
                    onChange={(val) =>
                      setFormData({ ...formData, district: val as string })
                    }
                  />
                </div>
              </div>
              
              {/* Enhanced Coordinates Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles.inputGroup}>
                  <Input
                    name="latitude"
                    label={t("assessment.locationDetails.latitude")}
                    placeholder={t("assessment.locationDetails.latitudePlaceholder")}
                    required
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                </div>
                <div className={styles.inputGroup}>
                  <Input
                    name="longitude"
                    label={t("assessment.locationDetails.longitude")}
                    placeholder={t("assessment.locationDetails.longitudePlaceholder")}
                    required
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
              </div>
              
              {/* Enhanced Location Services */}
              <div className={`${styles.inputGroup} mb-6`}>
                <div className="flex flex-col space-y-4">
                  <div className={`${styles.locationButton} ${styles.navigationButton} bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 shadow-xl w-[218px] rounded-xl overflow-hidden`}>
                    <Button
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                    >
                      <div className="flex items-center space-x-3">
                        <LocateIcon size={20} className={locationLoading ? 'animate-spin' : ''} />
                        <span className="font-semibold">
                          {locationLoading ? "Getting Location..." : "Use Current Location"}
                        </span>
                      </div>
                    </Button>
                  </div>
                  
                  {locationError && (
                    <div className={`${styles.locationStatus} p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl`}>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-red-600 text-sm font-bold">!</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-700 mb-1">⚠️ {locationError}</p>
                          <p className="text-xs text-red-600">
                            Please enable location permissions or enter coordinates manually.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.latitude && formData.longitude && !locationLoading && (
                    <div className={`${styles.locationStatus} p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm">✓</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-700">
                            📍 Location detected successfully!
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Coordinates: {parseFloat(formData.latitude).toFixed(4)}°N, {parseFloat(formData.longitude).toFixed(4)}°E
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <Input
                  name="rainfall"
                  label={t("assessment.locationDetails.rainfall")}
                  type="number"
                  placeholder={t("assessment.locationDetails.rainfallPlaceholder")}
                  icon={<CloudRainIcon size={18} />}
                  required
                  value={formData.rainfall}
                  onChange={(e) =>
                    setFormData({ ...formData, rainfall: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Navigation Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-between mt-12 pt-8 border-t border-gray-100 space-y-4 sm:space-y-0 ${styles.fadeInUp} ${styles.staggerDelay4}`}>
          {currentStep > 1 ? (
            <div className={`${styles.navigationButton} overflow-hidden rounded-xl`}>
              <Button variant="outline" onClick={handlePrevStep}>
                <div className="flex items-center space-x-2">
                  <ArrowLeftIcon size={18} />
                  <span className="font-semibold">{t("assessment.buttons.previous")}</span>
                </div>
              </Button>
            </div>
          ) : (
            <div className="hidden sm:block"></div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
            <div className="flex space-x-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {currentStep} of 3
            </span>
          </div>

          <div className={`${styles.navigationButton} overflow-hidden rounded-xl`}>
            <Button
              variant="primary"
              onClick={handleNextStep}
              disabled={!isStepValid()}
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold">
                  {currentStep === 3
                    ? t("assessment.buttons.submit")
                    : t("assessment.buttons.next")}
                </span>
                {currentStep === 3 ? (
                  <SendIcon size={18} />
                ) : (
                  <ArrowRightIcon size={18} />
                )}
              </div>
            </Button>
          </div>
        </div>
      </Card>
    </MainLayout>
  );
};

export default AssessmentInput;
