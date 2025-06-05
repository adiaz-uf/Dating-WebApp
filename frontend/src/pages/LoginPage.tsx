"use client";

import AuthLayout from "../layouts/AuthLayout";
import { Card, CardContent } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <AuthLayout>
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center text-pink-600">Welcome Back</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" placeholder="you@example.com" className="focus:ring-pink-500 focus:border-pink-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input type="password" placeholder="••••••••" className="focus:ring-pink-500 focus:border-pink-500" />
            </div>
          </div>
          <Button className="w-full">
            Log In
          </Button>
          <p className="text-sm text-center text-gray-500">
            Don’t have an account?{" "}
            <Link to="/register" className="text-pink-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}