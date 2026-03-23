import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Text, BlockStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <Page>
      <TitleBar title="Wishlink Postback" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Order Postback Integration
            </Text>
            <Text as="p" variant="bodyMd">
              This app automatically sends order data to Wishlink whenever a new
              order is created in your store.
            </Text>
            <Text as="p" variant="bodyMd">
              Configure your postback settings (goal_id, campaign_id,
              creative_id) via environment variables. No additional setup
              required—the webhook is active once the app is installed.
            </Text>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
