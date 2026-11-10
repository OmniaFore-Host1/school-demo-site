(() => {
  "use strict";

  const content = window.SITE_CONTENT;
  const config = window.SITE_CONFIG;
  const page = document.body.dataset.page;
  const main = document.getElementById("main-content");
  const svgNamespace = "http://www.w3.org/2000/svg";
  const routes = [
    ["home", "index.html"],
    ["about", "about.html"],
    ["academics", "academics.html"],
    ["admissions", "admissions.html"],
    ["disclosure", "disclosure.html"],
    ["parent", "parent.html"],
    ["campus", "campus.html"],
    ["contact", "contact.html"]
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svgElement(tag, attributes) {
    const node = document.createElementNS(svgNamespace, tag);
    Object.entries(attributes).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
    return node;
  }

  function icon(kind) {
    const paths = {
      arrow: ["M5 12h14m-6-6 6 6-6 6"],
      external: ["M14 4h6v6m0-6L10 14", "M10 4H4v16h16v-6"],
      menu: ["M4 6h16M4 12h16M4 18h16"],
      close: ["m5 5 14 14M19 5 5 19"],
      chevron: ["m6 9 6 6 6-6"],
      book: ["M12 6C9 4 6 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"],
      science: ["M9 3h6m-5 0v7L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-9V3M7 15h10"],
      computer: ["M3 4h18v13H3V4Zm5 17h8m-4-4v4"],
      sports: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0v20M2 12h20M5 5c7 3 7 11 14 14M19 5C12 8 12 16 5 19"],
      art: ["m8 15 9-12 4 4-12 9", "M8 15c-4-2-5 3-5 6 3 0 8-1 6-5"],
      music: ["M10 17V5l10-2v12M10 9l10-2", "M10 17c0-3-6-2-6 1s6 2 6-1Zm10-2c0-3-6-2-6 1s6 2 6-1Z"]
    };
    const svg = svgElement("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.6",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false"
    });
    paths[kind].forEach((path) => svg.append(svgElement("path", { d: path })));
    return svg;
  }

  function link(label, href, className, iconKind) {
    const anchor = element("a", className, label);
    anchor.setAttribute("href", href);
    if (iconKind) anchor.append(icon(iconKind));
    return anchor;
  }

  function section(heading, className, level = "h2") {
    const node = element("section", className);
    node.append(element(level, "section-heading", heading));
    return node;
  }

  function dataRow(label, value) {
    const row = element("div", "data-row");
    row.append(element("dt", "", label), element("dd", "", value));
    return row;
  }

  function noticeList(notices) {
    const list = element("ul", "notice-list");
    notices.forEach((notice) => list.append(element("li", "", notice)));
    return list;
  }

  function pageShell(title) {
    const shell = element("div", "container page-shell");
    shell.append(element("h1", "page-title", title));
    main.append(shell);
    return shell;
  }

  function renderHeader() {
    document.body.prepend(link(content.ui.skipLink, "#main-content", "skip-link"));
    const header = document.getElementById("site-header");
    const inner = element("div", "container header-inner");
    const brand = link(undefined, "index.html", "brand");
    const mark = element("span", "brand-mark");
    mark.setAttribute("aria-hidden", "true");
    if (config.logoPath) {
      const logo = element("img");
      logo.src = config.logoPath;
      logo.alt = "";
      logo.width = 38;
      logo.height = 38;
      mark.append(logo);
    } else if (config.logoText) {
      mark.textContent = config.logoText;
    }
    brand.append(mark, element("span", "school-name", config.schoolName));

    const navigation = element("nav", "site-navigation");
    navigation.id = "primary-navigation";
    const list = element("ul", "nav-list");
    routes.forEach(([key, href]) => {
      const item = element("li");
      const anchor = link(content[key].menuLabel, href, "nav-link");
      if (key === page) anchor.setAttribute("aria-current", "page");
      if (key === "disclosure") anchor.classList.add("disclosure-link");
      item.append(anchor);
      list.append(item);
    });
    navigation.append(list);

    const button = element("button", "menu-button");
    button.type = "button";
    button.setAttribute("aria-controls", navigation.id);
    const buttonLabel = element("span");
    const desktop = window.matchMedia("(min-width: 64rem)");

    function setMenu(open) {
      navigation.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      buttonLabel.textContent = open ? content.ui.menuClose : content.ui.menuOpen;
      button.replaceChildren(icon(open ? "close" : "menu"), buttonLabel);
    }

    function syncMenu() {
      const active = document.activeElement;
      const moveToButton = !desktop.matches && navigation.contains(active);
      const moveToBrand = desktop.matches && active === button;
      button.hidden = desktop.matches;
      setMenu(desktop.matches);
      if (moveToButton) button.focus();
      if (moveToBrand) brand.focus();
    }

    button.addEventListener("click", () => setMenu(navigation.hidden));
    header.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !desktop.matches && !navigation.hidden) {
        setMenu(false);
        button.focus();
      }
    });
    desktop.addEventListener("change", syncMenu);
    syncMenu();
    inner.append(brand, button, navigation);
    header.append(inner);
  }

  function schoolIllustration() {
    const art = element("div", "hero-art");
    art.setAttribute("aria-hidden", "true");
    const svg = svgElement("svg", {
      viewBox: "0 0 480 320",
      fill: "none",
      focusable: "false"
    });
    const shapes = [
      ["circle", { cx: 257, cy: 144, r: 138, fill: "var(--background)" }],
      ["circle", { cx: 375, cy: 58, r: 25, fill: "var(--accent)" }],
      ["path", { d: "M29 278h422", stroke: "var(--primary)", "stroke-width": 2 }],
      ["path", { d: "M93 277V143h294v134", fill: "var(--surface)", stroke: "var(--primary)", "stroke-width": 2 }],
      ["path", { d: "M81 143h318l-16-17H97l-16 17Z", fill: "var(--primary)" }],
      ["path", { d: "M167 277V122l73-47 73 47v155", fill: "var(--soft)", stroke: "var(--primary)", "stroke-width": 2 }],
      ["path", { d: "m159 125 81-53 81 53", stroke: "var(--primary)", "stroke-width": 5, "stroke-linejoin": "round" }],
      ["path", { d: "M217 277v-48a23 23 0 0 1 46 0v48", fill: "var(--primary)" }],
      ["circle", { cx: 240, cy: 135, r: 18, fill: "var(--accent)", stroke: "var(--primary)", "stroke-width": 2 }],
      ["path", { d: "M240 124v12l8 5", stroke: "var(--primary)", "stroke-width": 2, "stroke-linecap": "round" }],
      ["path", { d: "M203 278h74l17 22H186l17-22Z", fill: "var(--accent)" }],
      ["path", { d: "M50 278v-65m379 65v-65", stroke: "var(--primary)", "stroke-width": 3 }],
      ["ellipse", { cx: 50, cy: 193, rx: 25, ry: 42, fill: "var(--primary)" }],
      ["ellipse", { cx: 429, cy: 193, rx: 25, ry: 42, fill: "var(--primary)" }]
    ];
    shapes.forEach(([tag, attributes]) => svg.append(svgElement(tag, attributes)));
    [113, 139, 327, 353].forEach((x) => {
      [165, 213].forEach((y) => {
        svg.append(svgElement("rect", {
          x, y, width: 15, height: 26, rx: 2,
          fill: "var(--soft)", stroke: "var(--primary)", "stroke-width": 1.5
        }));
      });
    });
    [190, 229, 268].forEach((x) => {
      svg.append(svgElement("rect", {
        x, y: 172, width: 22, height: 23, rx: 2,
        fill: "var(--surface)", stroke: "var(--primary)", "stroke-width": 1.5
      }));
    });
    art.append(svg);
    return art;
  }

  function renderHome() {
    const data = content.home;
    const hero = element("section", "hero");
    const inner = element("div", "container hero-inner");
    const copy = element("div", "hero-copy");
    copy.append(
      element("h1", "", data.heroHeading),
      element("p", "", data.tagline),
      link(content.ui.disclosureButton, "disclosure.html", "button", "arrow")
    );
    inner.append(copy, schoolIllustration());
    hero.append(inner);
    const quickLinks = section(data.quickLinksHeading, "container home-links");
    const grid = element("div", "quick-grid");
    data.quickLinks.forEach((item) => {
      grid.append(link(item.label, item.href, "quick-link", "arrow"));
    });
    quickLinks.append(grid);
    const notices = section(data.noticesHeading, "container notices-strip");
    notices.append(noticeList(data.notices));
    main.append(hero, quickLinks, notices);
  }

  function renderAbout() {
    const data = content.about;
    const shell = pageShell(data.title);
    const layout = element("div", "section-stack about-layout");
    const vision = section(data.visionHeading, "panel vision-panel");
    vision.append(element("p", "", data.vision));
    const principal = section(data.principalHeading, "panel principal-panel");
    const principalDetails = element("dl", "principal-details");
    principalDetails.append(
      element("dt", "", data.principalNameLabel),
      element("dd", "", data.principalName)
    );
    principal.append(element("blockquote", "", data.principalMessage), principalDetails);
    const affiliation = section(data.affiliationHeading, "panel affiliation-panel");
    const affiliationDetails = element("dl");
    affiliationDetails.append(dataRow(data.affiliationLabel, data.affiliation));
    affiliation.append(affiliationDetails);
    layout.append(vision, principal, affiliation);
    shell.append(layout);
  }

  function renderAcademics() {
    const data = content.academics;
    const shell = pageShell(data.title);
    const intro = section(data.introHeading, "intro");
    intro.append(element("p", "", data.intro));
    const stages = section(data.stagesHeading);
    const list = element("div", "stage-list");
    data.stages.forEach((item, index) => {
      const stage = section(item.heading, "panel stage", "h3");
      stage.append(element("p", "", item.text));
      if (index === data.stages.length - 1) {
        const streams = section(data.streamsHeading, "stream-section", "h4");
        const grid = element("div", "card-grid stream-grid");
        data.streams.forEach((stream, streamIndex) => {
          const card = element("article", "card stream-card");
          const heading = element("h5", "", stream.heading);
          heading.id = `stream-${streamIndex}`;
          const syllabus = link(data.syllabusLabel, data.syllabusUrl, "text-link", "external");
          syllabus.setAttribute("aria-describedby", heading.id);
          card.append(heading, element("p", "", stream.text), syllabus);
          grid.append(card);
        });
        streams.append(grid);
        stage.append(streams);
      }
      list.append(stage);
    });
    stages.append(list);
    shell.append(intro, stages, link(data.cbseLabel, data.cbseUrl, "text-link cbse-link", "external"));
  }

  function enquiryForm(data) {
    const form = element("form", "enquiry-form");
    form.noValidate = true;
    form.autocomplete = "off";
    form.append(element("p", "form-note", data.formNote));
    const fields = [
      { name: "parent-name", label: data.parentNameLabel, type: "text" },
      { name: "phone", label: data.phoneLabel, type: "tel" },
      { name: "child-class", label: data.childClassLabel, type: "text" },
      { name: "message", label: data.messageLabel, type: "textarea" }
    ].map((spec) => {
      const wrapper = element("div", "field");
      const label = element("label", "", spec.label);
      const input = element(spec.type === "textarea" ? "textarea" : "input");
      input.id = spec.name;
      input.name = spec.name;
      input.required = true;
      if (spec.type !== "textarea") input.type = spec.type;
      if (spec.name === "phone") {
        input.inputMode = "numeric";
        input.pattern = "[0-9]+";
      }
      label.htmlFor = input.id;
      const error = element("p", "field-error");
      error.id = `${spec.name}-error`;
      error.hidden = true;
      error.setAttribute("aria-live", "polite");
      input.setAttribute("aria-describedby", error.id);

      function validate() {
        let message = "";
        if (!input.value.trim()) {
          message = data.requiredError;
        } else if (spec.name === "phone" && !/^[0-9]+$/.test(input.value)) {
          message = data.phoneError;
        }
        error.textContent = message;
        error.hidden = !message;
        if (message) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
        return !message;
      }

      input.addEventListener("blur", validate);
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") validate();
      });
      wrapper.append(label, input, error);
      form.append(wrapper);
      return { input, validate };
    });

    const submit = element("button", "button", data.submitButton);
    submit.type = "submit";
    submit.append(icon("arrow"));
    form.append(submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let firstInvalid;
      fields.forEach((field) => {
        if (!field.validate() && !firstInvalid) firstInvalid = field.input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      fields.forEach((field) => { field.input.value = ""; });
      const thanks = element("p", "thank-you", data.thankYou);
      thanks.setAttribute("role", "status");
      thanks.tabIndex = -1;
      form.replaceWith(thanks);
      thanks.focus();
    });
    return form;
  }

  function renderAdmissions() {
    const data = content.admissions;
    const shell = pageShell(data.title);
    const layout = element("div", "admissions-layout");
    const steps = section(data.stepsHeading);
    const list = element("ol", "steps-list");
    data.steps.forEach((step) => list.append(element("li", "", step)));
    steps.append(list);
    const enquiry = section(data.formHeading, "panel");
    enquiry.append(enquiryForm(data));
    layout.append(steps, enquiry);
    shell.append(layout);
  }

  function renderDisclosure() {
    const data = content.disclosure;
    const shell = pageShell(data.heading);
    const list = element("div", "disclosure-list");
    data.sections.forEach((item) => {
      const details = element("details", "disclosure-section");
      const summary = element("summary");
      const action = element("span", "disclosure-action");
      action.setAttribute("aria-hidden", "true");
      const label = element("span", "", data.expandLabel);
      action.append(label, icon("chevron"));
      summary.append(element("span", "disclosure-title", item.title), action);
      const rows = element("dl", "disclosure-rows");
      item.rows.forEach((row) => rows.append(dataRow(
        row.label,
        row.label === "Name of the school" ? config.schoolName : row.value
      )));
      details.append(summary, rows);
      details.addEventListener("toggle", () => {
        label.textContent = details.open ? data.collapseLabel : data.expandLabel;
      });
      list.append(details);
    });
    shell.append(list);
  }

  function renderParent() {
    const data = content.parent;
    const shell = pageShell(data.title);
    const top = element("div", "parent-top");
    const notices = section(data.noticesHeading, "panel");
    notices.append(noticeList(data.notices));
    const calendar = section(data.calendarHeading, "panel");
    calendar.append(element("p", "section-note", data.calendarNote));
    const columns = element("div", "calendar-columns");
    data.calendarHeaders.forEach((header, index) => {
      const label = element("span", "", header);
      label.id = `calendar-column-${index}`;
      columns.append(label);
    });
    const events = element("ul", "calendar-list");
    data.calendarRows.forEach((row) => {
      const event = element("li", "calendar-row");
      row.forEach((value, index) => {
        const cell = element("span", "", value);
        cell.setAttribute("aria-describedby", `calendar-column-${index}`);
        event.append(cell);
      });
      events.append(event);
    });
    calendar.append(columns, events);
    top.append(notices, calendar);

    const fees = section(data.feeHeading);
    fees.firstElementChild.id = "fee-heading";
    const note = element("p", "section-note", data.feeNote);
    note.id = "fee-note";
    const box = element("div", "table-box");
    box.tabIndex = 0;
    box.setAttribute("role", "region");
    box.setAttribute("aria-labelledby", "fee-heading");
    const table = element("table", "fee-table");
    table.setAttribute("aria-labelledby", "fee-heading");
    table.setAttribute("aria-describedby", "fee-note");
    const head = element("thead");
    const headings = element("tr");
    data.feeHeaders.forEach((header) => {
      const cell = element("th", "", header);
      cell.scope = "col";
      headings.append(cell);
    });
    head.append(headings);
    const body = element("tbody");
    data.feeRows.forEach((values) => {
      const row = element("tr");
      values.forEach((value, index) => {
        const cell = element(index === 0 ? "th" : "td", "", value);
        if (index === 0) cell.scope = "row";
        row.append(cell);
      });
      body.append(row);
    });
    table.append(head, body);
    box.append(table);
    fees.append(note, box);
    shell.append(top, fees);
  }

  function renderCampus() {
    const data = content.campus;
    const shell = pageShell(data.title);
    const facilities = section(data.heading);
    const grid = element("div", "card-grid campus-grid");
    const icons = ["book", "science", "computer", "sports", "art", "music"];
    data.cards.forEach((item, index) => {
      const card = element("article", "card");
      const mark = element("div", "facility-icon");
      mark.append(icon(icons[index] || "book"));
      card.append(mark, element("h3", "", item.title), element("p", "", item.text));
      grid.append(card);
    });
    facilities.append(grid);
    shell.append(facilities);
  }

  function renderContact() {
    const data = content.contact;
    const shell = pageShell(data.title);
    const contact = section(data.heading);
    const details = element("dl", "contact-details");
    details.append(
      dataRow(data.addressLabel, data.address),
      dataRow(data.phoneLabel, data.phone),
      dataRow(data.emailLabel, data.email)
    );
    contact.append(details);
    shell.append(contact);
  }

  Object.entries(config.colours).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
  document.title = `${content[page].title} | ${config.schoolName}`;
  renderHeader();
  const renderers = {
    home: renderHome,
    about: renderAbout,
    academics: renderAcademics,
    admissions: renderAdmissions,
    disclosure: renderDisclosure,
    parent: renderParent,
    campus: renderCampus,
    contact: renderContact
  };
  renderers[page]();
  const footer = element("div", "container footer-inner");
  footer.append(element("p", "", content.footer.text));
  document.getElementById("site-footer").append(footer);
})();
