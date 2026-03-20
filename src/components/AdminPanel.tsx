import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Link as LinkIcon, Sparkles, Video, Clock, CreditCard, Check, X as CloseIcon } from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, increment, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI, Type } from "@google/genai";

const CATEGORIES = [
  { id: 'Explore', label: 'Explore Gallery' },
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
  const [activeTab, setActiveTab] = useState<'upload' | 'payments'>('upload');
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [variablePrompt, setVariablePrompt] = useState('');
  const [price, setPrice] = useState<number>(0);
  
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [isAutoGenerate, setIsAutoGenerate] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (activeTab === 'payments') {
      setIsLoadingPayments(true);
      const q = query(
        collection(db, 'payment_requests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPaymentRequests(requests);
        setIsLoadingPayments(false);
      }, (err) => {
        console.error("Error fetching payment requests:", err);
        setIsLoadingPayments(false);
      });

      return () => unsubscribe();
    }
  }, [activeTab]);

  const handleApprovePayment = async (request: any) => {
    try {
      // 1. Update payment request status
      await updateDoc(doc(db, 'payment_requests', request.id), {
        status: 'approved',
        updatedAt: new Date().toISOString()
      });

      // 2. Update user wallet
      const userRef = doc(db, 'users', request.userId);
      await updateDoc(userRef, {
        walletBalance: increment(request.amount)
      });

      // 3. Add transaction record
      await addDoc(collection(db, 'users', request.userId, 'transactions'), {
        amount: request.amount,
        type: 'credit',
        method: request.method,
        status: 'completed',
        description: `Added ₹${request.amount} to wallet via ${request.method}`,
        createdAt: new Date().toISOString()
      });

      alert('Payment approved and wallet updated!');
    } catch (err) {
      console.error("Error approving payment:", err);
      alert('Failed to approve payment.');
    }
  };

  const handleRejectPayment = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this payment request?')) return;
    try {
      await updateDoc(doc(db, 'payment_requests', requestId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      alert('Payment request rejected.');
    } catch (err) {
      console.error("Error rejecting payment:", err);
      alert('Failed to reject payment.');
    }
  };

  const generateAIDetails = async (source: 'file' | 'url', fileOrUrl: File | string) => {
    if (!isAutoGenerate) return;
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
        
        if (source === 'file') {
          objectUrl = URL.createObjectURL(fileOrUrl as File);
          videoSrc = objectUrl;
        } else {
          const url = fileOrUrl as string;
          
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
        if (source === 'file') {
          const file = fileOrUrl as File;
          mimeType = file.type;
          base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
          });
        } else {
          const url = fileOrUrl as string;
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
        const urlToAnalyze = source === 'file' ? (fileOrUrl as File).name : (fileOrUrl as string);
        contents = [
          {
            role: 'user',
            parts: [
              { text: fallbackInstruction.replace('{URL_PLACEHOLDER}', urlToAnalyze) }
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      
      const firstFile = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(firstFile);

      if (isAutoGenerate) {
        await generateAIDetails('file', firstFile);
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url);
  };

  const handleUrlBlur = async () => {
    if (imageUrl && isAutoGenerate) {
      await generateAIDetails('url', imageUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (uploadMethod === 'file' && imageFiles.length === 0) {
      setError(`Please select a ${mediaType} to upload.`);
      return;
    }

    if (uploadMethod === 'url' && !imageUrl) {
      setError(`Please enter a ${mediaType} URL.`);
      return;
    }

    if (!title) {
      setError('Please enter a title.');
      return;
    }

    setIsUploading(true);

    try {
      if (uploadMethod === 'file' && imageFiles.length > 0) {
        setUploadProgress({ current: 0, total: imageFiles.length });
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          let actualMediaType = mediaType;
          if (file.type.startsWith('video/')) {
            actualMediaType = 'video';
          } else if (file.type.startsWith('image/')) {
            actualMediaType = 'image';
          }
          
          const storageRef = ref(storage, `${actualMediaType}s/${category}/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const finalImageUrl = await getDownloadURL(snapshot.ref);
          
          const itemTitle = imageFiles.length > 1 ? `${title} ${i + 1}` : title;
          
          await addDoc(collection(db, category), {
            title: itemTitle,
            url: finalImageUrl,
            type: actualMediaType,
            prompt,
            variablePrompt,
            price,
            likes: 0,
            views: 0,
            sales: 0,
            createdAt: new Date().toISOString()
          });
          
          setUploadProgress({ current: i + 1, total: imageFiles.length });
        }
      } else if (uploadMethod === 'url' && imageUrl) {
        let actualMediaType = mediaType;
        if (imageUrl.match(/\.(mp4|webm|ogg)$/i)) {
          actualMediaType = 'video';
        } else if (imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
          actualMediaType = 'image';
        }
        
        await addDoc(collection(db, category), {
          title,
          url: imageUrl,
          type: actualMediaType,
          prompt,
          variablePrompt,
          price,
          likes: 0,
          views: 0,
          sales: 0,
          createdAt: new Date().toISOString()
        });
      }

      setSuccess(true);
      
      // Reset form
      setTitle('');
      setPrompt('');
      setVariablePrompt('');
      setPrice(0);
      setImageFiles([]);
      setImageUrl('');
      setImagePreview(null);
      setUploadProgress(null);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || `Failed to upload ${mediaType}.`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
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
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'payments' 
                ? 'bg-white text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard size={16} />
            Payments
            {paymentRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {paymentRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
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
            {/* Left Column - Image Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-300">Media Type</label>
              </div>
              <div className="flex p-1 bg-zinc-800/50 rounded-xl border border-zinc-700/50 mb-4">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    mediaType === 'image' 
                      ? 'bg-zinc-700 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                  }`}
                >
                  <ImageIcon size={16} />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    mediaType === 'video' 
                      ? 'bg-zinc-700 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                  }`}
                >
                  <Video size={16} />
                  Video
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-300">{mediaType === 'image' ? 'Image' : 'Video'} Source</label>
              </div>

              <div className="flex p-1 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMethod('file');
                    setImagePreview(imageFiles.length > 0 ? URL.createObjectURL(imageFiles[0]) : null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    uploadMethod === 'file' 
                      ? 'bg-zinc-700 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                  }`}
                >
                  <Upload size={16} />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMethod('url');
                    setImagePreview(imageUrl || null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    uploadMethod === 'url' 
                      ? 'bg-zinc-700 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
                  }`}
                >
                  <LinkIcon size={16} />
                  Paste URL
                </button>
              </div>
              
              {uploadMethod === 'file' ? (
                <div 
                  className="relative aspect-square md:aspect-[4/5] rounded-2xl border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 bg-zinc-800/50 transition-colors overflow-hidden flex flex-col items-center justify-center cursor-pointer group"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {imagePreview ? (
                    <>
                      {mediaType === 'video' ? (
                        <video src={imagePreview} controls className="w-full h-full object-contain bg-black" />
                      ) : (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      {imageFiles.length > 1 && (
                        <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          +{imageFiles.length - 1} more
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-zinc-500 group-hover:text-indigo-400 transition-colors">
                      <Upload size={32} className="mb-3" />
                      <span className="text-sm font-medium">Click to upload {mediaType}(s)</span>
                      <span className="text-xs mt-1 opacity-70">
                        {mediaType === 'image' ? 'PNG, JPG up to 10MB' : 'MP4, WebM up to 50MB'}
                      </span>
                    </div>
                  )}
                  <input 
                    id="image-upload" 
                    type="file" 
                    multiple
                    accept={mediaType === 'image' ? "image/*" : "video/*"} 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    onBlur={handleUrlBlur}
                    placeholder={mediaType === 'image' ? "https://example.com/image.jpg" : "https://example.com/video.mp4"}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  
                  <div className="relative aspect-square md:aspect-[4/5] rounded-2xl border border-zinc-700 overflow-hidden bg-zinc-800/50 flex flex-col items-center justify-center">
                    {imagePreview ? (
                      mediaType === 'video' ? (
                        <video src={imagePreview} controls className="w-full h-full object-contain bg-black" />
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
                        <span className="text-sm font-medium">{mediaType === 'image' ? 'Image' : 'Video'} preview will appear here</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  {uploadProgress ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...` : 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload to System
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {isLoadingPayments ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Clock className="w-8 h-8 animate-spin mb-4" />
                <p>Loading pending requests...</p>
              </div>
            ) : paymentRequests.length === 0 ? (
              <div className="bg-zinc-900 border border-white/10 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-zinc-600" />
                </div>
                <h3 className="text-white font-medium mb-1">All caught up!</h3>
                <p className="text-zinc-500 text-sm">No pending payment requests to verify.</p>
              </div>
            ) : (
              paymentRequests.map((request) => (
                <div key={request.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">₹{request.amount}</h3>
                        <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full uppercase tracking-wider font-mono">
                          {request.method}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-2">User ID: <span className="font-mono text-xs">{request.userId}</span></p>
                      <div className="flex flex-wrap gap-4 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <span className="text-zinc-600 uppercase">UTR:</span>
                          <span className="text-white select-all">{request.utr}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <Clock size={12} />
                          <span>{new Date(request.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRejectPayment(request.id)}
                      className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <CloseIcon size={16} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprovePayment(request)}
                      className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
