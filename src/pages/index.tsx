import type { GetServerSideProps } from 'next'
import { ROUTES } from '@/constants/routes'

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: ROUTES.login,
      permanent: false,
    },
  }
}

const IndexPage = (): null => null

export default IndexPage
