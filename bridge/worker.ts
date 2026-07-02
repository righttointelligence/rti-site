// TEMPORARY bridge — delete after the righttointelligence.org zone moves to the
// RTI Cloudflare account (~2026-07-11) and custom domains attach to rti-site.
//
// The domain's zone lives on the Bootoshi account; Workers custom domains must be
// same-account, so this worker holds the domain and proxies every request to the
// canonical RTI deployment. One codebase, one D1, zero data divergence.

const ORIGIN = "https://rti-site.righttointelligence.workers.dev";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const target = ORIGIN + url.pathname + url.search;
    return fetch(target, request);
  },
};
