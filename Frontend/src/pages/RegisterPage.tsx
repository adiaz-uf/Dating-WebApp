"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import { Card, CardContent } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { MessageBox } from "../components/MessageBox";
import { registerUser } from "../api/auth_service";

export default function RegisterPage() {

  const navigate = useNavigate();

  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [new_password, setNewPassword] = useState<string>("");
  const [repeat_password, setRepeatPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  function validatePassword(pw: string): boolean {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pw);
  }

  function validateEmail(em: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(em);
  }

  const handleRegister = async () => {
    if (!email  || !new_password || !repeat_password || !first_name || !last_name || !username) {
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

    /* email validation - TODO: Commented while developing */
    /* if (!validateEmail(email)) {
      setError("Invalid email format. Please enter a valid email address.");
      setSuccess(false);
      setTimeout(() => setError(null), 3000);
      return;
    } */

    // send register POST
    try {
      await registerUser({ username, password: new_password,
        email, first_name, last_name,
      });

      setSuccess(true);
      setError(null);
      setTimeout(() => { setSuccess(false); navigate("/login"); }, 2000);

    } catch (err: any) {
      setError(err.message);
      setSuccess(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-50 space-y-2">
      {error && <MessageBox type="error" message={error} show={!!error} />}
      {success && <MessageBox type="success" message="Created account! You can Sign In now." show={success} />}
    </div>
    <AuthLayout>
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center text-pink-600">Create Account</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">Fisrt Name</label>
              <Input placeholder="John" value={first_name} onChange={(e) => setFirstName(e.target.value)}/>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">Last Name</label>
              <Input placeholder="Doe" value={last_name} onChange={(e) => setLastName(e.target.value)}/>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">Username</label>
              <Input placeholder="Johndoe123" value={username} onChange={(e) => setUsername(e.target.value)}/>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">New Password</label>
              <Input type="password" placeholder="••••••••" value={new_password} onChange={(e) => setNewPassword(e.target.value)}/>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">Repeat Password</label>
              <Input type="password" placeholder="••••••••" value={repeat_password} onChange={(e) => setRepeatPassword(e.target.value)}/>
            </div>
          </div>
          <Button className="w-full" onClick={handleRegister}>
            Sign Up
          </Button>
          <p className="text-md text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="ml-2 text-pink-600 hover:underline">
              Log In
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
    </div>
  );
}