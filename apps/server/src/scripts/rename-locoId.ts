import { db } from '@repo/firebase-config/firebase-node'
import { collection, getDocs, updateDoc, deleteField, doc } from 'firebase/firestore'


async function renameProperty(layoutId: string) {
  try {
    console.log('This script is disabled. It has been preserved for potential future use.');
    return;
    // Replace 'locos' with your collection name
    const querySnapshot = await getDocs(collection(db, `layouts/${layoutId}/locos`))
    
    const updates = querySnapshot.docs.map(async (document) => {
      const data = document.data()
      
      // Replace oldProperty and newProperty with your property names
      if (data.locoId !== undefined) {
        const newData = {
          address: data.locoId,
          // Remove the old property
          locoId: deleteField()
        }
        
        return updateDoc(doc(db, `layouts/${layoutId}/locos`, document.id), newData)
      }
    })
    
    await Promise.all(updates)
    console.log('Property renamed in all documents')
  } catch (error) {
    console.error('Error renaming property:', error)
  }
}
// ['shelf'].forEach(layoutId => renameProperty(layoutId))
['tam', 'betatrack'].forEach(layoutId => renameProperty(layoutId))