import { executeCommand } from '@appland/action-utils';

import now from './now';

export async function fetchInitialHistory(sinceDays: number) {
  const today = now();
  const fetchSinceDate = new Date(today.setDate(today.getDate() - sinceDays));
  const year = fetchSinceDate.getFullYear();
  const month = String(fetchSinceDate.getMonth() + 1).padStart(2, '0');
  const day = String(fetchSinceDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  await executeCommand(`git fetch --shallow-since ${formattedDate}`);
}

// If that fails, get all the history
export async function fetchAllHistory() {
  // 128: fatal: --unshallow on a complete repository does not make sense
  await executeCommand(`git fetch --unshallow`, { allowedCodes: [0, 128] });
}
