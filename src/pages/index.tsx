/**
 * v0 by Vercel.
 * @see https://v0.dev/t/U7MHY3lzP52
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ComponentProps {}

const Component: React.FC<ComponentProps> = () => {
  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <MountainIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your username and password to access the admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Enter your username" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" passHref>
                  <p className="text-sm font-medium text-primary hover:underline">Forgot password?</p>
                </Link>
              </div>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
          </CardContent>
          <CardFooter>
          <Link href='/Dashboard'> 
            <Button type="submit" className="w-full mx-20">
              Login
            </Button></Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

interface MountainIconProps {
  className?: string;
}

const MountainIcon: React.FC<MountainIconProps> = ({ className, ...props }) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
};

export default Component;
