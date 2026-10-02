import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseApp } from './firebase-app';

let _db: Firestore | null = null;

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(firebaseApp());
  return _db;
}
