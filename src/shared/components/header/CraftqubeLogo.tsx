import Image from "next/image";

export function CraftqubeLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image 
        src="/Logo.png" 
        alt="Craftqube Logo" 
        width={180} 
        height={40}
        priority
        style={{ height: 'auto' }}
      />
    </div>
  );
}