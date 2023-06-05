import {
  deleteDoc,
  doc,
  collection,
  addDoc,
  getCountFromServer,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '.';

interface Header {
  label: string;
  key: string;
}

export interface RunnersListCSV {
  headers: Header[];
  data: Row[];
  filename: string;
}

interface Row {
  name: string;
  class: string;
  number: number;
}

export async function exportRunners(): Promise<RunnersListCSV> {
  const rows: Row[] = [];

  await getDocs(collection(db, 'apps', '24-stunden-lauf', 'runners')).then(
    (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        rows.push({
          name: data.name,
          class: data.class || '',
          number: data.number,
        });
      });
    }
  );

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
    { label: 'Startnummer abgeholt', key: 'showedUp' },
    { label: 'Startnummer zurückgegeben', key: 'showedUp' },
  ];

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}_${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}`;

  const csvReport: RunnersListCSV = {
    data: rows,
    headers: headers,
    filename: 'Birklehof_24-Stunden-Lauf_Teilnehmer_' + formattedDate + '.csv',
  };

  return csvReport;
}
