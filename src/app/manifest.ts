import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ave Vista Resort PMS',
        short_name: 'Ave Vista PMS',
        description: 'Property Management System for Ave Vista Resort',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
