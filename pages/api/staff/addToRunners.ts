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

  // Check if user is admin
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

  // Copy all staff to runners
  await db
    .collection('staff')
    .get()
    .then(async (staffSnapshot) => {
      let runnersAdded = 0;

      await Promise.all(
        staffSnapshot.docs.map(async (doc) => {
          const staff = doc.data() as Staff;

          const newRunner = {
            number: 0,
            name: staff.firstName + ' ' + staff.lastName,
            type: 'staff',
            email: staff.email,
          };

          // Check if staff is already a runner by checking if there is a runner with the same email
          const runner = await db
            .collection('apps/24-stunden-lauf/runners')
            .where('email', '==', staff.email)
            .get();

          if (runner.empty) {
            await db
              .collection('apps/24-stunden-lauf/runners')
              .add(newRunner)
              .then(() => {
                runnersAdded += 1;
              });
          }
        })
      ).finally(() => {
        return res
          .status(200)
          .json({ success: true, runnersCreated: runnersAdded });
      });
    })
    .catch(() => {
      return res.status(500).json({ error: 'Error while creating runners' });
    });
}
