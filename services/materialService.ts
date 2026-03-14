import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { CourseMaterial } from '../types';

const MATERIALS_COLLECTION = (spaceId: string, courseId: string) => 
  `spaces/${spaceId}/courses/${courseId}/materials`;

export const uploadMaterial = async (
  spaceId: string, 
  courseId: string, 
  fileUri: string, 
  fileName: string,
  fileSize: number,
  fileType: string,
  uploadedByUid: string,
  uploadedByName: string
): Promise<string> => {
  const materialId = doc(collection(db, 'dummy')).id;
  const storagePath = `spaces/${spaceId}/courses/${courseId}/materials/${materialId}_${fileName}`;
  const storageRef = ref(storage, storagePath);

  // Fetch the file as a blob
  const response = await fetch(fileUri);
  const blob = await response.blob();

  // Upload to Firebase Storage
  await uploadBytes(storageRef, blob);
  const downloadUrl = await getDownloadURL(storageRef);

  const material: CourseMaterial = {
    id: materialId,
    courseId,
    title: fileName,
    fileUrl: downloadUrl,
    fileType,
    fileSize,
    uploadedAt: new Date(),
    uploadedByUid,
    uploadedByName,
    isPinned: false,
  };

  await setDoc(doc(db, MATERIALS_COLLECTION(spaceId, courseId), materialId), {
    ...material,
    uploadedAt: serverTimestamp(),
    storagePath,
  });

  return materialId;
};

export const getMaterials = async (spaceId: string, courseId: string): Promise<CourseMaterial[]> => {
  const materialsRef = collection(db, MATERIALS_COLLECTION(spaceId, courseId));
  const q = query(materialsRef, orderBy('uploadedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as CourseMaterial);
};

export const deleteMaterial = async (spaceId: string, courseId: string, materialId: string, storagePath: string): Promise<void> => {
  // Delete from Firestore
  await deleteDoc(doc(db, MATERIALS_COLLECTION(spaceId, courseId), materialId));
  
  // Delete from Storage
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};

export const togglePinMaterial = async (spaceId: string, courseId: string, materialId: string, isPinned: boolean): Promise<void> => {
  const materialRef = doc(db, MATERIALS_COLLECTION(spaceId, courseId), materialId);
  await setDoc(materialRef, { isPinned }, { merge: true });
};
