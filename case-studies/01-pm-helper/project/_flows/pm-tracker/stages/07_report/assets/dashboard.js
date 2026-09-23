(function () {
  "use strict";
  var D = JSON.parse(document.getElementById("data").textContent);
  var NS = "http://www.w3.org/2000/svg";
  var IMP = { normal: 0, high: 1, critical: 2 };
  var LINK_TEXT = { continuation: "continues", attachment_of: "attachment of", related: "related" };
  var KIND_TEXT = { original: "Original", reply: "Reply", forward: "Forward", file: "File" };
  var TYPE_ORDER = ["decision", "action", "risk", "issue", "change", "milestone", "meeting", "note"];
  var AXIS = 34, LH = 74;

  var MSG = {}, THR = {}, AREA = {}, EVBYMSG = {};
  D.messages.forEach(function (m) { MSG[m.key] = m; });
  D.threads.forEach(function (t) { THR[t.id] = t; });
  D.areas.forEach(function (a) { AREA[a.code] = a; });
  D.events.forEach(function (e) { if (e.msg) (EVBYMSG[e.msg] = EVBYMSG[e.msg] || []).push(e); });
  Object.keys(EVBYMSG).forEach(function (k) {
    EVBYMSG[k].sort(function (a, b) { return IMP[b.imp] - IMP[a.imp]; });
  });

  var state = { tags: {}, area: "all", imp: "all", st: "all", q: "", compress: true, suggested: true,
                zoom: 1, sel: null, view: null };

  /* ------------------------------------------------------------ helpers */
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function sv(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function dayNum(d) { var p = d.split("-"); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000); }
  function dayLabel(d) {
    var p = d.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).toLocaleDateString("en-GB",
      { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  }
  function abs(m) { return dayNum(m.day) * 1440 + m.mod; }
  function daysBetween(m) {
    return Math.max(0, Math.floor(((dayNum(D.asOfDay) * 1440 + D.asOfMod) - abs(m)) / 1440));
  }
  function trunc(s, n) { s = s || ""; return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  function srcLink(src, cls) {
    var w = el("span", "src " + (cls || ""));
    var a = el("a", "", src.label); a.href = src.href; a.title = "Open the verbatim text";
    w.appendChild(a);
    if (src.orig) { var o = el("a", "orig", "original"); o.href = src.orig; o.title = "Open the original file"; w.appendChild(o); }
    return w;
  }

  /* ------------------------------------------------------------ glyphs (shape carries the identity) */
  function glyph(type, s) {
    var g = sv("g", { style: "fill:var(--t-" + type + ");stroke:none" });
    var a = s * 0.9;
    if (type === "decision") g.appendChild(sv("polygon", { points: [0, -s, a, 0, 0, s, -a, 0].join(",") }));
    else if (type === "action") g.appendChild(sv("polygon", { points: [-a * .8, -s, a, 0, -a * .8, s].join(",") }));
    else if (type === "risk") g.appendChild(sv("polygon", { points: [0, -s, s, s * .85, -s, s * .85].join(",") }));
    else if (type === "issue") {
      g.appendChild(sv("circle", { r: s }));
      g.appendChild(sv("rect", { x: -s * .12, y: -s * .55, width: s * .24, height: s * .65, style: "fill:var(--card)" }));
      g.appendChild(sv("rect", { x: -s * .12, y: s * .3, width: s * .24, height: s * .24, style: "fill:var(--card)" }));
    }
    else if (type === "change") g.appendChild(sv("rect", { x: -a * .85, y: -a * .85, width: a * 1.7, height: a * 1.7, rx: 1 }));
    else if (type === "milestone") {
      var pts = [];
      for (var i = 0; i < 10; i++) {
        var r = i % 2 ? s * .45 : s * 1.1, ang = -Math.PI / 2 + i * Math.PI / 5;
        pts.push((r * Math.cos(ang)).toFixed(2) + "," + (r * Math.sin(ang)).toFixed(2));
      }
      g.appendChild(sv("polygon", { points: pts.join(" ") }));
    }
    else if (type === "meeting") g.appendChild(sv("circle", { r: s * .8, style: "fill:none;stroke:var(--t-meeting);stroke-width:2" }));
    else g.appendChild(sv("rect", { x: -s, y: -s * .35, width: s * 2, height: s * .7, rx: 1 }));
    return g;
  }
  function glyphIcon(type, size) {
    var s = sv("svg", { width: size, height: size, viewBox: "-8 -8 16 16" });
    s.appendChild(glyph(type, 6));
    return s;
  }

  /* ------------------------------------------------------------ thread state, filters */
  function stateText(t, short) {
    if (t.state === "awaiting" && short) return (t.stale ? "⚠ " : "⏳ ") + "waiting · " + t.days + " d";
    if (t.state === "awaiting") return (t.stale ? "⚠ Overdue: " : "⏳ ") + "waiting for " + (t.awaiting === "—" ? "a reply" : t.awaiting) +
      " · " + plural(t.days, "day");
    return { closed: "✓ Closed", ended: "Nothing expected", continued: "→ Continued elsewhere", unclear: "Unclear" }[t.state] || t.state;
  }
  function statePill(t, short) {
    var p = el("span", "state", stateText(t, short));
    if (short) p.title = stateText(t);
    p.setAttribute("data-s", t.state);
    if (t.stale) p.setAttribute("data-stale", "1");
    return p;
  }
  function evMatches(e) {
    if (state.area !== "all" && e.area !== state.area) return false;
    if (state.imp === "high" && IMP[e.imp] < 1) return false;
    if (state.imp === "critical" && IMP[e.imp] < 2) return false;
    return true;
  }
  function filtersOnEvents() { return state.area !== "all" || state.imp !== "all"; }
  function threadEvents(t) {
    var out = [];
    t.messages.forEach(function (k) { (EVBYMSG[k] || []).forEach(function (e) { out.push(e); }); });
    return out;
  }
  function threadText(t) {
    var s = [t.title, t.tags.join(" ")];
    t.messages.forEach(function (k) { var m = MSG[k]; s.push(m.name, m.preview, m.src.label); });
    threadEvents(t).forEach(function (e) { s.push(e.title, e.owner); });
    return s.join(" ").toLowerCase();
  }
  function threadVisible(t) {
    if (state.st === "awaiting" && t.state !== "awaiting") return false;
    if (state.st === "done" && t.state === "awaiting") return false;
    var wanted = Object.keys(state.tags).filter(function (k) { return state.tags[k]; });
    if (wanted.length && !wanted.some(function (x) { return t.tags.indexOf(x) >= 0; })) return false;
    if (filtersOnEvents() && !threadEvents(t).some(evMatches)) return false;
    if (state.q && threadText(t).indexOf(state.q) < 0) return false;
    return true;
  }
  function visibleThreads() { return D.threads.filter(threadVisible); }

  /* ------------------------------------------------------------ overview */
  function renderStats() {
    var host = $("#stats"), s = D.stats;
    [[s.docs, "source files"], [s.messages, "messages"], [s.threads, "conversations"],
     [s.events, "events extracted"], [s.open, "open items"], [s.awaiting, "waiting for a reply"], [s.stale, "overdue replies"]]
      .forEach(function (p) {
        var b = el("div"); b.appendChild(el("div", "stat", String(p[0]))); b.appendChild(el("div", "stat-lbl", p[1]));
        if (p[1] === "overdue replies" && p[0] > 0) b.firstChild.style.color = "var(--red)";
        host.appendChild(b);
      });
  }
  var TONE_TEXT = { red: "▲ Red", yellow: "◆ Yellow", green: "● Green", gray: "○ No data" };
  function renderAreas() {
    var host = $("#areaGrid");
    D.areas.forEach(function (a) {
      var c = el("div", "card area-tile"); c.setAttribute("data-tone", a.tone);
      var head = el("div", "area-head");
      head.appendChild(el("span", "area-num", String(a.index)));
      head.appendChild(el("div", "area-name", a.name));
      c.appendChild(head);
      var p = el("span", "pill", TONE_TEXT[a.tone]); p.setAttribute("data-tone", a.tone); c.appendChild(p);
      c.appendChild(el("div", "area-desc", a.description));
      c.appendChild(el("div", "area-divider"));
      c.appendChild(el("div", "area-conclusion", a.conclusion));
      c.appendChild(el("div", "area-count", plural(a.count, "event") + " in the database"));
      host.appendChild(c);
    });
    var lg = $("#statusLegend");
    D.statusRules.forEach(function (r) {
      var li = el("li"); var p = el("span", "pill", TONE_TEXT[r.tone]); p.setAttribute("data-tone", r.tone);
      li.appendChild(p); li.appendChild(el("span", "", r.text)); lg.appendChild(li);
    });
  }
  function renderAttention() {
    var w = $("#waitingList"), waiting = D.threads.filter(function (t) { return t.state === "awaiting"; })
      .sort(function (a, b) { return b.days - a.days; });
    $("#waitingNote").textContent = "A message that asks for something and has no later answer. Counted up to the newest message in the data (" +
      D.asOf + ", " + D.zone + "); overdue after " + plural(D.staleAfterDays, "day") + ".";
    if (!waiting.length) w.appendChild(el("div", "empty-note", "No conversation is waiting for a reply."));
    waiting.forEach(function (t) {
      var r = el("div", "row"); r.setAttribute("data-tone", t.stale ? "red" : "yellow");
      var b = el("div", "row-body");
      var title = el("a", "row-title", t.title); title.href = "#thr-" + t.id;
      title.addEventListener("click", function (ev) { ev.preventDefault(); gotoThread(t.id); });
      b.appendChild(title);
      var meta = el("div", "row-meta"); meta.appendChild(statePill(t));
      var pend = null;
      t.messages.forEach(function (k) { if (MSG[k].state === "no_reply") pend = MSG[k]; });
      if (pend) { meta.appendChild(el("span", "", "asked by " + pend.name + ", " + pend.label)); meta.appendChild(srcLink(pend.src)); }
      b.appendChild(meta); r.appendChild(b); w.appendChild(r);
    });
    var rl = $("#riskList"), risks = D.events.filter(function (e) { return (e.type === "risk" || e.type === "issue") && e.status === "open"; })
      .sort(function (a, b) { return IMP[b.imp] - IMP[a.imp]; });
    if (!risks.length) rl.appendChild(el("div", "empty-note", "No open risks or issues."));
    risks.forEach(function (e) {
      var r = el("div", "row"); r.setAttribute("data-tone", e.imp === "critical" ? "red" : e.imp === "high" ? "yellow" : "gray");
      r.appendChild(glyphIcon(e.type, 18));
      var b = el("div", "row-body"); b.appendChild(el("div", "row-title", e.title));
      var meta = el("div", "row-meta");
      meta.appendChild(el("span", "", (e.imp === "critical" ? "Critical " : e.imp === "high" ? "High " : "") + e.type));
      meta.appendChild(el("span", "", "Area: " + (AREA[e.area] ? AREA[e.area].name : e.area)));
      if (e.owner !== "—") meta.appendChild(el("span", "", "Owner: " + e.owner));
      if (e.due !== "—") meta.appendChild(el("span", "", "Due: " + e.due));
      meta.appendChild(srcLink(e.src));
      b.appendChild(meta); r.appendChild(b); rl.appendChild(r);
    });
  }

  /* ------------------------------------------------------------ filters bar */
  function initFilters() {
    var sel = $("#fArea"); var o = el("option", "", "all areas"); o.value = "all"; sel.appendChild(o);
    D.areas.forEach(function (a) { var x = el("option", "", a.name); x.value = a.code; sel.appendChild(x); });
    var tags = {}; D.threads.forEach(function (t) { t.tags.forEach(function (g) { tags[g] = (tags[g] || 0) + 1; }); });
    var row = $("#tagRow");
    Object.keys(tags).sort().forEach(function (g) {
      var c = el("button", "chip", g + " (" + tags[g] + ")"); c.type = "button";
      c.addEventListener("click", function () { state.tags[g] = !state.tags[g]; c.classList.toggle("is-on", !!state.tags[g]); renderCorr(); });
      row.appendChild(c);
    });
    $("#q").addEventListener("input", function (e) { state.q = e.target.value.trim().toLowerCase(); renderCorr(); });
    sel.addEventListener("change", function (e) { state.area = e.target.value; renderCorr(); });
    $("#fImp").addEventListener("change", function (e) { state.imp = e.target.value; renderCorr(); });
    $("#fState").addEventListener("change", function (e) { state.st = e.target.value; renderCorr(); });
    $("#cCompress").addEventListener("change", function (e) { state.compress = e.target.checked; renderTimeline(); });
    $("#cSuggested").addEventListener("change", function (e) { state.suggested = e.target.checked; renderTimeline(); });
    $("#zoomIn").addEventListener("click", function () { state.zoom = Math.min(4, state.zoom * 1.35); renderTimeline(); });
    $("#zoomOut").addEventListener("click", function () { state.zoom = Math.max(.4, state.zoom / 1.35); renderTimeline(); });
    $("#zoneNote").textContent = "Times are shown in " + D.zone + ". Where a message quotes a clock time in another zone, the order of the reply chain wins.";
  }

  /* ------------------------------------------------------------ timeline */
  function renderLegend() {
    var host = $("#tlLegend"); clear(host);
    function item(icon, text) { var li = el("li"); li.appendChild(icon); li.appendChild(el("span", "", text)); host.appendChild(li); }
    function mini(build) { var s = sv("svg", { width: 34, height: 16, viewBox: "0 0 34 16" }); build(s); return s; }
    item(mini(function (s) { s.appendChild(sv("circle", { cx: 17, cy: 8, r: 6, style: "fill:var(--accent)" })); }), "written by us");
    item(mini(function (s) { s.appendChild(sv("circle", { cx: 17, cy: 8, r: 5, style: "fill:var(--card);stroke:var(--text-2);stroke-width:2" })); }), "written by the other side");
    item(mini(function (s) { s.appendChild(sv("rect", { x: 11, y: 2, width: 12, height: 12, rx: 2, style: "fill:var(--text-3)" })); }), "file (Word, presentation)");
    item(mini(function (s) { s.appendChild(sv("line", { x1: 2, y1: 8, x2: 32, y2: 8, style: "stroke:var(--text-3);stroke-width:1.5" })); }), "reply to the message before it");
    item(mini(function (s) { s.appendChild(sv("path", { d: "M2,12 C14,12 20,4 32,4", style: "fill:none;stroke:var(--accent);stroke-width:2" })); }), "link between conversations, confirmed");
    item(mini(function (s) { s.appendChild(sv("path", { d: "M2,12 C14,12 20,4 32,4", style: "fill:none;stroke:var(--accent);stroke-width:1.8;stroke-dasharray:6 4" })); }), "link proposed by the model, waiting for your decision");
    item(mini(function (s) { s.appendChild(sv("line", { x1: 2, y1: 8, x2: 32, y2: 8, style: "stroke:var(--yellow);stroke-width:1.8;stroke-dasharray:3 3" })); }), "no reply yet");
    TYPE_ORDER.forEach(function (t) { item(glyphIcon(t, 16), D.typeLabel[t] || t); });
  }

  function layout(msgs) {
    var days = {}; msgs.forEach(function (m) { days[m.day] = 1; }); days[D.asOfDay] = 1;
    var list = Object.keys(days).sort(), x0 = 14, DW = 190 * state.zoom, GAP = 54, PPD = 64 * state.zoom;
    // a busy day (many messages in one conversation) gets more room so the dots do not pile up
    var cnt = {}, need = {};
    msgs.forEach(function (m) { var k = m.day + "|" + m.thread; cnt[k] = (cnt[k] || 0) + 1; });
    Object.keys(cnt).forEach(function (k) { var d = k.split("|")[0]; need[d] = Math.max(need[d] || 0, cnt[k]); });
    var base = {}, wd = {}, gaps = [], cursor = x0;
    if (state.compress) {
      list.forEach(function (d, i) {
        base[d] = cursor; wd[d] = Math.max(DW, (need[d] || 0) * 34 * state.zoom + 70); cursor += wd[d];
        if (i < list.length - 1) {
          var g = dayNum(list[i + 1]) - dayNum(d) - 1;
          if (g > 0) { gaps.push({ x: cursor, w: GAP, n: g }); cursor += GAP; }
        }
      });
    } else {
      cursor = x0 + (dayNum(list[list.length - 1]) - dayNum(list[0]) + 1) * PPD;
    }
    return {
      days: list, gaps: gaps, width: cursor + 90,
      x: function (day, mod) {
        return state.compress ? base[day] + mod / 1440 * wd[day] : x0 + (dayNum(day) - dayNum(list[0])) * PPD + mod / 1440 * PPD;
      }
    };
  }

  function renderTimeline() {
    var TS = visibleThreads(), labels = $("#tlLabels"), svg = $("#tlSvg");
    clear(labels); clear(svg); renderLegend();
    if (!TS.length) {
      labels.appendChild(el("p", "empty-note", "No conversation matches the filters."));
      svg.setAttribute("width", 10); svg.setAttribute("height", 10); return;
    }
    var msgs = [];
    TS.forEach(function (t) {
      var fallback = null;
      t.messages.forEach(function (k) { var m = MSG[k]; if (m.mod >= 0) { fallback = fallback || m; msgs.push(m); } });
    });
    var L = layout(msgs), H = AXIS + TS.length * LH + 16, pos = {}, laneOf = {};
    svg.setAttribute("width", L.width); svg.setAttribute("height", H); svg.setAttribute("viewBox", "0 0 " + L.width + " " + H);

    // lane bands and labels
    TS.forEach(function (t, i) {
      laneOf[t.id] = i;
      if (i % 2 === 0) svg.appendChild(sv("rect", { x: 0, y: AXIS + i * LH, width: L.width, height: LH, style: "fill:var(--lane)" }));
      svg.appendChild(sv("line", { x1: 0, x2: L.width, y1: AXIS + (i + 1) * LH, y2: AXIS + (i + 1) * LH, style: "stroke:var(--rule)" }));
      var lab = el("div", "tl-label"); lab.title = "Open this conversation";
      lab.appendChild(el("div", "t", t.title));
      var s = el("div", "s"); s.appendChild(statePill(t, true));
      t.tags.slice(0, 2).forEach(function (g) { s.appendChild(el("span", "tag", g)); });
      lab.appendChild(s);
      lab.addEventListener("click", function () { gotoThread(t.id); });
      labels.appendChild(lab);
    });
    // day columns, idle-day gaps, "data up to" line
    L.days.forEach(function (d) {
      var x = L.x(d, 0);
      svg.appendChild(sv("line", { x1: x, x2: x, y1: AXIS - 6, y2: H, style: "stroke:var(--rule)" }));
      svg.appendChild(sv("text", { x: x + 4, y: 20, "font-size": 11, "font-weight": 600 }, dayLabel(d)));
    });
    L.gaps.forEach(function (g) {
      svg.appendChild(sv("rect", { x: g.x, y: AXIS, width: g.w, height: H - AXIS, style: "fill:var(--rule);opacity:.35" }));
      svg.appendChild(sv("text", { x: g.x + g.w / 2, y: AXIS + 14, "text-anchor": "middle", "font-size": 10 }, "⋯ " + plural(g.n, "idle day")));
    });
    var xa = L.x(D.asOfDay, D.asOfMod);
    svg.appendChild(sv("line", { x1: xa, x2: xa, y1: AXIS - 6, y2: H, style: "stroke:var(--text-3);stroke-dasharray:2 3" }));
    svg.appendChild(sv("text", { x: xa + 4, y: 8, "font-size": 9.5 }, "newest message in the data"));

    // positions (with a small nudge so nodes in one lane never overlap)
    TS.forEach(function (t, i) {
      var y = AXIS + i * LH + 46, prev = -1e9;
      t.messages.map(function (k) { return MSG[k]; }).filter(function (m) { return m.mod >= 0; })
        .sort(function (a, b) { return L.x(a.day, a.mod) - L.x(b.day, b.mod); })
        .forEach(function (m) {
          var x = Math.max(L.x(m.day, m.mod), prev + 16); prev = x; pos[m.key] = { x: x, y: y, m: m, lane: i };
        });
    });
    var kids = {};
    // reply edges (a reply is joined to the message it answers)
    Object.keys(pos).forEach(function (k) {
      var p = pos[k], parent = pos[p.m.repliesTo];
      if (!parent || THR[p.m.thread] !== THR[parent.m.thread]) return;
      var n = kids[p.m.repliesTo] = (kids[p.m.repliesTo] || 0) + 1;
      var d = n === 1 ? "M" + parent.x + "," + parent.y + " L" + p.x + "," + p.y :
        "M" + parent.x + "," + parent.y + " Q" + (parent.x + p.x) / 2 + "," + (parent.y - 8 - 7 * n) + " " + p.x + "," + p.y;
      svg.appendChild(sv("path", { d: d, style: "fill:none;stroke:var(--text-3);stroke-width:1.5" }));
    });
    // unanswered messages: dashed tail up to the newest message in the data
    Object.keys(pos).forEach(function (k) {
      var p = pos[k], m = p.m;
      if (m.state !== "no_reply" || THR[m.thread].state === "continued") return;
      var days = daysBetween(m), stale = days >= D.staleAfterDays, col = stale ? "var(--red)" : "var(--yellow)";
      var end = Math.max(xa, p.x + 56);
      svg.appendChild(sv("line", { x1: p.x + 8, x2: end, y1: p.y, y2: p.y, style: "stroke:" + col + ";stroke-width:1.8;stroke-dasharray:3 3" }));
      svg.appendChild(sv("text", { x: p.x + 10, y: p.y + 17, "font-size": 10.5, style: "fill:" + col + " !important;font-weight:700" },
        (stale ? "⚠ " : "⏳ ") + "no reply · " + plural(days, "day")));
    });
    // closed conversations get an end mark after the last message
    TS.forEach(function (t) {
      if (t.state !== "closed") return;
      var last = pos[t.messages[t.messages.length - 1]]; if (!last) return;
      svg.appendChild(sv("text", { x: last.x + 11, y: last.y + 4, "font-size": 11, "font-weight": 700, style: "fill:var(--green) !important" }, "✓ closed"));
    });

    // links between conversations: solid = confirmed, dashed = proposed by the model
    D.links.forEach(function (lk) {
      if (lk.status === "rejected" || (lk.status === "suggested" && !state.suggested)) return;
      var a = pos[lk.left], b = pos[lk.right]; if (!a || !b) return;
      var dx = Math.max(40, Math.abs(b.x - a.x) / 2);
      var d = "M" + a.x + "," + a.y + " C" + (a.x + dx) + "," + a.y + " " + (b.x - dx) + "," + b.y + " " + b.x + "," + b.y;
      var g = sv("g", { class: "lk", tabindex: 0, role: "button", "aria-label": LINK_TEXT[lk.kind] + " link, " + lk.status });
      g.appendChild(sv("path", { d: d, style: "fill:none;stroke:transparent;stroke-width:14;cursor:pointer" }));
      var col = lk.kind === "related" && lk.status === "confirmed" ? "var(--text-3)" : "var(--accent)";
      var vis = sv("path", { d: d, style: "fill:none;stroke:" + col + ";stroke-width:" + (lk.status === "confirmed" ? 2.2 : 1.8) +
        (lk.status === "suggested" ? ";stroke-dasharray:6 4" : "") });
      g.appendChild(vis);
      var mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      g.appendChild(sv("text", { x: mid.x, y: mid.y - 5, "text-anchor": "middle", "font-size": 10.5, "font-weight": 700,
        style: "fill:" + col + " !important;paint-order:stroke;stroke:var(--card);stroke-width:3px" },
        LINK_TEXT[lk.kind] + (lk.status === "suggested" ? " · to decide" : "")));
      g.addEventListener("click", function () { openLink(lk); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter") openLink(lk); });
      g.addEventListener("mouseenter", function () { vis.style.strokeWidth = "3.4"; });
      g.addEventListener("mouseleave", function () { vis.style.strokeWidth = lk.status === "confirmed" ? "2.2" : "1.8"; });
      svg.appendChild(g);
    });

    // nodes and event glyphs
    Object.keys(pos).forEach(function (k) {
      var p = pos[k], m = p.m, stale = m.state === "no_reply" && daysBetween(m) >= D.staleAfterDays;
      var g = sv("g", { class: "node", tabindex: 0, role: "button", "aria-label": m.name + ", " + m.label });
      if (m.state === "no_reply" && THR[m.thread].state !== "continued")
        g.appendChild(sv("circle", { cx: p.x, cy: p.y, r: 10, style: "fill:none;stroke:" + (stale ? "var(--red)" : "var(--yellow)") + ";stroke-width:1.6" }));
      if (state.sel === k) g.appendChild(sv("circle", { cx: p.x, cy: p.y, r: 11, style: "fill:none;stroke:var(--text);stroke-width:2" }));
      if (m.kind === "file") g.appendChild(sv("rect", { x: p.x - 6, y: p.y - 6, width: 12, height: 12, rx: 2, style: "fill:var(--text-3)" }));
      else if (m.side === "ours") g.appendChild(sv("circle", { cx: p.x, cy: p.y, r: 6, style: "fill:var(--accent)" }));
      else g.appendChild(sv("circle", { cx: p.x, cy: p.y, r: 5, style: "fill:var(--card);stroke:var(--text-2);stroke-width:2" }));
      g.appendChild(sv("circle", { cx: p.x, cy: p.y, r: 12, style: "fill:transparent;cursor:pointer" }));
      var evs = EVBYMSG[k] || [];
      evs.slice(0, 3).forEach(function (e, i) {
        var gl = glyph(e.type, 5); gl.setAttribute("transform", "translate(" + p.x + "," + (p.y - 17 - i * 12) + ")");
        if (filtersOnEvents() && !evMatches(e)) gl.setAttribute("opacity", ".25");
        g.appendChild(gl);
      });
      if (evs.length > 3) g.appendChild(sv("text", { x: p.x + 8, y: p.y - 44, "font-size": 9.5, "font-weight": 700 }, "+" + (evs.length - 3)));
      g.addEventListener("click", function () { state.sel = k; openMessage(k); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter") { state.sel = k; openMessage(k); } });
      g.addEventListener("mousemove", function (e) { showTip(m.name + " · " + m.label + "\n" + THR[m.thread].title +
        (evs.length ? "\n" + plural(evs.length, "event") : ""), e); });
      g.addEventListener("mouseleave", hideTip);
      svg.appendChild(g);
    });
  }

  /* ------------------------------------------------------------ side panel, tooltip */
  function showTip(text, e) {
    var t = $("#tip"); t.hidden = false; t.style.whiteSpace = "pre-line"; t.textContent = text;
    t.style.left = Math.min(e.clientX + 14, window.innerWidth - 340) + "px"; t.style.top = (e.clientY + 14) + "px";
  }
  function hideTip() { $("#tip").hidden = true; }
  function openPanel(build) {
    var p = $("#panel"); clear(p); hideTip();
    var x = el("button", "x", "×"); x.type = "button"; x.setAttribute("aria-label", "Close"); x.addEventListener("click", closePanel);
    p.appendChild(x); build(p); p.hidden = false;
  }
  function closePanel() { $("#panel").hidden = true; state.sel = null; renderTimeline(); }
  function kv(p, k, v) { var d = el("div", "kv"); d.appendChild(el("b", "", k + ": ")); d.appendChild(document.createTextNode(v)); p.appendChild(d); }
  function openMessage(k) {
    var m = MSG[k], t = THR[m.thread];
    openPanel(function (p) {
      p.appendChild(el("div", "t-overline muted", KIND_TEXT[m.kind] + " · " + (m.side === "ours" ? "written by us" : m.side === "external" ? "written by the other side" : "author unknown")));
      p.appendChild(el("h3", "", m.name));
      kv(p, "When", m.label + " (" + D.zone + ")");
      if (m.written && m.written !== "—") kv(p, "As written in the source", m.written);
      if (m.to && m.to !== "—") kv(p, "To", m.to);
      var c = el("div", "kv"); c.appendChild(el("b", "", "Conversation: "));
      var a = el("a", "", t.title); a.href = "#thr-" + t.id; a.addEventListener("click", function (ev) { ev.preventDefault(); gotoThread(t.id); });
      c.appendChild(a); p.appendChild(c);
      p.appendChild(statePillWrap(t));
      var rs = { answered: "Answered by " + (MSG[m.answeredBy] ? MSG[m.answeredBy].name : "a later message"),
                 no_reply: "No reply yet" + (m.awaiting !== "—" ? " (asked of " + m.awaiting + ")" : "") + " · " + plural(daysBetween(m), "day"),
                 info: "Nothing was asked of the reader" }[m.state];
      kv(p, "Reply state", rs);
      if (m.repliesTo !== "—" && MSG[m.repliesTo]) kv(p, "Replies to", MSG[m.repliesTo].name + ", " + MSG[m.repliesTo].label);
      if (m.preview) p.appendChild(el("div", "quote", trunc(m.preview, 320)));
      (EVBYMSG[k] || []).forEach(function (e) {
        var r = el("div", "ev"); r.appendChild(glyphIcon(e.type, 16));
        var b = el("div", "ev-body"); b.appendChild(el("div", "ev-title", e.title));
        var f = el("div", "ev-foot"); f.appendChild(el("span", "", (D.typeLabel[e.type] || e.type) + " · " + (AREA[e.area] ? AREA[e.area].name : e.area)));
        if (e.owner !== "—") f.appendChild(el("span", "", "Owner: " + e.owner));
        if (e.due !== "—") f.appendChild(el("span", "", "Due: " + e.due));
        if (e.status !== "—") f.appendChild(el("span", "", "Status: " + e.status));
        b.appendChild(f); r.appendChild(b); p.appendChild(r);
      });
      var s = el("div", "kv"); s.appendChild(el("b", "", "Source: ")); s.appendChild(srcLink(m.src)); p.appendChild(s);
    });
    renderTimeline();
  }
  function statePillWrap(t) { var d = el("div", "kv"); d.appendChild(statePill(t)); return d; }
  function openLink(lk) {
    var a = THR[lk.from], b = THR[lk.to];
    openPanel(function (p) {
      p.appendChild(el("div", "t-overline muted", "Link between conversations"));
      p.appendChild(el("h3", "", "“" + a.title + "” " + LINK_TEXT[lk.kind] + " “" + b.title + "”"));
      kv(p, "Status", lk.status === "confirmed" ? "Confirmed by the PM" : "Proposed by the model — waiting for your decision");
      kv(p, "Model's confidence", lk.confidence);
      p.appendChild(el("div", "why", lk.reason));
      p.appendChild(el("div", "quote", lk.evidence));
      if (lk.status !== "confirmed")
        p.appendChild(el("p", "muted t-caption", "To decide: open _flows/pm-tracker/stages/04_relate/output/pending_review.md, write yes or no under this link and run review.py --apply."));
    });
  }

  /* ------------------------------------------------------------ conversations view */
  function renderThreads() {
    var host = $("#threadList"); clear(host);
    var TS = visibleThreads();
    if (!TS.length) host.appendChild(el("div", "empty-note", "No conversation matches the filters."));
    TS.forEach(function (t) {
      var d = el("details", "thr"); d.id = "thr-" + t.id; if (t.state === "awaiting") d.open = true;
      var s = el("summary"); s.appendChild(el("span", "ttl", t.title)); s.appendChild(statePill(t));
      t.tags.forEach(function (g) { s.appendChild(el("span", "tag", g)); });
      s.appendChild(el("span", "cnt", plural(t.messages.length, "message") + " · " + t.first + (t.messages.length > 1 ? " → " + t.last : "")));
      d.appendChild(s);
      var body = el("div", "thr-body");
      var lr = el("div", "links-row");
      D.links.forEach(function (lk) {
        if (lk.status === "rejected" || (lk.from !== t.id && lk.to !== t.id)) return;
        var other = THR[lk.from === t.id ? lk.to : lk.from];
        var txt = lk.from === t.id ? LINK_TEXT[lk.kind] + " → " + other.title : "← " + other.title + " " + LINK_TEXT[lk.kind] + " this";
        var b = el("button", "lnk" + (lk.status === "suggested" ? " suggested" : ""), (lk.status === "suggested" ? "(to decide) " : "") + trunc(txt, 90));
        b.type = "button"; b.addEventListener("click", function () { openLink(lk); }); lr.appendChild(b);
      });
      if (lr.childNodes.length) body.appendChild(lr);
      var lad = el("div", "ladder");
      t.messages.forEach(function (k) {
        var m = MSG[k], b = el("div", "bub " + m.side); b.id = "m-" + k;
        var h = el("div", "h"); h.appendChild(el("b", "", m.name)); h.appendChild(el("span", "muted", m.label));
        h.appendChild(el("span", "k", KIND_TEXT[m.kind]));
        if (m.state === "no_reply" && t.state !== "continued") {
          var st = daysBetween(m) >= D.staleAfterDays, bd = el("span", "state", (st ? "⚠ " : "⏳ ") + "no reply · " + plural(daysBetween(m), "day"));
          bd.setAttribute("data-s", "awaiting"); if (st) bd.setAttribute("data-stale", "1"); h.appendChild(bd);
        } else if (m.state === "answered") h.appendChild(el("span", "k", "✓ answered"));
        b.appendChild(h);
        if (m.repliesTo !== "—" && MSG[m.repliesTo]) b.appendChild(el("div", "reply-to", "↩ reply to " + MSG[m.repliesTo].name));
        if (m.preview) b.appendChild(el("div", "p", m.preview));
        var evs = EVBYMSG[k] || [];
        if (evs.length) {
          var ch = el("div", "chips");
          evs.forEach(function (e) {
            var c = el("span", "ev-chip"); c.appendChild(glyphIcon(e.type, 12)); c.appendChild(document.createTextNode(trunc(e.title, 70)));
            c.title = (D.typeLabel[e.type] || e.type) + ": " + e.title; ch.appendChild(c);
          });
          b.appendChild(ch);
        }
        var f = el("div", "foot"); f.appendChild(srcLink(m.src)); b.appendChild(f);
        lad.appendChild(b);
      });
      lad.appendChild(el("div", "endnote", stateText(t)));
      body.appendChild(lad); d.appendChild(body); host.appendChild(d);
    });
  }
  function gotoThread(id) {
    setView("threads");
    var t = THR[id];
    if (!threadVisible(t)) { state.q = ""; state.st = "all"; state.area = "all"; state.imp = "all"; state.tags = {}; syncFilterControls(); renderCorr(); }
    var d = document.getElementById("thr-" + id);
    if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }
  function syncFilterControls() {
    $("#q").value = ""; $("#fArea").value = "all"; $("#fImp").value = "all"; $("#fState").value = "all";
    Array.prototype.forEach.call(document.querySelectorAll("#tagRow .chip"), function (c) { c.classList.remove("is-on"); });
  }

  /* ------------------------------------------------------------ files (list) view */
  function renderList() {
    var host = $("#docList"); clear(host);
    D.docs.forEach(function (d) {
      var evs = d.events.filter(function (e) { return evMatches(e); });
      var text = (d.label + " " + d.file + " " + d.from.join(" ") + " " + d.events.map(function (e) { return e.title; }).join(" ")).toLowerCase();
      if (filtersOnEvents() && !evs.length) return;
      if (state.q && text.indexOf(state.q) < 0) return;
      var det = el("details", "doc");
      var s = el("summary");
      s.appendChild(el("span", "doc-date", d.date)); s.appendChild(el("span", "doc-kind", d.kind));
      var sub = el("span", "doc-subject"); var a = el("a", "", d.label.replace(/^[^·]*· /, "")); a.href = d.href; sub.appendChild(a); s.appendChild(sub);
      var th = THR[d.thread]; if (th) { var tb = el("button", "lnk", trunc(th.title, 40)); tb.type = "button"; tb.title = "Open the conversation";
        tb.addEventListener("click", function (ev) { ev.preventDefault(); gotoThread(th.id); }); s.appendChild(tb); }
      d.areas.forEach(function (c) { s.appendChild(el("span", "tag", AREA[c] ? AREA[c].name : c)); });
      s.appendChild(el("span", "cnt", plural(d.events.length, "event")));
      det.appendChild(s);
      var body = el("div", "doc-body"), meta = el("div", "doc-meta");
      [["From", d.from], ["To", d.to.length ? d.to : ["— (a document, not an e-mail)"]]].forEach(function (p) {
        var b = el("div"); b.appendChild(el("div", "k", p[0])); var v = el("div", "v");
        p[1].forEach(function (x) { v.appendChild(el("span", "", x)); }); b.appendChild(v); meta.appendChild(b);
      });
      var fb = el("div"); fb.appendChild(el("div", "k", "Files")); var fv = el("div", "v");
      fv.appendChild(srcLink({ label: d.label, href: d.href, orig: d.orig })); fb.appendChild(fv); meta.appendChild(fb);
      body.appendChild(meta);
      if (!d.events.length) body.appendChild(el("div", "no-events", "No new events — this file only repeats content captured elsewhere."));
      d.events.forEach(function (e) {
        var r = el("div", "ev"); r.appendChild(glyphIcon(e.type, 16));
        var b = el("div", "ev-body"); b.appendChild(el("div", "ev-title", e.title));
        var f = el("div", "ev-foot"); f.appendChild(el("span", "", (D.typeLabel[e.type] || e.type) + " · " + (AREA[e.area] ? AREA[e.area].name : e.area)));
        if (e.imp !== "normal") f.appendChild(el("span", "", "Importance: " + e.imp));
        if (e.owner !== "—") f.appendChild(el("span", "", "Owner: " + e.owner));
        if (e.due !== "—") f.appendChild(el("span", "", "Due: " + e.due));
        if (e.status !== "—") f.appendChild(el("span", "", "Status: " + e.status));
        b.appendChild(f); r.appendChild(b); body.appendChild(r);
      });
      det.appendChild(body); host.appendChild(det);
    });
    if (!host.childNodes.length) host.appendChild(el("div", "empty-note", "No file matches the filters."));
  }

  /* ------------------------------------------------------------ views, theme, start */
  function renderCorr() { renderTimeline(); renderThreads(); renderList(); }
  function setView(v) {
    state.view = v;
    ["timeline", "threads", "list"].forEach(function (n) { $("#view-" + n).hidden = n !== v; });
    Array.prototype.forEach.call(document.querySelectorAll("#viewTabs button"), function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-view") === v ? "true" : "false");
    });
    try { localStorage.setItem("pm-dashboard-view", v); } catch (e) {}
  }
  function initTheme() {
    var root = document.documentElement, btn = $("#themeToggle"), stored = null;
    try { stored = localStorage.getItem("pm-dashboard-theme"); } catch (e) {}
    if (stored === "dark" || stored === "light") root.setAttribute("data-theme", stored);
    function isDark() { var s = root.getAttribute("data-theme"); return s ? s === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; }
    function sync() { btn.textContent = isDark() ? "Light mode" : "Dark mode"; }
    btn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark"; root.setAttribute("data-theme", next);
      try { localStorage.setItem("pm-dashboard-theme", next); } catch (e) {}
      sync();
    });
    sync();
  }
  function initPan() {
    var sc = $("#tlScroll"), down = false, sx = 0, sl = 0;
    sc.addEventListener("pointerdown", function (e) { if (e.target.closest(".node,.lk")) return; down = true; sx = e.clientX; sl = sc.scrollLeft; sc.classList.add("drag"); });
    window.addEventListener("pointermove", function (e) { if (down) sc.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener("pointerup", function () { down = false; sc.classList.remove("drag"); });
  }

  renderStats(); renderAreas(); renderAttention(); initFilters(); initTheme(); initPan();
  Array.prototype.forEach.call(document.querySelectorAll("#viewTabs button"), function (b) {
    b.addEventListener("click", function () { setView(b.getAttribute("data-view")); });
  });
  $("#expandAll").addEventListener("click", function () { Array.prototype.forEach.call(document.querySelectorAll(".doc"), function (d) { d.open = true; }); });
  $("#collapseAll").addEventListener("click", function () { Array.prototype.forEach.call(document.querySelectorAll(".doc"), function (d) { d.open = false; }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("#panel").hidden) closePanel(); });
  var saved = null; try { saved = localStorage.getItem("pm-dashboard-view"); } catch (e) {}
  setView(window.innerWidth < 760 ? "threads" : (saved === "threads" || saved === "list" || saved === "timeline" ? saved : "timeline"));
  renderCorr();
})();
