import { getBrands, getProviders, getProvidersTotalPaid } from "./actions";
import { getCampaigns } from "@/app/(dashboard)/dashboard/campaigns/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandCard } from "@/components/dashboard/directory/brand-card";
import { ProviderCard } from "@/components/dashboard/directory/provider-card";
import { CreateBrandDialog } from "@/components/dashboard/directory/create-brand-dialog";
import { CreateProviderDialog } from "@/components/dashboard/directory/create-provider-dialog";
import { BookUser, Building2, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DirectoryPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const defaultTab = params.tab === "providers" ? "providers" : "brands";

    const [brandsResult, providersResult, providerTotals, campaignsResult] = await Promise.all([
        getBrands(),
        getProviders(),
        getProvidersTotalPaid(),
        getCampaigns(),
    ]);

    const brands = brandsResult.data || [];
    const providers = providersResult.data || [];
    const error = brandsResult.error || providersResult.error;

    // Build campaign list for the payment dialog select
    const campaigns = (campaignsResult.data || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        brand_name: c.brand_name,
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <BookUser className="h-8 w-8 text-primary" />
                    Directorio
                </h1>
                <p className="text-muted-foreground mt-1">
                    Tu mini-CRM: gestiona marcas, clientes y proveedores.
                </p>
            </div>

            {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Error al cargar el directorio: {error}
                </div>
            )}

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
                    <TabsTrigger value="brands" className="gap-1.5">
                        <Building2 className="h-4 w-4" />
                        Marcas
                        {brands.length > 0 && (
                            <span className="ml-1 text-xs text-muted-foreground">({brands.length})</span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="providers" className="gap-1.5">
                        <Users className="h-4 w-4" />
                        Proveedores
                        {providers.length > 0 && (
                            <span className="ml-1 text-xs text-muted-foreground">({providers.length})</span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Brands Tab */}
                <TabsContent value="brands" className="mt-0 outline-none space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight hidden sm:block">
                            Mis Marcas
                        </h2>
                        <CreateBrandDialog />
                    </div>

                    {brands.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20 text-center">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold">Sin marcas registradas</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                Añade tu primera marca o cliente para poder vincularla con tus campañas.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {brands.map((brand) => (
                                <BrandCard key={brand.id} brand={brand} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Providers Tab */}
                <TabsContent value="providers" className="mt-0 outline-none space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight hidden sm:block">
                            Mi Equipo
                        </h2>
                        <CreateProviderDialog />
                    </div>

                    {providers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20 text-center">
                            <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold">Sin proveedores registrados</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                Añade editores, asistentes u otros colaboradores de tu equipo.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {providers.map((provider) => (
                                <ProviderCard
                                    key={provider.id}
                                    provider={provider}
                                    totalPaid={providerTotals[provider.id] || 0}
                                    campaigns={campaigns}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
