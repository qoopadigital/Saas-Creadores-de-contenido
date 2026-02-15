import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Transaction {
    id: string;
    title: string;
    brand_name: string;
    budget: number;
    status: string;
    updated_at: string;
}

interface RecentTransactionsProps {
    transactions: Transaction[];
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-CO", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

const statusLabels: Record<string, string> = {
    completed: "Completada",
    published: "Publicada",
    payment_pending: "Pendiente",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    published: "default",
    payment_pending: "secondary",
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="text-base">Transacciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No hay transacciones aún
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Marca</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">{t.brand_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(t.updated_at)}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-sm">
                                        {formatCurrency(t.budget)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={statusVariants[t.status] ?? "outline"}>
                                            {statusLabels[t.status] ?? t.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
