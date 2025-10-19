// emails/DownloadLinkEmail.tsx
import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Column,
  Row,
  Img,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";

type Props = {
  downloadUrl: string;        // /api/download?token=...
  productTitle: string;       // e.g. "Project Execution Plan (MS Word)"
  siteUrl?: string;           // e.g. https://workflowkits.com
  userName?: string;          // optional personalization
  expiresText?: string;       // e.g. "24 hours"
  supportEmail?: string;      // e.g. support@workflowkits.com
  fileName?: string;          // e.g. project_execution_plan.docx
  fileSize?: string;          // e.g. "2.3 MB"
};

const brand = {
  bg: "#0b1020",             // dark header bg
  accent: "#00c2ff",         // CTA color
  text: "#0f172a",           // slate-900
  sub: "#475569",            // slate-600
  border: "#e2e8f0",         // slate-200
};

export default function DownloadLinkEmail({
  downloadUrl,
  productTitle,
  siteUrl = "https://workflowkits.com",
  userName,
  expiresText = "24 hours",
  supportEmail = "support@workflowkits.com",
  fileName,
  fileSize,
}: Props) {
  const preview = `Your download link for “${productTitle}” is ready.`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>

      <Body style={styles.body}>
        {/* Top bar */}
        <Section style={styles.topBar} role="presentation">
          <Row align="center">
            <Column style={{ width: 56 }}>
              <Link href={siteUrl} style={{ display: "inline-block" }}>
                <Img
                  src={`${siteUrl}/logo.png`}
                  alt="WorkflowKits"
                  width="40"
                  height="40"
                  style={{ borderRadius: 8, display: "block" }}
                />
              </Link>
            </Column>
            <Column>
              <Link href={siteUrl} style={styles.brandName}>
                WorkflowKits
              </Link>
            </Column>
          </Row>
        </Section>

        <Container style={styles.card}>
          {/* Greeting */}
          <Section style={{ paddingBottom: 6 }}>
            <Text style={styles.hi}>
              {userName ? `Hi ${userName},` : "Hi,"}
            </Text>
            <Text style={styles.lead}>
              Your download link for <strong>{productTitle}</strong> is ready.
            </Text>
          </Section>

          {/* File meta */}
          {(fileName || fileSize) && (
            <>
              <Hr style={styles.hr} />
              <Section>
                <Row>
                  {fileName && (
                    <Column>
                      <Text style={styles.metaLabel}>File</Text>
                      <Text style={styles.metaValue}>{fileName}</Text>
                    </Column>
                  )}
                  {fileSize && (
                    <Column>
                      <Text style={styles.metaLabel}>Size</Text>
                      <Text style={styles.metaValue}>{fileSize}</Text>
                    </Column>
                  )}
                </Row>
              </Section>
            </>
          )}

          {/* CTA */}
          <Section style={{ paddingTop: 18 }}>
            <Button
              href={downloadUrl}
              style={styles.cta}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download now
            </Button>
            <Text style={styles.small}>
              Link expires in {expiresText}. If the button doesn’t work, copy
              and paste this URL into your browser:
              <br />
              <Link href={downloadUrl} style={styles.url}>
                {downloadUrl}
              </Link>
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Help */}
          <Section>
            <Text style={styles.small}>
              Need help or received this email in error? Contact us at{" "}
              <Link href={`mailto:${supportEmail}`} style={styles.link}>
                {supportEmail}
              </Link>
              .
            </Text>
          </Section>
        </Container>

        {/* Footer */}
        <Section style={{ padding: "16px 0 40px" }}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} WorkflowKits Inc. ·{" "}
            <Link href={siteUrl} style={styles.link}>
              workflowkits.com
            </Link>
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: "#f6f7fb",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji"',
    color: brand.text,
  },
  topBar: {
    background: brand.bg,
    padding: "16px 24px",
  },
  brandName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 700,
    textDecoration: "none",
  },
  card: {
    maxWidth: 560,
    margin: "24px auto",
    background: "#ffffff",
    borderRadius: 14,
    border: `1px solid ${brand.border}`,
    boxShadow: "0 8px 24px rgba(2, 6, 23, 0.06)",
    padding: 24,
  },
  hi: {
    margin: 0,
    fontSize: 16,
    color: brand.sub,
  },
  lead: {
    margin: "8px 0 0",
    fontSize: 18,
    lineHeight: 1.5,
  },
  hr: {
    borderColor: brand.border,
    margin: "18px 0",
  },
  metaLabel: {
    fontSize: 12,
    color: brand.sub,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: 600,
  },
  cta: {
    display: "inline-block",
    background: brand.accent,
    color: "#001018",
    fontWeight: 700,
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    border: "0",
  },
  small: {
    fontSize: 12,
    color: brand.sub,
    marginTop: 14,
    lineHeight: 1.6,
  },
  url: {
    color: brand.accent,
    wordBreak: "break-all",
    textDecoration: "underline",
  },
  link: {
    color: brand.accent,
    textDecoration: "underline",
  },
  footerText: {
    textAlign: "center",
    color: brand.sub,
    fontSize: 12,
  },
};
