import logoPrincipal from "../../../api/images/logo_principal.png";

interface BrandLogoProps {
  className: string;
  alt?: string;
}

export function BrandLogo({
  className,
  alt = "Logo da plataforma Cursos Livres",
}: BrandLogoProps) {
  return (
    <img
      className={`brand-logo ${className}`}
      src={logoPrincipal}
      alt={alt}
    />
  );
}
