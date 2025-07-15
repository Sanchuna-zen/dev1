'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// IMPORTANT: Replace this with your actual Crisp Website ID
const CRISP_WEBSITE_ID = "YOUR_CRISP_WEBSITE_ID";

export function LiveChatWidget() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);


  useEffect(() => {
    if (user && CRISP_WEBSITE_ID !== 'YOUR_CRISP_WEBSITE_ID') {
      // Configure Crisp object before loading the script
      (window as any).$crisp = [];
      (window as any).CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;
      
      // Set user information
      if(user.email) {
        (window as any).$crisp.push(["set", "user:email", [user.email]]);
      }
      if(user.user_metadata?.full_name) {
        (window as any).$crisp.push(["set", "user:nickname", [user.user_metadata.full_name]]);
      }

      // Inject the script
      const script = document.createElement("script");
      script.src = "https://client.crisp.chat/l.js";
      script.async = true;
      document.head.appendChild(script);

      return () => {
        // Clean up the script when the component unmounts or user logs out
        const crispScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
        if (crispScript) {
            document.head.removeChild(crispScript);
        }
        delete (window as any).$crisp;
        delete (window as any).CRISP_WEBSITE_ID;
      };
    }
  }, [user]);

  return null; // This component does not render anything itself
}
