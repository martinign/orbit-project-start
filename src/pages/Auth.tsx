
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, MapPin, Phone } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    last_name: '',
    location: '',
    telephone: '',
    acceptedTerms: false,
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(loginData.email, loginData.password);
      // Successful login handled by auth state change in context
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!signupData.acceptedTerms) {
      toast({
        title: "Terms and Conditions",
        description: "You must accept the Terms and Conditions to continue",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await signUp(
        signupData.email, 
        signupData.password, 
        {
          full_name: signupData.full_name,
          last_name: signupData.last_name,
          location: signupData.location,
          telephone: signupData.telephone,
          acceptedTerms: signupData.acceptedTerms,
        }
      );
      // Clear form and switch to login tab on successful signup
      setSignupData({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        last_name: '',
        location: '',
        telephone: '',
        acceptedTerms: false,
      });
      document.getElementById('login-tab')?.click();
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger id="login-tab" value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Sign up for a new account</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignupSubmit}>
                <CardContent className="space-y-4">

                  <div className="space-y-2">
                    <Label htmlFor="signup-full-name">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-full-name" 
                        type="text" 
                        placeholder="John Doe" 
                        value={signupData.full_name}
                        onChange={(e) => setSignupData({...signupData, full_name: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-last-name">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-last-name" 
                        type="text" 
                        placeholder="John Doe" 
                        value={signupData.last_name}
                        onChange={(e) => setSignupData({...signupData, last_name: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                    
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-location" 
                        type="text" 
                        placeholder="City, Country" 
                        value={signupData.location}
                        onChange={(e) => setSignupData({...signupData, location: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-telephone">Telephone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-telephone" 
                        type="tel" 
                        placeholder="+1234567890" 
                        value={signupData.telephone}
                        onChange={(e) => setSignupData({...signupData, telephone: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-confirm-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="terms" 
                      checked={signupData.acceptedTerms}
                      onCheckedChange={(checked) => 
                        setSignupData({...signupData, acceptedTerms: checked === true})
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I accept the{" "}
                        <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-sm underline">Terms and Conditions</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Terms and Conditions</DialogTitle>
                              <DialogDescription>
                                Please review these terms carefully before using the experimental management tool.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="text-sm space-y-4 py-4">
                              <p>
                                These Terms and Conditions ("Terms") govern the use of the experimental management tool ("Tool") you access and use. 
                                The Tool is developed and provided on a non-commercial, volunteer basis. By using the Tool, you (including your employer 
                                or company, collectively "You") agree to the following terms, designed to protect the Developer from any claims or liability 
                                related to data or its use. If You do not agree, do not use the Tool.
                              </p>
                              
                              <div>
                                <h3 className="font-bold mb-2">1. Experimental, Unsupported Tool</h3>
                                <p><strong>Development Phase.</strong> The Tool is under active development, is unofficial, and may be unstable or incomplete.</p>
                                <p><strong>No Professional Support.</strong> No guarantees, support services, or SLAs are provided.</p>
                              </div>

                              <div>
                                <h3 className="font-bold mb-2">2. Data Ownership, Control & Risk</h3>
                                <p><strong>Your Data, Your Risk.</strong> You alone are responsible for all data, content, or information you upload, enter, process, 
                                or store ("Your Data"). You assume all risks and liabilities arising out of its use, accuracy, security, privacy, or compliance.</p>
                                <p><strong>No Data Liability.</strong> All responsibility or liability for loss, corruption, unauthorized access, 
                                or disclosure of Your Data is disclaimed.</p>
                              </div>

                              <div>
                                <h3 className="font-bold mb-2">3. No Warranties; "As Is"</h3>
                                <p>The Tool is provided "AS IS" and "AS AVAILABLE", without any warranties whatsoever, express or implied, including but not limited to:</p>
                                <p><strong>Accuracy or Reliability.</strong> No warranty that the Tool will function correctly or meet Your needs.</p>
                                <p><strong>Security or Privacy.</strong> No warranty that data will be protected against unauthorized access or breach.</p>
                                <p><strong>Fitness for Purpose.</strong> No warranty that the Tool is suitable for any particular purpose.</p>
                              </div>

                              <div>
                                <h3 className="font-bold mb-2">4. Limitation of Liability</h3>
                                <p>
                                  To the fullest extent permitted by law, in no event shall any party be liable for any direct, indirect, incidental, 
                                  special, consequential, or punitive damages, including but not limited to:
                                </p>
                                <ul className="list-disc pl-6">
                                  <li>Loss of profits, business, data, or goodwill;</li>
                                  <li>Business interruption or downtime;</li>
                                  <li>Any legal or regulatory fines or penalties;</li>
                                </ul>
                                <p>arising out of or related to Your use of—or inability to use—the Tool, even if advised of the possibility of such damages.</p>
                                <p>Total aggregate liability under these Terms for any cause whatsoever shall not exceed €100.</p>
                              </div>

                              <div>
                                <h3 className="font-bold mb-2">5. Waiver and Release of Claims</h3>
                                <p>
                                  By using the Tool, You (and Your company) hereby irrevocably waive, release, and discharge the Developer from any and all 
                                  claims, demands, actions, causes of action, suits, liabilities, damages, losses, costs, or expenses 
                                  (including attorney's fees) arising out of, related to, or connected with:
                                </p>
                                <ul className="list-disc pl-6">
                                  <li>Your use of the Tool or Your Data;</li>
                                  <li>Any errors, omissions, bugs, or failures of the Tool;</li>
                                  <li>Any data loss, corruption, or breach.</li>
                                </ul>
                              </div>
                            </div>
                            <Button onClick={() => {
                              setSignupData({...signupData, acceptedTerms: true});
                              setTermsDialogOpen(false);
                            }} className="ml-auto">Accept Terms</Button>
                          </DialogContent>
                        </Dialog>
                      </label>
                    </div>
                  </div>
                           
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
