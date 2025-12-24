import satori from 'satori';
import sharp from 'sharp';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

async function generateOGImage() {
    // Load Inter font files
    const fontRegular = await readFile(join(process.cwd(), 'scripts', 'Inter-Regular.ttf'));
    const fontMedium = await readFile(join(process.cwd(), 'scripts', 'Inter-Medium.ttf'));
    const fontBold = await readFile(join(process.cwd(), 'scripts', 'Inter-Bold.ttf'));

    const fonts = [
        {
            name: 'Inter',
            data: fontRegular,
            weight: 400,
            style: 'normal' as const,
        },
        {
            name: 'Inter',
            data: fontMedium,
            weight: 500,
            style: 'normal' as const,
        },
        {
            name: 'Inter',
            data: fontBold,
            weight: 700,
            style: 'normal' as const,
        },
    ];

    // Premium dark theme design
    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a1a 100%)',
                    padding: '80px',
                    position: 'relative',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                },
                children: [
                    // Background gradient overlay
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background:
                                    'radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)',
                            },
                        },
                    },
                    // Main content container
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '32px',
                                maxWidth: '900px',
                            },
                            children: [
                                // Brand name with accent
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        },
                                        children: [
                                            {
                                                type: 'span',
                                                props: {
                                                    style: {
                                                        fontSize: '72px',
                                                        fontWeight: '700',
                                                        color: '#ffffff',
                                                        letterSpacing: '-0.02em',
                                                        lineHeight: '1',
                                                    },
                                                    children: 'Azone',
                                                },
                                            },
                                            {
                                                type: 'span',
                                                props: {
                                                    style: {
                                                        fontSize: '72px',
                                                        fontWeight: '700',
                                                        background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                                        backgroundClip: 'text',
                                                        WebkitBackgroundClip: 'text',
                                                        color: 'transparent',
                                                        letterSpacing: '-0.02em',
                                                        lineHeight: '1',
                                                    },
                                                    children: '.store',
                                                },
                                            },
                                        ],
                                    },
                                },
                                // Divider line
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            width: '120px',
                                            height: '2px',
                                            background: 'linear-gradient(90deg, transparent 0%, #7C3AED 50%, transparent 100%)',
                                        },
                                    },
                                },
                                // Subtitle
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            fontSize: '36px',
                                            fontWeight: '500',
                                            color: '#E5E7EB',
                                            textAlign: 'center',
                                            letterSpacing: '-0.01em',
                                            lineHeight: '1.4',
                                        },
                                        children: 'Production-Ready Templates',
                                    },
                                },
                                // Tagline
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            fontSize: '24px',
                                            fontWeight: '400',
                                            color: '#9CA3AF',
                                            textAlign: 'center',
                                            marginTop: '16px',
                                            letterSpacing: '0.01em',
                                        },
                                        children: 'Built for scale. Designed for production.',
                                    },
                                },
                            ],
                        },
                    },
                    // Decorative elements
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                bottom: '60px',
                                right: '60px',
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
                                filter: 'blur(40px)',
                            },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                top: '60px',
                                left: '60px',
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
                                filter: 'blur(30px)',
                            },
                        },
                    },
                ],
            },
        },
        {
            width: 1200,
            height: 630,
            fonts,
        }
    );

    // Convert SVG to PNG
    const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();

    // Save to public directory
    const outputPath = join(process.cwd(), 'public', 'og-image.png');
    await writeFile(outputPath, pngBuffer);

    console.log('✅ OG image generated successfully at:', outputPath);
    console.log('📐 Image size: 1200x630 pixels (Open Graph standard)');
}

generateOGImage().catch((error) => {
    console.error('❌ Error generating OG image:', error);
    process.exit(1);
});

