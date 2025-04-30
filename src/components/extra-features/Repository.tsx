
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FolderArchive, File, Download, Trash2, Search } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string; // "protocol" | "study" | "other"
  url: string;
  date: string;
}

export function Repository() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>(() => {
    const savedDocs = localStorage.getItem("repository-documents");
    return savedDocs ? JSON.parse(savedDocs) : [
      {
        id: crypto.randomUUID(),
        name: "Protocol Document",
        type: "protocol",
        url: "https://example.com/protocol.pdf",
        date: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: "Study Guidelines",
        type: "study",
        url: "https://example.com/guidelines.pdf",
        date: new Date().toISOString()
      }
    ];
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");

  const filteredDocuments = documents
    .filter(doc => {
      // Filter by search query
      if (searchQuery) {
        return doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .filter(doc => {
      // Filter by tab
      if (currentTab === "all") return true;
      return doc.type === currentTab;
    });

  const handleDelete = (id: string) => {
    setDocuments(currentDocs => currentDocs.filter(doc => doc.id !== id));
    localStorage.setItem("repository-documents", JSON.stringify(
      documents.filter(doc => doc.id !== id)
    ));
    
    toast({
      title: "Document removed",
      description: "The document has been deleted from the repository"
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <FolderArchive className="h-5 w-5 mr-2 text-green-600" />
          Document Repository
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute top-2.5 left-3 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setCurrentTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="protocol" className="flex-1">Protocols</TabsTrigger>
            <TabsTrigger value="study" className="flex-1">Study</TabsTrigger>
            <TabsTrigger value="other" className="flex-1">Other</TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab} className="mt-2">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No documents found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map(doc => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50"
                  >
                    <div className="flex items-start">
                      <File className="h-5 w-5 mr-3 text-blue-500 mt-1 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(doc.date)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
