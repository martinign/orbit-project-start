
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { PencilIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";

type WorkdayCode = {
  id: string;
  task: string;
  activity: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type FormData = {
  task: string;
  activity: string;
};

const WorkdayCodes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workdayCodes, setWorkdayCodes] = useState<WorkdayCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<WorkdayCode | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<WorkdayCode | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<FormData>({
    defaultValues: {
      task: "",
      activity: ""
    }
  });

  // Fetch all workday codes
  const fetchCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("workday_codes")
        .select("*")
        .order("task", { ascending: true });

      if (error) throw error;
      setWorkdayCodes(data || []);
    } catch (error) {
      console.error("Error fetching workday codes:", error);
      toast({
        title: "Error",
        description: "Failed to load workday codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const checkForDuplicate = (task: string, activity: string, id?: string): boolean => {
    const duplicate = workdayCodes.find(
      code => code.task.toLowerCase() === task.toLowerCase() && 
             code.activity.toLowerCase() === activity.toLowerCase() &&
             (id ? code.id !== id : true)
    );
    return !!duplicate;
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editing) {
        // Check for duplicates when updating
        if (checkForDuplicate(data.task, data.activity, editing.id)) {
          toast({
            title: "Duplicate Entry",
            description: "This task and activity combination already exists",
            variant: "destructive",
          });
          return;
        }

        // Update existing code
        const { error } = await supabase
          .from("workday_codes")
          .update({
            task: data.task,
            activity: data.activity,
          })
          .eq("id", editing.id);

        if (error) {
          if (error.code === "23505") {
            toast({
              title: "Duplicate Entry",
              description: "This task and activity combination already exists",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Success",
            description: "Workday code updated successfully",
          });
          fetchCodes();
          reset();
          setEditing(null);
        }
      } else {
        // Check for duplicates when creating
        if (checkForDuplicate(data.task, data.activity)) {
          toast({
            title: "Duplicate Entry",
            description: "This task and activity combination already exists",
            variant: "destructive",
          });
          return;
        }

        // Create new code
        const { error } = await supabase
          .from("workday_codes")
          .insert({
            task: data.task,
            activity: data.activity,
            user_id: user.id,
          });

        if (error) {
          if (error.code === "23505") {
            toast({
              title: "Duplicate Entry",
              description: "This task and activity combination already exists",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Success",
            description: "New workday code added successfully",
          });
          fetchCodes();
          reset();
        }
      }
    } catch (error: any) {
      console.error("Error saving workday code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save workday code",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (code: WorkdayCode) => {
    setEditing(code);
    setValue("task", code.task);
    setValue("activity", code.activity);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    reset();
  };

  const confirmDelete = (code: WorkdayCode) => {
    setCodeToDelete(code);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!codeToDelete) return;
    
    try {
      const { error } = await supabase
        .from("workday_codes")
        .delete()
        .eq("id", codeToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workday code deleted successfully",
      });
      
      fetchCodes();
    } catch (error: any) {
      console.error("Error deleting workday code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete workday code",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCodeToDelete(null);
    }
  };

  const isUserOwner = (code: WorkdayCode) => {
    return user && user.id === code.user_id;
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col justify-between md:flex-row md:items-center gap-4">
        <h1 className="text-2xl font-bold">Workday Codes</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Workday Code" : "Add New Workday Code"}</CardTitle>
            <CardDescription>
              Create task and activity combinations for workday time tracking
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task">Task</Label>
                <Input
                  id="task"
                  placeholder="Enter task name"
                  {...register("task", { required: "Task is required" })}
                />
                {errors.task && (
                  <p className="text-sm text-red-500">{errors.task.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Activity</Label>
                <Input
                  id="activity"
                  placeholder="Enter activity name"
                  {...register("activity", { required: "Activity is required" })}
                />
                {errors.activity && (
                  <p className="text-sm text-red-500">{errors.activity.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              {editing && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editing ? "Update Code" : "Add Code"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Workday Codes List</CardTitle>
              <CardDescription>
                View and manage all existing workday codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-10 text-center">Loading workday codes...</div>
              ) : workdayCodes.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No workday codes found. Add your first one!
                </div>
              ) : (
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableCaption>A list of all workday codes</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workdayCodes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell className="font-medium">{code.task}</TableCell>
                          <TableCell>{code.activity}</TableCell>
                          <TableCell className="flex gap-2">
                            {isUserOwner(code) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(code)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmDelete(code)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workday code. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkdayCodes;
