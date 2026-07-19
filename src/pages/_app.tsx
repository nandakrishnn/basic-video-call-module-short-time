import type { AppProps } from 'next/app'
import { inter } from '@/lib/font'
import '@/styles/globals.css'

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <div className={inter.className}>
      <Component {...pageProps} />
    </div>
  )
}

export default App
