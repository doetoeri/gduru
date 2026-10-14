
    (() => {
      const root = document.documentElement, mark = document.querySelector(".pc-startup");
      const reduced = matchMedia("(prefers-reduced-motion: reduce)");
      const day = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
      let repeat = false, light = true, enabled = true;
      try {
        repeat = localStorage.getItem("pincon-startup-day-v1") === day;
        light = localStorage.getItem("pincon-cover-lighting-v1") !== "off";
        enabled = localStorage.getItem("pincon-startup-enabled-v1") !== "off";
      } catch {}
      const mode = !enabled || reduced.matches || document.hidden ? "none" : repeat ? "short" : "full";
      const duration = mode === "full" ? 800 : mode === "short" ? 200 : 0;
      const state = window.PINCON_STARTUP = { mode, duration, enabled, startAt: performance.now(), finished: false, dismiss: finish };
      const listeners = new AbortController(), timers = [];
      function finish() {
        if (state.finished) return;
        state.finished = true; state.endAt = performance.now();
        timers.forEach(clearTimeout); listeners.abort();
        root.dataset.startup = "ready";
        delete root.dataset.startupLight;
        document.dispatchEvent(new Event("pincon-startup-end"));
        mark.remove();
      }
      root.dataset.startup = mode;
      // Repeat visits go straight to the app's 200ms cover reveal. A second
      // overlay would add a needless pause before cached covers can appear.
      if (mode !== "full") { finish(); return; }
      root.dataset.startupLight = light ? "on" : "off";
      mark.hidden = false;
      mark.getBoundingClientRect();
      try { if (mode === "full") localStorage.setItem("pincon-startup-day-v1", day); } catch {}
      timers.push(setTimeout(finish, duration));
      // Input and reduced-motion always take priority over the greeting.
      for (const type of ["pointerdown", "keydown", "wheel"]) document.addEventListener(type, finish, { capture: true, passive: true, signal: listeners.signal });
      document.addEventListener("visibilitychange", () => { if (document.hidden) finish(); }, { signal: listeners.signal });
      reduced.addEventListener("change", () => { if (reduced.matches) finish(); }, { signal: listeners.signal });
      window.addEventListener("pagehide", finish, { once: true, signal: listeners.signal });
    })();
  