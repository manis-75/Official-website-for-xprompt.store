export interface ImageItem {
  id: string;
  url: string;
  title: string;
  aspectRatio: 'portrait' | 'landscape' | 'square';
  prompt?: string;
  variablePrompt?: string;
  likes?: number;
  views?: number;
  sales?: number;
  type?: 'image' | 'video';
  price?: number;
  collection?: string;
  category?: string;
  aiModels?: string[];
}

export const IMAGE_AI_WEBSITES = [
  "ChatGPT Image",
  "FLUX",
  "Gemini Image",
  "Grok Image",
  "Hunyuan",
  "Ideogram",
  "Imagen",
  "Leonardo Ai",
  "Midjourney",
  "Qwen Image",
  "Recraft",
  "Seedream",
  "Stable Diffusion"
];

export const VIDEO_AI_WEBSITES = [
  "Grok Video",
  "Hailuo AI",
  "KLING AI",
  "Midjourney Video",
  "Seedance",
  "Sora",
  "Veo",
  "Wan"
];

export const AI_WEBSITE_LOGOS: Record<string, string> = {
  "ChatGPT Image": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  "FLUX": "https://api.dicebear.com/7.x/initials/svg?seed=FX&backgroundColor=000000",
  "Gemini Image": "https://www.gstatic.com/lamda/images/gemini_sparkle_v002.svg",
  "Grok Image": "https://api.dicebear.com/7.x/initials/svg?seed=GK&backgroundColor=000000",
  "Hunyuan": "https://api.dicebear.com/7.x/initials/svg?seed=HY&backgroundColor=000000",
  "Ideogram": "https://api.dicebear.com/7.x/initials/svg?seed=ID&backgroundColor=000000",
  "Imagen": "https://api.dicebear.com/7.x/initials/svg?seed=IM&backgroundColor=000000",
  "Leonardo Ai": "https://api.dicebear.com/7.x/initials/svg?seed=LA&backgroundColor=000000",
  "Midjourney": "https://api.dicebear.com/7.x/initials/svg?seed=MJ&backgroundColor=000000",
  "Qwen Image": "https://api.dicebear.com/7.x/initials/svg?seed=QW&backgroundColor=000000",
  "Recraft": "https://api.dicebear.com/7.x/initials/svg?seed=RC&backgroundColor=000000",
  "Seedream": "https://api.dicebear.com/7.x/initials/svg?seed=SD&backgroundColor=000000",
  "Stable Diffusion": "https://api.dicebear.com/7.x/initials/svg?seed=SD&backgroundColor=000000",
  "Grok Video": "https://api.dicebear.com/7.x/initials/svg?seed=GV&backgroundColor=000000",
  "Hailuo AI": "https://api.dicebear.com/7.x/initials/svg?seed=HL&backgroundColor=000000",
  "KLING AI": "https://api.dicebear.com/7.x/initials/svg?seed=KL&backgroundColor=000000",
  "Midjourney Video": "https://api.dicebear.com/7.x/initials/svg?seed=MV&backgroundColor=000000",
  "Seedance": "https://api.dicebear.com/7.x/initials/svg?seed=SN&backgroundColor=000000",
  "Sora": "https://api.dicebear.com/7.x/initials/svg?seed=SR&backgroundColor=000000",
  "Veo": "https://api.dicebear.com/7.x/initials/svg?seed=VO&backgroundColor=000000",
  "Wan": "https://api.dicebear.com/7.x/initials/svg?seed=WN&backgroundColor=000000"
};

export const GENERATOR_SYSTEMS = [
  {
    id: 'influencer',
    name: 'AI Influencer',
    aspectRatio: '9:16',
    categories: [
      'Model', 'AI Influencer: Fashion Model', 'AI Influencer: Fitness Model',
      'AI Influencer: Glamour Model', 'AI Influencer: Traditional Model', 'AI Influencer: Casual Lifestyle'
    ]
  },
  {
    id: 'ad_studio',
    name: 'Ad Studio',
    aspectRatio: '3:4',
    categories: [
      'AddImage', 'Ad Templates: Product Ads', 'Ad Templates: Fashion Ads',
      'Ad Templates: Fitness Ads', 'Ad Templates: Beauty Ads', 'Ad Templates: Food Ads',
      'Ad Templates: Tech Ads', 'Ad Templates: Business Ads', 'Ad Templates: Social Ads',
      'Ad Templates: Story Ads', 'Ad Templates: Global Style', 'Ad Templates: Luxury Ads',
      'Ad Templates: Ecom Ads'
    ]
  },
  {
    id: 'thumbnail',
    name: 'YouTube Thumbnail',
    aspectRatio: '16:9',
    categories: [
      'YoutubeThumbnail', 'Trending: Gaming', 'Trending: Stock Market', 'Trending: Personal Finance',
      'Trending: Tech', 'Trending: Vlogging', 'Trending: Cricket', 'Trending: Movies',
      'Trending: Web Series', 'Trending: Comedy', 'Trending: Podcast', 'Trending: Fitness',
      'Trending: Motivation', 'Trending: Education', 'Trending: Online Earning',
      'Trending: Business Ideas', 'Trending: Automobile', 'Trending: Cooking',
      'Trending: Real Estate', 'Trending: Spirituality', 'Trending: Fashion',
      'Trending: Beauty', 'Trending: Parenting', 'Trending: Coding',
      'Trending: Graphic Design', 'Trending: Photography', 'Trending: Travel',
      'Trending: News', 'Trending: Science', 'Trending: AI', 'Trending: Government Schemes',
      'All Category: Business Ideas', 'All Category: Automobile', 'All Category: Cooking',
      'All Category: Real Estate', 'All Category: Spirituality', 'All Category: Fashion',
      'All Category: Beauty', 'All Category: Parenting', 'All Category: Coding',
      'All Category: Graphic Design', 'All Category: Photography', 'All Category: Travel',
      'All Category: Science', 'All Category: Government Schemes', 'All Category: Comedy'
    ]
  },
  {
    id: 'logo',
    name: 'Logo Generator',
    aspectRatio: '1:1',
    categories: [
      'IconImage', 'Logo Prompt: 3D', 'Logo Prompt: Animal', 'Logo Prompt: Business & Startup',
      'Logo Prompt: Cartoon', 'Logo Prompt: Cute', 'Logo Prompt: Food', 'Logo Prompt: Lettered',
      'Logo Prompt: Hand-drawn', 'Logo Prompt: Minimalist', 'Logo Prompt: Modern',
      'Logo Prompt: Painted', 'Logo Prompt: Styled'
    ]
  },
  {
    id: 'icon',
    name: 'Icon Assets',
    aspectRatio: '1:1',
    categories: [
      'Icon Prompt: 3D', 'Icon Prompt: Animal', 'Icon Prompt: Clipart', 'Icon Prompt: Cute',
      'Icon Prompt: Flat Graphic', 'Icon Prompt: Pixel Art', 'Icon Prompt: Styled', 'Icon Prompt: UI'
    ]
  }
];
