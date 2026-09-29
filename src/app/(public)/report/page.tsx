'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  Construction,
  Trash2,
  Droplets,
  Waves,
  Lightbulb,
  Shield,
  Flame,
  Building,
  Loader2,
  Users,
  Compass,
  Check,
  Eye,
} from 'lucide-react';

// Dynamic import of LocationPicker with SSR disabled to prevent Leaflet window reference errors
const LocationPicker = dynamic(() => import('@/components/maps/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        Loading Interactive GPS Map...
      </div>
    </div>
  ),
});

// Category Icon Mapping
const CATEGORY_ICONS: Record<string, any> = {
  'road-damage': Construction,
  'waste-management': Trash2,
  'water-supply': Droplets,
  'drainage-sewage': Waves,
  'street-lighting': Lightbulb,
  'public-safety': Shield,
  'environmental-hazard': Flame,
  'public-infrastructure': Building,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  colorCode: string;
  icon: string;
  defaultSeverity: string;
  isEmergencyCategory: boolean;
}

export default function ReportIssueWizard() {
  const router = useRouter();

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [safetyRisk, setSafetyRisk] = useState('LOW');
  const [affectedPeopleEst, setAffectedPeopleEst] = useState(50);

  // Location State (Default: Pokhara Lakeside)
  const [latitude, setLatitude] = useState(28.2096);
  const [longitude, setLongitude] = useState(83.9856);
  const [address, setAddress] = useState('Baidam Road, Lakeside, Pokhara');
  const [city, setCity] = useState('Pokhara');
  const [ward, setWard] = useState('Ward 6');

  // Evidence Images State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // AI Assistant States
  const [suggestedCategory, setSuggestedCategory] = useState<Category | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Duplicate Check States
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [ignoreDuplicateWarning, setIgnoreDuplicateWarning] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdIssue, setCreatedIssue] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0 && !categoryId) {
            setCategoryId(data.categories[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Real-time AI category suggestion when title or description changes
  useEffect(() => {
    if (title.trim().length < 5 && description.trim().length < 5) {
      setSuggestedCategory(null);
      return;
    }

    const timer = setTimeout(async () => {
      setAiAnalyzing(true);
      try {
        const res = await fetch('/api/ai/suggest-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        const data = await res.json();
        if (data.suggestedCategory) {
          setSuggestedCategory(data.suggestedCategory);
        } else {
          setSuggestedCategory(null);
        }
      } catch (err) {
        console.warn('AI suggestion error', err);
      } finally {
        setAiAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [title, description]);

  // Check for duplicates when entering Step 5
  useEffect(() => {
    if (currentStep === 5 && !createdIssue) {
      setCheckingDuplicates(true);
      fetch('/api/ai/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          latitude,
          longitude,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.matches && data.matches.length > 0) {
            setDuplicateMatches(data.matches);
          } else {
            setDuplicateMatches([]);
          }
        })
        .catch((err) => console.warn('Duplicate check failed', err))
        .finally(() => setCheckingDuplicates(false));
    }
  }, [currentStep, title, description, categoryId, latitude, longitude]);

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMessage('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setUploadedImages((prev) => [...prev, data.url]);
        } else {
          setErrorMessage(data.error || 'Failed to upload photo');
        }
      }
    } catch (err) {
      setErrorMessage('Network error during file upload');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Issue to API
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          severity,
          safetyRisk,
          affectedPeopleEst: Number(affectedPeopleEst),
          isEmergency,
          latitude,
          longitude,
          address,
          city,
          ward,
          images: uploadedImages,
        }),
      });

      const data = await res.json();
      if (res.ok && data.issue) {
        setCreatedIssue(data.issue);
      } else {
        setErrorMessage(data.error || 'Failed to submit report');
      }
    } catch (err) {
      setErrorMessage('A network error occurred while submitting your report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  // Step Navigation Validation
  const canGoNext = () => {
    if (currentStep === 1) return !!categoryId;
    if (currentStep === 2) return title.trim().length >= 5 && description.trim().length >= 10;
    if (currentStep === 3) return address.trim().length >= 2;
    if (currentStep === 4) return true; // Evidence is optional but encouraged
    return true;
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-4xl mx-auto">
        {/* Wizard Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Civic Intelligence Pipeline
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Report a Community Issue
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Your report is geocoded, deduplicated with AI, verified by neighbors, and prioritized for municipality response.
          </p>
        </div>

        {/* 5-Step Progress Indicator */}
        {!createdIssue && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-8">
            <div className="flex items-center justify-between relative">
              {[
                { num: 1, label: 'Category' },
                { num: 2, label: 'Description' },
                { num: 3, label: 'Location' },
                { num: 4, label: 'Evidence' },
                { num: 5, label: 'Review & AI' },
              ].map((step, idx) => (
                <div key={step.num} className="flex-1 flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === step.num
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md'
                        : currentStep > step.num
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 text-center hidden sm:block ${
                      currentStep === step.num ? 'text-indigo-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Callout */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <p className="flex-1">{errorMessage}</p>
            <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-rose-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Screen after submission */}
        {createdIssue ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-md text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              Tracking Code: {createdIssue.trackingCode}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Report Submitted Successfully!
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto text-sm mb-6">
              Thank you for contributing to your community. Your report has been registered with priority score{' '}
              <strong className="text-indigo-600">{createdIssue.priorityScore}/100</strong> and community confidence{' '}
              <strong className="text-emerald-600">{createdIssue.communityConfidence}%</strong>.
            </p>

            <div className="bg-slate-50 rounded-2xl p-5 max-w-md mx-auto mb-8 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Issue Title:</span>
                <span className="font-semibold text-slate-900">{createdIssue.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-900">{createdIssue.address}, {createdIssue.city}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Assigned Municipality:</span>
                <span className="font-semibold text-indigo-600">{createdIssue.assignedOrg?.name || 'Pokhara Metropolitan City'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Reputation Awarded:</span>
                <span className="font-bold text-emerald-600">+5 Civic Points</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/issues/${createdIssue.id}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-primary text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
              >
                View Public Issue Page
              </Link>
              <Link
                href="/map"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Explore Live Map
              </Link>
              <button
                onClick={() => {
                  setCreatedIssue(null);
                  setCurrentStep(1);
                  setTitle('');
                  setDescription('');
                  setUploadedImages([]);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        ) : (
          /* Wizard Main Container */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            {/* STEP 1: CATEGORY SELECTION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Select Issue Category</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Choose the sector that best describes the community infrastructure or safety concern.
                  </p>
                </div>

                {/* Emergency Toggle & Disclaimer */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isEmergency
                      ? 'bg-rose-50/80 border-rose-300 text-rose-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isEmergency ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Is this an active hazard or emergency?
                        </h4>
                        <p className="text-xs text-slate-500">
                          Critical safety risks receive priority dispatch tagging.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEmergency}
                        onChange={(e) => setIsEmergency(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                  {isEmergency && (
                    <p className="mt-3 pt-3 border-t border-rose-200 text-xs text-rose-700 font-medium">
                      ⚠️ <strong>Emergency Disclaimer:</strong> Civora connects community intelligence with local municipal teams. It does not replace official national emergency hotlines. For immediate life-threatening crises, please contact Police (100), Fire (101), or Ambulance (102).
                    </p>
                  )}
                </div>

                {/* Categories Grid */}
                {categoriesLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <div key={n} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {categories.map((cat) => {
                      const IconComponent = CATEGORY_ICONS[cat.slug] || Construction;
                      const isSelected = categoryId === cat.id;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryId(cat.id)}
                          className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-md'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                            style={{
                              backgroundColor: `${cat.colorCode}15`,
                              color: cat.colorCode,
                            }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {cat.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                              {cat.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PROBLEM DESCRIPTION */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Describe the Issue</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Provide clear, objective details to help municipal inspectors understand the impact.
                  </p>
                </div>

                {/* AI Category Suggestion Pill */}
                {suggestedCategory && suggestedCategory.id !== categoryId && (
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3 text-xs text-indigo-900 fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                      <span>
                        AI suggests category: <strong>{suggestedCategory.name}</strong> based on your description.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCategoryId(suggestedCategory.id)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Deep pothole causing motorbike accidents near Lakeside Hallanchowk"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {title.length}/100 characters (minimum 5)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Problem Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe how long this issue has persisted, how it affects vehicles/pedestrians, and any visible hazards..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {description.length}/500 characters (minimum 10)
                  </span>
                </div>

                {/* Severity & Safety Risk Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Severity Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { level: 'LOW', label: 'Low', color: 'border-emerald-300 text-emerald-700' },
                        { level: 'MEDIUM', label: 'Med', color: 'border-amber-300 text-amber-700' },
                        { level: 'HIGH', label: 'High', color: 'border-orange-300 text-orange-700' },
                        { level: 'CRITICAL', label: 'Crit', color: 'border-rose-400 text-rose-700' },
                      ].map((item) => (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setSeverity(item.level)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                            severity === item.level
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : `bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100`
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Safety Risk
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['LOW', 'MEDIUM', 'HIGH', 'EXTREME'].map((risk) => (
                        <button
                          key={risk}
                          type="button"
                          onClick={() => setSafetyRisk(risk)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                            safetyRisk === risk
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {risk === 'EXTREME' ? 'Extr' : risk.slice(0, 4)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Estimated Affected People */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Estimated People Affected Daily
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: 25, label: '< 50 people' },
                      { val: 120, label: '50 - 200' },
                      { val: 350, label: '201 - 500' },
                      { val: 800, label: '500+ citizens' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setAffectedPeopleEst(item.val)}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                          affectedPeopleEst === item.val
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LOCATION PINNING */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pinpoint Location</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Drag the map pin or use your device GPS so field teams know exactly where to go.
                  </p>
                </div>

                <LocationPicker
                  latitude={latitude}
                  longitude={longitude}
                  address={address}
                  city={city}
                  ward={ward}
                  onLocationChange={(loc) => {
                    setLatitude(loc.latitude);
                    setLongitude(loc.longitude);
                    setAddress(loc.address);
                    setCity(loc.city);
                    setWard(loc.ward);
                  }}
                />
              </div>
            )}

            {/* STEP 4: EVIDENCE UPLOAD */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Upload Photo Evidence</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Clear photographs increase Community Confidence and expedite dispatch.
                  </p>
                </div>

                {/* Drag & drop upload zone */}
                <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    id="evidence-upload"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="evidence-upload" className="cursor-pointer block">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Click to upload photos or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WebP up to 10MB each
                    </p>
                  </label>
                </div>

                {uploadingImage && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing and uploading evidence photo...
                  </div>
                )}

                {/* Preview Gallery */}
                {uploadedImages.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 mb-3">
                      Attached Evidence ({uploadedImages.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {uploadedImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video group shadow-sm">
                          <img src={imgUrl} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: REVIEW & AI DUPLICATE CHECK */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Review & AI Verification</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Civora is checking our spatial database for matching complaints before logging your report.
                  </p>
                </div>

                {/* Live Duplicate Warning Alert */}
                {checkingDuplicates ? (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center gap-3 text-indigo-900 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    Running AI geospatial duplicate detection against nearby active issues...
                  </div>
                ) : duplicateMatches.length > 0 && !ignoreDuplicateWarning ? (
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">
                          Possible Duplicate Issue Detected Nearby!
                        </h4>
                        <p className="text-xs text-amber-800">
                          A similar complaint was already submitted in this immediate vicinity. Confirming an existing issue increases its priority faster than creating a duplicate!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-3">
                      {duplicateMatches.slice(0, 2).map((match) => (
                        <div
                          key={match.existingIssue.id}
                          className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {match.existingIssue.trackingCode}
                              </span>
                              <span className="font-semibold text-slate-800">
                                {match.distanceMeters}m away
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-emerald-700 font-semibold">
                                {match.existingIssue.confirmationsCount} confirmations
                              </span>
                            </div>
                            <p className="font-semibold text-slate-900">{match.existingIssue.title}</p>
                          </div>
                          <Link
                            href={`/issues/${match.existingIssue.id}`}
                            target="_blank"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" /> View & Confirm
                          </Link>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIgnoreDuplicateWarning(true)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                      >
                        This is a separate issue — submit anyway
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>
                      <strong>AI Check Passed:</strong> No duplicate reports detected within a 350-meter radius.
                    </span>
                  </div>
                )}

                {/* Summary Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Category
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: selectedCategoryObj?.colorCode || '#6366f1' }}
                        />
                        {selectedCategoryObj?.name}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Severity & Risk
                      </span>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {severity} • Safety: {safetyRisk}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Issue Summary
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{description}</p>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">{address}</p>
                      <p className="text-slate-500">
                        {ward ? `${ward}, ` : ''}{city}, Nepal ({latitude.toFixed(5)}, {longitude.toFixed(5)})
                      </p>
                    </div>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Attached Photos ({uploadedImages.length})
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {uploadedImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="thumb"
                            className="w-16 h-12 rounded-lg object-cover border border-slate-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  disabled={!canGoNext()}
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-primary text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing Report...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit & Verify Report
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
