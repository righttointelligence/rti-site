# Vercel DNS bridge

Emergency reverse proxy: serves righttointelligence.org from Vercel's edge,
passing every request straight through to the Cloudflare Worker at
rti-site.righttointelligence.workers.dev. No build, no app code — one rewrite.

Why it exists: a false phishing report (2026-07-03) put a Cloudflare
interstitial on the custom domain. The interstitial only exists on proxied
(orange-cloud) traffic, so serving the domain via a grey-cloud DNS record
pointed at Vercel removes it from the request path while the Trust & Safety
review runs. Worker, D1, Turnstile all stay exactly where they are.

Deploy:  cd vercel-proxy && bunx vercel deploy --prod
Domain:  add righttointelligence.org + www in the Vercel project settings
DNS:     in Cloudflare DNS, set the apex/www records to Vercel
         (A 76.76.21.21 / CNAME cname.vercel-dns.com) with the cloud GREY.

Rollback when the review clears: flip DNS records back to the Worker custom
domain (orange cloud) and delete the Vercel project.
