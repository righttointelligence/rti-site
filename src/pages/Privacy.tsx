import Template from "./Template";

// The plain-language privacy answer. Short because the practice is short:
// we collect almost nothing, we show only aggregates, we never sell or share.
// Every claim here is checkable against the open-source worker code.
export default function Privacy() {
  return (
    <Template idx="→ privacy" title="What we do with your info.">
      <p>
        <b>When you sign, we store four things:</b> your email, your state, your zip if you chose
        to give one, and the time you signed. That row is your signature — it's how we prove to
        lawmakers that real constituents care. That's the whole list. No name, no address, no
        phone number.
      </p>
      <p>
        <b>What we never collect:</b> IP addresses, location, cookies, analytics, or trackers of
        any kind. There is no Google Analytics, no pixel, no fingerprinting script on this site.
        If you use the location button on a call page, your coordinates are used once to find your
        public state lawmakers and are never stored.
      </p>
      <p>
        <b>What the public sees:</b> counts only. The live counter and the stats page show
        aggregate numbers per state. There is no endpoint that returns emails — the API serves
        totals, period. Your email is never shown to anyone, including the lawmakers we bring
        counts to.
      </p>
      <p>
        <b>What we'll use your email for:</b> a heads-up when your state has a bill that needs
        action, and nothing else. No spam, no newsletters you didn't ask for, no selling, no
        renting, no sharing with any third party, ever. Every email we send will include a way
        out.
      </p>
      <p>
        <b>Where it lives:</b> an encrypted database that only the people who run RTI can access.
      </p>
      <p>
        <b>Want out?</b> Email{" "}
        <a href="mailto:volunteer@righttointelligence.org?subject=Remove%20my%20signature">
          volunteer@righttointelligence.org
        </a>{" "}
        from the address you signed with and we'll delete your signature.
      </p>
      <p>
        <b>Check our work:</b> this site is open source at{" "}
        <a href="https://github.com/righttointelligence/rti-site" rel="noreferrer" target="_blank">
          github.com/righttointelligence/rti-site
        </a>
        . The code that handles your signature is public — you don't have to take our word for any
        of this.
      </p>
    </Template>
  );
}
