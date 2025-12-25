import { notFound } from "next/navigation";
import { Suspense } from "react";
import TemplateDetail from "@/components/marketplace/TemplateDetail";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { getTemplateBySlugDB } from "@/lib/db/queries";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const template = await getTemplateBySlugDB(slug);
  const baseUrl = "https://store.paing.xyz";

  if (!template) {
    return {
      title: "Template Not Found - Azone.store",
      description: "The requested template could not be found.",
    };
  }

  const title = `${template.title} - Azone.store`;
  const description = template.shortDescription || template.description || `Premium ${template.category} template by Azone.store`;
  const imageUrl = template.imageUrl || `${baseUrl}/og`;

  return {
    title,
    description,
    keywords: [
      template.title,
      template.category,
      ...template.techStack,
      "Next.js template",
      "React template",
      "production-ready",
    ],
    openGraph: {
      type: "website",
      url: `${baseUrl}/templates/${slug}`,
      title,
      description,
      siteName: "Azone.store",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: template.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/templates/${slug}`,
    },
  };
}

export default async function TemplatePage({ params }: PageProps) {
  const { slug } = await params;
  const template = await getTemplateBySlugDB(slug);

  if (!template) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TemplateDetail template={template} />
    </Suspense>
  );
}

