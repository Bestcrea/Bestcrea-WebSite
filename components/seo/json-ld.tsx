import { JsonLdScript, OrganizationJsonLd } from "next-seo";

type OrgProps = {
  name: string;
  description: string;
  url: string;
};

export function OrganizationJsonLdBlock({ name, description, url }: OrgProps) {
  return (
    <OrganizationJsonLd
      name={name}
      description={description}
      url={url}
      email="contact@bestcrea.com"
      telephone="+212636499140"
    />
  );
}

export function WebsiteJsonLd({ name, url }: { name: string; url: string }) {
  return (
    <JsonLdScript
      scriptKey="website"
      id="website-jsonld"
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
      }}
    />
  );
}
