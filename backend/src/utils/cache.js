import { LRUCache } from "lru-cache";

const cache = new LRUCache({
  max: 100,                 // nombre max d'entrées
  ttl: 1000 * 60 * 10       // 10 minutes
});

export default cache;
