const KEY = "smartpricetag_removed_products";

export function readRemovedProducts(): string[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const ids: unknown = JSON.parse(raw);
  if (!Array.isArray(ids) || !ids.every(id => typeof id === "string")) {
    throw new Error("Invalid removed products list");
  }
  return ids;
}

export function setProductRemoved(id: string, removed: boolean) {
  const ids = new Set(readRemovedProducts());
  if (removed) ids.add(id);
  else ids.delete(id);
  localStorage.setItem(KEY, JSON.stringify([...ids]));
}
