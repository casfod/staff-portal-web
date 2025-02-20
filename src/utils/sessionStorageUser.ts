export function sessionStorageUser() {
  const storedUserJSON = sessionStorage.getItem("currentSessionUser");
  let storedUser = null;

  if (storedUserJSON) {
    try {
      storedUser = JSON.parse(storedUserJSON);
    } catch (error) {
      console.error("Error parsing stored user data:", error);
    }
  }

  return storedUser;
}

export function getUserToken(userId: number) {
  return sessionStorage.getItem(`token-${userId}`);
}
