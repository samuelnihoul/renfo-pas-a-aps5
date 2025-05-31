"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash, X, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Item {
    id: number;
    name: string;
}

interface ItemDetail {
    itemId: number;
    itemName: string;
}

interface ItemGroup {
    groupNumber: number;
    name: string;
    items: ItemDetail[];
}

export default function ItemSelectorAndOrganizer({ items }: { items: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [availableItems, setAvailableItems] = useState<Item[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [currentGroupIndex, setCurrentGroupIndex] = useState<number | null>(null);
    const [filterQuery, setFilterQuery] = useState("");
    const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [groupError, setGroupError] = useState("");
    const [tempItem, setTempItem] = useState({
        itemId: 0,
    });

    useEffect(() => {
        const fetchItems = async () => {
            setLoadingItems(true);
            try {
                const response = await fetch(`/api/${items}`);
                if (response.ok) {
                    const data = await response.json();
                    setAvailableItems(data);
                } else {
                    toast({
                        title: "Error",
                        description: "Unable to load items",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Error fetching items:", error);
                toast({
                    title: "Error",
                    description: "Unable to load items",
                    variant: "destructive",
                });
            } finally {
                setLoadingItems(false);
            }
        };

        fetchItems();
    }, [items]);

    const addGroup = () => {
        if (!newGroupName.trim()) {
            setGroupError("Group name is required");
            return;
        }

        setItemGroups((prev) => [
            ...prev,
            {
                groupNumber: prev.length + 1,
                name: newGroupName,
                items: [],
            },
        ]);

        setNewGroupName("");
        setGroupError("");
    };

    const removeGroup = (groupNumber: number) => {
        setItemGroups((prev) => {
            const filtered = prev.filter((group) => group.groupNumber !== groupNumber);
            return filtered.map((group, index) => ({
                ...group,
                groupNumber: index + 1,
            }));
        });
    };

    const openAddItemDialog = (groupIndex: number) => {
        setCurrentGroupIndex(groupIndex);
        setAddItemDialogOpen(true);
    };

    const handleItemSelection = (id: number) => {
        setTempItem((prev) => ({
            ...prev,
            itemId: id,
        }));
    };

    const addItemToGroup = () => {
        if (currentGroupIndex === null || tempItem.itemId === 0) return;

        const selectedItem = availableItems.find((item) => item.id === tempItem.itemId);
        if (!selectedItem) return;

        setItemGroups((prev) => {
            const newGroups = [...prev];
            const group = newGroups[currentGroupIndex];

            if (group.items.some((item) => item.itemId === tempItem.itemId)) {
                return prev;
            }

            group.items.push({
                itemId: tempItem.itemId,
                itemName: selectedItem.name,
            });

            return newGroups;
        });

        setTempItem({
            itemId: 0,
        });
        setAddItemDialogOpen(false);
    };

    const removeItemFromGroup = (groupIndex: number, itemIndex: number) => {
        setItemGroups((prev) => {
            const newGroups = [...prev];
            newGroups[groupIndex].items.splice(itemIndex, 1);
            return newGroups;
        });
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const response = await fetch("/api/admin/groups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ groups: itemGroups }),
            });

            if (response.ok) {
                toast({
                    title: "Groups created",
                    description: "The groups have been created successfully",
                });
                router.push("/admin/groups");
            } else {
                const data = await response.json();
                toast({
                    title: "Error",
                    description: data.error || "An error occurred while creating the groups",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error creating groups:", error);
            toast({
                title: "Error",
                description: "An error occurred while creating the groups",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = availableItems.filter((item) =>
        item.name.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center mb-6">
                <Link href={`/admin/${items}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold ml-2">New Group</h1>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Add a Group</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="groupName" className={groupError ? "text-destructive" : ""}>
                            Group Name*
                        </Label>
                        <Input
                            id="groupName"
                            value={newGroupName}
                            onChange={(e) => {
                                setNewGroupName(e.target.value);
                                if (groupError) setGroupError("");
                            }}
                            placeholder="e.g., Group 1"
                            className={groupError ? "border-destructive" : ""}
                        />
                        {groupError && <p className="text-destructive text-sm">{groupError}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={addGroup} type="button">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Group
                    </Button>
                </CardFooter>
            </Card>

            {itemGroups.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Groups ({itemGroups.length})</h2>
                    {itemGroups.map((group, groupIndex) => (
                        <Card key={groupIndex}>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle>
                                    Group {group.groupNumber}: {group.name}
                                </CardTitle>
                                <Button
                                    variant="destructive"
                                    onClick={() => removeGroup(group.groupNumber)}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Remove Group
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Items ({group.items.length})</h3>
                                    <Button
                                        size="sm"
                                        onClick={() => openAddItemDialog(groupIndex)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </div>

                                {group.items.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>#</TableHead>
                                                <TableHead>Item</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.items.map((item, itemIndex) => (
                                                <TableRow key={itemIndex}>
                                                    <TableCell>{itemIndex + 1}</TableCell>
                                                    <TableCell className="font-medium">{item.itemName}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-destructive"
                                                            onClick={() => removeItemFromGroup(groupIndex, itemIndex)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <p>No items added to this group.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground mb-2">No groups added.</p>
                    <p className="text-sm text-muted-foreground mb-4">
                        Start by adding at least one group.
                    </p>
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || itemGroups.length === 0}
                >
                    {loading ? "Creating..." : "Create Groups"}
                </Button>
            </div>

            <Dialog
                open={addItemDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setTempItem({
                            itemId: 0,
                        });
                    }
                    setAddItemDialogOpen(open);
                }}
            >
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add an Item</DialogTitle>
                        <DialogDescription>
                            Select an item to add to the group.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="item-search">Search for an Item</Label>
                                <Input
                                    id="item-search"
                                    placeholder="Search by name"
                                    value={filterQuery}
                                    onChange={(e) => setFilterQuery(e.target.value)}
                                />
                            </div>

                            <div className="border rounded-md max-h-[350px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingItems ? (
                                            <TableRow>
                                                <TableCell colSpan={1} className="text-center py-8">
                                                    Loading items...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={1} className="text-center py-8">
                                                    No items found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <TableRow
                                                    key={item.id}
                                                    className={`cursor-pointer ${
                                                        tempItem.itemId === item.id ? 'bg-primary/10' : ''
                                                    }`}
                                                    onClick={() => handleItemSelection(item.id)}
                                                >
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={addItemToGroup}
                            disabled={tempItem.itemId === 0}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
