import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, Image as ImageIcon, MapPin, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_urls: string[] | null;
  crop_type: string | null;
  harvest_quantity: string | null;
  farm_location: string | null;
  post_type: string;
  created_at: string;
  profiles?: { full_name: string | null };
  likes?: { count: number };
  comments?: { count: number };
  user_liked?: boolean;
}

const Social = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    post_type: 'general',
    crop_type: '',
    harvest_quantity: '',
    farm_location: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading posts:', error);
      return;
    }

    // Load profiles separately
    const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    
    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    // Load likes and comments counts
    const postsWithCounts = await Promise.all(
      (postsData || []).map(async (post) => {
        const [likesData, commentsData, userLike] = await Promise.all([
          supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
          supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
          user ? supabase.from('post_likes').select('*').eq('post_id', post.id).eq('user_id', user.id).single() : null
        ]);

        return {
          ...post,
          profiles: profilesMap.get(post.user_id),
          likes: { count: likesData.count || 0 },
          comments: { count: commentsData.count || 0 },
          user_liked: !!userLike?.data
        };
      })
    );

    setPosts(postsWithCounts);
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.content.trim()) return;
    
    setIsPosting(true);
    try {
      let imageUrls: string[] = [];
      
      // Upload images if any
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('post-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(fileName);
          
          return publicUrl;
        });
        
        imageUrls = await Promise.all(uploadPromises);
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: newPost.content,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        crop_type: newPost.crop_type || null,
        harvest_quantity: newPost.harvest_quantity || null,
        farm_location: newPost.farm_location || null,
        post_type: newPost.post_type,
      });

      if (error) throw error;

      toast({ title: t('common.success') });
      setNewPost({ content: '', post_type: 'general', crop_type: '', harvest_quantity: '', farm_location: '' });
      setSelectedImages([]);
      setIsCreating(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: t('common.error'), variant: 'destructive' });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_liked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
      loadPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = (post: Post) => {
    const text = `${post.content}\n\nVia AgriConnect`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({ title: 'AgriConnect Post', text, url });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id);
      if (error) throw error;
      
      toast({ title: t('common.success') });
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-foreground">{t('social.title')}</h1>

        {/* Create Post Card */}
        <Card className="mb-6">
          <CardHeader>
            <Button 
              onClick={() => setIsCreating(!isCreating)} 
              className="w-full"
              variant={isCreating ? "secondary" : "default"}
            >
              {t('social.createPost')}
            </Button>
          </CardHeader>
          
          {isCreating && (
            <CardContent className="space-y-4">
              <Textarea
                placeholder={t('social.postPlaceholder')}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="min-h-[100px]"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('social.postType')}</Label>
                  <Select value={newPost.post_type} onValueChange={(v) => setNewPost({ ...newPost, post_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t('social.general')}</SelectItem>
                      <SelectItem value="harvest">{t('social.harvest')}</SelectItem>
                      <SelectItem value="tip">{t('social.tip')}</SelectItem>
                      <SelectItem value="experience">{t('social.experience')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newPost.post_type === 'harvest' && (
                  <>
                    <div>
                      <Label>{t('social.cropType')}</Label>
                      <Input
                        value={newPost.crop_type}
                        onChange={(e) => setNewPost({ ...newPost, crop_type: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{t('social.harvestQuantity')}</Label>
                      <Input
                        value={newPost.harvest_quantity}
                        onChange={(e) => setNewPost({ ...newPost, harvest_quantity: e.target.value })}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <Label>{t('social.location')}</Label>
                  <Input
                    value={newPost.farm_location}
                    onChange={(e) => setNewPost({ ...newPost, farm_location: e.target.value })}
                    placeholder="Kigali, Rwanda"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="post-images" className="cursor-pointer flex items-center gap-2 text-primary">
                  <ImageIcon className="w-4 h-4" />
                  {t('social.uploadImage')}
                </Label>
                <Input
                  id="post-images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
                />
                {selectedImages.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'} selected
                  </p>
                )}
              </div>

              <Button onClick={handleCreatePost} disabled={isPosting} className="w-full">
                {isPosting ? t('social.posting') : t('social.post')}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">{t('social.noPostsYet')}</p>
                <p className="text-sm text-muted-foreground mt-2">{t('social.beFirst')}</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback>
                        {post.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{post.profiles?.full_name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.image_urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Post image"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {(post.crop_type || post.harvest_quantity || post.farm_location) && (
                    <div className="flex flex-wrap gap-2 mb-4 text-sm text-muted-foreground">
                      {post.crop_type && <span className="bg-muted px-2 py-1 rounded">{post.crop_type}</span>}
                      {post.harvest_quantity && <span className="bg-muted px-2 py-1 rounded">{post.harvest_quantity}</span>}
                      {post.farm_location && (
                        <span className="bg-muted px-2 py-1 rounded flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {post.farm_location}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2"
                      >
                        <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                        {post.likes?.count || 0}
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments?.count || 0}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        {t('social.share')}
                      </Button>
                    </div>
                    
                    {user && post.user_id === user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Social;
