"use client";

import { useState } from "react";

import { Input } from "@repo/ui/components/control";
import { Card } from "@repo/ui/components/layout";

import { api } from "~/trpc/react";

export default function CreateTaskPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = api.purchaseOrder.all.useQuery({ query });
  const [selectedPo, setSelectedPo] = useState();

  return (
    <Card className="flex flex-col items-stretch">
      Test
      {/* {selectedPo && <div>{selectedPo.id}</div>}
      <div className="border-b border-border p-4">
        <h1>Select Purchase Order</h1>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by PO number or account name"
        />
      </div>
      <div className="max-h-[calc(100vh-10rem)] flex-1 overflow-y-auto">
        <ul>
          {data?.data.map((po) => (
            <li key={po.id}>
              <button
                className="flex w-full flex-row border-b p-2 text-left"
                type="button"
                onClick={() => setSelectedPo(po)}
              >
                <div className="flex grow flex-col">
                  <div className="font-semibold">{po.id}</div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {po.accountId}
                  </div>
                </div>
                <div className="flex flex-col">
                  {po.deliveryDate?.toLocaleDateString()}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div> */}
    </Card>
  );
}

// type SelectPurchaseOrderProps = {
//   selectPO: () => void;
// };

// const SelectPurchaseOrder = ({ po }: SelectPurhcaseOrderProps) => {
//   const [query, setQuery] = useState("");
//   const { data, isLoading } = api.purchaseOrder.all.useQuery({ query });
//   const [selectedPo, setSelectedPo] = useState();

//   return (
//     <Card className="flex flex-col items-stretch">
//       {selectedPo && <div>{selectedPo.id}</div>}
//       <div className="border-b border-border p-4">
//         <h1>Select Purchase Order</h1>
//         <Input
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search by PO number or account name"
//         />
//       </div>
//       <div className="max-h-[calc(100vh-10rem)] flex-1 overflow-y-auto">
//         <ul>
//           {data?.data.map((po) => (
//             <li key={po.id}>
//               <button
//                 className="flex w-full flex-row border-b p-2 text-left"
//                 type="button"
//                 onClick={() => setSelectedPo(po)}
//               >
//                 <div className="flex grow flex-col">
//                   <div className="font-semibold">{po.id}</div>
//                   <div className="text-sm font-medium text-muted-foreground">
//                     {po.accountId}
//                   </div>
//                 </div>
//                 <div className="flex flex-col">
//                   {po.deliveryDate?.toLocaleDateString()}
//                 </div>
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </Card>
//   );
