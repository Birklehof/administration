import { NextApiRequest, NextApiResponse } from 'next';
import { auth, db } from '@/lib/firebase/firebaseAdmin';
import { Lap, Runner, Staff } from '@/lib/interfaces';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const token = await auth.verifyIdToken(
      req.headers.authorization.toString()
    );

    if (!token.email) {
      throw new Error('Access token invalid');
    }

    const role = await db
      .collection('apps/administration/roles')
      .doc(token.email)
      .get();

    if (!role.exists || role.data()?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }

  const staffSnapshot = await db.collection('staff').get();

  staffSnapshot.forEach(async (doc) => {
    const staff = doc.data() as Staff;

    const newRunner = {
      number: 0,
      name: staff.firstName + ' ' + staff.lastName,
      type: 'staff',
      email: staff.email,
    };

    await db.collection('apps/24-stunden-lauf/runners').add(newRunner);
  });

  return res
    .status(200)
    .json({ success: true, runnersCreated: staffSnapshot.size });
}
