// app/test-policies/page.tsx
import { getShopPolicies } from '../lib/shopify/policies';

export default async function TestPolicies() {
  const policies = await getShopPolicies();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Policies Debug</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(policies, null, 2)}
      </pre>
    </div>
  );
}