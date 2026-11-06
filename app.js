(function () {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  const form = document.getElementById("applyForm");
  const result = document.getElementById("applyResult");
  const applyText = document.getElementById("applyText");
  const copyBtn = document.getElementById("copyBtn");
  const copyStatus = document.getElementById("copyStatus");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      const open = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  function buildApplication(data) {
    return [
      "=== Butterflies in my Azz — Guild Application ===",
      "Character: " + data.charName,
      "Class: " + data.className,
      "Spec: " + data.spec,
      "Experience: " + (data.experience || "(not provided)"),
      "Contact: " + (data.contact || "(not provided)"),
      "Why join:",
      data.why,
      "===============================================",
      "Please whisper / message a guild officer with this text."
    ].join("\n");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const data = {
        charName: form.charName.value.trim(),
        className: form.className.value,
        spec: form.spec.value.trim(),
        experience: form.experience.value.trim(),
        contact: form.contact.value.trim(),
        why: form.why.value.trim()
      };

      applyText.textContent = buildApplication(data);
      result.hidden = false;
      copyStatus.textContent = "";
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    form.addEventListener("reset", function () {
      result.hidden = true;
      applyText.textContent = "";
      copyStatus.textContent = "";
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      const text = applyText.textContent || "";
      if (!text) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        copyStatus.textContent = "Copied! Paste it to an officer.";
      } catch (err) {
        copyStatus.textContent = "Couldn’t copy automatically — select the text and copy manually.";
        copyStatus.style.color = "var(--danger)";
      }
    });
  }
})();
