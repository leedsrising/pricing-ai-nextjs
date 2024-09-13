import React, { useState } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Container } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PricingData {
  tiers: {
    name: string;
    price: string;
    features: { [key: string]: string };
  }[];
  features: string[];
}

export default function PricingExtractor() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pricingData, setPricingData] = useState<PricingData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPricingData(null);

    try {
      const response = await axios.post(`${API_URL}/api/getPricing`, { url })
      console.log('API Response:', response.data)
      setPricingData(response.data.pricingData)
    } catch (err) {
      setError('Failed to fetch pricing data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg">
      <Container maxWidth="sm">
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          AI Powered Price Assessment
        </Typography>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <TextField
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="company.com"
            required
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={loading}>
            Go
          </Button>
        </form>
      </Container>

      {loading && <Typography align="center" style={{ marginTop: '1rem' }}>Loading...</Typography>}
      {error && <Typography align="center" color="error" style={{ marginTop: '1rem' }}>{error}</Typography>}

      {pricingData && (
        <TableContainer component={Paper} style={{ marginTop: '2rem' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Feature</TableCell>
                {pricingData.tiers.map((tier, index) => (
                  <TableCell key={index}>{tier.name} - {tier.price}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pricingData.features.map((feature, featureIndex) => (
                <TableRow key={featureIndex}>
                  <TableCell>{feature}</TableCell>
                  {pricingData.tiers.map((tier, tierIndex) => (
                    <TableCell key={tierIndex}>
                      {tier.features && typeof tier.features === 'object' && feature in tier.features
                        ? tier.features[feature as string]
                        : '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}