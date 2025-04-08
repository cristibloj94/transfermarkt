import { toast } from "react-toastify";

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch('https://auth.saas.ascendro.io/realms/ascendro/protocol/openid-connect/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: "password",
        client_id: "ascendroauth",
        username: email,
        password
      }).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const data = await response.json();
    if (data?.access_token) {
      localStorage.setItem("token", data?.access_token);
      localStorage.setItem("refreshToken", data?.refresh_token);

      const user = await getUserId(email, data?.access_token);
      const userId = user?.[0]?.id;

      const roles = await getUserRole(userId, data?.access_token);
      const userRole = roles?.realmMappings?.[1]?.name;
      localStorage.setItem("role", userRole);

      window.location.href = "/home";
    }
    else toast.error("Invalid credentials");
  }
  catch {
    toast.error("Error logging in!");
  }
}

const getUserId = async (email: string, accessToken: string) => {
  try {
    const response = await fetch(`https://auth-admin.intern.ascendro.io/admin/realms/ascendro/users?username=${email}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    return data;
  }
  catch {
    toast.error("Error getting user id!");
  }
}

const getUserRole = async (id: string, accessToken: string) => {
  try {
    const response = await fetch(`https://auth-admin.intern.ascendro.io/admin/realms/ascendro/users/${id}/role-mappings`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    return data;
  }
  catch {
    toast.error("Error getting user role!");
  }
}