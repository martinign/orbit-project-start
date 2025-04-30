
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Plus, Trash2 } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export function SiteInitiationTracker() {
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const savedItems = localStorage.getItem("site-initiation-items");
    return savedItems ? JSON.parse(savedItems) : [
      { id: crypto.randomUUID(), title: "Regulatory Documents", completed: false },
      { id: crypto.randomUUID(), title: "Site Training", completed: false },
      { id: crypto.randomUUID(), title: "System Access", completed: false },
      { id: crypto.randomUUID(), title: "Protocol Review", completed: false },
    ];
  });
  
  const [newItem, setNewItem] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (items.length === 0) {
      setProgress(0);
    } else {
      const completedCount = items.filter(item => item.completed).length;
      const newProgress = Math.round((completedCount / items.length) * 100);
      setProgress(newProgress);
    }
    
    localStorage.setItem("site-initiation-items", JSON.stringify(items));
  }, [items]);

  const handleAddItem = () => {
    if (!newItem.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a task description",
        variant: "destructive"
      });
      return;
    }

    const updatedItems = [
      ...items,
      { id: crypto.randomUUID(), title: newItem.trim(), completed: false }
    ];
    
    setItems(updatedItems);
    setNewItem("");
    
    toast({
      title: "Item added",
      description: `"${newItem}" has been added to the tracker`
    });
  };

  const handleToggleItem = (id: string) => {
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
    
    toast({
      title: "Item removed",
      description: "The item has been deleted from the tracker"
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <ClipboardList className="h-5 w-5 mr-2 text-orange-500" />
          Site Initiation Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="w-full flex items-center gap-2">
            <Progress value={progress} className="h-2" />
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Add new item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItem.trim()) {
                  handleAddItem();
                }
              }}
            />
            <Button onClick={handleAddItem} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No items added yet</p>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-2 border rounded-md hover:bg-slate-50"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`check-${item.id}`}
                    checked={item.completed}
                    onCheckedChange={() => handleToggleItem(item.id)}
                  />
                  <Label 
                    htmlFor={`check-${item.id}`}
                    className={`cursor-pointer ${item.completed ? 'line-through text-gray-500' : ''}`}
                  >
                    {item.title}
                  </Label>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
