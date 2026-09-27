import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms for using the Intersign editor software.',
}

const REPO_URL = 'https://github.com/RendraSuproboAji/Intersign'
const ISSUES_URL = `${REPO_URL}/issues`

export default function TermsPage() {
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
            <span className="font-medium text-foreground">Terms of Use</span>
            <span className="text-muted-foreground">|</span>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/privacy"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="mb-2 font-bold text-3xl">Terms of Use</h1>
          <p className="mb-8 text-muted-foreground text-sm">Effective Date: September 27, 2026</p>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">1. Introduction</h2>
            <p className="text-foreground/90 leading-relaxed">
              These terms apply to your use of the Intersign editor, an open-source 3D interior and
              building design tool that you run on your own computer or server. By using Intersign,
              you agree to these terms.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">2. Open-Source License</h2>
            <p className="text-foreground/90 leading-relaxed">
              The Intersign source code is released under the{' '}
              <a
                className="text-foreground underline hover:text-foreground/80"
                href={`${REPO_URL}/blob/main/LICENSE`}
              >
                MIT License
              </a>
              . Intersign is based on Pascal Editor, and the original copyright notice is kept as
              that license requires (see{' '}
              <a
                className="text-foreground underline hover:text-foreground/80"
                href={`${REPO_URL}/blob/main/NOTICE.md`}
              >
                NOTICE.md
              </a>
              ). Nothing in these terms limits your rights under the MIT License.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">3. Your Content</h2>
            <p className="text-foreground/90 leading-relaxed">
              You own the projects, designs and files you create with Intersign. Intersign claims no
              rights to your content and does not receive it.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">4. Outside Services and Plugins</h2>
            <p className="text-foreground/90 leading-relaxed">
              Some features rely on services and plugins provided by others, such as the 3D asset
              library served from the Pascal Editor asset server, the Mint plugin and the hosted
              Pascal MCP server. Your use of them is subject to their providers&apos; own terms,
              licenses and privacy policies. Models and textures from these sources are licensed by
              their providers, not under the Intersign license.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">5. Acceptable Use</h2>
            <p className="text-foreground/90 leading-relaxed">You agree not to use Intersign to:</p>
            <ul className="list-disc space-y-2 pl-6 text-foreground/90">
              <li>Break any applicable law or regulation</li>
              <li>Infringe the intellectual property or other rights of others</li>
              <li>Overload, disrupt or gain unauthorized access to outside services</li>
            </ul>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">6. Trademarks</h2>
            <p className="text-foreground/90 leading-relaxed">
              The MIT License covers the source code, not the Intersign name or logo. Please do not
              use them in a way that suggests endorsement without permission. &quot;Pascal&quot; and
              other third-party names belong to their respective owners.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">7. No Warranty</h2>
            <p className="text-foreground/90 leading-relaxed">
              Intersign is provided &quot;as is&quot;, without warranty of any kind, express or
              implied, including warranties of merchantability, fitness for a particular purpose and
              non-infringement. Designs made with Intersign are not a substitute for review by a
              qualified professional.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">8. Limitation of Liability</h2>
            <p className="text-foreground/90 leading-relaxed">
              To the maximum extent permitted by law, the Intersign authors and contributors are not
              liable for any claim, damages or other liability arising from, or in connection with,
              the software or its use, including loss of data.
            </p>
          </section>

          <section className="mb-8 space-y-4">
            <h2 className="font-semibold text-xl">9. Changes to These Terms</h2>
            <p className="text-foreground/90 leading-relaxed">
              We may update these terms as the software changes. Updates are published in the
              Intersign repository with a new effective date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold text-xl">10. Contact Us</h2>
            <p className="text-foreground/90 leading-relaxed">
              Questions about these terms can be raised on{' '}
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
