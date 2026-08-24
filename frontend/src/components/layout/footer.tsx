import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Youtube } from "lucide-react";
import { LogoMark } from "@/components/shared/brand";
import { APP_NAME, PRODUCT_CONFIGS, ROUTES } from "@/constants";

const productLinks = [
  { label: "Sports Management", href: ROUTES.SPORTS },
  { label: "BandConnect Marketplace", href: ROUTES.BAND },
  { label: "Select product", href: ROUTES.SELECT_PRODUCT },
] as const;

const companyLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Get started", href: ROUTES.REGISTER },
] as const;

const supportLinks = [
  { label: "Log in", href: ROUTES.LOGIN },
  { label: "Verify email", href: ROUTES.VERIFY_EMAIL },
  { label: "Reset password", href: ROUTES.FORGOT_PASSWORD },
] as const;

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
] as const;

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <Link
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-24 border-t border-border/70 bg-card">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-extrabold tracking-tight text-primary">
              {APP_NAME}
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            One platform powering {PRODUCT_CONFIGS.sports.name} and{" "}
            {PRODUCT_CONFIGS.band.name}.
          </p>
          <a
            href="mailto:support@unify.app"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-opacity hover:opacity-80"
          >
            <Mail className="h-4 w-4" />
            support@unify.app
          </a>
          <div className="flex items-center gap-2 pt-1">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterLinkGroup title="Products" links={productLinks} />
        <FooterLinkGroup title="Company" links={companyLinks} />
        <FooterLinkGroup title="Support" links={supportLinks} />
      </div>

      <div className="border-t border-border/70 py-6">
        <p className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
