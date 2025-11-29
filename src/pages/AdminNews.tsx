import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsArticle {
  id: string;
  title: string;
  title_kinyarwanda: string;
  content: string;
  content_kinyarwanda: string;
  category: string;
  image_url: string | null;
  published: boolean;
}

const AdminNews = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    title_kinyarwanda: '',
    content: '',
    content_kinyarwanda: '',
    category: '',
    image_url: '',
    published: false,
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        const { error } = await supabase
          .from('news_articles')
          .update(formData)
          .eq('id', editing);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news_articles')
          .insert([formData]);
        if (error) throw error;
      }

      toast({
        title: t('common.success'),
        description: editing ? 'Article updated' : 'Article created',
      });

      resetForm();
      loadArticles();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Article deleted',
      });

      loadArticles();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setFormData({
      title: article.title,
      title_kinyarwanda: article.title_kinyarwanda,
      content: article.content,
      content_kinyarwanda: article.content_kinyarwanda,
      category: article.category,
      image_url: article.image_url || '',
      published: article.published,
    });
    setEditing(article.id);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_kinyarwanda: '',
      content: '',
      content_kinyarwanda: '',
      category: '',
      image_url: '',
      published: false,
    });
    setEditing(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">{t('admin.newsManagement')}</h1>

        <Card className="mb-8 card-hover animate-fade-in-up">
          <CardHeader>
            <CardTitle>
              {editing ? t('admin.editArticle') : t('admin.createArticle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{t('admin.titleEnglish')}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('admin.titleKinyarwanda')}</Label>
                <Input
                  value={formData.title_kinyarwanda}
                  onChange={(e) => setFormData({ ...formData, title_kinyarwanda: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>{t('admin.contentEnglish')}</Label>
              <Textarea
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div>
              <Label>{t('admin.contentKinyarwanda')}</Label>
              <Textarea
                rows={4}
                value={formData.content_kinyarwanda}
                onChange={(e) => setFormData({ ...formData, content_kinyarwanda: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{t('admin.category')}</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('admin.imageUrl')}</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <Label>{t('admin.publish')}</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="button-press">
                <Plus className="w-4 h-4 mr-2" />
                {editing ? t('common.save') : t('admin.createArticle')}
              </Button>
              {editing && (
                <Button onClick={resetForm} variant="outline">
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {articles.map((article, index) => (
            <Card key={article.id} className={`card-hover animate-fade-in-up stagger-item`} style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{article.title_kinyarwanda}</h3>
                      <Badge variant={article.published ? 'default' : 'secondary'}>
                        {article.published ? t('admin.published') : t('admin.draft')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{article.category}</p>
                    <p className="text-sm line-clamp-2">{article.content_kinyarwanda}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(article)}
                      className="hover-lift"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(article.id)}
                      className="hover-lift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNews;
