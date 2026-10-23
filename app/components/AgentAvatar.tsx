import Image from "next/image";

interface AgentAvatarProps {
  avatar: string;
  name: string;
  size?: number;
  /** Tile color behind emoji avatars. */
  background?: string;
  shape?: "rounded" | "circle";
  className?: string;
}

/** Emoji on a tinted tile (LobeChat style), or a same-origin image. */
export default function AgentAvatar({ avatar, name, size = 40, background, shape = "rounded", className = "" }: AgentAvatarProps) {
  const radius = shape === "circle" ? "rounded-full" : size >= 56 ? "rounded-2xl" : size >= 32 ? "rounded-xl" : "rounded-lg";
  if (avatar?.startsWith("/") && !avatar.startsWith("//")) {
    return (
      <Image
        src={avatar}
        alt={`${name} avatar`}
        width={size}
        height={size}
        className={`${radius} shrink-0 object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={`${name} avatar`}
      className={`inline-flex shrink-0 select-none items-center justify-center bg-elevated ${radius} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.52), lineHeight: 1, background }}
    >
      {avatar || name.charAt(0).toUpperCase()}
    </span>
  );
}
