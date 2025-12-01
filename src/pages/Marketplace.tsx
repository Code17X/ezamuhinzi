import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Phone, MapPin, Trash2, Building2, ShoppingBag, Heart, MessageCircle, Share2, Send } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

interface Listing {
  id: string;
  user_id: string;
  service_name: string;
  provider_name: string;
  phone_number: string;
  service_cost: string;
  location: string;
  description: string | null;
  created_at: string;
}

interface Industry {
  id: string;
  name: string;
  phone_number: string;
  location: string;
  description: string | null;
  created_at: string;
}

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  unit: string;
  quantity: string | null;
  category: string;
  location: string;
  contact_phone: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_urls: string[] | null;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const Marketplace = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedProductComments, setSelectedProductComments] = useState<string | null>(null);
  const [selectedPostComments, setSelectedPostComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState("");
  const [newPostComment, setNewPostComment] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [newPost, setNewPost] = useState({
    content: ''
  });
  
  const [newListing, setNewListing] = useState({
    service_name: '',
    provider_name: '',
    phone_number: '',
    service_cost: '',
    location: '',
    description: ''
  });
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    unit: 'kg',
    quantity: '',
    category: 'crop',
    location: '',
    contact_phone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load service listings
    const { data: listingsData } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (listingsData) setListings(listingsData);

    // Load industries
    const { data: industriesData } = await supabase
      .from('industries')
      .select('*')
      .order('name');

    if (industriesData) setIndustries(industriesData);

    // Load products with likes and comments count
    const { data: productsData } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (productsData && user) {
      // Get likes and comments counts for each product
      const productsWithCounts = await Promise.all(
        productsData.map(async (product) => {
          const { count: likesCount } = await supabase
            .from('marketplace_likes')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', product.id);

          const { count: commentsCount } = await supabase
            .from('marketplace_comments')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', product.id);

          const { data: userLike } = await supabase
            .from('marketplace_likes')
            .select('id')
            .eq('listing_id', product.id)
            .eq('user_id', user.id)
            .single();

          return {
            ...product,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            user_has_liked: !!userLike
          };
        })
      );
      setProducts(productsWithCounts);
    } else if (productsData) {
      setProducts(productsData);
    }

    // Load posts with likes and comments count
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsData && user) {
      const postsWithCounts = await Promise.all(
        postsData.map(async (post) => {
          const { count: likesCount } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          const { count: commentsCount } = await supabase
            .from('post_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          const { data: userLike } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();

          return {
            ...post,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            user_has_liked: !!userLike
          };
        })
      );
      setPosts(postsWithCounts);
    } else if (postsData) {
      setPosts(postsData);
    }
  };

  const handleLike = async (productId: string) => {
    if (!user) {
      toast({ title: "Injira mbere", variant: "destructive" });
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      if (product.user_has_liked) {
        // Unlike
        await supabase
          .from('marketplace_likes')
          .delete()
          .eq('listing_id', productId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('marketplace_likes')
          .insert({ listing_id: productId, user_id: user.id });
      }
      loadData();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleShare = async (product: Product) => {
    const shareText = `${product.title} - ${product.price.toLocaleString()} RWF/${product.unit}\n${product.location}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: shareText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast({ title: "Byakoporowe!" });
    }
  };

  const loadComments = async (productId: string) => {
    const { data } = await supabase
      .from('marketplace_comments')
      .select('*')
      .eq('listing_id', productId)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(prev => ({ ...prev, [productId]: data }));
    }
  };

  const handleAddComment = async (productId: string) => {
    if (!user || !newComment.trim()) return;

    try {
      await supabase
        .from('marketplace_comments')
        .insert({
          listing_id: productId,
          user_id: user.id,
          content: newComment.trim()
        });

      setNewComment("");
      loadComments(productId);
      loadData();
      toast({ title: "Icyiyumviro cyashyizwe!" });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleShowComments = (productId: string) => {
    if (selectedProductComments === productId) {
      setSelectedProductComments(null);
    } else {
      setSelectedProductComments(productId);
      loadComments(productId);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setProductImage(imageUrl);
  };

  const handleCreateListing = async () => {
    if (!user || !newListing.service_name || !newListing.provider_name || 
        !newListing.phone_number || !newListing.service_cost || !newListing.location) {
      toast({
        title: "Uzuza byose",
        description: "Uzuza amakuru yose akenewe",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('services').insert({
        user_id: user.id,
        service_name: newListing.service_name,
        provider_name: newListing.provider_name,
        phone_number: newListing.phone_number,
        service_cost: newListing.service_cost,
        location: newListing.location,
        description: newListing.description || null
      });

      if (error) throw error;

      toast({ title: "Byakozwe neza!" });
      setNewListing({
        service_name: '',
        provider_name: '',
        phone_number: '',
        service_cost: '',
        location: '',
        description: ''
      });
      setIsCreatingListing(false);
      loadData();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ title: "Byasibwe!" });
      loadData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleCreateProduct = async () => {
    if (!user || !newProduct.title || !newProduct.price || !newProduct.location || !newProduct.contact_phone) {
      toast({
        title: "Uzuza byose",
        description: "Uzuza amakuru yose akenewe",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('marketplace_listings').insert({
        user_id: user.id,
        title: newProduct.title,
        description: newProduct.description || null,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit,
        quantity: newProduct.quantity || null,
        category: newProduct.category,
        location: newProduct.location,
        contact_phone: newProduct.contact_phone,
        image_url: productImage,
        status: 'active'
      });

      if (error) throw error;

      // Send SMS notification to subscribed users
      try {
        await supabase.functions.invoke('send-marketplace-alert', {
          body: {
            productTitle: newProduct.title,
            price: newProduct.price,
            location: newProduct.location,
            category: newProduct.category
          }
        });
      } catch (smsError) {
        console.error('Error sending SMS alert:', smsError);
      }

      toast({ title: "Icyicuruzwa cyashyizwe!" });
      setNewProduct({
        title: '',
        description: '',
        price: '',
        unit: 'kg',
        quantity: '',
        category: 'crop',
        location: '',
        contact_phone: ''
      });
      setProductImage(null);
      setIsCreatingProduct(false);
      loadData();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ title: "Byasibwe!" });
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  // Post handlers
  const handlePostImageUploaded = (imageUrl: string) => {
    setPostImages(prev => [...prev, imageUrl]);
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.content.trim()) {
      toast({
        title: "Uzuza byose",
        description: "Andika icyerekezo cyawe",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: newPost.content,
        image_urls: postImages.length > 0 ? postImages : null,
        post_type: 'general'
      });

      if (error) throw error;

      toast({ title: "Positi yashyizwe!" });
      setNewPost({ content: '' });
      setPostImages([]);
      setIsCreatingPost(false);
      loadData();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast({ title: "Injira mbere", variant: "destructive" });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_has_liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }
      loadData();
    } catch (error) {
      console.error('Error toggling post like:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleSharePost = async (post: Post) => {
    const shareText = `${post.content}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: "Byakoporowe!" });
    }
  };

  const loadPostComments = async (postId: string) => {
    const { data } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) {
      setPostComments(prev => ({ ...prev, [postId]: data }));
    }
  };

  const handleAddPostComment = async (postId: string) => {
    if (!user || !newPostComment.trim()) return;

    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newPostComment.trim()
        });

      setNewPostComment("");
      loadPostComments(postId);
      loadData();
      toast({ title: "Icyiyumviro cyashyizwe!" });
    } catch (error) {
      console.error('Error adding post comment:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  const handleShowPostComments = (postId: string) => {
    if (selectedPostComments === postId) {
      setSelectedPostComments(null);
    } else {
      setSelectedPostComments(postId);
      loadPostComments(postId);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({ title: "Byasibwe!" });
      loadData();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: "Ikosa", variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Tanga Akazi</h1>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Positi</TabsTrigger>
            <TabsTrigger value="products">Ibicuruzwa</TabsTrigger>
            <TabsTrigger value="services">Serivisi</TabsTrigger>
            <TabsTrigger value="industries">Inganda</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {user && (
              <Card>
                <CardHeader>
                  <Button 
                    onClick={() => setIsCreatingPost(!isCreatingPost)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tanga Positi Yawe
                  </Button>
                </CardHeader>
                
                {isCreatingPost && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Ifoto (Optional)</Label>
                      <ImageUpload 
                        onImageAnalyzed={(_, imageUrl) => handlePostImageUploaded(imageUrl)}
                        skipAnalysis={true}
                      />
                      {postImages.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {postImages.map((img, idx) => (
                            <div key={idx} className="relative w-20 h-20">
                              <img src={img} alt="" className="w-full h-full object-cover rounded" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Icyerekezo Cyawe</Label>
                      <Textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Andika icyo ushaka gusangira..."
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleCreatePost} className="w-full">
                      Ohereza
                    </Button>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nta positi ziboneka</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="hover-scale">
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString('rw-RW')}
                        </p>
                        {user && post.user_id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

                      {post.image_urls && post.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {post.image_urls.map((url, idx) => (
                            <img 
                              key={idx}
                              src={url} 
                              alt=""
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      {/* Social Actions */}
                      <div className="flex items-center gap-4 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center gap-1"
                        >
                          <Heart 
                            className={`w-4 h-4 ${post.user_has_liked ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          <span>{post.likes_count || 0}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowPostComments(post.id)}
                          className="flex items-center gap-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments_count || 0}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSharePost(post)}
                          className="flex items-center gap-1"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Sangira</span>
                        </Button>
                      </div>

                      {/* Comments Section */}
                      {selectedPostComments === post.id && (
                        <div className="space-y-3 pt-3 border-t">
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {postComments[post.id]?.map((comment) => (
                              <div key={comment.id} className="bg-muted p-2 rounded text-sm">
                                <p>{comment.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(comment.created_at).toLocaleDateString('rw-RW')}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          {user && (
                            <div className="flex gap-2">
                              <Input
                                value={newPostComment}
                                onChange={(e) => setNewPostComment(e.target.value)}
                                placeholder="Andika icyiyumviro..."
                                onKeyPress={(e) => e.key === 'Enter' && handleAddPostComment(post.id)}
                              />
                              <Button 
                                size="sm"
                                onClick={() => handleAddPostComment(post.id)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            {user && (
              <Card>
                <CardHeader>
                  <Button 
                    onClick={() => setIsCreatingProduct(!isCreatingProduct)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tanga Icyicuruzwa Cyawe
                  </Button>
                </CardHeader>
                
                {isCreatingProduct && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Ifoto y'Icyicuruzwa (Optional)</Label>
                      <ImageUpload 
                        onImageAnalyzed={(_, imageUrl) => handleImageUploaded(imageUrl)}
                        skipAnalysis={true}
                      />
                    </div>

                    <div>
                      <Label>Izina ry'Icyicuruzwa</Label>
                      <Input
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                        placeholder="Urugero: Ibigori byiza"
                      />
                    </div>

                    <div>
                      <Label>Icyiciro</Label>
                      <Select value={newProduct.category} onValueChange={(val) => setNewProduct({ ...newProduct, category: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crop">Ibihingwa</SelectItem>
                          <SelectItem value="livestock">Amatungo</SelectItem>
                          <SelectItem value="equipment">Ibikoresho</SelectItem>
                          <SelectItem value="other">Ibindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Igiciro</Label>
                        <Input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <Label>Igipimo</Label>
                        <Select value={newProduct.unit} onValueChange={(val) => setNewProduct({ ...newProduct, unit: val })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="piece">piece</SelectItem>
                            <SelectItem value="bag">bag</SelectItem>
                            <SelectItem value="liter">liter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Ingano (Optional)</Label>
                      <Input
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                        placeholder="Urugero: 100kg"
                      />
                    </div>

                    <div>
                      <Label>Aho Uhereye</Label>
                      <Input
                        value={newProduct.location}
                        onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                        placeholder="Urugero: Kigali, Gasabo"
                      />
                    </div>

                    <div>
                      <Label>Numero ya Telefone</Label>
                      <Input
                        type="tel"
                        value={newProduct.contact_phone}
                        onChange={(e) => setNewProduct({ ...newProduct, contact_phone: e.target.value })}
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>

                    <div>
                      <Label>Ibisobanuro (Optional)</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Sobanura icyicuruzwa cyawe..."
                      />
                    </div>

                    <Button onClick={handleCreateProduct} className="w-full">
                      Ohereza
                    </Button>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Products List */}
            <div className="grid gap-4 md:grid-cols-2">
              {products.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nta bicuruzwa biboneka</p>
                  </CardContent>
                </Card>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="hover-scale">
                    {product.image_url && (
                      <div className="w-full h-48 overflow-hidden rounded-t-lg">
                        <img 
                          src={product.image_url} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{product.title}</span>
                        {user && product.user_id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {product.price.toLocaleString()} RWF
                          <span className="text-sm font-normal text-muted-foreground ml-2">/ {product.unit}</span>
                        </p>
                        {product.quantity && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Ingano: {product.quantity}
                          </p>
                        )}
                      </div>

                      {product.contact_phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${product.contact_phone}`} className="hover:text-primary">
                            {product.contact_phone}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{product.location}</span>
                      </div>

                      {product.description && (
                        <p className="text-sm text-muted-foreground pt-2 border-t">
                          {product.description}
                        </p>
                      )}

                      {/* Social Actions */}
                      <div className="flex items-center gap-4 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(product.id)}
                          className="flex items-center gap-1"
                        >
                          <Heart 
                            className={`w-4 h-4 ${product.user_has_liked ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          <span>{product.likes_count || 0}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowComments(product.id)}
                          className="flex items-center gap-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{product.comments_count || 0}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(product)}
                          className="flex items-center gap-1"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Sangira</span>
                        </Button>
                      </div>

                      {/* Comments Section */}
                      {selectedProductComments === product.id && (
                        <div className="space-y-3 pt-3 border-t">
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {comments[product.id]?.map((comment) => (
                              <div key={comment.id} className="bg-muted p-2 rounded text-sm">
                                <p>{comment.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(comment.created_at).toLocaleDateString('rw-RW')}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          {user && (
                            <div className="flex gap-2">
                              <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Andika icyiyumviro..."
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(product.id)}
                              />
                              <Button 
                                size="sm"
                                onClick={() => handleAddComment(product.id)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {user && (
              <Card>
                <CardHeader>
                  <Button 
                    onClick={() => setIsCreatingListing(!isCreatingListing)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tanga Serivisi Yawe
                  </Button>
                </CardHeader>
                
                {isCreatingListing && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Izina rya Serivisi</Label>
                      <Input
                        value={newListing.service_name}
                        onChange={(e) => setNewListing({ ...newListing, service_name: e.target.value })}
                        placeholder="Urugero: Umuganga w'amatungo"
                      />
                    </div>

                    <div>
                      <Label>Amazina Yawe</Label>
                      <Input
                        value={newListing.provider_name}
                        onChange={(e) => setNewListing({ ...newListing, provider_name: e.target.value })}
                        placeholder="Izina ryawe ryuzuye"
                      />
                    </div>

                    <div>
                      <Label>Numero ya Telefone</Label>
                      <Input
                        value={newListing.phone_number}
                        onChange={(e) => setNewListing({ ...newListing, phone_number: e.target.value })}
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>

                    <div>
                      <Label>Igiciro cya Serivisi</Label>
                      <Input
                        value={newListing.service_cost}
                        onChange={(e) => setNewListing({ ...newListing, service_cost: e.target.value })}
                        placeholder="Urugero: 5,000 RWF - 20,000 RWF"
                      />
                    </div>

                    <div>
                      <Label>Aho Uhereye</Label>
                      <Input
                        value={newListing.location}
                        onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                        placeholder="Urugero: Kigali, Gasabo"
                      />
                    </div>

                    <div>
                      <Label>Ibisobanuro (Optional)</Label>
                      <Textarea
                        value={newListing.description}
                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                        placeholder="Sobanura serivisi yawe..."
                      />
                    </div>

                    <Button onClick={handleCreateListing} className="w-full">
                      Ohereza
                    </Button>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Services List */}
            <div className="grid gap-4 md:grid-cols-2">
              {listings.map((listing) => (
                <Card key={listing.id} className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span>{listing.service_name}</span>
                      {user && listing.user_id === user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteListing(listing.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-semibold">{listing.provider_name}</p>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${listing.phone_number}`} className="hover:text-primary">
                        {listing.phone_number}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.location}</span>
                    </div>

                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Igiciro:</p>
                      <p className="font-bold text-primary">{listing.service_cost}</p>
                    </div>

                    {listing.description && (
                      <p className="text-sm text-muted-foreground pt-2 border-t">
                        {listing.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Industries Tab */}
          <TabsContent value="industries" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {industries.map((industry) => (
                <Card key={industry.id} className="hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      {industry.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${industry.phone_number}`} className="hover:text-primary">
                        {industry.phone_number}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{industry.location}</span>
                    </div>

                    {industry.description && (
                      <p className="text-sm text-muted-foreground pt-2 border-t">
                        {industry.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Marketplace;