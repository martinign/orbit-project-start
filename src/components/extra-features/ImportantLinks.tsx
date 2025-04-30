
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link, ExternalLink, Plus, Trash2 } from "lucide-react";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export function ImportantLinks() {
  const { toast } = useToast();
  const [links, setLinks] = useState<LinkItem[]>(() => {
    const savedLinks = localStorage.getItem("important-links");
    return savedLinks ? JSON.parse(savedLinks) : [
      { id: crypto.randomUUID(), title: "Lovable Documentation", url: "https://docs.lovable.dev/" },
      { id: crypto.randomUUID(), title: "Supabase Documentation", url: "https://supabase.com/docs" }
    ];
  });
  
  const [newLink, setNewLink] = useState({ title: "", url: "" });

  const handleSaveLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and URL",
        variant: "destructive"
      });
      return;
    }

    // Basic URL validation
    if (!newLink.url.startsWith("http://") && !newLink.url.startsWith("https://")) {
      setNewLink(prev => ({ ...prev, url: `https://${prev.url}` }));
    }

    const updatedLinks = [...links, { id: crypto.randomUUID(), ...newLink }];
    setLinks(updatedLinks);
    localStorage.setItem("important-links", JSON.stringify(updatedLinks));
    
    // Reset form
    setNewLink({ title: "", url: "" });
    
    toast({
      title: "Link added",
      description: `${newLink.title} has been added to your links`
    });
  };

  const handleDeleteLink = (id: string) => {
    const updatedLinks = links.filter(link => link.id !== id);
    setLinks(updatedLinks);
    localStorage.setItem("important-links", JSON.stringify(updatedLinks));
    
    toast({
      title: "Link removed",
      description: "The link has been deleted"
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Link className="h-5 w-5 mr-2 text-blue-500" />
          Important Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-col space-y-2">
            <Input
              placeholder="Link Title"
              value={newLink.title}
              onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
            />
            <div className="flex space-x-2">
              <Input
                placeholder="URL (e.g., https://example.com)"
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                className="flex-grow"
              />
              <Button onClick={handleSaveLink} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {links.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No links added yet</p>
          ) : (
            links.map((link) => (
              <div 
                key={link.id} 
                className="flex items-center justify-between p-2 border rounded-md hover:bg-slate-50"
              >
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline overflow-hidden text-ellipsis"
                >
                  <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{link.title}</span>
                </a>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteLink(link.id)}
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
