import * as functions from 'firebase-functions';
import webpush from 'web-push';

export default functions
  .runWith({
    maxInstances: 1,
    memory: '256MB',
  })
  .pubsub.schedule('every 1 hour')
  .onRun(async (context) => {
    console.log('running notify');

    const db = await getDb();

    const batchSize = 100;
    const query = db.collectionGroup('push_subscriptions').limit(batchSize);

    const batchProcess = async (
      query: FirebaseFirestore.Query,
      last?: FirebaseFirestore.DocumentSnapshot
    ) => {
      const next = await (last ? query.startAfter(last) : query).get();

      next.docs.forEach((doc) => {
        // TODO: this can overwhelm the nodejs. Limit the number of running promises.
        processOne(db, doc);
      });

      if (next.docs.length) {
        const last = next.docs[next.docs.length - 1];
        process.nextTick(() => {
          batchProcess(query, last);
        });
      }
    };

    batchProcess(query);
  });

const processOne = async (
  db: FirebaseFirestore.Firestore,
  doc: FirebaseFirestore.DocumentSnapshot
) => {
  const subscription: any = doc.data();
  const uid = doc.ref.parent.parent!.id;

  const nextReview = await db
    .collection(`users/${uid}/items`)
    .where('scheduledOn', '<', new Date())
    .orderBy('scheduledOn')
    .select('scheduledOn')
    .limit(1)
    .get();

  if (!nextReview.docs.length) {
    // no items to review
    return;
  }

  const itemId = nextReview.docs[0].id;
  const scheduledOn: FirebaseFirestore.Timestamp =
    nextReview.docs[0].data().scheduledOn;
  if (
    subscription.lastNotified?.id === itemId &&
    scheduledOn.isEqual(subscription.lastNotified?.scheduledOn)
  ) {
    // already notified about this item
    return;
  }

  try {
    await webpush.sendNotification(
      subscription.subscription,
      JSON.stringify({ itemId }),
      {
        vapidDetails: {
          subject: process.env.VAPID_SUBJECT!,
          publicKey: process.env.VAPID_PUBLIC_KEY!,
          privateKey: process.env.VAPID_PRIVATE_KEY!,
        },
      }
    );

    await doc.ref.update({ lastNotified: { id: itemId, scheduledOn } });
  } catch (e) {
    console.warn('failed to send notification', e);
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
