export async function bulkSyncUsers() {
  return {
    synced: 0,
    updated: 0,
    conflicts: 0,
    failed: 0,
    details: [],
  };
}
