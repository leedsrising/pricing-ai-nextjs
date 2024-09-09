import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function SearchList() {
  const { data, error } = useSWR('/api/searches', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  return <ul>{data.map(search => <li key={search.id}>{search.searchString}</li>)}</ul>
}