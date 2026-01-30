// app/policies/[handle]/page.tsx
import { getShopPolicies } from '../../lib/shopify/policies';
import { notFound } from 'next/navigation';
import { ShopPolicy } from '../../lib/shopify/types';

export async function generateStaticParams() {
  const policies = await getShopPolicies();
  
  const handles: string[] = [];
  
  if (policies.privacyPolicy) handles.push(policies.privacyPolicy.handle);
  if (policies.refundPolicy) handles.push(policies.refundPolicy.handle);
  if (policies.shippingPolicy) handles.push(policies.shippingPolicy.handle);
  if (policies.termsOfService) handles.push(policies.termsOfService.handle);

  return handles.map((handle) => ({
    handle: handle,
  }));
}

function findPolicyByHandle(policies: any, handle: string): ShopPolicy | null {
  const allPolicies = [
    policies.privacyPolicy,
    policies.refundPolicy,
    policies.shippingPolicy,
    policies.termsOfService,
  ];

  return allPolicies.find((p) => p?.handle === handle) || null;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ handle: string }> 
}) {
  const { handle } = await params;
  const policies = await getShopPolicies();
  const policy = findPolicyByHandle(policies, handle);

  if (!policy) return {};

  return {
    title: policy.title,
    description: `${policy.title} - Our store policy`,
  };
}

export default async function PolicyPage({ 
  params 
}: { 
  params: Promise<{ handle: string }> 
}) {
  const { handle } = await params;
  const policies = await getShopPolicies();
  const policy = findPolicyByHandle(policies, handle);

  if (!policy) {
    notFound();
  }

  return (
    <div className=" mx-auto px-4 py-12 pt-30 pr-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{policy.title}</h1>
      <div 
        className="prose prose-lg max-w-none policyContent w-[60%] "
        dangerouslySetInnerHTML={{ __html: policy.body }}
      />
    </div>
  );
}