'use client'

import { useState } from "react";
import Link from "next/link";
import { Plus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "./ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AddToCrateModal } from "./AddToCrateModal";

interface NavigationProps {
    currentPage: string;
}

export function Navigation({ currentPage }: NavigationProps) {
    const [isAddToCrateOpen, setIsAddToCrateOpen] = useState(false);

    return (
        <>
            <div className="sticky top-0 z-100 flex w-full justify-between items-center py-4 px-6 border-b border-border bg-background">
                <img src="/Viettel_logo.png" alt="Viettel Logo" className="h-7 bg-center" />

                <NavigationMenu>
                    <NavigationMenuList className="gap-4">
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="/scan-station"
                                    className={`px-3 py-2 rounded-md transition-colors font-medium text-sm ${currentPage === "scan-station"
                                        ? "bg-destructive text-white hover:bg-destructive/90"
                                        : "text-foreground hover:text-destructive bg-transparent hover:bg-transparent"
                                        }`}
                                >
                                    Scan Station
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="/scan-history"
                                    className={`px-3 py-2 rounded-md transition-colors font-medium text-sm ${currentPage === "scan-history"
                                        ? "bg-destructive text-white hover:bg-destructive/90"
                                        : "text-foreground hover:text-destructive bg-transparent hover:bg-transparent"
                                        }`}
                                >
                                    Scan History
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="/crate-info"
                                    className={`px-3 py-2 rounded-md transition-colors font-medium text-sm ${currentPage === "crate-info"
                                        ? "bg-destructive text-white hover:bg-destructive/90"
                                        : "text-foreground hover:text-destructive bg-transparent hover:bg-transparent"
                                        }`}
                                >
                                    Crate Info
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-0 h-auto rounded-full hover:ring-2 hover:ring-accent transition-all cursor-pointer border-0 bg-transparent">
                                        <Avatar className="size-9">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>SC</AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-32 w-auto">
                                    <DropdownMenuItem asChild>
                                        <Link href="/login" className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10">
                                            <LogOut className="size-4" />
                                            Logout
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <AddToCrateModal
                open={isAddToCrateOpen}
                onClose={() => setIsAddToCrateOpen(false)}
                crateId="A-03"
            />
        </>
    );
}