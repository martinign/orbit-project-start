
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, MapPin, Phone, Briefcase } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  // Use useEffect for navigation to avoid rendering issues
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
    job_title: '',
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
          job_title: signupData.job_title.toUpperCase(), // Ensure job title is uppercase
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
        job_title: '',
        acceptedTerms: false,
      });
      document.getElementById('login-tab')?.click();
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already logged in, don't render the form
  if (user) {
    return null;
  }

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
                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
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
                        placeholder="John" 
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
                        placeholder="Doe" 
                        value={signupData.last_name}
                        onChange={(e) => setSignupData({...signupData, last_name: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-job-title">Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-job-title" 
                        type="text" 
                        placeholder="PROJECT MANAGER" 
                        value={signupData.job_title}
                        onChange={(e) => setSignupData({...signupData, job_title: e.target.value})}
                        className="pl-10 uppercase"
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
                                These Terms and Conditions (“Terms”) govern Your access to and use of the experimental management tool (“Tool”) 
                                offered by the Developer. <strong>The Tool was conceived, designed, and implemented solely by the Developer 
                                in their personal capacity, using only their own time and resources, and without reference to, use of, or reliance 
                                upon any proprietary materials, software, data, or intellectual property of PAREXEL. It is neither endorsed 
                                by nor affiliated with PAREXEL in any manner.</strong> You (including, as applicable, Your employer or affiliated 
                                entities, collectively “You”) agree that by accessing or using the Tool, You accept and agree to be bound by 
                                these Terms. If You do not agree with any provision hereof, You must immediately cease all use of the Tool.
                              </p>
                            
                              <div>
                                <h3 className="font-bold mb-2">1. Definitions</h3>
                                <p>
                                  <strong>“Developer”</strong> means the individual who created the Tool. <br/>
                                  <strong>“Documentation”</strong> means any user guides, instructions, or FAQs provided with the Tool. <br/>
                                  <strong>“Confidential Information”</strong> means any non-public information disclosed by one party to the other 
                                  in connection with the Tool. <br/>
                                  <strong>“Third-Party Services”</strong> means any services, APIs, libraries, or software not provided by the Developer.
                                </p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">2. Experimental Nature; No Support</h3>
                                <p><strong>2.1 Development Phase.</strong> The Tool remains under active, unpaid development and may contain 
                                defects, incomplete features, or inaccuracies. Its functionality and availability are neither guaranteed nor 
                                warranted.</p>
                                <p><strong>2.2 No Service Level.</strong> There is no promise of uptime, error correction, maintenance, upgrades, 
                                or technical support. The Developer may modify or withdraw the Tool or any feature thereof at any time, for 
                                any reason, without notice or liability.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">3. License Grant; Restrictions</h3>
                                <p><strong>3.1 License.</strong> Subject to Your compliance with these Terms, the Developer grants You a 
                                limited, non-exclusive, non-transferable, revocable license to use the Tool solely for Your internal, 
                                non-commercial purposes.</p>
                                <p><strong>3.2 Restrictions.</strong> You shall not (a) sublicense, rent, lease, sell, distribute, or 
                                otherwise transfer the Tool; (b) reverse-engineer, decompile, disassemble, or attempt to discover any 
                                source code; (c) remove or alter any proprietary notices or labels; (d) use the Tool to develop a competing 
                                product; or (e) incorporate the Tool into any system or product offered to third parties.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">4. Intellectual Property</h3>
                                <p>All title, ownership rights, and intellectual property rights in and to the Tool, Documentation, and any 
                                derivative works are and will remain with the Developer. No rights are granted to You except as expressly set 
                                forth herein.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">5. Data Ownership, Control & Risk</h3>
                                <p><strong>5.1 Your Data.</strong> You alone are responsible for all data, content, or information that You 
                                upload, enter, process, or store (“Your Data”). You represent and warrant that You have all rights, consents, 
                                and permissions necessary to use and process Your Data in connection with the Tool.</p>
                                <p><strong>5.2 Risk Allocation.</strong> You assume all risks and liabilities arising out of or relating to the 
                                collection, storage, processing, transmission, display, accuracy, completeness, privacy, or legality of Your Data.</p>
                                <p><strong>5.3 No Liability.</strong> The Developer disclaims any and all liability for loss, corruption, 
                                unauthorized access, or disclosure of Your Data, whether in contract, tort (including negligence), strict liability, 
                                or otherwise.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">6. No Warranties; “As Is”</h3>
                                <p>The Tool is provided “AS IS” and “AS AVAILABLE” without warranty of any kind. The Developer expressly 
                                disclaims all warranties, whether express, implied, statutory, or otherwise, including but not limited to:</p>
                                <ul className="list-disc pl-6">
                                  <li><strong>Accuracy, Reliability, or Correctness:</strong> No guarantee that output or results will be accurate.</li>
                                  <li><strong>Fitness for a Particular Purpose:</strong> No warranty that the Tool meets Your specific needs.</li>
                                  <li><strong>Non-Infringement:</strong> No warranty that use will not infringe any third-party rights.</li>
                                  <li><strong>Security or Availability:</strong> No assurance that the Tool is free from vulnerabilities or interruptions.</li>
                                </ul>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">7. Limitation of Liability</h3>
                                <p>To the maximum extent permitted by applicable law, neither the Developer nor any of its licensors or 
                                contributors shall be liable for any indirect, incidental, special, consequential, exemplary, or punitive 
                                damages whatsoever, including but not limited to:</p>
                                <ul className="list-disc pl-6">
                                  <li>Loss of profits, business, revenue, data, or goodwill;</li>
                                  <li>Business interruption or downtime;</li>
                                  <li>Legal or regulatory fines, penalties, or costs;</li>
                                  <li>Any other losses arising out of or related to Your use of or inability to use the Tool.</li>
                                </ul>
                                <p>In no event shall the aggregate liability of the Developer for all claims under these Terms exceed €100 or the 
                                total amount You have paid (if any), whichever is lower.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">8. Indemnification</h3>
                                <p>You agree to defend, indemnify, and hold harmless the Developer and its affiliates, licensors, and 
                                contributors from and against any and all claims, liabilities, damages, losses, costs, and expenses (including 
                                reasonable attorneys’ fees and costs) arising out of or in any way connected with (a) Your use of the Tool; 
                                (b) Your breach of these Terms; or (c) Your violation of any law or third-party right.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">9. Confidentiality</h3>
                                <p>Each party agrees to keep confidential all Confidential Information disclosed by the other party and not to 
                                use such information except as necessary to exercise its rights or perform its obligations hereunder. This 
                                obligation shall survive termination of these Terms.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">10. Termination</h3>
                                <p>These Terms are effective until terminated. The Developer may terminate or suspend Your license at any time, 
                                with or without cause or notice. Upon termination, You must immediately cease all use of the Tool and destroy 
                                all copies in Your possession.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">11. Modifications to Terms</h3>
                                <p>The Developer reserves the right to modify these Terms at any time. Changes will be effective upon posting 
                                revised Terms to the distribution site. Your continued use of the Tool after such posting constitutes Your 
                                acceptance of the modified Terms.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">12. Governing Law & Dispute Resolution</h3>
                                <p>These Terms shall be governed by and construed in accordance with the laws of the Developer’s place of 
                                residence, without regard to its conflict-of-laws principles. Any dispute arising under or in connection with 
                                these Terms shall be subject to the exclusive jurisdiction of the competent courts of that jurisdiction.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">13. Severability</h3>
                                <p>If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and 
                                the remaining provisions shall remain in full force and effect.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">14. Entire Agreement</h3>
                                <p>These Terms constitute the entire agreement between You and the Developer regarding the Tool and supersede 
                                all prior or contemporaneous understandings or agreements, written or oral, regarding the subject matter hereof.</p>
                              </div>
                            
                              <div>
                                <h3 className="font-bold mb-2">15. Force Majeure</h3>
                                <p>Neither party shall be liable for any delay or failure to perform its obligations hereunder where such delay 
                                or failure results from any cause beyond reasonable control, including but not limited to acts of God, war, 
                                terrorism, strikes, civil unrest, or governmental action.</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
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
