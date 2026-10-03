import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer@9.13.1';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import { blogPosts } from '../data/blogPosts';
import { API_BASE_URL } from '../utils/env';
import { useEffect, useMemo, useState } from 'react';

interface BlogSectionProps {
  onOpenPost: (slug: string) => void;
}
export function BlogSection({ onOpenPost }: BlogSectionProps) {
  const { language } = useLanguage();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [posts, setPosts] = useState(blogPosts);
  const [activeTag, setActiveTag] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/public/blog`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || !Array.isArray(data.posts) || data.posts.length === 0) return;
        const mapped = data.posts.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          title: typeof p.title === 'object' ? p.title : { ru: p.title || '', uz: p.title || '' },
          description: typeof p.description === 'object' ? p.description : { ru: p.description || '', uz: p.description || '' },
          date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('ru-RU') : '',
          image: p.image || '',
          tag: typeof p.tag === 'object' ? p.tag : { ru: 'Новость', uz: 'Yangilik' },
        }));
        setPosts(mapped);
      } catch {
        // fallback to seeded posts
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const tags = useMemo(() => {
    const values = Array.from(
      new Set(posts.map((p) => p.tag?.[language]).filter(Boolean)),
    ) as string[];
    return values;
  }, [posts, language]);

  const visiblePosts = useMemo(
    () => (activeTag === 'all' ? posts : posts.filter((p) => p.tag?.[language] === activeTag)),
    [activeTag, language, posts],
  );

  return (
    <section id="blog" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 text-gradient font-grotesk"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            {language === 'uz' ? 'Yangiliklar va blog' : 'Новости и блог'}
          </motion.h2>
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {language === 'uz'
              ? 'Yangi mahsulotlar, ishlab chiqarish yangiliklari va foydali maslahatlarni shu bo`limda joylaymiz.'
              : 'Здесь будем публиковать новости, обновления производства и полезные материалы по уходу за изделиями.'}
          </motion.p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Button
            variant={activeTag === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTag('all')}
            className={activeTag === 'all' ? 'bg-primary text-primary-foreground' : 'glass-card border-primary/20'}
          >
            {language === 'uz' ? 'Barchasi' : 'Все'}
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? 'default' : 'outline'}
              onClick={() => setActiveTag(tag)}
              className={activeTag === tag ? 'bg-primary text-primary-foreground' : 'glass-card border-primary/20'}
            >
              {tag}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading &&
            Array.from({ length: 3 }).map((_, idx) => (
              <Card key={`skeleton-${idx}`} className="glass-card border-primary/10 h-[360px] animate-pulse" />
            ))}
          {!isLoading && visiblePosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-200 overflow-hidden h-full">
                <CardHeader className="p-0">
                  <img
                    src={post.image}
                    alt={post.title[language]}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-52 object-cover"
                  />
                </CardHeader>
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                      {post.tag[language]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>

                  <CardTitle className="text-lg leading-tight mb-3">{post.title[language]}</CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{post.description[language]}</p>

                  <Button
                    variant="ghost"
                    onClick={() => onOpenPost(post.slug)}
                    className="mt-auto justify-start px-0 text-primary hover:text-primary/80 hover:bg-transparent"
                  >
                    {language === 'uz' ? 'Batafsil o`qish' : 'Читать подробнее'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {!isLoading && visiblePosts.length === 0 && (
          <div className="text-center mt-8 text-muted-foreground">
            {language === 'uz' ? 'Bu teg bo`yicha maqolalar topilmadi' : 'По этому тегу пока нет статей'}
          </div>
        )}
      </div>
    </section>
  );
}
