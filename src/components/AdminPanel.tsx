import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, CheckCircle, AlertCircle, Link as LinkIcon, Sparkles, Video, ChevronDown, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { IMAGE_AI_WEBSITES, VIDEO_AI_WEBSITES } from '../constants';

const CATEGORIES = [
  { id: 'Explore', label: 'Explore Gallery' },
  // Explore Categories (Sub-categories)
  { id: 'Fashion Model', label: 'Fashion Model' },
  { id: 'Fitness Model', label: 'Fitness Model' },
  { id: 'Glamour Model', label: 'Glamour Model' },
  { id: 'Traditional Model', label: 'Traditional Model' },
  { id: 'Casual Lifestyle', label: 'Casual Lifestyle' },
  { id: 'Product Ads', label: 'Product Ads' },
  { id: 'Fashion Ads', label: 'Fashion Ads' },
  { id: 'Fitness Ads', label: 'Fitness Ads' },
  { id: 'Beauty Ads', label: 'Beauty Ads' },
  { id: 'Food Ads', label: 'Food Ads' },
  { id: 'Tech Ads', label: 'Tech Ads' },
  { id: 'Business Ads', label: 'Business Ads' },
  { id: 'Social Ads', label: 'Social Ads' },
  { id: 'Story Ads', label: 'Story Ads' },
  { id: 'Global Style', label: 'Global Style' },
  { id: 'Luxury Ads', label: 'Luxury Ads' },
  { id: 'Ecom Ads', label: 'Ecom Ads' },
  { id: 'Gaming', label: 'Gaming' },
  { id: 'Stock Market', label: 'Stock Market' },
  { id: 'Personal Finance', label: 'Personal Finance' },
  { id: 'Tech', label: 'Tech' },
  { id: 'Vlogging', label: 'Vlogging' },
  { id: 'Cricket', label: 'Cricket' },
  { id: 'Movies', label: 'Movies' },
  { id: 'Web Series', label: 'Web Series' },
  { id: 'Comedy', label: 'Comedy' },
  { id: 'Podcast', label: 'Podcast' },
  { id: 'Fitness', label: 'Fitness' },
  { id: 'Motivation', label: 'Motivation' },
  { id: 'Education', label: 'Education' },
  { id: 'Online Earning', label: 'Online Earning' },
  { id: 'Business Ideas', label: 'Business Ideas' },
  { id: 'Automobile', label: 'Automobile' },
  { id: 'Cooking', label: 'Cooking' },
  { id: 'Real Estate', label: 'Real Estate' },
  { id: 'Spirituality', label: 'Spirituality' },
  { id: 'Fashion', label: 'Fashion' },
  { id: 'Beauty', label: 'Beauty' },
  { id: 'Parenting', label: 'Parenting' },
  { id: 'Coding', label: 'Coding' },
  { id: 'Graphic Design', label: 'Graphic Design' },
  { id: 'Photography', label: 'Photography' },
  { id: 'Travel', label: 'Travel' },
  { id: 'News', label: 'News' },
  { id: 'Science', label: 'Science' },
  { id: 'AI', label: 'AI' },
  { id: 'Government Schemes', label: 'Government Schemes' },
  // Original Categories with prefixes
  { id: 'AI Influencer: Fashion Model', label: 'AI Influencer: Fashion Model' },
  { id: 'AI Influencer: Fitness Model', label: 'AI Influencer: Fitness Model' },
  { id: 'AI Influencer: Glamour Model', label: 'AI Influencer: Glamour Model' },
  { id: 'AI Influencer: Traditional Model', label: 'AI Influencer: Traditional Model' },
  { id: 'AI Influencer: Casual Lifestyle', label: 'AI Influencer: Casual Lifestyle' },
  { id: 'Ad Templates: Product Ads', label: 'Ad Templates: Product Ads' },
  { id: 'Ad Templates: Fashion Ads', label: 'Ad Templates: Fashion Ads' },
  { id: 'Ad Templates: Fitness Ads', label: 'Ad Templates: Fitness Ads' },
  { id: 'Ad Templates: Beauty Ads', label: 'Ad Templates: Beauty Ads' },
  { id: 'Ad Templates: Food Ads', label: 'Ad Templates: Food Ads' },
  { id: 'Ad Templates: Tech Ads', label: 'Ad Templates: Tech Ads' },
  { id: 'Ad Templates: Business Ads', label: 'Ad Templates: Business Ads' },
  { id: 'Ad Templates: Social Ads', label: 'Ad Templates: Social Ads' },
  { id: 'Ad Templates: Story Ads', label: 'Ad Templates: Story Ads' },
  { id: 'Ad Templates: Global Style', label: 'Ad Templates: Global Style' },
  { id: 'Ad Templates: Luxury Ads', label: 'Ad Templates: Luxury Ads' },
  { id: 'Ad Templates: Ecom Ads', label: 'Ad Templates: Ecom Ads' },
  { id: 'Trending: Gaming', label: 'Trending: Gaming' },
  { id: 'Trending: Stock Market', label: 'Trending: Stock Market' },
  { id: 'Trending: Personal Finance', label: 'Trending: Personal Finance' },
  { id: 'Trending: Tech', label: 'Trending: Tech' },
  { id: 'Trending: Vlogging', label: 'Trending: Vlogging' },
  { id: 'Trending: Cricket', label: 'Trending: Cricket' },
  { id: 'Trending: Movies', label: 'Trending: Movies' },
  { id: 'Trending: Web Series', label: 'Trending: Web Series' },
  { id: 'Trending: Comedy', label: 'Trending: Comedy' },
  { id: 'Trending: Podcast', label: 'Trending: Podcast' },
  { id: 'Trending: Fitness', label: 'Trending: Fitness' },
  { id: 'Trending: Motivation', label: 'Trending: Motivation' },
  { id: 'Trending: Education', label: 'Trending: Education' },
  { id: 'Trending: Online Earning', label: 'Trending: Online Earning' },
  { id: 'Trending: Business Ideas', label: 'Trending: Business Ideas' },
  { id: 'Trending: Automobile', label: 'Trending: Automobile' },
  { id: 'Trending: Cooking', label: 'Trending: Cooking' },
  { id: 'Trending: Real Estate', label: 'Trending: Real Estate' },
  { id: 'Trending: Spirituality', label: 'Trending: Spirituality' },
  { id: 'Trending: Fashion', label: 'Trending: Fashion' },
  { id: 'Trending: Beauty', label: 'Trending: Beauty' },
  { id: 'Trending: Parenting', label: 'Trending: Parenting' },
  { id: 'Trending: Coding', label: 'Trending: Coding' },
  { id: 'Trending: Graphic Design', label: 'Trending: Graphic Design' },
  { id: 'Trending: Photography', label: 'Trending: Photography' },
  { id: 'Trending: Travel', label: 'Trending: Travel' },
  { id: 'Trending: News', label: 'Trending: News' },
  { id: 'Trending: Science', label: 'Trending: Science' },
  { id: 'Trending: AI', label: 'Trending: AI' },
  { id: 'Trending: Government Schemes', label: 'Trending: Government Schemes' },
  { id: 'All Category: Business Ideas', label: 'All Category: Business Ideas' },
  { id: 'All Category: Automobile', label: 'All Category: Automobile' },
  { id: 'All Category: Cooking', label: 'All Category: Cooking' },
  { id: 'All Category: Real Estate', label: 'All Category: Real Estate' },
  { id: 'All Category: Spirituality', label: 'All Category: Spirituality' },
  { id: 'All Category: Fashion', label: 'All Category: Fashion' },
  { id: 'All Category: Beauty', label: 'All Category: Beauty' },
  { id: 'All Category: Parenting', label: 'All Category: Parenting' },
  { id: 'All Category: Coding', label: 'All Category: Coding' },
  { id: 'All Category: Graphic Design', label: 'All Category: Graphic Design' },
  { id: 'All Category: Photography', label: 'All Category: Photography' },
  { id: 'All Category: Travel', label: 'All Category: Travel' },
  { id: 'All Category: Science', label: 'All Category: Science' },
  { id: 'All Category: Government Schemes', label: 'All Category: Government Schemes' },
  { id: 'All Category: Comedy', label: 'All Category: Comedy' },
  { id: 'Logo Prompt: 3D', label: 'Logo Prompt: 3D' },
  { id: 'Logo Prompt: Animal', label: 'Logo Prompt: Animal' },
  { id: 'Logo Prompt: Business & Startup', label: 'Logo Prompt: Business & Startup' },
  { id: 'Logo Prompt: Cartoon', label: 'Logo Prompt: Cartoon' },
  { id: 'Logo Prompt: Cute', label: 'Logo Prompt: Cute' },
  { id: 'Logo Prompt: Food', label: 'Logo Prompt: Food' },
  { id: 'Logo Prompt: Lettered', label: 'Logo Prompt: Lettered' },
  { id: 'Logo Prompt: Hand-drawn', label: 'Logo Prompt: Hand-drawn' },
  { id: 'Logo Prompt: Minimalist', label: 'Logo Prompt: Minimalist' },
  { id: 'Logo Prompt: Modern', label: 'Logo Prompt: Modern' },
  { id: 'Logo Prompt: Painted', label: 'Logo Prompt: Painted' },
  { id: 'Logo Prompt: Styled', label: 'Logo Prompt: Styled' },
  { id: 'Icon Prompt: 3D', label: 'Icon Prompt: 3D' },
  { id: 'Icon Prompt: Animal', label: 'Icon Prompt: Animal' },
  { id: 'Icon Prompt: Clipart', label: 'Icon Prompt: Clipart' },
  { id: 'Icon Prompt: Cute', label: 'Icon Prompt: Cute' },
  { id: 'Icon Prompt: Flat Graphic', label: 'Icon Prompt: Flat Graphic' },
  { id: 'Icon Prompt: Pixel Art', label: 'Icon Prompt: Pixel Art' },
  { id: 'Icon Prompt: Styled', label: 'Icon Prompt: Styled' },
  { id: 'Icon Prompt: UI', label: 'Icon Prompt: UI' },
];

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'upload'>('upload');
  
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [variablePrompt, setVariablePrompt] = useState('');
  const [selectedAIModels, setSelectedAIModels] = useState<string[]>([]);
  const [modelSearch, setModelSearch] = useState('');
  const [showModelList, setShowModelList] = useState(false);
  const [price, setPrice] = useState<number>(0);
  
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [isAutoGenerate, setIsAutoGenerate] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setSelectedAIModels([]);
  }, [mediaType]);

  useEffect(() => {
    // No longer fetching payment requests
  }, [activeTab]);

  const handleApprovePayment = async (request: any) => {
    // No longer used
  };

  const handleRejectPayment = async (request: any) => {
    // No longer used
  };

  const generateAIDetails = async (url: string) => {
    if (!isAutoGenerate || !url) return;
    setIsGenerating(true);
    try {
      let base64 = '';
      let mimeType = '';

      if (mediaType === 'video') {
        mimeType = 'image/jpeg';
        let videoSrc = '';
        let objectUrl = '';
        let isYouTube = false;
        let youtubeThumbnailUrl = '';
        
        // Check if it's a YouTube URL
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        if (ytMatch && ytMatch[1]) {
          isYouTube = true;
          youtubeThumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
        } else {
          try {
            // Try fetching directly first
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            objectUrl = URL.createObjectURL(blob);
            videoSrc = objectUrl;
          } catch (e) {
            try {
              // Fallback to CORS proxy
              const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
              const response = await fetch(proxyUrl);
              if (!response.ok) throw new Error('Proxy network response was not ok');
              const blob = await response.blob();
              objectUrl = URL.createObjectURL(blob);
              videoSrc = objectUrl;
            } catch (proxyErr) {
              // Last resort, try direct URL with crossOrigin
              videoSrc = url;
            }
          }
        }
        
        if (isYouTube) {
          // Fetch the YouTube thumbnail instead of extracting a frame
          try {
            const response = await fetch(youtubeThumbnailUrl);
            const blob = await response.blob();
            base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = () => resolve((reader.result as string).split(',')[1]);
              reader.onerror = error => reject(error);
            });
          } catch (e) {
            try {
              const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(youtubeThumbnailUrl)}`;
              const response = await fetch(proxyUrl);
              const blob = await response.blob();
              base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = error => reject(error);
              });
            } catch (proxyErr) {
              console.warn('Failed to load YouTube thumbnail for AI analysis.');
            }
          }
        } else {
          try {
            base64 = await new Promise<string>((resolve, reject) => {
              const video = document.createElement('video');
              if (!objectUrl) {
                video.crossOrigin = 'anonymous';
              }
              video.src = videoSrc;
              video.currentTime = 1;
              video.muted = true;
              video.playsInline = true;
              
              video.onloadeddata = () => {
                if (video.duration < 1) video.currentTime = 0;
              };
              
              video.onseeked = () => {
                try {
                  const canvas = document.createElement('canvas');
                  canvas.width = video.videoWidth || 640;
                  canvas.height = video.videoHeight || 360;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
                  } else {
                    reject(new Error('Canvas context failed'));
                  }
                } catch (err) {
                  reject(new Error('Failed to extract video frame due to CORS security restrictions.'));
                } finally {
                  if (objectUrl) URL.revokeObjectURL(objectUrl);
                }
              };
              
              video.onerror = () => {
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                reject(new Error('Video load failed. CORS policy might be blocking the video URL.'));
              };
            });
          } catch (err) {
            console.warn("Frame extraction failed, falling back to URL analysis", err);
          }
        }
      } else {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Network response was not ok');
          const blob = await response.blob();
          mimeType = blob.type || 'image/jpeg';
          base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
          });
        } catch (e) {
          try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Proxy network response was not ok');
            const blob = await response.blob();
            mimeType = blob.type || 'image/jpeg';
            base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = () => resolve((reader.result as string).split(',')[1]);
              reader.onerror = error => reject(error);
            });
          } catch (proxyErr) {
            console.warn('Image load failed. CORS policy might be blocking the image URL. Falling back to URL analysis.');
          }
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const promptInstruction = `Analyze this ${mediaType} and provide a short catchy title, a detailed generation prompt that could recreate this ${mediaType}, and a variable prompt. The variable prompt must be the exact same prompt but with exactly 4 key elements replaced by bracketed variables. CRITICAL INSTRUCTION: Do NOT use generic variable names (like [Subject], [Style], [Lighting], [Camera]) every time. Instead, invent 4 highly specific, unique, and creative variable names that perfectly match the unique elements of this specific ${mediaType} (e.g., if it's a cyberpunk cat, use variables like [Neon_Color], [Feline_Breed], [Futuristic_Accessory], [Alley_Atmosphere]). It is critical that there are exactly 4 variables in the variable prompt, and they must be different and unique for every generation.`;

      const fallbackInstruction = `I have a ${mediaType} at this URL/filename: {URL_PLACEHOLDER}. Please guess the content based on the URL/filename and provide a short catchy title, a detailed generation prompt that could recreate this ${mediaType}, and a variable prompt. The variable prompt must be the exact same prompt but with exactly 4 key elements replaced by bracketed variables. CRITICAL INSTRUCTION: Do NOT use generic variable names (like [Subject], [Style], [Lighting], [Camera]) every time. Instead, invent 4 highly specific, unique, and creative variable names that perfectly match the unique elements of this specific ${mediaType}. It is critical that there are exactly 4 variables in the variable prompt, and they must be different and unique for every generation.`;

      let contents: any[] = [];
      if (base64) {
        contents = [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64, mimeType } },
              { text: promptInstruction }
            ]
          }
        ];
      } else {
        // Fallback: Just use the URL text to guess
        contents = [
          {
            role: 'user',
            parts: [
              { text: fallbackInstruction.replace('{URL_PLACEHOLDER}', url) }
            ]
          }
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              prompt: { type: Type.STRING },
              variablePrompt: { type: Type.STRING }
            },
            required: ["title", "prompt", "variablePrompt"]
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        if (result.title) setTitle(result.title);
        if (result.prompt) setPrompt(result.prompt);
        if (result.variablePrompt) setVariablePrompt(result.variablePrompt);
      }
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      const errorStr = err.message || JSON.stringify(err);
      if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
        setError("AI generation quota exceeded. Please enter the title and prompts manually.");
      } else {
        setError("AI Generation failed. Please enter details manually.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url);
  };

  const handleUrlBlur = async () => {
    if (imageUrl && isAutoGenerate) {
      await generateAIDetails(imageUrl);
    }
  };

  const toggleAIModel = (model: string) => {
    setSelectedAIModels(prev => 
      prev.includes(model) 
        ? prev.filter(m => m !== model) 
        : [...prev, model]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!imageUrl) {
      setError(`Please enter a ${mediaType} URL.`);
      return;
    }

    if (!title) {
      setError('Please enter a title.');
      return;
    }

    setIsUploading(true);

    try {
      let actualMediaType = mediaType;
      if (imageUrl.match(/\.(mp4|webm|ogg)$/i)) {
        actualMediaType = 'video';
      } else if (imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        actualMediaType = 'image';
      }
      
      // Determine target collection and category field
      let targetCollection = category;
      let categoryField = category;

      const exploreSubCategories = [
        "Fashion Model", "Fitness Model", "Glamour Model", "Traditional Model", "Casual Lifestyle",
        "Product Ads", "Fashion Ads", "Fitness Ads", "Beauty Ads", "Food Ads", "Tech Ads", 
        "Business Ads", "Social Ads", "Story Ads", "Global Style", "Luxury Ads", "Ecom Ads",
        "Gaming", "Stock Market", "Personal Finance", "Tech", "Vlogging", "Cricket", "Movies", 
        "Web Series", "Comedy", "Podcast", "Fitness", "Motivation", "Education", "Online Earning", 
        "Business Ideas", "Automobile", "Cooking", "Real Estate", "Spirituality", "Fashion", 
        "Beauty", "Parenting", "Coding", "Graphic Design", "Photography", "Travel", "News", 
        "Science", "AI", "Government Schemes"
      ];

      if (exploreSubCategories.includes(category)) {
        targetCollection = 'Explore';
      } else if (category === 'Explore') {
        categoryField = '';
      }

      await addDoc(collection(db, targetCollection), {
        title,
        url: imageUrl,
        type: actualMediaType,
        prompt,
        variablePrompt,
        aiModels: selectedAIModels,
        category: categoryField,
        price,
        likes: 0,
        views: 0,
        sales: 0,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      
      // Reset form
      setTitle('');
      setPrompt('');
      setVariablePrompt('');
      setSelectedAIModels([]);
      setPrice(0);
      setImageUrl('');
      setImagePreview(null);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || `Failed to upload ${mediaType}.`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-zinc-400">Manage media and verify payments.</p>
        </div>
        
        <div className="flex p-1 bg-zinc-900 border border-white/10 rounded-2xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'upload' 
                ? 'bg-white text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Media Upload
          </button>
        </div>
      </div>

      {activeTab === 'upload' && (
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8">
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-emerald-400">
            <CheckCircle size={20} className="shrink-0" />
            <p>{mediaType === 'image' ? 'Image' : 'Video'} uploaded successfully!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Media Upload */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Content Type</label>
                <div className="flex p-1 bg-zinc-800 rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                      mediaType === 'image' 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <ImageIcon size={18} />
                    IMAGE
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                      mediaType === 'video' 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Video size={18} />
                    VIDEO
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    {mediaType === 'video' ? 'Video URL (YouTube, Vimeo, etc.)' : 'Image URL'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                      <LinkIcon size={18} />
                    </div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={handleUrlChange}
                      onBlur={handleUrlBlur}
                      placeholder={mediaType === 'video' ? "Paste video URL here..." : "https://example.com/image.jpg"}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="relative aspect-square md:aspect-[4/5] rounded-2xl border border-zinc-700 overflow-hidden bg-zinc-800/50 flex flex-col items-center justify-center">
                  {imagePreview ? (
                    mediaType === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-black/40">
                        <div className="text-center p-4">
                          <Video size={48} className="mx-auto mb-2 text-indigo-400" />
                          <p className="text-xs text-zinc-300 line-clamp-2">{imageUrl}</p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x500?text=Invalid+Image+URL';
                        }}
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center text-zinc-600">
                      {mediaType === 'video' ? <Video size={32} className="mb-3 opacity-50" /> : <ImageIcon size={32} className="mb-3 opacity-50" />}
                      <span className="text-sm font-medium">{mediaType === 'video' ? 'Video' : 'Image'} preview will appear here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6 relative">
              {isGenerating && (
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-10">
                  <div className="flex flex-col items-center gap-3 text-indigo-400 bg-zinc-900 p-6 rounded-2xl border border-indigo-500/20 shadow-2xl">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-sm font-medium">AI is analyzing {mediaType}...</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isAutoGenerate ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Auto-fill with AI</h3>
                    <p className="text-xs text-zinc-400">Generate details automatically</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAutoGenerate(!isAutoGenerate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAutoGenerate ? 'bg-indigo-500' : 'bg-zinc-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoGenerate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    setCategory(newCategory);
                    
                    // Auto-set price based on category
                    if (newCategory.startsWith('AI Influencer')) {
                      setPrice(59);
                    } else if (newCategory.startsWith('Ad Templates')) {
                      setPrice(49);
                    } else if (newCategory.startsWith('Logo Prompt') || newCategory.startsWith('Icon Prompt')) {
                      setPrice(39);
                    } else if (newCategory.startsWith('Trending') || newCategory.startsWith('All Category')) {
                      setPrice(29);
                    } else {
                      setPrice(0);
                    }
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cyberpunk Cityscape"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`The exact prompt used to generate this ${mediaType}...`}
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Variable Prompt</label>
                <textarea
                  value={variablePrompt}
                  onChange={(e) => setVariablePrompt(e.target.value)}
                  placeholder="[Subject: ...], [Style: ...]"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Model</h3>
                  <div className="flex p-1 bg-zinc-800 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setMediaType('image')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        mediaType === 'image' 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      IMAGE
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('video')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        mediaType === 'video' 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      VIDEO
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300 italic">Select the AI model your prompt uses</label>
                  <div className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={modelSearch}
                        onChange={(e) => {
                          setModelSearch(e.target.value);
                          setShowModelList(true);
                        }}
                        onFocus={() => setShowModelList(true)}
                        placeholder="Select Prompt Type"
                        className="w-full bg-[#2A2B3D] border border-zinc-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <ChevronDown 
                        className={`absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none transition-transform ${showModelList ? 'rotate-180' : ''}`} 
                        size={18} 
                      />
                    </div>

                    {showModelList && (
                      <div className="absolute z-20 w-full mt-2 bg-[#1A1B2D] border border-zinc-700/50 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                        {(mediaType === 'image' ? IMAGE_AI_WEBSITES : VIDEO_AI_WEBSITES)
                          .filter(model => model.toLowerCase().includes(modelSearch.toLowerCase()))
                          .map(model => (
                            <button
                              key={model}
                              type="button"
                              onClick={() => {
                                toggleAIModel(model);
                                setModelSearch('');
                                setShowModelList(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-indigo-600/20 flex items-center justify-between ${
                                selectedAIModels.includes(model) ? 'text-indigo-400 bg-indigo-600/10' : 'text-zinc-300'
                              }`}
                            >
                              {model}
                              {selectedAIModels.includes(model) && <CheckCircle size={14} />}
                            </button>
                          ))}
                        {(mediaType === 'image' ? IMAGE_AI_WEBSITES : VIDEO_AI_WEBSITES).filter(model => model.toLowerCase().includes(modelSearch.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-sm text-zinc-500 italic">No models found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Click outside to close */}
                {showModelList && (
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowModelList(false)}
                  />
                )}

                {selectedAIModels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAIModels.map(model => (
                      <span 
                        key={model} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-lg text-xs font-medium group"
                      >
                        {model}
                        <button 
                          type="button"
                          onClick={() => toggleAIModel(model)}
                          className="hover:text-white transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0 for free"
                  min="0"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isUploading || isGenerating}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Add to System
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
);
};
