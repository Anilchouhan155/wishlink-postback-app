import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  BlockStack,
  Card,
  Badge,
  IndexTable,
  useIndexResourceState,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const orders = await prisma.order.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return json({ orders });
};

function AttributionSummary({ data }: { data: Record<string, unknown> | null }) {
  if (!data || Object.keys(data).length === 0) return <Text as="span" tone="subdued">—</Text>;
  const source = (data.utm_source ?? data.source ?? data.ref) as string | undefined;
  const clickId = (data.atgSessionId ?? data.clickid ?? data.utm_campaign) as string | undefined;
  return (
    <InlineStack gap="200" blockAlign="center">
      {source && <Badge tone="info">{String(source).slice(0, 20)}</Badge>}
      {clickId && <Text as="span" variant="bodySm">{String(clickId).slice(0, 16)}…</Text>}
    </InlineStack>
  );
}

function AttributionDetail({ data }: { data: Record<string, unknown> }) {
  return (
    <BlockStack gap="200">
      <BlockStack gap="100">
        {Object.entries(data).map(([k, v]) => (
          <InlineStack key={k} gap="200" blockAlign="start">
            <Text as="span" variant="bodySm" fontWeight="semibold">{k}:</Text>
            <Text as="span" variant="bodySm">{String(v)}</Text>
          </InlineStack>
        ))}
      </BlockStack>
    </BlockStack>
  );
}

export default function Index() {
  const { orders } = useLoaderData<typeof loader>();
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders.map((o) => o.orderId));
  const selectedOrder = orders.find((o) => selectedResources.includes(o.orderId));

  return (
    <Page>
      <TitleBar title="Wishlink Postback" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Order & Attribution Dashboard
            </Text>
            <Text as="p" variant="bodyMd">
              <strong>App channel:</strong> Every order is saved with full
              attribution data—all URL params (utm_*, atgSessionId, referrer,
              session) to identify content creators and affiliate sources.{" "}
              <strong>Wishlink channel:</strong> Postback fires when order has
              tracking (atgSessionId, utm_campaign, clickid).
            </Text>
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Recent Orders
              </Text>
              {orders.length === 0 ? (
                <Text as="p" variant="bodyMd" tone="subdued">
                  No orders yet. Orders will appear once the webhook receives them.
                  Ensure the webhook URL points to:{" "}
                  <code>
                    https://wishlink-postback-app.vercel.app/webhooks/orders/create
                  </code>
                </Text>
              ) : (
                <IndexTable
                  resourceName={{ singular: "order", plural: "orders" }}
                  itemCount={orders.length}
                  selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
                  onSelectionChange={handleSelectionChange}
                  headings={[
                    { title: "Order" },
                    { title: "Total" },
                    { title: "Currency" },
                    { title: "Customer" },
                    { title: "Attribution" },
                    { title: "Wishlink" },
                    { title: "Date" },
                  ]}
                >
                  {orders.map((order) => (
                    <IndexTable.Row
                      id={order.orderId}
                      key={order.orderId}
                      selected={selectedResources.includes(order.orderId)}
                      position={order.orderId}
                    >
                      <IndexTable.Cell>
                        <Text fontWeight="semibold">
                          {order.orderName || `#${order.orderId}`}
                        </Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>{order.totalPrice}</IndexTable.Cell>
                      <IndexTable.Cell>{order.currency}</IndexTable.Cell>
                      <IndexTable.Cell>{order.customerEmail || "—"}</IndexTable.Cell>
                      <IndexTable.Cell>
                        <AttributionSummary data={order.attributionData as Record<string, unknown> | null} />
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        {order.wishlinkSent ? (
                          <Badge tone="success">Sent</Badge>
                        ) : (
                          <Badge tone="subdued">—</Badge>
                        )}
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        {new Date(order.createdAt).toLocaleString()}
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
        {selectedOrder?.attributionData && Object.keys(selectedOrder.attributionData as object).length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Creator / Affiliate Attribution — {selectedOrder.orderName || `#${selectedOrder.orderId}`}
                </Text>
                <AttributionDetail data={selectedOrder.attributionData as Record<string, unknown>} />
              </BlockStack>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
