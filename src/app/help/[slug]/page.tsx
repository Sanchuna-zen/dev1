
import { promises as fs } from 'fs';
import path from 'path';
import { Article } from '@/components/help/Article';
import { LanguageSwitcher } from '@/components/help/LanguageSwitcher';
import { notFound } from 'next/navigation';

interface HelpPageProps {
  params: { slug: string };
  searchParams: { lang?: 'en' | 'ta' };
}

async function getArticleContent(slug: string, lang: 'en' | 'ta') {
  const filePath = path.join(process.cwd(), 'src', 'articles', `${slug}.${lang}.md`);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    return null;
  }
}

export default async function HelpPage({ params, searchParams }: HelpPageProps) {
  const lang = searchParams.lang || 'en';
  const content = await getArticleContent(params.slug, lang);

  if (!content) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <LanguageSwitcher />
      </div>
      <Article content={content} />
    </div>
  );
}
