
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound, Plus } from "lucide-react";
import { TeamMembersList } from "@/components/TeamMembersList";

const TeamMembers = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Team Member</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Team Members</CardTitle>
          <CardDescription>
            View and manage your organization's team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* This component would be implemented separately if needed */}
          <div className="text-center p-8 text-muted-foreground">
            <UserRound className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <h3 className="text-lg font-medium">No team members yet</h3>
            <p className="mb-4">Add team members to collaborate on projects</p>
            <Button className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              <span>Add Team Member</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamMembers;
