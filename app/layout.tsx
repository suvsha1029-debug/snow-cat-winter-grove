import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Winter Grove — A little winter world',description:'Explore a gentle 3D winter forest with a roaming ginger cat, a snowman, swaying pines and falling snow.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
