//components/admin/selector.tsx
"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Save, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react";
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


interface ItemSelectorAndOrganizerProps {
    items: string;
    onItemSelectAction: (selectedExerciseIds: number[], orderIndices?: number[]) => void;
    selectedItemIds?: number[];
}
export default function ItemSelectorAndOrganizer({ items, onItemSelectAction, selectedItemIds }: ItemSelectorAndOrganizerProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [availableItems, setAvailableItems] = useState<Item[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [filterQuery, setFilterQuery] = useState("");
    const [itemList, setItemList] = useState<ItemDetail[]>([]);
    const [tempItem, setTempItem] = useState({
        itemId: 0,
    });
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            console.log("selectedItemsIds", selectedItemIds)
            setLoadingItems(true);
            try {
                const response = await fetch(`/api/${items}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("item data", data)
                    setAvailableItems(data);
                } else {
                    toast({
                        title: "Erreur",
                        description: "Impossible de charger les éléments",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Erreur lors du chargement des éléments:", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les éléments",
                    variant: "destructive",
                });
            } finally {
                setLoadingItems(false);
            }
        };

        fetchItems();
    }, [items]);

    useEffect(() => {
        if (selectedItemIds && selectedItemIds.length > 0 && availableItems.length > 0 && !isInitialized) {
            console.log("avaoilable items", availableItems)
            const selectedItems = availableItems.filter(item =>
                selectedItemIds.includes(item.id)
            ).map(item => ({
                itemId: item.id,
                itemName: item.name,
            }));

            setItemList(selectedItems);
            setIsInitialized(true);
            console.log("selectedItems", selectedItems)
        }
    }, [selectedItemIds, availableItems, isInitialized]);
    useEffect(() => {
        // Always update parent when itemList changes
        const selectedExerciseIds = itemList.map(item => item.itemId);
        const orderIndices = itemList.map((_, index) => index);
        onItemSelectAction(selectedExerciseIds, orderIndices);
    }, [itemList]);

    const openAddItemDialog = () => {
        setAddItemDialogOpen(true);
    };

    const handleItemSelection = (id: number) => {
        setTempItem((prev) => ({
            ...prev,
            itemId: id,
        }));
    };

    const addItemToList = () => {
        if (tempItem.itemId === 0) return;

        const selectedItem = availableItems.find((item) => item.id === tempItem.itemId);
        if (!selectedItem) return;

        setItemList((prev) => [
            ...prev,
            {
                itemId: tempItem.itemId,
                itemName: selectedItem.name,
            },
        ]);

        setTempItem({
            itemId: 0,
        });
        setAddItemDialogOpen(false);
    };

    const removeItemFromList = (itemIndex: number) => {
        setItemList((prev) => {
            const newList = [...prev];
            newList.splice(itemIndex, 1);
            return newList;
        });
    };

    const moveItem = (itemIndex: number, direction: "up" | "down") => {
        if (
            (direction === "up" && itemIndex === 0) ||
            (direction === "down" && itemIndex === itemList.length - 1)
        ) {
            return;
        }

        const newIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
        const newList = [...itemList];
        [newList[itemIndex], newList[newIndex]] = [newList[newIndex], newList[itemIndex]];

        setItemList(newList);
    };

    const filteredItems = availableItems.filter((item) =>
        item.name.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return (
        <div>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Ajouter des éléments à la liste</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button type="button" size="sm" onClick={openAddItemDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un élément
                        </Button>
                    </div>

                    {itemList.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Élément</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemList.map((item, itemIndex) => (
                                    <TableRow key={itemIndex}>
                                        <TableCell>{itemIndex + 1}</TableCell>
                                        <TableCell className="font-medium">{item.itemName}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => moveItem(itemIndex, "up")}
                                                    disabled={itemIndex === 0}
                                                >
                                                    <ArrowUp className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => moveItem(itemIndex, "down")}
                                                    disabled={itemIndex === itemList.length - 1}
                                                >
                                                    <ArrowDown className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive"
                                                    onClick={() => removeItemFromList(itemIndex)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>Aucun élément ajouté à la liste.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

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
                        <DialogTitle>Ajouter un élément</DialogTitle>
                        <DialogDescription>
                            Sélectionnez un élément à ajouter à la liste.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="item-search">Rechercher un élément</Label>
                                <Input
                                    id="item-search"
                                    placeholder="Rechercher par nom"
                                    value={filterQuery}
                                    onChange={(e) => setFilterQuery(e.target.value)}
                                />
                            </div>

                            <div className="border rounded-md max-h-[350px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nom</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingItems ? (
                                            <TableRow>
                                                <TableCell colSpan={1} className="text-center py-8">
                                                    Chargement des éléments...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={1} className="text-center py-8">
                                                    Aucun élément trouvé
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <TableRow
                                                    key={item.id}
                                                    className={`cursor-pointer ${tempItem.itemId === item.id ? 'bg-primary/10' : ''
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
                        <Button type="button" variant="outline" onClick={() => setAddItemDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            onClick={addItemToList}
                            disabled={tempItem.itemId === 0}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
