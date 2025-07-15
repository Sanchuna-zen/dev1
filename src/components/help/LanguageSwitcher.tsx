'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const currentLang = searchParams.get('lang') || 'en';

  const setLanguage = (lang: 'en' | 'ta') => {
    const params = new URLSearchParams(searchParams)
    params.set('lang', lang)
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex space-x-2">
      <Button 
        variant={currentLang === 'en' ? 'default' : 'outline'}
        onClick={() => setLanguage('en')} >
        English
      </Button>
      <Button 
        variant={currentLang === 'ta' ? 'default' : 'outline'} 
        onClick={() => setLanguage('ta')} >
        தமிழ்
      </Button>
    </div>
  )
}
