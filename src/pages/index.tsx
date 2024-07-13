import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

interface ComponentProps {}

const Component: React.FC<ComponentProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleLogin = () => {
    // Perform login action (replace with actual login logic)
    console.log("Perform login action");

    // Redirect to Dashboard page
    router.push("/NewDashBoard");
  };

  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          {/* MountainIcon component */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isLogin ? "Admin Dashboard" : "Create Account"}
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your username and password to access the admin dashboard."
                : "Fill in the details to create a new account."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Enter your email" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Enter your username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/NewDashBoard">
              <Button
                type="button"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleLogin}
              >
                {isLogin ? "Login" : "Sign Up"}
              </Button>
            </Link>
            <p className="text-center text-sm text-muted">
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <span
                    onClick={() => setIsLogin(false)}
                    className="text-primary cursor-pointer hover:underline"
                  >
                    Sign Up
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => setIsLogin(true)}
                    className="text-primary cursor-pointer hover:underline"
                  >
                    Login
                  </span>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Component;
