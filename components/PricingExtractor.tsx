import { useState } from 'react'
import axios from 'axios'
import styles from '../styles/PricingExtractor.module.css'

export default function PricingExtractor() {
  const [url, setUrl] = useState('')
  const [pricingData, setPricingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPricingData(null)

    try {
      const response = await axios.post('/api/getPricing', { url })
      console.log('API Response:', response.data)
      setPricingData(response.data.pricingData)
    } catch (err) {
      console.error('Error fetching pricing data:', err)
      setError('Error fetching pricing data: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const renderPricingTable = () => {
    if (!pricingData || !pricingData.features || !pricingData.tiers) return null;

    return (
      <table className={styles.pricingTable}>
        <thead>
          <tr>
            <th>Feature</th>
            {pricingData.tiers.map((tier, index) => (
              <th key={index}>{tier.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pricingData.features.map((feature, featureIndex) => (
            <tr key={featureIndex}>
              <td>{feature}</td>
              {pricingData.tiers.map((tier, tierIndex) => (
                <td key={tierIndex}>{tier[feature] || '-'}</td>
              ))}
            </tr>
          ))}
          <tr>
            <td><strong>Price</strong></td>
            {pricingData.tiers.map((tier, index) => (
              <td key={index}><strong>{tier.price}</strong></td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Pricing'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {loading && <p>Loading pricing data...</p>}

      {pricingData ? renderPricingTable() : <p>No pricing data found.</p>}
    </div>
  )
}