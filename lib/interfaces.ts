export interface Role {
  email: string;
  role: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Student {
  id: string;
  number: number;
  firstName: string;
  lastName: string;
  email: string;
  house: string;
  class: string;
}

export interface User {
  photoURL?: string;
  displayName?: string;
  uid: string;
  email: string;
  accessToken?: string;
}
