"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { addProviderPayment } from "@/app/(dashboard)/dashboard/directory/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Campaign {
    id: string;
    title: string;
    brand_name: string;
}

interface AddPaymentDialogProps {
    providerId: string;
    providerName: string;
    campaigns: Campaign[];
}

export function AddPaymentDialog({ providerId, providerName, campaigns }: AddPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
    const [campaignId, setCampaignId] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            toast.error("El monto debe ser mayor a 0");
            return;
        }
        if (!description.trim()) {
            toast.error("La descripción es obligatoria");
            return;
        }

        setIsLoading(true);
        const result = await addProviderPayment({
            provider_id: providerId,
            campaign_id: campaignId && campaignId !== "__none" ? campaignId : undefined,
            amount: Number(amount),
            description: description.trim(),
            payment_date: paymentDate,
        });

        if (result.error) {
            toast.error("Error al registrar pago", { description: result.error });
        } else {
            toast.success("Pago registrado exitosamente", {
                description: `$${Number(amount).toLocaleString()} a ${providerName}`,
            });
            setOpen(false);
            setAmount("");
            setDescription("");
            setCampaignId("");
            setPaymentDate(new Date().toISOString().split("T")[0]);
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm" className="gap-1.5 text-xs">
                    <CreditCard className="h-3.5 w-3.5" />
                    Registrar Pago
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Registrar Pago
                    </DialogTitle>
                    <DialogDescription>
                        Pago a <strong>{providerName}</strong>. Se descontará automáticamente de tu beneficio neto.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="payment-amount">Monto ($) *</Label>
                        <Input
                            id="payment-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="150.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="payment-desc">Descripción *</Label>
                        <Input
                            id="payment-desc"
                            placeholder="Ej: Sesión de fotos"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="payment-date">Fecha</Label>
                        <Input
                            id="payment-date"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Campaign (Optional) */}
                    <div className="space-y-2">
                        <Label>Campaña (Opcional)</Label>
                        <Select value={campaignId} onValueChange={setCampaignId} disabled={isLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sin campaña vinculada" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none">Sin campaña vinculada</SelectItem>
                                {campaigns.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.title} — {c.brand_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="gap-2">
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isLoading ? "Registrando..." : "Registrar Pago"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
