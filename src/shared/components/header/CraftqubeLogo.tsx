import Image from "next/image";
import logo from "../../../../public/Logo.png";

export function CraftqubeLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image 
        src={logo}
        alt="Craftqube Logo" 
        priority
        style={{ width: 180, maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}
