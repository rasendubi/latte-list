import * as functions from 'firebase-functions';

export default functions
  .runWith({
    maxInstances: 1,
    memory: '256MB',
    timeoutSeconds: 60,
  })
  .auth.user()
  .onDelete(async (user) => {
    const uid = user.uid;
    const db = await getDb();
    await db.doc(`users/${uid}`).delete();
    await deleteCollection(db.collection(`users/${uid}/items`));
    await deleteCollection(db.collection(`users/${uid}/push_subscriptions`));
  });

const deleteCollection = async (
  ref: FirebaseFirestore.CollectionReference,
  batchSize = 128
) => {
  const query = ref.orderBy('__name__').limit(batchSize);

  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
};

const deleteQueryBatch = async (
  query: FirebaseFirestore.Query,
  resolve: () => void,
  reject: (e: any) => void
) => {
  try {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      resolve();
      return;
    }

    // Delete documents in a batch
    const batch = query.firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
      deleteQueryBatch(query, resolve, reject);
    });
  } catch (e) {
    reject(e);
  }
};

const getDb = async () => {
  const admin = await import('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  const db = admin.firestore();
  return db;
};
