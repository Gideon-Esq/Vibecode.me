"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";

const FAQS = [
  {
    q: "Can I change my itinerary after it's generated?",
    a: "Yes. You can regenerate individual days, switch hotels, update flights, or modify activities without rebuilding your entire trip.",
  },
  {
    q: "Does Voyagoa book flights and hotels?",
    a: "Voyagoa recommends and organizes travel options. Booking integrations can be added through supported travel partners.",
  },
  {
    q: "Can I use any currency?",
    a: "Yes. Voyagoa supports multiple currencies and can convert budgets where applicable.",
  },
  {
    q: "Is visa information always accurate?",
    a: "Voyagoa provides guidance and links to official government resources. Because visa policies can change, always verify requirements before traveling.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-[7px]">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex min-h-[42px] w-full cursor-pointer items-center justify-between gap-4 border-b border-[#e5edf9] bg-[#f6f9ff] px-3.5 py-2 text-left text-[0.83rem] font-bold text-navy last:border-b-0"
            >
              {item.q}
              <Icon
                name={isOpen ? "remove" : "add"}
                className="shrink-0 text-[17px] text-blue"
              />
            </button>
            {isOpen && (
              <p className="border-x border-[#edf2fb] bg-white px-3.5 pb-3 pt-2.5 text-[0.8rem] text-[#45556f]">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
