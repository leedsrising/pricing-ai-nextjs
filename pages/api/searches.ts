import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const searches = await prisma.search.findMany()
    res.status(200).json(searches)
  }
  // Handle other HTTP methods...
}