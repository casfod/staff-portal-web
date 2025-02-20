export function localStorageUser() {
  const storedUserJSON = localStorage.getItem("currentLocalUser");
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
  return localStorage.getItem(`token-${userId}`);
}
