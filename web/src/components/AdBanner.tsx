interface AdBannerProps {
  position: "top" | "sidebar" | "inline" | "bottom";
}

export default function AdBanner({ position }: AdBannerProps) {
  const sizes: Record<string, string> = {
    top: "h-[90px] max-w-4xl",
    sidebar: "h-[250px] w-full",
    inline: "h-[90px] w-full",
    bottom: "h-[90px] max-w-4xl",
  };

  return (
    <div className={`mx-auto w-full px-4 ${position === "top" ? "mt-2 mb-4" : position === "bottom" ? "mt-4 mb-2" : "my-4"}`}>
      <div className={`ad-slot ${sizes[position]}`}>
        {/*
          Aquí va el código de Google AdSense.
          Reemplazar con:
          <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-XXXXX"
            data-ad-slot="XXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true" />
        */}
        <span>Espacio publicitario</span>
      </div>
    </div>
  );
}
