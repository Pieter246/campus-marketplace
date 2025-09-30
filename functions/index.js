import { onRequest } from 'firebase-functions/v2/https';

export const makePublic = onRequest({
  invoker: 'public'
}, (req, res) => {
  res.send('Public function working');
});