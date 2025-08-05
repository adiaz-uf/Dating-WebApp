"use client";

import { useState } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { Card, CardContent } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { MessageBox } from "../components/MessageBox";
import { resetPass } from "../api/auth_service";

export default function NewPassPage() {

  const navigate = useNavigate();

  const [new_password, setNewPassword] = useState<string>("");
  const [repeat_password, setRepeatPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  function validatePassword(pw: string): boolean {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pw);
  }


  const handleResetPassword = async () => {
    if (!new_password || !repeat_password) {
      setError("Please fill all fields.");
      setSuccess(false);
      setTimeout(() => setError(null), 4000);
      return;
    }

    if (new_password !== repeat_password) {
      setError("Passwords must be the same.");
      setSuccess(false);
      setTimeout(() => setError(null), 4000);
      return;
    }

    /* Password validation - TODO: Commented while developing */
    /* if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      setSuccess(false);
      setTimeout(() => setError(null), 3000);
      return;
    } */

    try {
      await resetPass({
        token: token || "",
        new_password: new_password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Could not update password");
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-50 space-y-2">
      {error && <MessageBox type="error" message={error} show={!!error} />}
      {success && <MessageBox type="success" message="Updated Password! You can Sign In now." show={success} />}
    </div>
    <AuthLayout>
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center text-pink-600">Create new password</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <Input type="password" placeholder="••••••••" value={new_password} onChange={(e) => setNewPassword(e.target.value)}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Password</label>
              <Input type="password" placeholder="••••••••" value={repeat_password} onChange={(e) => setRepeatPassword(e.target.value)}/>
            </div>
          </div>
          <Button className="w-full" onClick={handleResetPassword}>
            Update Pasword
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
    </div>
  );
}