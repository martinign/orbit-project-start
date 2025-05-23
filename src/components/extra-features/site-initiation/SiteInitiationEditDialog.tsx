
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { SiteData, useSiteInitiationData, isEligibleForStarterPack } from '@/hooks/useSiteInitiationData';
import { AlertCircle } from 'lucide-react';

interface SiteInitiationEditDialogProps {
  site: SiteData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onSuccess?: () => void;
}

export const SiteInitiationEditDialog: React.FC<SiteInitiationEditDialogProps> = ({
  site,
  open,
  onOpenChange,
  projectId,
  onSuccess
}) => {
  const { updateSite } = useSiteInitiationData(projectId);
  
  const form = useForm<SiteData>({
    defaultValues: {
      ...site,
      starter_pack: site.starter_pack || false
    }
  });

  // Watch for changes in the role field to update starter pack availability
  const currentRole = form.watch('role');
  const isStarterPackEligible = currentRole === 'LABP';
  
  // Update the form when role changes
  useEffect(() => {
    if (!isStarterPackEligible) {
      form.setValue('starter_pack', false);
    }
  }, [currentRole, form]);

  const onSubmit = async (data: SiteData) => {
    if (!site.id) return;
    
    // Ensure starter pack is only set when role is LABP
    if (!isEligibleForStarterPack(data)) {
      data.starter_pack = false;
    }
    
    const success = await updateSite(site.id, data);
    if (success) {
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Site Information</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pxl_site_reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PXL Site Reference</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="site_personnel_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Personnel Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pi_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PI Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="site_personnel_email_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="site_personnel_telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telephone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="site_personnel_fax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fax</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city_town"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City/Town</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="province_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province/State</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="starter_pack"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-2 space-y-0 pt-6">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                          disabled={!isStarterPackEligible}
                        />
                        {!isStarterPackEligible && (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </FormControl>
                    <div>
                      <FormLabel className="font-normal">Starter Pack Sent</FormLabel>
                      {!isStarterPackEligible && (
                        <FormDescription className="text-xs text-amber-600">
                          Only LABP roles are eligible for starter packs
                        </FormDescription>
                      )}
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
