
  // Only modifying the createEvent mutation function
  const createEvent = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Use explicit field names with table prefixes to avoid ambiguity
      const { data: insertedData, error } = await supabase
        .from('project_events')
        .insert([{
          project_id: projectId,
          title: data.title,
          description: data.description || null,
          user_id: user.id,
          start_date: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
          end_date: selectedDate ? selectedDate.toISOString() : new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error("Error creating event:", error);
        throw error;
      }
      
      return insertedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_events', projectId] });
      toast({
        title: 'Event created',
        description: 'Your event has been created successfully.',
      });
      setIsEventDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error submitting form:", error);
      toast({
        title: 'Error',
        description: error.message || 'There was an error creating the event.',
        variant: 'destructive',
      });
    },
  });
