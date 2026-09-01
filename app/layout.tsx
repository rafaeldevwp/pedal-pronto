import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin'] });
export const metadata: Metadata = { title: 'Pedal Pronto', description: 'Prontidão diária e adaptação segura de treinos de ciclismo.', manifest:'/manifest.webmanifest', icons:{icon:'/icon.svg'}, appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'Pedal Pronto'} };
export const viewport: Viewport = { themeColor:'#165c45', width:'device-width', initialScale:1, viewportFit:'cover' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body className={manrope.variable}>{children}</body></html>; }
