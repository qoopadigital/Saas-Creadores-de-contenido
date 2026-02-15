"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import {
    updateCampaign,
    getCampaignExpenses,
    createCampaignExpense,
    deleteCampaignExpense
} from "@/app/(dashboard)/dashboard/campaigns/actions";
import { ColorTagsInput } from "@/components/ui/color-tags-input";
import type { CampaignData } from "./card";
import type { Expense } from "@/types/database.types";

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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";


// ---- Schema ----
const formSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    brand_name: z.string().min(2, "La marca debe tener al menos 2 caracteres"),
    budget: z.string().min(1, "El presupuesto es requerido"),
    deadline: z.string().min(1, "La fecha límite es requerida"),
    tags: z.array(z.string()).optional(),
    // Financials
    payment_status: z.enum(["pending", "invoiced", "paid", "overdue"]).optional(),
    has_invoice: z.boolean().default(false).optional(),
    invoice_date: z.string().optional(),
    invoice_number: z.string().optional(),
    payment_method: z.string().optional(),
    actual_hours: z.string().optional(),
}).superRefine((data, ctx) => {
    // Logic for 'Invoiced' - Mandatory Invoice
    if (data.payment_status === "invoiced") {
        if (!data.invoice_date) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La fecha es obligatoria", path: ["invoice_date"] });
        if (!data.invoice_number) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El número es obligatorio", path: ["invoice_number"] });
    }
    // Logic for 'Paid' - Conditional Invoice
    if (data.payment_status === "paid") {
        if (data.has_invoice) {
            if (!data.invoice_date) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La fecha es obligatoria", path: ["invoice_date"] });
            if (!data.invoice_number) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El número es obligatorio", path: ["invoice_number"] });
        }
    }
});

type FormValues = z.infer<typeof formSchema>;

