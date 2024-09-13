import prisma from '../lib/prisma';
import React from "react"
import { GetStaticProps } from "next"
import Layout from "../components/Layout"
import PricingExtractor from '../components/PricingExtractor'

export default function Home() {
  return (
    <div>
      <PricingExtractor />
    </div>
  )
}

export type SearchProps = {
  id: string
  searchString: string
}

export const getStaticProps: GetStaticProps = async () => {
  const searches = await prisma.search.findMany();
  return {
    props: { searches },
    revalidate: 10,
  };
};

type Props = {
  searches: SearchProps[]
}

const SearchList: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className="page">
        <h1>Search History</h1>
        <main>
          {props.searches.map((search) => (
            <div key={search.id} className="search-item">
              <p>{search.searchString}</p>
            </div>
          ))}
        </main>
      </div>
      <style jsx>{`
        .search-item {
          background: white;
          transition: box-shadow 0.1s ease-in;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .search-item:hover {
          box-shadow: 1px 1px 3px #aaa;
        }
      `}</style>
    </Layout>
  )
}

export { SearchList }
