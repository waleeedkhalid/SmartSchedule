/**
 * Manage Sections Page
 * 
 * Allows teaching load manager to assign instructors and rooms to sections.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { sectionsRepository } from "@/app/mobile/lib/repositories/sections.repository";
import { instructorsRepository } from "@/app/mobile/lib/repositories/instructors.repository";
import { roomsRepository } from "@/app/mobile/lib/repositories/rooms.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Edit2, Save, X } from "lucide-react";
import type { Section, Instructor, Room } from "@/app/mobile/lib/api/types";

export default function ManageSectionsPage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [sections, setSections] = useState<Section[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<string>("");
    const [selectedRoom, setSelectedRoom] = useState<string>("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            checkAuth();
        }
    }, [isAuthenticated, checkAuth]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/mobile/login");
            return;
        }

        if (user?.role !== "teaching_load") {
            router.push("/mobile/schedule");
            return;
        }

        loadData();
    }, [isAuthenticated, user, router]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sectionsData, instructorsData, roomsData] = await Promise.all([
                sectionsRepository.getSections(),
                instructorsRepository.getInstructors(),
                roomsRepository.getRooms()
            ]);
            setSections(sectionsData);
            setInstructors(instructorsData);
            setRooms(roomsData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (section: Section) => {
        setEditingSection(section.id);
        setSelectedInstructor(section.instructor_id || "unassigned");
        setSelectedRoom(section.room_code || "unassigned");
    };

    const cancelEditing = () => {
        setEditingSection(null);
        setSelectedInstructor("");
        setSelectedRoom("");
    };

    const saveSection = async (sectionId: string) => {
        setSaving(true);
        try {
            await sectionsRepository.updateSection(sectionId, {
                instructor_id: selectedInstructor === "unassigned" ? null : selectedInstructor,
                room_code: selectedRoom === "unassigned" ? null : selectedRoom
            });
            toast.success("Section updated successfully");
            setEditingSection(null);
            // Reload sections to reflect changes
            const updatedSections = await sectionsRepository.getSections();
            setSections(updatedSections);
        } catch (err) {
            toast.error("Failed to update section");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated || !user || user.role !== "teaching_load") {
        return null;
    }

    return (
        <div className="min-h-screen p-4 pb-20">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/mobile/teaching-load")}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle>Manage Sections</CardTitle>
                                <CardDescription>
                                    Assign instructors and rooms
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Sections List */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sections.map((section) => (
                            <Card key={section.id} className={editingSection === section.id ? "border-primary ring-1 ring-primary" : ""}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">
                                                {section.course_code} - Section {section.section_no}
                                            </CardTitle>
                                            <CardDescription>
                                                {section.section_type} • {section.meeting_pattern?.days?.join(", ") || "TBA"} {section.meeting_pattern?.start_time || section.meeting_pattern?.start || ""}
                                            </CardDescription>
                                        </div>
                                        {editingSection !== section.id && (
                                            <Button variant="ghost" size="sm" onClick={() => startEditing(section)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {editingSection === section.id ? (
                                        <div className="space-y-4 animate-in fade-in">
                                            <div className="space-y-2">
                                                <Label>Instructor</Label>
                                                <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select instructor" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                                        {instructors.map((instructor) => (
                                                            <SelectItem key={instructor.id} value={instructor.id}>
                                                                {instructor.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Room</Label>
                                                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select room" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                                        {rooms.map((room) => (
                                                            <SelectItem key={room.code} value={room.code}>
                                                                {room.code} ({room.type})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex gap-2 justify-end pt-2">
                                                <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                                <Button size="sm" onClick={() => saveSection(section.id)} disabled={saving}>
                                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Save
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Instructor</p>
                                                <p className="font-medium">{section.instructor?.name || "Unassigned"}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Room</p>
                                                <p className="font-medium">{section.room_code || "Unassigned"}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
