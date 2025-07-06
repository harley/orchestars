import { useState, useEffect, useCallback } from 'react'

interface FetchResult<T> {
  loading: boolean
  error: any
  data: T | null
  refetch: () => void
}

function useFetchData<T = any>(apiPath: string): FetchResult<T> {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)
  const [data, setData] = useState<T | null>(null)

  const fetchData = useCallback(() => {
    if (!apiPath) return
    setLoading(true)
    setError(null)
    setData(null)

    fetch(apiPath)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`)
        }
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }, [apiPath])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { loading, error, data, refetch: fetchData }
}

export default useFetchData
