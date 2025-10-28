import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from '../hooks/use-fetch';
import { getLongUrl } from '../db/apiUrls';
import { BarLoader } from 'react-spinners';
import { storeClicks } from '../db/apiClicks';

// ...existing code...
const RedirectLink = () => {
  const { id } = useParams();

  const { loading, data, fn } = useFetch(getLongUrl, id);

  useEffect(() => {
    const redirect = async () => {
      await fn(); // fetch long URL
    };
    redirect();
  }, [id, fn]); // include id/fn so fetch reruns reliably

  useEffect(() => {
    if (!loading && data) {
      // diagnostics
      console.log("Redirect: data =", data);

      // Log click asynchronously, do NOT block redirect.
      // Strategy: try navigator.sendBeacon first (queued by browser),
      // fallback to fetch(..., { keepalive: true }) if available, and
      // also fire `storeClicks` asynchronously as a backup (don't await).
      try {
        const payload = JSON.stringify({ id: data.id, ts: Date.now() });

        // Prefer sendBeacon (reliable during unload/navigation)
        if (navigator && typeof navigator.sendBeacon === "function") {
          try {
            const ok = navigator.sendBeacon("/__beacon_click", payload);
            console.log("sendBeacon queued:", ok);
          } catch (beErr) {
            console.warn("sendBeacon failed, will try fetch keepalive:", beErr);
            // try fetch keepalive below
            try {
              fetch("/__beacon_click", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
                keepalive: true,
              }).then(() => console.log("fetch keepalive queued"))
                .catch((fErr) => console.warn("fetch keepalive failed:", fErr));
            } catch (fErrTop) {
              console.warn("fetch keepalive threw:", fErrTop);
            }
          }
        } else {
          // No sendBeacon: try fetch with keepalive (modern browsers)
          try {
            fetch("/__beacon_click", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: payload,
              keepalive: true,
            }).then(() => console.log("fetch keepalive queued"))
              .catch((fErr) => console.warn("fetch keepalive failed:", fErr));
          } catch (fErr) {
            console.warn("fetch keepalive threw:", fErr);
          }
        }

        // Fire the existing storeClicks function as a non-blocking backup.
        // Do it in a microtask / timeout so we never await it here.
        try {
          setTimeout(() => {
            try {
              storeClicks({ id: data.id });
            } catch (sErr) {
              console.warn("storeClicks failed:", sErr);
            }
          }, 0);
        } catch (sErrTop) {
          console.warn("scheduling storeClicks failed:", sErrTop);
        }
      } catch (e) {
        console.warn("Click logging setup failed:", e);
      }

      try {
        // Ensure URL has a protocol (mobile browsers often require it)
        let target = (data.original_url || "").trim();
        console.log("Redirect target (raw):", target);
        if (!/^https?:\/\//i.test(target)) {
          target = `https://${target}`;
        }

        // If the stored URL points to localhost (or 127.0.0.1),
        // rewrite the hostname to the current page's hostname/port so
        // a mobile device can reach the dev server on your machine.
        try {
          const u = new URL(target);
          if (["localhost", "127.0.0.1"].includes(u.hostname)) {
            const host = window.location.hostname;
            const port = window.location.port;
            // Replace hostname and port with the host:port the short-link page was loaded from
            u.hostname = host;
            if (port) {
              u.port = port;
            } else {
              // if no port on current page, clear the port on URL (so default ports apply)
              u.port = "";
            }
            target = u.toString();
            console.log("Rewrote localhost/127.0.0.1 ->", target);
          }
        } catch (e) {
          console.warn("Failed to parse/normalize redirect URL:", e);
        }

        console.log("Normalized target:", target);

        // Optimized immediate redirect (no artificial delay):
        // We already attempted to enqueue logging above (sendBeacon or fetch keepalive).
        // Now perform a synchronous redirect so the user doesn't perceive any lag.
        try {
          try {
            // Preferred: replace so short URL isn't left in history
            window.location.replace(target);
          } catch (e) {
            console.warn("replace() failed, trying assign/href:", e);
            try {
              window.location.assign(target);
            } catch (e2) {
              window.location.href = target;
              // try {
              // } catch (e3) {
              //   console.error("All redirect attempts failed:", e3);
              //   // Insert a minimal manual fallback so user can tap the link
              //   // try {
              //   //   const notice = document.createElement("div");
              //   //   notice.style.cssText = "padding:20px;font-size:16px;text-align:center;";
              //   //   notice.innerHTML = `If you are not redirected automatically, <a href="${target}" id="__manual_redirect">tap here</a> to continue.`;
              //   //   document.body.innerHTML = ""; // clear page so fallback is visible
              //   //   document.body.appendChild(notice);
              //   // } catch (uiErr) {
              //   //   console.error("Failed to create manual fallback UI:", uiErr);
              //   // }
              // }
            }
          }
        } catch (err) {
          console.error("Immediate redirect error:", err);
        }

      } catch (err) {
        console.error("Redirect error:", err);
      }
    }
  }, [loading, data]);

  if (loading) {
    return (
      <>
        <BarLoader width={"100%"} color="#36d7b7" />
        <br />
        Redirecting ....
      </>
    );
  }

  return null;
};

export default RedirectLink;
// ...existing code...