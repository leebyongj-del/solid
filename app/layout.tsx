import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'입체 탐험대 | 우리 학교에서 발견하는 수학',description:'사진으로 발견하고 입체로 확인하는 다면체·회전체 탐구 교실'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&display=swap"/></head><body>{children}</body></html>}
