"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { Card, CardContent } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Link } from "react-router-dom";
import { MessageBox } from "../components/MessageBox";

export default function LoginPage() {

  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  function validatePassword(pw: string): boolean {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pw);
  }

  // TODO
  const handleResetPassword = () => {

  }

  const handleLogin = () => {
    if (!username || !password) {
      setError("Please fill in both username and password.");
      setSuccess(false);
      setTimeout(() => setError(null), 3000);
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

    // Simulate successful login
    setError(null);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate("/");
    }, 2500);
  }

  return (
    <div className="relative min-h-screen">
    <div className="absolute top-4 right-4 z-50 space-y-2">
      {error && <MessageBox type="error" message={error} show={!!error} />}
      {success && <MessageBox type="success" message="Login successful! Redirecting..." show={success} />}
    </div>
    <AuthLayout>
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center text-pink-600">Welcome Back</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">username</label>
              <Input type="username" placeholder="example123" value={username} onChange={(e) => setUsername(e.target.value)}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
          </div>
          <Button className="w-full" onClick={handleLogin}>
            Log In
          </Button>
          <Button className="w-full" variant="outline" onClick={handleResetPassword}>
            Reset Password
          </Button>
          <p className="text-md text-center text-gray-500">
            Don’t have an account?{" "}
            <Link to="/register" className="ml-2 text-pink-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
    </div>
  );
}