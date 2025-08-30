"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { Card, CardContent } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { MessageBox } from "../components/MessageBox";
import { requestResetPass } from "../api/auth_service";

  function validateEmail(em: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(em);
  }

export default function ResetPassPage() {

  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please fill in email");
      setSuccess(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format. Please enter a valid email address.");
      setSuccess(false);
      setTimeout(() => setError(null), 3000);
      return;
    }

  try {
      await requestResetPass(email);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/login");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Could not send reset email");
      setTimeout(() => setError(null), 3000);
    }
  }

  return (
    <div className="relative min-h-screen">
    <div className="absolute top-4 right-4 z-50 space-y-2">
      {error && <MessageBox type="error" message={error} show={!!error} />}
      {success && <MessageBox type="success" message="Check your email to change your password!" show={success} />}
    </div>
    <AuthLayout>
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center text-pink-600">Reset Password</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Please enter your email</label>
              <Input type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
           </div>
          <Button className="w-full" onClick={handleResetPassword}>
            Reset Password
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
    </div>
  );
}