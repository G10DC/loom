// lib/store.js — M4: versioned artifact store. A save NEVER silently overwrites: repeated saves
// to the same name append a version. get returns the latest (or a specific version). This is the
// persistence side of FR-6; the engine already passes artifacts between phases by name (prevArtifact).

/**
 * @returns {{ save: (name: string, doc: string) => {name,version}, get: (name: string, version?: number) => (string|null), versions: (name: string) => number, list: () => string[], toJSON: () => Object }}
 */
export function createStore() {
  const map = new Map(); // name -> doc[]

  return {
    save(name, doc) {
      const list = map.get(name) || [];
      list.push(doc);
      map.set(name, list);
      return { name, version: list.length };
    },
    get(name, version) {
      const list = map.get(name);
      if (!list || list.length === 0) return null;
      return version == null ? list[list.length - 1] : list[version - 1] ?? null;
    },
    versions(name) {
      return (map.get(name) || []).length;
    },
    list() {
      return [...map.keys()];
    },
    toJSON() {
      return Object.fromEntries(map);
    },
  };
}

/** A pure helper: does artifact `name` resolve for phase N+1 after phase N saved it? (FR-6 read-by-name) */
export function canReadPrev(store, name) {
  return store.get(name) != null;
}