interface EditCampaignDialogProps {
    campaign: CampaignData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditCampaignDialog({
    campaign,
    open,
    onOpenChange,
}: EditCampaignDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [expensesLoading, setExpensesLoading] = useState(false);

    // New Expense State
    const [newExpenseDesc, setNewExpenseDesc] = useState("");
    const [newExpenseAmount, setNewExpenseAmount] = useState("");
    const [newExpenseCategory, setNewExpenseCategory] = useState("other");

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: campaign.title,
            brand_name: campaign.brand_name,
            budget: String(campaign.budget),
            deadline: campaign.deadline
                ? new Date(campaign.deadline).toISOString().split("T")[0]
                : "",
            tags: campaign.tags || [],
            payment_status: (campaign.payment_status as any) || "pending",
            has_invoice: !!campaign.invoice_number, // User Goal: "Inicialización: true solo si YA tiene un invoice_number"
            invoice_date: campaign.invoice_date || "",
            invoice_number: campaign.invoice_number || "",
            payment_method: campaign.payment_method || "",
            actual_hours: campaign.actual_hours ? String(campaign.actual_hours) : "",
        },
    });

    // Load Expenses on Open
    useEffect(() => {
        if (open) {
            loadExpenses();
        }
    }, [open, campaign.id]);

    async function loadExpenses() {
        setExpensesLoading(true);
        const data = await getCampaignExpenses(campaign.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setExpenses(data as any[]);
        setExpensesLoading(false);
    }

    // Calculations
    const currentBudget = Number(watch("budget") || 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = currentBudget - totalExpenses;
    const isProfitPositive = netProfit >= 0;

    async function onSubmit(data: FormValues) {
        // Check for unsaved expense data
        if (newExpenseDesc || newExpenseAmount) {
            toast.warning("Tienes un gasto pendiente de añadir", {
                description: "Dale al botón (+) o borra los campos para continuar.",
            });
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("id", campaign.id);
        formData.append("title", data.title);
        formData.append("brand_name", data.brand_name);
        formData.append("budget", data.budget);
        formData.append("deadline", data.deadline);
        formData.append("status", campaign.status);
        formData.append("tags", JSON.stringify(data.tags || []));

        // Financials
        formData.append("payment_status", data.payment_status || "pending");
        formData.append("actual_hours", data.actual_hours || "");

        // Only send invoice data if status requires it ("invoiced") OR if "paid" with explicit "has_invoice" checked
        // Note: For 'overdue' we generally assume it was invoiced, so let's include it there too if data exists.
        const shouldSendInvoiceData =
            data.payment_status === "invoiced" ||
            data.payment_status === "overdue" ||
            (data.payment_status === "paid" && data.has_invoice);

        if (shouldSendInvoiceData) {
            if (data.invoice_date) formData.append("invoice_date", data.invoice_date);
            if (data.invoice_number) formData.append("invoice_number", data.invoice_number);
        }

        if (data.payment_status === "paid" && data.payment_method) {
            formData.append("payment_method", data.payment_method);
        }

        const result = await updateCampaign(formData);

        if (result?.error) {
            toast.error("Error al actualizar la campaña", {
                description: result.error,
            });
        } else {
            toast.success("Campaña actualizada exitosamente");
            onOpenChange(false);
        }

        setIsLoading(false);
    }

    async function handleAddExpense() {
        if (!newExpenseDesc || !newExpenseAmount) return;

        const result = await createCampaignExpense(
            campaign.id,
            newExpenseDesc,
            Number(newExpenseAmount),
            newExpenseCategory
        );

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Gasto añadido");
            setNewExpenseDesc("");
            setNewExpenseAmount("");
            loadExpenses(); // Refresh list
        }
    }

    async function handleDeleteExpense(id: string) {
        if (!confirm("¿Eliminar este gasto?")) return;

        const result = await deleteCampaignExpense(id);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Gasto eliminado");
            loadExpenses();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gestionar Campaña</DialogTitle>
                    <DialogDescription>
                        Edita detalles y gestiona las finanzas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="details">Detalles</TabsTrigger>
                            <TabsTrigger value="finance">Finanzas</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Título</Label>
                                <Input id="edit-title" disabled={isLoading} {...register("title")} />
                                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                            </div>

                            {/* Brand & Budget Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-brand">Marca</Label>
                                    <Input id="edit-brand" disabled={isLoading} {...register("brand_name")} />
                                    {errors.brand_name && <p className="text-sm text-destructive">{errors.brand_name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-budget">Presupuesto ($)</Label>
                                    <Input id="edit-budget" type="number" disabled={isLoading} {...register("budget")} />
                                    {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
                                </div>
                            </div>

                            {/* Deadline */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-deadline">Fecha Límite</Label>
                                <Input id="edit-deadline" type="date" disabled={isLoading} {...register("deadline")} />
                                {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label>Etiquetas</Label>
                                <Controller
                                    control={control}
                                    name="tags"
                                    render={({ field }) => (
                                        <ColorTagsInput value={field.value} onChange={field.onChange} />
                                    )}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="finance" className="space-y-6">
                            {/* A. Payment Status & Method (Always Visible / Level 1) */}
                            <div className="space-y-4">
                                <Card className="bg-background border-none shadow-none p-0">
                                    <div className="grid gap-4">
                                        {/* Payment Status */}
                                        <div className="space-y-2">
                                            <Label>Estado del Pago</Label>
                                            <Controller
                                                control={control}
                                                name="payment_status"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            // Reset Invoice Data if moving from Paid to Pending/Negotiation
                                                            if (val === "pending" || val === "negotiation") {
                                                                setValue("has_invoice", false);
                                                                setValue("invoice_number", "");
                                                                setValue("invoice_date", "");
                                                                setValue("payment_method", "");
                                                            }
                                                        }}
                                                        defaultValue={field.value}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Estado" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pendiente</SelectItem>
                                                            <SelectItem value="invoiced">Facturado</SelectItem>
                                                            <SelectItem value="paid">Pagado</SelectItem>
                                                            <SelectItem value="overdue">Vencido</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>

                                        {/* PAID Flow: Level 1 (Method & Switch) */}
                                        {watch("payment_status") === "paid" && (
                                            <div className="grid gap-4 p-4 border rounded-lg bg-muted/20 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 gap-1 h-6">
                                                        <TrendingUp className="w-3 h-3" /> Ciclo completado
                                                    </Badge>
                                                </div>

                                                {/* Payment Method */}
                                                <div className="space-y-2">
                                                    <Label>Método de Pago</Label>
                                                    <Controller
                                                        control={control}
                                                        name="payment_method"
                                                        render={({ field }) => (
                                                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccionar método..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                                                                    <SelectItem value="paypal">PayPal</SelectItem>
                                                                    <SelectItem value="stripe">Stripe</SelectItem>
                                                                    <SelectItem value="bizum">Bizum</SelectItem>
                                                                    <SelectItem value="cash">Efectivo</SelectItem>
                                                                    <SelectItem value="other">Otro</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>

                                                {/* Has Invoice Switch */}
                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Controller
                                                        control={control}
                                                        name="has_invoice"
                                                        render={({ field }) => (
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                id="has-invoice"
                                                            />
                                                        )}
                                                    />
                                                    <Label htmlFor="has-invoice" className="font-normal cursor-pointer text-sm">
                                                        ¿Emitiste factura?
                                                    </Label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* B. Invoice Data Card (Level 2 - Conditional) */}
                                {(
                                    watch("payment_status") === "invoiced" ||
                                    watch("payment_status") === "overdue" ||
                                    (watch("payment_status") === "paid" && watch("has_invoice"))
                                ) && (
                                        <Card className="bg-muted/30 border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                            <CardHeader className="pb-3 pt-4 px-4">
                                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> Datos de Facturación
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-4 pb-4 grid grid-cols-2 gap-4">
                                                {/* Invoice Number */}
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-1">
                                                        No. Factura
                                                        <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        placeholder="Ej: FAC-001"
                                                        {...register("invoice_number")}
                                                    />
                                                    {errors.invoice_number && <p className="text-xs text-destructive">{errors.invoice_number.message}</p>}
                                                </div>

                                                {/* Invoice Date */}
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-1">
                                                        Fecha Factura
                                                        <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input type="date" {...register("invoice_date")} />
                                                    {errors.invoice_date && <p className="text-xs text-destructive">{errors.invoice_date.message}</p>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                            </div>

                            {/* Actual Hours (Separate) */}
                            <div className="space-y-2">
                                <Label>Horas Reales Trabajadas</Label>
                                <Input type="number" placeholder="0" {...register("actual_hours")} />
                                <p className="text-[10px] text-muted-foreground">Necesario para calcular tu tarifa horaria efectiva.</p>
                            </div>

                            {/* B. Profitability Calculator */}
                            <Card className="bg-muted/50 border-none shadow-none">
                                <CardContent className="pt-6">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Ingresos (Presupuesto)</span>
                                            <span>${currentBudget.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">(-) Gastos Totales</span>
                                            <span className="text-destructive">-${totalExpenses.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t my-2 pt-2 flex justify-between font-bold text-lg">
                                            <span>Beneficio Neto</span>
                                            <span className={`flex items-center gap-1 ${isProfitPositive ? "text-green-600" : "text-red-600"}`}>
                                                {isProfitPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                ${netProfit.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hourly Rate Effective */}
                                    <div className="mt-4 pt-4 border-t border-dashed">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Tarifa Horaria Efectiva
                                            </span>
                                            {Number(watch("actual_hours")) > 0 ? (
                                                <span className={`font-semibold ${(netProfit / Number(watch("actual_hours"))) >= 50
                                                    ? "text-emerald-600"
                                                    : "text-amber-600"
                                                    }`}>
                                                    ${(netProfit / Number(watch("actual_hours"))).toFixed(2)} / h
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">---</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* C. Expenses Manager */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Gastos de Campaña
                                </h4>

                                {/* Add Expense Form */}
                                <div className="flex gap-2 items-end">
                                    <div className="grid gap-1 flex-1">
                                        <Input
                                            placeholder="Concepto (ej: Taxi)"
                                            value={newExpenseDesc}
                                            onChange={(e) => setNewExpenseDesc(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="grid gap-1 w-24">
                                        <Input
                                            type="number"
                                            placeholder="$"
                                            value={newExpenseAmount}
                                            onChange={(e) => setNewExpenseAmount(e.target.value)}
                                            className="h-8 text-sm"

                                        />
                                    </div>
                                    <Select value={newExpenseCategory} onValueChange={setNewExpenseCategory}>
                                        <SelectTrigger className="w-[110px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="production">Producción</SelectItem>
                                            <SelectItem value="travel">Viajes</SelectItem>
                                            <SelectItem value="agency_fee">Agencia</SelectItem>
                                            <SelectItem value="tax">Impuestos</SelectItem>
                                            <SelectItem value="other">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" size="sm" className="h-8 w-8 p-0" onClick={handleAddExpense}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Expenses List */}
                                <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                                    {expensesLoading ? (
                                        <div className="text-xs text-center py-2 text-muted-foreground">Cargando gastos...</div>
                                    ) : expenses.length === 0 ? (
                                        <div className="text-xs text-center py-2 text-muted-foreground border border-dashed rounded">Sin gastos registrados</div>
                                    ) : (
                                        expenses.map((expense) => (
                                            <div key={expense.id} className="flex items-center justify-between text-sm p-2 bg-background border rounded group">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{expense.description}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{expense.category}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono">${expense.amount}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
