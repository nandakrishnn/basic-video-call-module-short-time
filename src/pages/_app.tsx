import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ToastProvider } from '@/components/shared/Toast'
import { inter } from '@/lib/font'
import { MESSAGES } from '@/constants/messages'
import '@/styles/globals.css'

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <>
      {/* Default tab identity. Nothing set a title before, so every route
          showed its raw URL. A page can override this with its own <Head>. */}
      <Head>
        <title>{MESSAGES.app.title}</title>
        <meta name="description" content={MESSAGES.app.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* Above the router's page, so a toast raised just before navigating is
          still on screen once the next page renders. */}
      <ToastProvider>
        <div className={inter.className}>
          <Component {...pageProps} />
        </div>
      </ToastProvider>
    </>
  )
}

export default App
