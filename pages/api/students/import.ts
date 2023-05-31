import { NextApiRequest, NextApiResponse } from 'next';
import { auth, db, rc } from '@/lib/firebase/firebaseAdmin';
import formidable from 'formidable';
import fs from 'fs';
import { FormidableError, parseForm } from '@/lib/parseForm';
import { Student } from '@/lib/interfaces';
import { deleteCollection } from '@/lib/firebase/backendUtils';

// Absolutely necessary for the upload to work
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  // Get remote config house name translations
  const template = await rc.getTemplate();
  const houses = JSON.parse(template.parameters.houseAbbreviationTranslations.defaultValue?.value) as { name: string, abbreviation: string }[];

  try {
    // Get the uploaded file
    const { fields, files } = await parseForm(req);
    if (!files.file) {
      throw new Error('No file uploaded');
    }
    const file = files.file as formidable.File;

    // Parse the file
    const newStudents = await parseStudents(file, houses);

    // Delete old students
    await deleteCollection('students');

    // Create new students
    await createStudents(newStudents);

    res.status(200).end();
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).end();
    } else {
      res.status(500).end();
    }
  }
}

async function parseStudents(file: formidable.File, houses: { name: string, abbreviation: string }[]) {
  let students: Student[] = [];
  try {
    const data = fs.readFileSync(file.filepath);
    const lines = data.toString().split('\n');

    for (let i = 1; i < lines.length - 1; i++) {
      students.push(parseStudent(lines[i], houses));
    }
  } catch (error) {
    throw new Error('Error while parsing file');
  }

  return students;
}

function parseStudent(line: string, houses: { name: string, abbreviation: string }[]): Student {
  const student = line.split(';');

  const numberStr = student[0].trim();
  const lastName = student[1].trim();
  const firstName = student[2].trim();
  const _class = student[3].replace(/\s/g, '').toUpperCase();
  const house = houses.find(house => house.abbreviation === student[4].trim())?.name || student[4].trim();
  const email = student[5]?.trim() || `${firstName.replace(/\s/g, '').toLowerCase()}.${lastName.replace(/\s/g, '').toLowerCase()}@s.birklehof.de`;

  // Parse number
  if (numberStr.length !== 5) {
    throw new Error('Invalid student number');
  }

  const numberInt = parseInt(numberStr);

  if (isNaN(numberInt)) {
    throw new Error('Invalid student number');
  }

  return {
    number: numberInt,
    firstName,
    lastName,
    class: _class,
    house,
    email,
  };
}

async function createStudents(students: Student[]) {
  const batch = db.batch();
  students.forEach((student) => {
    const studentRef = db.collection('students').doc();
    batch.set(studentRef, student);
  });
  await batch.commit();
}
