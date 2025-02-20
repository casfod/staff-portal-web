import { localStorageUser, getUserToken } from "./localStorageUser";

const currentUser = localStorageUser();

const authToken = currentUser ? getUserToken(currentUser.id) : null;

export function generalApiHeader() {
  const header = authToken ? { authorization: `Bearer ${authToken}` } : {};
  return header;
}
