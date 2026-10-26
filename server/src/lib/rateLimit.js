/**
 * Rate limit đơn giản in-memory (MVP).
 * key → timestamps trong cửa sổ thời gian.
 */

function createRateLimiter({ windowMs, max }) {
  const hits = new Map();

  function prune(now, list) {
    return list.filter((t) => now - t < windowMs);
  }

  return function check(key) {
    const now = Date.now();
    const list = prune(now, hits.get(key) || []);
    if (list.length >= max) {
      hits.set(key, list);
      return false;
    }
    list.push(now);
    hits.set(key, list);
    return true;
  };
}

/** Connect socket: tối đa 20 lần / phút / user */
const allowSocketConnect = createRateLimiter({
  windowMs: 60_000,
  max: 20,
});

/** send_message: tối đa 30 tin / 10 giây / user */
const allowSendMessage = createRateLimiter({
  windowMs: 10_000,
  max: 30,
});

module.exports = { allowSocketConnect, allowSendMessage };
