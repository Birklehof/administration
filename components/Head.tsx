import Head from "next/head";

interface HeadProps {
  title?: string;
}

export default function Header({ title }: HeadProps) {
  const pageTitle = title ? `Administration | ${title}` : "Administration";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="author" content="Schule Birklehof e.V." />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.webp" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
    </>
  );
}
