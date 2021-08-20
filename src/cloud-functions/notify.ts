import * as functions from 'firebase-functions';
import webpush from 'web-push';

export default functions
  .runWith({
    maxInstances: 1,
    memory: '256MB',
    timeoutSeconds: 60,
  })
  .pubsub.schedule('every 15 mins')
  .onRun(async (context) => {
    console.log('running notify');

    const db = await getDb();

    const batchSize = 100;
    const query = db.collectionGroup('push_subscriptions').limit(batchSize);

    const batchProcess = async (
      query: FirebaseFirestore.Query,
      resolve: () => void,
      last?: FirebaseFirestore.DocumentSnapshot
    ) => {
      const next = await (last ? query.startAfter(last) : query).get();

      await Promise.all(next.docs.map((doc) => processOne(db, doc)));

      if (next.size) {
        const last = next.docs[next.docs.length - 1];
        // Recurse on the next process tick, to avoid exploding the
        // stack.
        process.nextTick(() => {
          batchProcess(query, resolve, last);
        });
      } else {
        resolve();
      }
    };

    await new Promise<void>((resolve) => {
      batchProcess(query, resolve);
    });
  });

const processOne = async (
  db: FirebaseFirestore.Firestore,
  doc: FirebaseFirestore.DocumentSnapshot
) => {
  console.log('processing', doc.id);
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
    console.log('sending a push', doc.id);
    await webpush.sendNotification(
      subscription.subscription,
      JSON.stringify({
        id: itemId,
        scheduledOn: scheduledOn.toDate().toUTCString(),
      }),
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
