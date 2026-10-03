import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, ArrowRight } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import { API_BASE_URL } from '../utils/env';

interface BlogListPageProps {
  onBack: () => void;
  onOpenPost: (slug: string) => void;
}

export function BlogListPage({ onBack, onOpenPost }: BlogListPageProps) {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/public/blog?limit=${limit}&offset=${offset}`);
        const data = await res.json();
        if (!mounted) return;
        setPosts(data.posts || []);
        setHasMore(Boolean(data.pagination?.hasMore));
      } catch {
        if (!mounted) return;
        setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [limit, offset]);

  return (
    <section className="pt-28 pb-16">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={onBack} className="mb-6 pl-0 text-primary hover:bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'uz' ? 'Bosh sahifaga' : 'На главную'}
        </Button>
        <h1 className="text-3xl md:text-4xl font-grotesk text-gradient mb-8">
          {language === 'uz' ? 'Blog va yangiliklar' : 'Блог и новости'}
        </h1>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="glass-card border-primary/10 h-[320px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-200 overflow-hidden h-full">
                  <CardHeader className="p-0">
                    <img src={post.image} alt={post.title?.[language] || post.title} className="w-full h-52 object-cover" loading="lazy" />
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center mb-3">
                      <Badge className="bg-primary/15 text-primary border-primary/20">
                        {(post.tag?.[language] || post.tag?.ru || 'Новость')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ru-RU') : ''}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight mb-3">
                      {post.title?.[language] || post.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-4">
                      {post.description?.[language] || post.description}
                    </p>
                    <Button variant="ghost" onClick={() => onOpenPost(post.slug)} className="px-0 text-primary hover:bg-transparent">
                      {language === 'uz' ? 'Batafsil' : 'Подробнее'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => setOffset((v) => Math.max(0, v - limit))} disabled={offset === 0 || loading}>
            {language === 'uz' ? 'Oldingi' : 'Назад'}
          </Button>
          <Button variant="outline" onClick={() => setOffset((v) => v + limit)} disabled={!hasMore || loading}>
            {language === 'uz' ? 'Keyingi' : 'Далее'}
          </Button>
        </div>
      </div>
    </section>
  );
}
