import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import puppeteer from 'puppeteer';
import OpenAI from 'openai';

// Make sure to set these environment variables in your .env.local file
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function findPricingPage(url: string): Promise<string | null> {
  try {
    console.log(`Searching for pricing page for domain: ${url}`);
    const searchResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q: `${url} pricing`,
      }
    });

    console.log('Google API response:', JSON.stringify(searchResponse.data, null, 2));

    if (searchResponse.data.items && searchResponse.data.items.length > 0) {
      const pricingUrl = searchResponse.data.items[0].link;
      console.log(`Found pricing URL: ${pricingUrl}`);
      return pricingUrl;
    } else {
      console.log('No pricing page found');
      return null;
    }
  } catch (error) {
    console.error('Error using Google Custom Search API:', error);
    throw new Error('Error finding pricing page');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('GOOGLE_API_KEY set:', !!GOOGLE_API_KEY);
    console.log('GOOGLE_CX set:', !!GOOGLE_CX);
    console.log('OPENAI_API_KEY set:', !!OPENAI_API_KEY);

    const pricingUrl = await findPricingPage(url);
    if (!pricingUrl) {
      return res.status(404).json({ error: 'Pricing page not found' });
    }

    const pricingData = await extractPricingData(pricingUrl);
    res.status(200).json({ pricingUrl, pricingData });
  } catch (error) {
    console.error('Error in getPricing:', error);
    res.status(500).json({ error: 'Error processing the request', details: error.message });
  }
}

async function extractPricingData(url: string): Promise<any> {
  try {
    console.log('Extracting pricing info from:', url);
    
    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to the URL and wait for the content to load
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Take a screenshot
    const screenshot = await page.screenshot({ encoding: 'base64' });
    
    await browser.close();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extract pricing information from this image. Format the response as a JSON object with 'features' as an array of feature names (including price), and 'tiers' as an array of tier objects. Each tier object should have a 'name' and values corresponding to each feature. If there are no tiers, create three usage levels (e.g., 'Low', 'Medium', 'High') and estimate prices for each level." },
            { type: "image_url", image_url: { url: `data:image/png;base64,${screenshot}` } }
          ],
        },
      ],
      max_tokens: 4096,
    });

    console.log('OpenAI API response received');
    let pricingData;
    try {
      const content = completion.choices[0].message.content;
      // Use regex to extract JSON content from markdown code block
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        // Parse the extracted JSON content
        pricingData = JSON.parse(jsonMatch[1]);
      } else {
        // If no JSON block is found, return the raw content
        pricingData = { rawContent: content };
      }
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      // If parsing fails, return the raw content
      pricingData = { rawContent: completion.choices[0].message.content };
    }
    return pricingData;
  } catch (error) {
    console.error('Error extracting pricing information:', error);
    throw error;
  }
}
