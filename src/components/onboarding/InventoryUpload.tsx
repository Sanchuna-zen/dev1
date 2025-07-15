'use client'

import { useState } from "react";
import { parseCsv } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { z } from "zod";

// Define the expected CSV structure for validation
const inventoryItemSchema = z.object({
  product_name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive()),
  quantity: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().min(0)),
});

type InventoryItem = z.infer<typeof inventoryItemSchema>;

interface InventoryUploadProps {
  onUpload: (data: InventoryItem[]) => void;
  isLoading?: boolean;
}

export function InventoryUpload({ onUpload, isLoading }: InventoryUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      try {
        const data = await parseCsv<any>(selectedFile);
        const validatedData = z.array(inventoryItemSchema).parse(data);
        setParsedData(validatedData);
      } catch (err) {
        console.error("CSV Parsing Error:", err);
        if (err instanceof z.ZodError) {
            setError(`CSV validation failed: ${err.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ')}`);
        } else {
            setError("Failed to parse or validate CSV file. Please check the format.");
        }
        setParsedData([]);
      }
    }
  };

  return (
    <div className="space-y-4">
        <div>
            <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700">Upload Inventory CSV</label>
            <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} />
            <p className="mt-1 text-sm text-gray-500">
                Required columns: product_name, price, quantity. Optional: description, category.
            </p>
        </div>

      {error && <p className="text-red-500">{error}</p>}

      {parsedData.length > 0 && (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview Inventory</h3>
          <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {parsedData.map((item, index) => (
                    <TableRow key={index}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
            <Button onClick={() => onUpload(parsedData)} disabled={isLoading}>
                {isLoading ? "Uploading..." : "Confirm and Upload Inventory"}
            </Button>
        </div>
      )}
    </div>
  );
}
