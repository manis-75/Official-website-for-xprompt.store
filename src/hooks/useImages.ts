import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ImageItem } from '../constants';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const useImages = (category: string) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    throw error;
  }

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchImages = async () => {
      try {
        const MAIN_CATEGORY_MAPPING: Record<string, string[]> = {
          'Model': [
            'Model', 'AI Influencer',
            'AI Influencer: Fashion Model', 'AI Influencer: Fitness Model',
            'AI Influencer: Glamour Model', 'AI Influencer: Traditional Model', 'AI Influencer: Casual Lifestyle'
          ],
          'Ad Studio': [
            'AddImage', 'Ad Studio',
            'Ad Templates: Product Ads', 'Ad Templates: Fashion Ads',
            'Ad Templates: Fitness Ads', 'Ad Templates: Beauty Ads', 'Ad Templates: Food Ads',
            'Ad Templates: Tech Ads', 'Ad Templates: Business Ads', 'Ad Templates: Social Ads',
            'Ad Templates: Story Ads', 'Ad Templates: Global Style', 'Ad Templates: Luxury Ads',
            'Ad Templates: Ecom Ads'
          ],
          'Thumbnail': [
            'YoutubeThumbnail', 'Thumbnail',
            'Trending: Gaming', 'Trending: Stock Market', 'Trending: Personal Finance',
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
          ],
          'Logo Image': [
            'IconImage', 'Logo Image',
            'Logo Prompt: 3D', 'Logo Prompt: Animal', 'Logo Prompt: Business & Startup',
            'Logo Prompt: Cartoon', 'Logo Prompt: Cute', 'Logo Prompt: Food', 'Logo Prompt: Lettered',
            'Logo Prompt: Hand-drawn', 'Logo Prompt: Minimalist', 'Logo Prompt: Modern',
            'Logo Prompt: Painted', 'Logo Prompt: Styled',
            'Icon Prompt: 3D', 'Icon Prompt: Animal', 'Icon Prompt: Clipart', 'Icon Prompt: Cute',
            'Icon Prompt: Flat Graphic', 'Icon Prompt: Pixel Art', 'Icon Prompt: Styled', 'Icon Prompt: UI'
          ]
        };

        const categoriesToFetch = MAIN_CATEGORY_MAPPING[category] || [category];
        const fetchedImages: ImageItem[] = [];

        // Fetch in chunks to avoid overwhelming the network
        const chunkSize = 10;
        for (let i = 0; i < categoriesToFetch.length; i += chunkSize) {
          const chunk = categoriesToFetch.slice(i, i + chunkSize);
          const fetchPromises = chunk.map(cat => 
            getDocs(query(collection(db, cat), orderBy('createdAt', 'desc'), limit(200)))
          );
          
          const querySnapshots = await Promise.all(fetchPromises);
          
          querySnapshots.forEach((querySnapshot, index) => {
            const cat = chunk[index];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              let type = data.type || 'image';
              if (data.url && data.url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
                type = 'video';
              } else if (data.url && data.url.includes('firebasestorage') && data.url.includes('videos%2F')) {
                type = 'video';
              }
              
              fetchedImages.push({
                id: doc.id,
                url: data.url,
                title: data.title,
                type: type,
                aspectRatio: data.aspectRatio || 'square',
                prompt: data.prompt,
                variablePrompt: data.variablePrompt,
                likes: data.likes || 0,
                views: data.views || 0,
                sales: data.sales || 0,
                price: data.price || 0,
                collection: cat,
              });
            });
          });
        }

        if (isMounted) {
          const allImages = [...fetchedImages];
          // Sort by sales first, then likes, then views
          allImages.sort((a, b) => {
            const salesA = a.sales || 0;
            const salesB = b.sales || 0;
            if (salesA !== salesB) {
              return salesB - salesA;
            }
            
            const likesA = a.likes || 0;
            const likesB = b.likes || 0;
            if (likesA !== likesB) {
              return likesB - likesA;
            }
            
            const viewsA = a.views || 0;
            const viewsB = b.views || 0;
            return viewsB - viewsA;
          });
          setImages(allImages);
        }
      } catch (err) {
        if (isMounted) {
          setImages([]);
        }
        if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
          try {
            handleFirestoreError(err, OperationType.LIST, category);
          } catch (handledError) {
            if (isMounted) setError(handledError as Error);
          }
        } else {
          console.error("Error fetching images:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [category]);

  return { images, loading };
};
