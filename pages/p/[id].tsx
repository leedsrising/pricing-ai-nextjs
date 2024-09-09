import React from "react"
import { GetServerSideProps } from "next"
import Layout from "../../components/Layout"
import prisma from '../../lib/prisma'

export type SearchProps = {
  id: string
  searchString: string
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const search = await prisma.search.findUnique({
    where: {
      id: String(params?.id),
    },
  })

  if (!search) {
    return {
      notFound: true,
    }
  }

  return {
    props: search,
  }
}

const SearchDetail: React.FC<SearchProps> = (props) => {
  return (
    <Layout>
      <div className="page">
        <h2>Search Detail</h2>
        <div className="search-item">
          <p><strong>ID:</strong> {props.id}</p>
          <p><strong>Search String:</strong> {props.searchString}</p>
        </div>
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 2rem;
        }

        .search-item {
          background: #f0f0f0;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 1rem;
        }
      `}</style>
    </Layout>
  )
}

export default SearchDetail
