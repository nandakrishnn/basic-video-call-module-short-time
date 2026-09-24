import { Head, Html, Main, NextScript } from 'next/document'

/**
 * Document-level head only. Next's docs are explicit that <title> must not live
 * here — it goes in _app so pages can override it per route.
 */
const Document = (): JSX.Element => (
  <Html lang="en">
    <Head>
      {/* Generated from public/yorphysio-logo.png. The full mark is 571 KB,
          which is far too heavy to ship as a tab icon. */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />
      <meta name="theme-color" content="#D86F4E" />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
)

export default Document
