import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/50">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{language === 'en' ? 'English' : 'हिंदी'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-primary/10 font-semibold' : ''}
        >
          <span className="mr-2">🇬🇧</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('hi')}
          className={language === 'hi' ? 'bg-primary/10 font-semibold' : ''}
        >
          <span className="mr-2">🇮🇳</span>
          हिंदी (Hindi)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
