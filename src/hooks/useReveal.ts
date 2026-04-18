import { useEffect, useRef } from 'react';

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = Array.from(el.querySelectorAll('.reveal'));
            if (el.classList.contains('reveal')) targets.unshift(el);

            targets.forEach((target, i) => {
              (target as HTMLElement).style.transitionDelay = `${i * 0.08}s`;
              target.classList.add('visible');
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
