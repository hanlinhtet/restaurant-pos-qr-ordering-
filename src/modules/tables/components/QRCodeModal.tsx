"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function QRCodeModal({ table }: { table: any }) {
    const qrUrl = `${window.location.origin}/menu?tableId=${table.id}`;

    const downloadQR = () => {
        const canvas = document.getElementById(`qr-canvas-${table.id}`) as HTMLCanvasElement;
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `table-${table.number}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" /> Download QR
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Table {table.number} QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                    <QRCodeCanvas id={`qr-canvas-${table.id}`} value={qrUrl} size={256} />
                    <a 
                        href={qrUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Customer View
                    </a>
                    <p className="text-xs text-muted-foreground break-all">{qrUrl}</p>
                    <Button onClick={downloadQR} className="w-full">
                        Download PNG
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
