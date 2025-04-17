
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactsList from "@/components/ContactsList";

const Contacts = () => {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Contacts</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Table</CardTitle>
          <CardDescription>
            Manage your contacts and network connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactsList />
        </CardContent>
      </Card>
    </div>
  );
};

export default Contacts;
