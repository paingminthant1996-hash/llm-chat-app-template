import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Simple script to generate OG image by calling the Next.js API route
 * This uses the /og route to generate the image and saves it to /public/og-image.png
 */
async function generateOGImage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ogUrl = `${baseUrl}/og`;

  try {
    console.log('🔄 Fetching OG image from:', ogUrl);
    
    const response = await fetch(ogUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OG image: ${response.status} ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const outputPath = join(process.cwd(), 'public', 'og-image.png');
    
    await writeFile(outputPath, Buffer.from(imageBuffer));

    console.log('✅ OG image generated successfully at:', outputPath);
    console.log('📐 Image size: 1200x630 pixels (Open Graph standard)');
    console.log('\n💡 Note: Make sure your Next.js dev server is running (npm run dev)');
  } catch (error: any) {
    console.error('❌ Error generating OG image:', error.message);
    console.log('\n💡 Alternative: Start your dev server and visit http://localhost:3000/og');
    console.log('   Then save the image manually as /public/og-image.png');
    process.exit(1);
  }
}

generateOGImage();

