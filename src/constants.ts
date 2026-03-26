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
  "Midjourney",
  "DALL-E 3",
  "Stable Diffusion",
  "Adobe Firefly",
  "Leonardo.ai",
  "Playground AI",
  "SeaArt.ai",
  "Civitai",
  "Ideogram",
  "Flux.1",
  "Canva AI",
  "Bing Image Creator",
  "Krea.ai",
  "Recraft.ai"
];

export const VIDEO_AI_WEBSITES = [
  "Pika Labs",
  "Luma Dream Machine",
  "Runway Gen-2",
  "Sora (OpenAI)",
  "HeyGen",
  "Synthesia",
  "Kaiber.ai",
  "InVideo",
  "CapCut AI",
  "Adobe Premiere AI",
  "DaVinci Resolve AI",
  "Topaz Video AI",
  "Wonder Dynamics"
];

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
