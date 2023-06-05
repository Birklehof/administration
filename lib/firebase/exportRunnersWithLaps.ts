import {
  deleteDoc,
  doc,
  collection,
  addDoc,
  getCountFromServer,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '.';
import { Runner } from '../interfaces';

interface Header {
  label: string;
  key: string;
}

export interface RunnersWithLapsListCSV {
  headers: Header[];
  data: Row[];
  filename: string;
}

interface Row {
  name: string;
  class: string;
  number: number;
  laps: number;
}

export async function exportRunnersWithLaps(): Promise<RunnersWithLapsListCSV> {
  const rows: Row[] = [];

  await getDocs(collection(db, 'apps', '24-stunden-lauf', 'runners'))
    .then(async (querySnapshot) => {

      await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data() as Runner;

          const lapsQuery = query(
            collection(db, 'apps', '24-stunden-lauf', 'laps'),
            where('runnerId', '==', doc.id)
          );
          const lapsSnapshot = await getCountFromServer(lapsQuery);
          const laps = lapsSnapshot.data().count || 0;

          rows.push({
            name: data.name,
            class: data.class || '',
            number: data.number,
            laps: laps,
          });
        })
      );
    })
    .catch((error) => {
      throw new Error(error);
    });

  // Sort by class
  rows.sort((a, b) => {
    // If class is the same, sort by name
    if (a.class === b.class) {
      return a.name.localeCompare(b.name);
    }

    // If both are numbers, sort by number
    if (!isNaN(Number(a.class)) && !isNaN(Number(b.class))) {
      return Number(a.class) - Number(b.class);
    }

    // If one is a number, sort by number
    if (!isNaN(Number(a.class))) {
      return -1;
    }

    if (!isNaN(Number(b.class))) {
      return 1;
    }

    // If both are strings, sort by string
    return a.class.localeCompare(b.class);
  });

  const headers: Header[] = [
    { label: 'Name', key: 'name' },
    { label: 'Klasse', key: 'class' },
    { label: 'Startnummer', key: 'number' },
    { label: 'Runden', key: 'laps' },
  ];

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}_${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}`;

  const csvReport: RunnersWithLapsListCSV = {
    data: rows,
    headers: headers,
    filename: 'Birklehof_24-Stunden-Lauf_Ergebnis_' + formattedDate + '.csv',
  };

  return csvReport;
}
