import type { Metadata } from "next";
import Link from "next/link";
import { businessSoftware } from "@/data/business-software";
import styles from "./software.module.css";

export const metadata: Metadata = {
  title: "WDT Business Softwares | WorkflowKits",
  description: "Discover business applications from WorkFlowKits Digital Technology. Open WDT POS to manage sales, stock, staff and business reporting.",
  alternates: { canonical: "https://workflowkits.com/business-software" },
  openGraph: {
    title: "WDT Business Softwares | WorkflowKits",
    description: "Practical software for your next chapter. Discover WDT POS and our growing family of business applications.",
    url: "https://workflowkits.com/business-software",
    type: "website",
  },
};

const questions = [
  ["What is WDT Business Softwares?", "This is the home for business applications from WorkFlowKits Digital Technology. WDT POS is the first application featured here. As more applications become available, you will be able to find and access them from this page."],
  ["Where do I sign in or create a POS account?", "Select Open WDT POS to visit pos.workflowkits.com. Use the sign-in or business registration options in the POS application. Your WorkflowKits template account is separate from your POS business account."],
  ["Is WDT POS a download or an online application?", "WDT POS is a browser-based business application. Open it from this page to access your workspace. Offline cash sales need a prepared device, saved catalogue, registered offline profile and valid device grant; prepare these while connected."],
  ["Where can I see subscription pricing?", "Open WDT POS and review the subscription options in the application. Plan details, allowances and billing status are managed there. No subscription purchase or payment is taken on this directory page."],
  ["Will there be other business applications?", "Yes, this page is designed to grow as WDT develops more business software. Only WDT POS is listed for access today. Additional applications will be listed when they are ready."],
];

export default function BusinessSoftwarePage() {
  return <div className={styles.page}>
    <a className={styles.skip} href="#software-directory">Skip to applications</a>
    <section className={`${styles.hero} ${styles.wrap}`}>
      <div>
        <p className={styles.eyebrow}>WORKFLOWKITS DIGITAL TECHNOLOGY</p>
        <h1>WDT Business<br /><span>Softwares.</span></h1>
        <p className={styles.heroTagline}>Built for business.<br />Ready for what’s next.</p>
        <p className={styles.lead}>Practical applications for the work behind your business. Discover the tools, find your workspace and get on with your day.</p>
        <div className={styles.actions}><a className={styles.primary} href="#software-directory">Explore applications <span aria-hidden="true">↓</span></a><a className={styles.textLink} href="https://pos.workflowkits.com/">Open WDT POS ↗</a></div>
        <p className={styles.caption}>One place to discover WDT business applications.</p>
      </div>
      <div className={styles.heroArt} aria-label="Illustration of the WDT application directory">
        <div className={styles.artHeader}><span className={styles.wordmark}>WDT<span> / </span>Business suite</span><span className={styles.artDots} aria-hidden="true">● ● ●</span></div>
        <div className={styles.artContent}><p className={styles.miniLabel}>YOUR NEXT CHAPTER STARTS HERE</p><h2>Good tools.<br />Every working day.</h2><div className={styles.appTile}><span className={styles.posIcon} aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><rect x="7" y="5" width="26" height="21" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M14 34h12M20 26v8M12 12h16M12 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><div><strong>WDT POS</strong><p>Sales. Stock. People.</p></div><span className={styles.available}>Available</span></div><div className={styles.futureTile}><span aria-hidden="true">＋</span><div><strong>A growing family of applications</strong><p>More possibilities, as we build.</p></div></div></div>
        <div className={styles.artFooter}><span aria-hidden="true">✦</span> Practical software. Connected possibilities.</div>
      </div>
    </section>

    <div className={styles.principles}><div className={styles.wrap}><span>MADE FOR THE WAY YOU WORK</span><strong>Everyday operations</strong><i aria-hidden="true">✦</i><strong>Business visibility</strong><i aria-hidden="true">✦</i><strong>Room to grow</strong></div></div>

    <section id="software-directory" className={`${styles.directory} ${styles.wrap}`}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>THE APPLICATIONS</p><h2>Your business.<br />The right tools.</h2></div><p>Start with WDT POS. Come back here to discover new applications as the WDT family grows.</p></div>
      {businessSoftware.map((app) => <article key={app.id} id={app.id} className={styles.product}>
        <div className={styles.productIntro}><div className={styles.productLabels}><span>{app.category}</span><span className={styles.available}>Available now</span></div><h3>{app.name}</h3><p>{app.description}</p><a className={styles.primary} href={app.href}>Open {app.name} <span aria-hidden="true">↗</span></a><p className={styles.productNote}>Sign in or create your business account in the POS app.</p><a className={styles.domain} href={app.href}>pos.workflowkits.com ↗</a></div>
        <div className={styles.featureGrid}>{app.features.map((feature, index) => <div key={feature.title}><span className={styles.featureNumber}>0{index + 1} /</span><h4>{feature.title}</h4><p>{feature.description}</p></div>)}</div>
        <div className={styles.productFoot}><span>SUBSCRIPTION-BASED BUSINESS APPLICATION</span><p>Review current plans and allowances inside WDT POS.</p></div>
      </article>)}
      <aside className={styles.comingSoon}><span className={styles.plus} aria-hidden="true">＋</span><div><h3>More business software. One familiar home.</h3><p>We’re building the WDT family of applications. New software will appear here when it’s ready to use.</p></div><span className={styles.futureLabel}>LOOKING AHEAD</span></aside>
    </section>

    <section className={styles.how}><div className={styles.wrap}><div><p className={styles.eyebrow}>FROM DISCOVERY TO YOUR WORKSPACE</p><h2>A simple way<br />to get started.</h2></div><ol>{[["Find your application", "Explore the available applications and see what each one helps you do."], ["Open your workspace", "Follow the application link. Sign in or create a business account there."], ["Choose what fits", "Review the application’s subscription options and set up your business."]].map(([title, body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ol></div></section>

    <section className={`${styles.faq} ${styles.wrap}`}><div><p className={styles.eyebrow}>A FEW THINGS TO KNOW</p><h2>Before you<br />get started.</h2></div><div>{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

    <section className={styles.final}><div className={styles.wrap}><p className={styles.eyebrow}>START WITH WDT POS</p><h2>Your next working day,<br />better connected.</h2><p>Bring sales, stock and your team into one business workspace.</p><a className={styles.primary} href="https://pos.workflowkits.com/">Open WDT POS <span aria-hidden="true">↗</span></a><Link className={styles.backLink} href="/">Explore WorkflowKits templates and resources →</Link></div></section>
  </div>;
}
