(function () {
  // Single roster config. Everyone is North America (NA), PvP.
  // Armory links use the verified character path
  // https://armorywowforever.com/c/forever/us/pvp/<Name-With-Hyphens>
  // (spaces become hyphens; the rest of the name stays as written).
  // When spec is set, the Role column reads as "<spec> <role>"
  // (for example "Discipline Healer"), matching the previous table.
  var guildConfig = {
    armoryCharacterBase: "https://armorywowforever.com/c/forever/us/pvp/",
    roster: [
      {
        name: "Wool Chucker",
        className: "Priest",
        spec: "Discipline",
        role: "Healer",
        rank: "GM",
        professions: "Herbalism / Alchemy",
        region: "North America (NA)",
        gameMode: "PvP"
      },
      {
        name: "Asmodeus Mommy",
        className: "Warlock",
        spec: "",
        role: "DPS",
        rank: "Officer",
        professions: "Enchanting / Tailoring",
        region: "North America (NA)",
        gameMode: "PvP"
      },
      {
        name: "Davy Crocketts",
        className: "Hunter",
        spec: "",
        role: "DPS",
        rank: "Officer",
        professions: "Leatherworking / Skinning",
        region: "North America (NA)",
        gameMode: "PvP"
      },
      {
        name: "Jack Body",
        className: "Mage",
        spec: "",
        role: "DPS",
        rank: "Officer",
        professions: "TBD",
        region: "North America (NA)",
        gameMode: "PvP"
      },
      {
        name: "Huzband Beeter",
        className: "Paladin",
        spec: "Ret",
        role: "DPS / Tank off-spec",
        rank: "Officer",
        professions: "Mining / Blacksmithing",
        region: "North America (NA)",
        gameMode: "PvP"
      }
    ]
  };

  function armoryHref(member) {
    return guildConfig.armoryCharacterBase + member.name.trim().replace(/\s+/g, "-");
  }

  var CLASS_COLORS = {
    Druid: "#FF7C0A",
    Hunter: "#AAD372",
    Mage: "#3FC7EB",
    Paladin: "#F48CBA",
    Priest: "#FFFFFF",
    Rogue: "#FFF468",
    Shaman: "#0070DD",
    Warlock: "#8788EE",
    Warrior: "#C69B6D"
  };

  var supportsPopover = typeof HTMLElement !== "undefined" &&
    typeof HTMLElement.prototype.showPopover === "function";

  var cards = [];

  function classColor(className) {
    return CLASS_COLORS[className] || "";
  }

  function roleColumn(member) {
    return member.spec ? member.spec + " " + member.role : member.role;
  }

  function classSpec(member) {
    return member.spec ? member.className + " · " + member.spec : member.className;
  }

  function badgeClass(rank) {
    return "badge " + String(rank || "").toLowerCase().replace(/\s+/g, "-");
  }

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function metaRow(label, value) {
    var row = make("div", "char-card-row");
    row.appendChild(make("span", "char-card-label", label));
    row.appendChild(make("span", "char-card-value", value));
    return row;
  }

  function buildCard(member, id) {
    var card = make("div", "char-card");
    card.id = id;
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", member.name);
    if (supportsPopover) card.setAttribute("popover", "manual");
    else card.classList.add("char-card-fallback");

    var color = classColor(member.className);
    if (color) card.style.setProperty("--class-color", color);

    var top = make("div", "card-ornament top");
    top.setAttribute("aria-hidden", "true");
    card.appendChild(top);

    var head = make("div", "char-card-head");
    head.appendChild(make("p", "char-card-name", member.name));
    head.appendChild(make("span", badgeClass(member.rank), member.rank));
    card.appendChild(head);

    var meta = make("div", "char-card-meta");
    meta.appendChild(metaRow("Class / Spec", classSpec(member)));
    meta.appendChild(metaRow("Role", member.role));
    meta.appendChild(metaRow("Professions", member.professions));
    card.appendChild(meta);

    var foot = make("div", "char-card-foot");
    var link = make("a", "char-card-armory");
    link.href = armoryHref(member);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.appendChild(document.createTextNode("Armory"));
    var external = make("span", "sr-only", " (opens in a new tab)");
    link.appendChild(external);
    var arrow = make("span", null, "↗");
    arrow.setAttribute("aria-hidden", "true");
    link.appendChild(arrow);
    foot.appendChild(link);
    card.appendChild(foot);

    var bottom = make("div", "card-ornament bottom");
    bottom.setAttribute("aria-hidden", "true");
    card.appendChild(bottom);

    return card;
  }

  function showCard(card) {
    card.classList.add("is-open");
    if (!supportsPopover) return;
    if (!card.matches(":popover-open")) card.showPopover();
  }

  function hideCard(card) {
    card.classList.remove("is-open");
    card.style.visibility = "";
    if (supportsPopover && card.matches(":popover-open")) card.hidePopover();
  }

  function placeCard(state) {
    var rect = state.trigger.getBoundingClientRect();
    var card = state.card;
    var margin = 10;
    var gap = 8;
    var width = card.offsetWidth;
    var height = card.offsetHeight;
    var top = rect.bottom + gap;
    if (top + height > window.innerHeight - margin) {
      var above = rect.top - gap - height;
      if (above >= margin) top = above;
    }
    if (top < margin) top = margin;
    if (top + height > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - margin - height);
    }
    var left = rect.left;
    if (left + width > window.innerWidth - margin) {
      left = window.innerWidth - margin - width;
    }
    if (left < margin) left = margin;
    card.style.top = Math.round(top) + "px";
    card.style.left = Math.round(left) + "px";
  }

  function closeCard(state) {
    if (!state.open) return;
    state.open = false;
    state.pinned = false;
    state.keyboard = false;
    state.suppressFocus = true;
    state.trigger.setAttribute("aria-expanded", "false");
    if (state.closeTimer) {
      clearTimeout(state.closeTimer);
      state.closeTimer = null;
    }
    hideCard(state.card);
    setTimeout(function () { state.suppressFocus = false; }, 0);
  }

  function closeOthers(current) {
    cards.forEach(function (state) {
      if (state !== current) closeCard(state);
    });
  }

  function openCard(state, pin) {
    var already = state.open;
    closeOthers(state);
    if (!already) {
      state.card.style.visibility = "hidden";
      showCard(state.card);
      placeCard(state);
      state.card.style.visibility = "visible";
    } else {
      placeCard(state);
    }
    state.open = true;
    state.pinned = !!pin;
    state.trigger.setAttribute("aria-expanded", "true");
  }

  function scheduleClose(state) {
    if (state.pinned) return;
    if (state.closeTimer) clearTimeout(state.closeTimer);
    state.closeTimer = setTimeout(function () {
      state.closeTimer = null;
      if (state.pinned) return;
      if (state.keyboard) {
        var active = document.activeElement;
        if (active && (state.card.contains(active) || state.trigger === active)) return;
      }
      closeCard(state);
    }, 180);
  }

  function bindCard(state) {
    var trigger = state.trigger;
    var card = state.card;
    var pointerFocus = false;

    trigger.addEventListener("pointerdown", function (e) {
      pointerFocus = true;
      state.downWhilePinned = !!(state.open && state.pinned && e.pointerType === "touch");
      if (e.pointerType === "touch") state.touchedAt = Date.now();
      setTimeout(function () { pointerFocus = false; }, 600);
    });

    trigger.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch") return;
      if (state.touchedAt && Date.now() - state.touchedAt < 800) return;
      if (state.closeTimer) {
        clearTimeout(state.closeTimer);
        state.closeTimer = null;
      }
      if (!state.open) openCard(state, false);
    });

    trigger.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      scheduleClose(state);
    });

    card.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch") return;
      if (state.closeTimer) {
        clearTimeout(state.closeTimer);
        state.closeTimer = null;
      }
    });

    card.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      scheduleClose(state);
    });

    trigger.addEventListener("focus", function () {
      if (pointerFocus || state.suppressFocus) {
        pointerFocus = false;
        return;
      }
      state.keyboard = true;
      openCard(state, false);
    });

    trigger.addEventListener("click", function (e) {
      var fromTouch = e.pointerType === "touch" ||
        (state.touchedAt && Date.now() - state.touchedAt < 800);
      if (!fromTouch) return;
      // A tap that starts while the card is already open follows the name link.
      // The opening tap, and any ghost click after it, stays on this page.
      if (state.downWhilePinned) return;
      e.preventDefault();
      if (!state.open) openCard(state, true);
    });

    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeCard(state);
        return;
      }
      if (e.key !== "Tab" || e.shiftKey || !state.open) return;
      var armory = card.querySelector(".char-card-armory");
      if (!armory) return;
      e.preventDefault();
      armory.focus();
    });

    var armoryLink = card.querySelector(".char-card-armory");
    if (armoryLink) {
      armoryLink.addEventListener("keydown", function (e) {
        if (e.key === "Tab" && e.shiftKey) {
          e.preventDefault();
          trigger.focus();
        } else if (e.key === "Escape") {
          e.stopPropagation();
          closeCard(state);
          trigger.focus();
        }
      });
    }

    card.addEventListener("click", function (e) {
      var target = e.target;
      if (target && target.closest && target.closest("a")) return;
      if (state.pinned) closeCard(state);
    });
  }

  function triggerVisible(trigger) {
    var rect = trigger.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    var wrap = trigger.closest(".table-wrap");
    var bounds = wrap ? wrap.getBoundingClientRect() : {
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight
    };
    var vertically = rect.bottom > Math.max(0, bounds.top) && rect.top < Math.min(window.innerHeight, bounds.bottom);
    var horizontally = rect.right > Math.max(0, bounds.left) && rect.left < Math.min(window.innerWidth, bounds.right);
    return vertically && horizontally;
  }

  function repositionOpen() {
    cards.forEach(function (state) {
      if (!state.open) return;
      if (!triggerVisible(state.trigger)) {
        closeCard(state);
        return;
      }
      placeCard(state);
    });
  }

  function renderRoster() {
    var tbody = document.getElementById("rosterBody");
    if (!tbody) return;
    tbody.textContent = "";

    guildConfig.roster.forEach(function (member, index) {
      var tr = document.createElement("tr");
      if (member.rank === "GM") tr.className = "rank-gm";

      var nameCell = document.createElement("td");
      var href = armoryHref(member);
      var trigger = make("a", "char char-trigger");
      trigger.href = href;
      trigger.target = "_blank";
      trigger.rel = "noopener noreferrer";
      trigger.appendChild(document.createTextNode(member.name));
      var described = make("span", "sr-only", ", " + [
        member.rank,
        classSpec(member),
        member.role,
        member.professions
      ].join(", ") + " (opens in a new tab)");
      trigger.appendChild(described);

      var color = classColor(member.className);
      if (color) trigger.style.setProperty("--class-color", color);

      var cardId = "char-card-" + index;
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", cardId);

      var card = buildCard(member, cardId);
      nameCell.appendChild(trigger);
      tr.appendChild(nameCell);

      tr.appendChild(make("td", null, member.className));
      tr.appendChild(make("td", null, roleColumn(member)));

      var rankCell = document.createElement("td");
      rankCell.appendChild(make("span", badgeClass(member.rank), member.rank));
      tr.appendChild(rankCell);

      tr.appendChild(make("td", null, member.professions));
      tbody.appendChild(tr);
      document.body.appendChild(card);

      var state = {
        trigger: trigger,
        card: card,
        open: false,
        pinned: false,
        keyboard: false,
        suppressFocus: false,
        closeTimer: null,
        touchedAt: 0,
        downWhilePinned: false
      };
      cards.push(state);
      bindCard(state);
    });
  }

  renderRoster();

  document.addEventListener("pointerdown", function (e) {
    var target = e.target;
    if (!target || !target.closest) return;
    var inside = target.closest(".char-trigger") || target.closest(".char-card");
    if (!inside) closeOthers(null);
  });

  document.addEventListener("focusin", function (e) {
    cards.forEach(function (state) {
      if (!state.open) return;
      if (e.target === state.trigger || state.card.contains(e.target)) return;
      closeCard(state);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    cards.forEach(function (state) {
      if (!state.open) return;
      var restore = state.card.contains(document.activeElement);
      closeCard(state);
      if (restore) state.trigger.focus();
    });
  });

  window.addEventListener("resize", repositionOpen);
  window.addEventListener("scroll", repositionOpen, true);

  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  var form = document.getElementById("applyForm");
  var result = document.getElementById("applyResult");
  var applyText = document.getElementById("applyText");
  var copyBtn = document.getElementById("copyBtn");
  var copyStatus = document.getElementById("copyStatus");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("open");
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

      var data = {
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
      var text = applyText.textContent || "";
      if (!text) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          var ta = document.createElement("textarea");
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
