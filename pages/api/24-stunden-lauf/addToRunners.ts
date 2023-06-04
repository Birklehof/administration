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

  const newNumbersStart = await db
    .collection('apps/24-stunden-lauf/runners')
    .orderBy('number', 'desc')
    .limit(1)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        return 1;
      } else {
        return snapshot.docs[0].data().number + 1;
      }
    });

  const studentsAdded = await addStudents(newNumbersStart, res);
  const staffAdded = await addStaff(res, newNumbersStart + studentsAdded);

  return res.status(200).json({
    studentsAdded,
    staffAdded,
  });
}

async function addStudents(
  newNumbersStart: number,
  res: NextApiResponse
): Promise<number | void> {
  return db
    .collection('students')
    .get()
    .then(async (studentsSnapshot) => {
      let runnersAdded = 0;

      await Promise.all(
        studentsSnapshot.docs.map(async (doc, index) => {
          const student = doc.data() as Student;

          const newRunner = {
            number: newNumbersStart + index,
            studentId: student.studentId,
            name: student.firstName + ' ' + student.lastName,
            type: 'student',
            email: student.email,
            class: student.class,
            house: student.house,
          };

          // Check if student is already a runner by checking if there is a runner with the same studentId
          const runner = await db
            .collection('apps/24-stunden-lauf/runners')
            .where('studentId', '==', student.studentId)
            .get();

          // If the student is not already a runner, add them to the runners collection
          if (runner.empty) {
            await db
              .collection('apps/24-stunden-lauf/runners')
              .add(newRunner)
              .then(() => {
                runnersAdded += 1;
              });
          }
        })
      );
      return runnersAdded;
    })
    .catch((error: any) => {
      return res.status(500).json({ error: 'Error while creating runners' });
    });
}

async function addStaff(
  res: NextApiResponse,
  newNumbersStart: number
): Promise<number | void> {
  return db
    .collection('staff')
    .get()
    .then(async (staffSnapshot) => {
      let runnersAdded = 0;

      await Promise.all(
        staffSnapshot.docs.map(async (doc, index) => {
          const staff = doc.data() as Staff;

          const newRunner = {
            number: newNumbersStart + index,
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
      );
      return runnersAdded;
    })
    .catch(() => {
      return res.status(500).json({ error: 'Error while creating runners' });
    });
}
