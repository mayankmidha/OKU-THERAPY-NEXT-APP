import type { Metadata } from "next";
import { headers } from "next/headers";

import {
  getBodyClassForPathname,
  getLocalStylesheetPaths,
  getPostStylesheetInlineStyles,
  getPreStylesheetInlineStyles,
} from "@/lib/wp-content";

import "./globals.css";
import "./styles/wp-runtime.css";
import AuthProvider from "@/components/auth-provider";

export const metadata: Metadata = {
  description: "Depth-oriented Psychotherapy Clinic",
  metadataBase: new URL("https://okutherapy.com"),
  title: {
    default: "OKU Therapy",
    template: "%s",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-next-pathname") ?? "/";
  const bodyClass = getBodyClassForPathname(pathname);
  const stylesheetPaths = getLocalStylesheetPaths();
  const preStylesheetInlineStyles = getPreStylesheetInlineStyles();
  const postStylesheetInlineStyles = getPostStylesheetInlineStyles();

  return (
    <html className="html" lang="en-US">
      <head>
        <link rel="profile" href="https://gmpg.org/xfn/11" />

        {preStylesheetInlineStyles.map((styleBlock, index) => (
          <style
            dangerouslySetInnerHTML={{ __html: styleBlock.cssText }}
            id={styleBlock.id}
            key={styleBlock.id ?? `pre-inline-style-${index}`}
            type="text/css"
          />
        ))}

        {stylesheetPaths.map((href) => (
          <link href={href} key={href} media="all" rel="stylesheet" />
        ))}

        {postStylesheetInlineStyles.map((styleBlock, index) => (
          <style
            dangerouslySetInnerHTML={{ __html: styleBlock.cssText }}
            id={styleBlock.id}
            key={styleBlock.id ?? `post-inline-style-${index}`}
            type="text/css"
          />
        ))}

        <link
          href="/wp-content/uploads/2026/03/cropped-oku-therapy-transparent-1-32x32.png"
          rel="icon"
          sizes="32x32"
        />
        <link
          href="/wp-content/uploads/2026/03/cropped-oku-therapy-transparent-1-192x192.png"
          rel="icon"
          sizes="192x192"
        />
        <link
          href="/wp-content/uploads/2026/03/cropped-oku-therapy-transparent-1-180x180.png"
          rel="apple-touch-icon"
        />
      </head>
      <body className={bodyClass}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
