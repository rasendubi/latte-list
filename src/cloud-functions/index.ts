export { default as fetch } from './fetch';

// TODO: app can be lazy-initialized

// admin.initializeApp();
//
// const dev = process.env.NODE_ENV !== 'production';
// const app = next({
//   dev: false,
//   // the absolute directory from the package.json file that initialises this module
//   // IE: the absolute path from the root of the Cloud Function
//   // conf: { distDir: 'dist/client' } as any,
// });
// const handle = app.getRequestHandler();
//
// export const server = functions
//   .runWith({
//     maxInstances: 1,
//     timeoutSeconds: 30,
//     memory: '128MB',
//   })
//   .https.onRequest((request, response) => {
//     return app.prepare().then(() => handle(request, response));
//   });
