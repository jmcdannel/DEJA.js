import { db } from '@repo/firebase-config/firebase-node'
import { collection, getDocs, setDoc, deleteDoc, deleteField, doc } from 'firebase/firestore'


async function renameLocoId(layoutId: string) {
  try {
    console.log('This script is disabled. It has been preserved for potential future use.');
    return;
    // Replace 'locos' with your collection name
    const querySnapshot = await getDocs(collection(db, `layouts/${layoutId}/locos`))
    const locosToDelete: string[] = []
    
    const updates = querySnapshot.docs.map(async (document) => {
      const data = document.data()
      
      locosToDelete.push(document.id)
        
      return setDoc(doc(db, `layouts/${layoutId}/locos`, data.address.toString()), {...data})
    })
    
    await Promise.all(updates)
    // Delete old locoId documents
    const deletePromises = locosToDelete.map(id => deleteDoc(doc(db, `layouts/${layoutId}/locos`, id)))
    await Promise.all(deletePromises)
    console.log('Property renamed in all documents')
  } catch (error) {
    console.error('Error renaming property:', error)
  }
}
['tam'].forEach(layoutId => renameLocoId(layoutId))