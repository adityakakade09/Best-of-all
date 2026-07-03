import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BestOfAll — Search Once, Compare Everywhere',
    short_name: 'BestOfAll',
    description: 'Universal search and comparison platform across delivery and e-commerce apps.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F6FA',
    theme_color: '#4F6BFF',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
