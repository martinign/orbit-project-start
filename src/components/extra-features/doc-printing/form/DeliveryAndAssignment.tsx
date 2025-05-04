
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';
import { TeamMember } from '@/hooks/useTeamMembers';

interface DeliveryAndAssignmentProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
  teamMembers?: TeamMember[];
  isLoadingTeamMembers: boolean;
}

export const DeliveryAndAssignment: React.FC<DeliveryAndAssignmentProps> = ({ 
  form, 
  isSubmitting, 
  teamMembers, 
  isLoadingTeamMembers 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="doc_delivery_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Delivery Address</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || undefined}
              disabled={isSubmitting}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery address" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="EUDC">EUDC</SelectItem>
                <SelectItem value="NADC">NADC</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="doc_assigned_to"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned To</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || undefined}
              disabled={isSubmitting || isLoadingTeamMembers}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamMembers?.map((member) => (
                  <SelectItem key={member.id} value={member.user_id}>
                    {member.display_name || `${member.full_name} ${member.last_name || ''}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
