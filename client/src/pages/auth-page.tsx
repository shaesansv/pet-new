import { useState } from "react";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ForestAnimation from "@/components/forest-animation";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", confirmPassword: "" });

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/admin" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      return; // Handle password mismatch
    }
    registerMutation.mutate({
      username: registerData.username,
      password: registerData.password,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <ForestAnimation />
      
      {/* Left side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <Card className="w-full max-w-md forest-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif font-bold mb-2">
              🌲 PetShopForest Admin
            </CardTitle>
            <p className="text-muted-foreground">Access the admin dashboard</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginData.username}
                      onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                      required
                      disabled={loginMutation.isPending}
                      data-testid="input-login-username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={loginMutation.isPending}
                      data-testid="input-login-password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                      required
                      disabled={registerMutation.isPending}
                      data-testid="input-register-username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Choose a password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={registerMutation.isPending}
                      data-testid="input-register-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      disabled={registerMutation.isPending}
                      data-testid="input-register-confirm-password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerMutation.isPending || registerData.password !== registerData.confirmPassword}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Hero Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 relative z-10">
        <div className="text-center max-w-lg">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Manage Your <span className="text-accent">Forest</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Control your pet shop inventory, orders, and settings from the admin dashboard. 
            Keep track of your forest friends and help them find loving homes.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="forest-card p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📦 Product Management</h3>
              <p className="text-sm text-muted-foreground">Add and manage pets, food, and accessories</p>
            </div>
            <div className="forest-card p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📋 Order Tracking</h3>
              <p className="text-sm text-muted-foreground">Monitor and update order statuses</p>
            </div>
            <div className="forest-card p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🏷️ Categories</h3>
              <p className="text-sm text-muted-foreground">Organize products by categories</p>
            </div>
            <div className="forest-card p-4 rounded-lg">
              <h3 className="font-semibold mb-2">⚙️ Site Settings</h3>
              <p className="text-sm text-muted-foreground">Update store description and content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
