// This file tells Vercel/Next.js to NEVER prerender this route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const revalidate = 0;