import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft } from '../utils/lucide-stub';
import { useLanguage } from '../utils/language-context';
import { getBlogPostBySlug } from '../data/blogPosts';
import { API_BASE_URL } from '../utils/env';
import { useEffect, useMemo, useState } from 'react';

interface BlogPostPageProps {
  slug: string;
  onBack: () => void;
}

export function BlogPostPage({ slug, onBack }: BlogPostPageProps) {
  const { language } = useLanguage();
  const localPost = useMemo(() => getBlogPostBySlug(slug), [slug]);
  const [remotePost, setRemotePost] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/public/blog/${encodeURIComponent(slug)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || !data?.post) return;
        setRemotePost(data.post);
      } catch {
        // fallback to local content
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const post = remotePost
    ? {
        ...remotePost,
        title: typeof remotePost.title === 'object' ? remotePost.title : { ru: remotePost.title || '', uz: remotePost.title || '' },
        description:
          typeof remotePost.description === 'object'
            ? remotePost.description
            : { ru: remotePost.description || '', uz: remotePost.description || '' },
        tag: typeof remotePost.tag === 'object' ? remotePost.tag : { ru: 'Новость', uz: 'Yangilik' },
        content:
          typeof remotePost.content === 'object' && remotePost.content
            ? remotePost.content
            : { ru: [], uz: [] },
        date: remotePost.publishedAt ? new Date(remotePost.publishedAt).toLocaleDateString('ru-RU') : '',
      }
    : localPost;

  if (!post) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl border border-primary/10 p-8 text-center max-w-xl mx-auto">
            <h1 className="text-2xl font-grotesk mb-3">
              {language === 'uz' ? 'Maqola topilmadi' : 'Статья не найдена'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'uz'
                ? 'Maqola manzili o`zgargan yoki mavjud emas.'
                : 'Возможно, адрес изменился или материал недоступен.'}
            </p>
            <Button onClick={onBack} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {language === 'uz' ? 'Blogga qaytish' : 'Вернуться к блогу'}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 pl-0 text-primary hover:text-primary/80 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'uz' ? 'Blogga qaytish' : 'Назад к блогу'}
        </Button>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-card rounded-3xl border border-primary/10 overflow-hidden"
        >
          <img
            src={post.image}
            alt={post.title[language]}
            className="w-full h-[260px] md:h-[360px] object-cover"
            loading="eager"
          />

          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                {post.tag[language]}
              </Badge>
              <span className="text-sm text-muted-foreground">{post.date}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-grotesk mb-4 leading-tight">
              {post.title[language]}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-6">{post.description[language]}</p>

            <div className="space-y-4">
              {(post.content[language] || []).map((paragraph: string) => (
                <p key={paragraph} className="text-foreground/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
