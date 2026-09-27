import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How the Intersign editor handles your data.',
}

const ISSUES_URL = 'https://github.com/RendraSuproboAji/Intersign/issues'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/"
            >
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/terms"
            >
              Terms of Use
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="font-medium text-foreground">Privacy Policy</span>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="mb-2 font-bold text-3xl">Privacy Policy</h1>
          <p className="mb-8 text-muted-foreground text-sm">Effective Date: September 27, 2026</p>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">1. Introduction</h2>
            <p className="text-foreground/90 leading-relaxed">
              Intersign is open-source 3D interior and building design software. You run it
              yourself, on your own computer or on a server you control. It is not an online service
              operated by Intersign, so the person or organization running a copy of Intersign
              controls the data in it. This policy explains what the software does with your data
              and which outside services it contacts by default.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">2. What We Do Not Collect</h2>
            <p className="text-foreground/90 leading-relaxed">
              The Intersign software has no user accounts, no analytics, no tracking cookies and no
              telemetry. Your projects are never sent to the Intersign project.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">3. Data Stored on Your Device</h2>
            <ul className="list-disc space-y-2 pl-6 text-foreground/90">
              <li>
                <strong>Projects</strong> are saved in a local database file on the machine running
                the editor, by default <code>~/.intersign/data/intersign.db</code>. You can choose
                another location with the <code>INTERSIGN_DB_PATH</code> or{' '}
                <code>INTERSIGN_DATA_DIR</code> settings.
              </li>
              <li>
                <strong>Editor preferences</strong> and the scene you are working on are kept in
                your browser&apos;s local storage.
              </li>
            </ul>
            <p className="text-foreground/90 leading-relaxed">
              You can delete this data at any time by deleting the database file or clearing your
              browser&apos;s site data.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">4. Outside Services</h2>
            <p className="text-foreground/90 leading-relaxed">
              Some features contact services that Intersign does not operate. When they do, the
              provider receives your IP address and the details of the request, and their own
              privacy policy applies.
            </p>
            <ul className="list-disc space-y-2 pl-6 text-foreground/90">
              <li>
                <strong>3D asset library</strong>: furniture models and textures are downloaded from
                the Pascal Editor asset server (<code>editor.pascal.app</code>) by default. The
                operator of an Intersign installation can point this to another server with the{' '}
                <code>NEXT_PUBLIC_ASSETS_CDN_URL</code> setting.
              </li>
              <li>
                <strong>Mint plugin</strong> (optional): if you sign in to Mint to browse or
                generate 3D assets, your requests and Mint account details are handled by Mint.
              </li>
              <li>
                <strong>Hosted MCP server</strong> (optional): if you connect an AI agent to the
                hosted Pascal MCP server with an API key, the scenes you work on there are handled
                by that service.
              </li>
              <li>
                <strong>Send to Blender</strong>: sends your scene only to Blender running on the
                same computer.
              </li>
            </ul>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">5. Installations Run by Others</h2>
            <p className="text-foreground/90 leading-relaxed">
              If you use an Intersign installation that someone else hosts, that operator is
              responsible for the data stored on their server and for providing their own privacy
              notice.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">6. Children&apos;s Privacy</h2>
            <p className="text-foreground/90 leading-relaxed">
              Intersign is not directed at children under 13, and the software does not knowingly
              collect personal information from them.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">7. Changes to This Policy</h2>
            <p className="text-foreground/90 leading-relaxed">
              We may update this policy as the software changes. Updates are published in the
              Intersign repository with a new effective date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-xl">8. Contact Us</h2>
            <p className="text-foreground/90 leading-relaxed">
              Questions about this policy can be raised on{' '}
              <a className="text-foreground underline hover:text-foreground/80" href={ISSUES_URL}>
                GitHub Issues
              </a>
              .
            </p>
          </section>
        </article>
      </main>
    </div>
  )
}
