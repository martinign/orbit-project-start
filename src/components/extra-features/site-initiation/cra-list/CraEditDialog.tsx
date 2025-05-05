
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CRAData } from '@/hooks/cra-list/types';

interface CraEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CRAData) => Promise<void>;
  initialData?: CRAData;
  isEditing: boolean;
}

const defaultCra: CRAData = {
  full_name: '',
  first_name: '',
  last_name: '',
  study_site: '',
  status: 'active',
  email: '',
  study_country: '',
  study_team_role: '',
  user_type: '',
  user_reference: '',
  project_id: ''
};

export const CraEditDialog: React.FC<CraEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing
}) => {
  const [formData, setFormData] = useState<CRAData>(initialData || defaultCra);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultCra);
    }
    setFormErrors({});
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    
    // If email is provided, validate format
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Auto-fill full name when first or last name changes
    if (name === 'first_name' || name === 'last_name') {
      const firstName = name === 'first_name' ? value : formData.first_name;
      const lastName = name === 'last_name' ? value : formData.last_name;
      
      if (firstName || lastName) {
        setFormData(prev => ({ 
          ...prev, 
          full_name: `${firstName} ${lastName}`.trim() 
        }));
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving CRA:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit CRA' : 'Add New CRA'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details for this CRA' 
              : 'Enter the details for the new CRA'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="first_name" className="text-right">
              First Name *
            </Label>
            <Input
              id="first_name"
              name="first_name"
              className="col-span-3"
              value={formData.first_name}
              onChange={handleInputChange}
            />
            {formErrors.first_name && (
              <p className="col-start-2 col-span-3 text-xs text-red-500">
                {formErrors.first_name}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="last_name" className="text-right">
              Last Name *
            </Label>
            <Input
              id="last_name"
              name="last_name"
              className="col-span-3"
              value={formData.last_name}
              onChange={handleInputChange}
            />
            {formErrors.last_name && (
              <p className="col-start-2 col-span-3 text-xs text-red-500">
                {formErrors.last_name}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              className="col-span-3"
              value={formData.email || ''}
              onChange={handleInputChange}
            />
            {formErrors.email && (
              <p className="col-start-2 col-span-3 text-xs text-red-500">
                {formErrors.email}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="study_site" className="text-right">
              Study Site
            </Label>
            <Input
              id="study_site"
              name="study_site"
              className="col-span-3"
              value={formData.study_site || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="study_country" className="text-right">
              Country
            </Label>
            <Input
              id="study_country"
              name="study_country"
              className="col-span-3"
              value={formData.study_country || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="study_team_role" className="text-right">
              Role
            </Label>
            <Input
              id="study_team_role"
              name="study_team_role"
              className="col-span-3"
              value={formData.study_team_role || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={formData.status || 'active'}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user_reference" className="text-right">
              Reference ID
            </Label>
            <Input
              id="user_reference"
              name="user_reference"
              className="col-span-3"
              value={formData.user_reference || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user_type" className="text-right">
              User Type
            </Label>
            <Select
              value={formData.user_type || ''}
              onValueChange={(value) => handleSelectChange('user_type', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Internal">Internal</SelectItem>
                <SelectItem value="External">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Add CRA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
