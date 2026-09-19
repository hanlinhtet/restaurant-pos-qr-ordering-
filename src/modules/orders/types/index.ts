import { Order, OrderItem, Product, ProductVariant, ProductAttribute, TableSession, Table, OrderReport, Payment } from "@prisma/client";

export type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: Product;
    variant: ProductVariant | null;
    attribute: ProductAttribute | null;
  })[];
  tableSession: (TableSession & {
    table: Table;
  }) | null;
  report: OrderReport | null;
  payments: Payment[];
};
