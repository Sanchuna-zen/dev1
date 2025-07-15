'use client'

import { useState, useEffect } from 'react';
import { ShopProfileForm } from '@/components/onboarding/ShopProfileForm';
import { InventoryUpload } from '@/components/onboarding/InventoryUpload';
import { useRouter } from 'next/navigation';

type OnboardingStep = 'profile' | 'inventory' | 'completed' | 'loading';

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [shopId, setShopId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch('/api/onboarding/status');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'completed') {
          router.push('/dashboard'); // Redirect if already completed
        } else if (data.status === 'inventory_pending') {
            setStep('inventory');
        } else {
            setStep('profile');
        }
      } else {
        setStep('profile'); // Default to profile if status fetch fails
      }
    };

    fetchStatus();
  }, [router]);

  const handleProfileSubmit = async (data: any) => {
    setIsLoading(true);
    const response = await fetch('/api/onboarding/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'profile', data }),
    });

    if (response.ok) {
      const result = await response.json();
      setShopId(result.shop.id);
      setStep('inventory');
    } else {
      // Handle error
      console.error("Failed to submit profile");
    }
    setIsLoading(false);
  };

  const handleInventoryUpload = async (data: any) => {
    if (!shopId) {
        console.error("No shop ID available for inventory upload");
        return;
    }
    setIsLoading(true);
    const response = await fetch('/api/onboarding/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'inventory', data: { shopId, inventory: data } }),
    });

    if (response.ok) {
      setStep('completed');
      router.push('/dashboard');
    } else {
      // Handle error
      console.error("Failed to upload inventory");
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Shop Onboarding</h1>
      {step === 'loading' && <p>Loading...</p>}
      {step === 'profile' && 
        <div>
            <h2 className="text-xl font-semibold mb-2">Step 1: Create Your Shop Profile</h2>
            <ShopProfileForm onSubmit={handleProfileSubmit} isLoading={isLoading} />
        </div>
      }
      {step === 'inventory' && 
        <div>
            <h2 className="text-xl font-semibold mb-2">Step 2: Upload Your Inventory</h2>
            <InventoryUpload onUpload={handleInventoryUpload} isLoading={isLoading} />
        </div>
      }
    </div>
  );
}
