"use client";

import { useEffect, useRef } from "react";
import { focusRing, secondaryBtn } from "./ui";

const link = `font-semibold text-moody-ink underline underline-offset-2 ${focusRing}`;

/** Shown when the local check or the model flags a safety concern. */
export function CrisisCard({ onDismiss }: { onDismiss: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
    heading.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <section
      role="alert"
      aria-labelledby="moody-crisis-heading"
      className="mb-6 rounded-3xl bg-moody-sky-pale p-5 tablet:p-6"
    >
      <h2
        id="moody-crisis-heading"
        ref={heading}
        tabIndex={-1}
        className="font-(family-name:--font-quicksand) mb-2 text-[22px] font-bold outline-none"
      >
        You don&apos;t have to carry this alone
      </h2>
      <p className="mb-4 text-[15px] leading-relaxed text-moody-ink">
        It sounds like things might be really hard right now. Talking to someone can help, and
        these are free and open 24/7.
      </p>
      <ul className="mb-5 space-y-2.5 text-[15px] text-moody-ink">
        <li>
          <strong className="text-moody-ink">988 Suicide &amp; Crisis Lifeline:</strong>{" "}
          <a className={link} href="tel:988">call 988</a> or <a className={link} href="sms:988">text 988</a>
        </li>
        <li>
          <strong className="text-moody-ink">Crisis Text Line:</strong>{" "}
          <a className={link} href="sms:741741?&body=HOME">text HOME to 741741</a>
        </li>
        <li>
          <strong className="text-moody-ink">In immediate danger:</strong>{" "}
          <a className={link} href="tel:911">call 911</a>
        </li>
      </ul>
      <button
        type="button"
        onClick={onDismiss}
        className={secondaryBtn}
      >
        Dismiss
      </button>
    </section>
  );
}
