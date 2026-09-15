/** Prefixes a path under public/ with the site's base path (/beauty on GitHub Pages). */
export const asset = (path: string): string => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
