"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchCustomerEvents, createCustomerEvent } from "@/store/band/marketplace-slice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Calendar as CalendarIcon, MapPin, Users, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerEventsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { myEvents, loading } = useSelector((state: RootState) => state.marketplace);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    event_type: "Festival",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    guest_count: 0,
    budget: 0,
  });

  useEffect(() => {
    dispatch(fetchCustomerEvents());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createCustomerEvent({
      ...formData,
      guest_count: Number(formData.guest_count),
      budget: Number(formData.budget),
    }));
    setIsOpen(false);
    setFormData({
      title: "",
      event_type: "Festival",
      date: "",
      start_time: "",
      end_time: "",
      location: "",
      guest_count: 0,
      budget: 0,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Events</h2>
          <p className="text-muted-foreground">
            Manage your umbrella events and multi-provider bookings.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Hyderabad Sunsets Live Fest" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Input id="type" required value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})} placeholder="e.g. Festival, Corporate, Wedding" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" min={new Date().toISOString().split("T")[0]} required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="City or Venue Name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start">Start Time</Label>
                    <Input id="start" type="time" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end">End Time</Label>
                    <Input id="end" type="time" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="guests">Guest Count</Label>
                    <Input id="guests" type="number" required value={formData.guest_count || ""} onChange={e => setFormData({...formData, guest_count: Number(e.target.value)})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="budget">Total Budget (₹)</Label>
                    <Input id="budget" type="number" required value={formData.budget || ""} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="pt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      ) : (myEvents || []).length === 0 ? (
        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <CalendarIcon className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No events created</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven&apos;t created any events yet. Create an event to start booking venues, artists, and bands.
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myEvents.map((event) => (
            <Card key={event.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{event.event_type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {new Date(event.date).toLocaleDateString()} ({event.start_time} - {event.end_time})
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {event.guest_count} Guests
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" />
                    ₹{event.budget.toLocaleString('en-IN')} Budget
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
