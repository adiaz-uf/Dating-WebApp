import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../api/config";

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) {
      navigate("/login", { state: { confirmMsg: "Invalid confirmation link." } });
      return;
    }
    fetch(`${API_URL}/auth/email/callback?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          navigate("/login", { state: { confirmMsg: data.message } });
        } else {
          navigate("/login", { state: { confirmMsg: data.message || "Confirmation failed." } });
        }
      })
      .catch(() => {
        navigate("/login", { state: { confirmMsg: "Confirmation failed." } });
      });
  }, [navigate, location.search]);

  return null;
}
