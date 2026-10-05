import Image from "next/image";

export default function NewsImage(props) {
  return (
    <Image
      {...props}
      unoptimized={/^https?:\/\//i.test(props.src || "")}
      alt={props.alt || "News image"}
    />
  );
}
