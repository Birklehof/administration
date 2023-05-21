import { NextApiRequest, NextApiResponse } from 'next';
import { auth, db } from '@/lib/firebase/firebaseAdmin';
import { Lap, Runner, Staff, Student } from '@/lib/interfaces';

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

  // Copy all students to runners
  await db
    .collection('students')
    .get()
    .then(async (studentsSnapshot) => {
      let runnersAdded = 0;

      await Promise.all(
        studentsSnapshot.docs.map(async (doc) => {
          const student = doc.data() as Student;

          const newRunner = {
            number: 0,
            name: student.firstName + ' ' + student.lastName,
            type: 'student',
            email: student.email,
            class: student.class,
            house: student.house,
          };

          await db
            .collection('apps/24-stunden-lauf/runners')
            .add(newRunner)
            .then(() => {
              runnersAdded += 1;
            });
        })
      ).finally(() => {
        return res
          .status(200)
          .json({ success: true, runnersCreated: runnersAdded });
      });
    })
    .catch((error: any) => {
      return res.status(500).json({ error: 'Error while creating runners' });
    });
}
