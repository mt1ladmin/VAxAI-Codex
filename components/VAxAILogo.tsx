import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
};

export default function VAxAILogo({ className = "h-7 w-24", priority = false }: Props) {
  return (
    <span className={`relative block overflow-hidden bg-[#0d2225] ${className}`}>
      <Image
        src="/vaxai-logo.jpg"
        alt="VAxAI"
        width={512}
        height={763}
        priority={priority}
        className="absolute left-1/2 top-1/2 h-auto w-[145%] max-w-none -translate-x-1/2 -translate-y-1/2"
      />
    </span>
  );
}
