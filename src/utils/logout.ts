import { toast } from "react-toastify";

export const logout = async () => {
  try {
    if (!localStorage.getItem("refreshToken")) return;

    await fetch('https://auth.saas.ascendro.io/realms/ascendro/protocol/openid-connect/logout', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: "ascendroauth",
        refresh_token: localStorage.getItem("refreshToken") ?? ''
      }).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    localStorage.clear();
    window.location.href = "/login";
  }
  catch {
    toast.error("Error logging out!");
  }
}