import { toast } from "react-toastify";

export const refreshToken = async () => {
  try {
    const response = await fetch('https://auth.saas.ascendro.io/realms/ascendro/protocol/openid-connect/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: "ascendroauth",
        refresh_token: localStorage.getItem("refreshToken") ?? ''
      }).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const data = await response.json();
    if (data?.access_token) {
      localStorage.setItem("token", data?.access_token);
      localStorage.setItem("refreshToken", data?.refresh_token);
    }
  }
  catch {
    toast.error("Error refreshing token!");
  }
}