import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { auth } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { setCookie, destroyCookie } from "nookies";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

interface ComponentProps {}

const Component: React.FC<ComponentProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/NewDashBoard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      setCookie(null, 'token', token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      router.push("/NewDashBoard");
    } catch (error) {
      console.error("Login error: ", error);
    }
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      setCookie(null, 'token', token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      router.push("/NewDashBoard");
    } catch (error) {
      console.error("Sign Up error: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      destroyCookie(null, 'token');
      router.push("/login");
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isLogin ? "Admin Dashboard" : "Create Account"}
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your Email and password to access the admin dashboard."
                : "Fill in the details to create a new account."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 pt-5 flex items-center text-lg leading-5 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              type="button"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={isLogin ? handleLogin : handleSignUp}
            >
              {isLogin ? "Login" : "Sign Up"}
            </Button>
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
