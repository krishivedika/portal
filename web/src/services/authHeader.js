export default function authHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  return { "x-access-token": user?.accessToken || ''};
}
