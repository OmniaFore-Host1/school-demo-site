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
      menu: ["M4 6h16M4 12h16M4 18h16"],
      close: ["m5 5 14 14M19 5 5 19"],
      chevron: ["m6 9 6 6 6-6"]
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

  function schoolLogo(className, alt = "") {
    const logo = element("img", className);
    logo.src = config.logoPath;
    logo.alt = alt;
    logo.width = 325;
    logo.height = 336;
    logo.decoding = "async";
    return logo;
  }

  function renderHeader() {
    document.body.prepend(link(content.ui.skipLink, "#main-content", "skip-link"));
    const header = document.getElementById("site-header");
    const inner = element("div", "container header-inner");
    const brand = link(undefined, "index.html", "brand");
    brand.append(schoolLogo("brand-logo"), element("span", "school-name", config.schoolName));

    const navigation = element("nav", "site-navigation");
    navigation.id = "primary-navigation";
    const list = element("ul", "nav-list");
    routes.forEach(([key, href]) => {
      const item = element("li");
      const anchor = link(content[key].menuLabel, href, "nav-link");
      if (key === page) anchor.setAttribute("aria-current", "page");
      item.append(anchor);
      list.append(item);
    });
    navigation.append(list);

    const button = element("button", "menu-button");
    button.type = "button";
    button.setAttribute("aria-controls", navigation.id);
    const buttonLabel = element("span", "visually-hidden");
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

  function renderHome() {
    const data = content.home;
    const shell = element("div", "container page-shell home-shell");
    const hero = element("section", "hero");
    const inner = element("div", "hero-inner");
    const logoCard = element("div", "card hero-logo-card");
    logoCard.append(schoolLogo("hero-logo", config.schoolName));
    inner.append(
      element("p", "eyebrow", data.session),
      logoCard,
      element("h1", "", data.heroHeading),
      element("p", "hero-tagline", data.tagline),
      link(content.ui.disclosureButton, "disclosure.html", "button", "arrow")
    );
    hero.append(inner);
    const quickLinks = section(data.quickLinksHeading);
    const grid = element("div", "quick-grid");
    data.quickLinks.forEach((item) => {
      grid.append(link(item.label, item.href, "card quick-link", "arrow"));
    });
    quickLinks.append(grid);
    const notices = section(data.noticesHeading, "callout");
    notices.append(noticeList(data.notices));
    shell.append(hero, quickLinks, notices);
    main.append(shell);
  }

  function renderAbout() {
    const data = content.about;
    const shell = pageShell(data.title);
    const values = element("div", "card-grid two-column");
    const vision = section(data.visionHeading, "card");
    vision.append(element("p", "", data.vision));
    const mission = section(data.missionHeading, "card");
    mission.append(element("p", "", data.mission));
    values.append(vision, mission);
    const principal = section(data.principalHeading, "card principal-card");
    const principalDetails = element("dl", "principal-details");
    principalDetails.append(
      element("dt", "", data.principalNameLabel),
      element("dd", "", data.principalName)
    );
    principal.append(principalDetails, element("p", "", data.principalMessage));
    const affiliation = section(data.affiliationHeading);
    const affiliationDetails = element("dl", "fact-list");
    affiliationDetails.append(
      dataRow(data.affiliationLabel, data.affiliation),
      dataRow(data.schoolCodeLabel, data.schoolCode)
    );
    affiliation.append(affiliationDetails);
    shell.append(values, principal, affiliation);
  }

  function renderAcademics() {
    const data = content.academics;
    const shell = pageShell(data.title);
    const intro = section(data.introHeading, "intro");
    intro.append(element("p", "", data.intro));
    const stages = section(data.stagesHeading);
    const list = element("div", "card-grid two-column");
    data.stages.forEach((item) => {
      const stage = section(item.heading, "card", "h3");
      stage.append(element("p", "", item.text));
      list.append(stage);
    });
    stages.append(list);
    const streams = section(data.streamsHeading);
    const grid = element("div", "card-grid three-column");
    data.streams.forEach((stream) => {
      const card = section(stream.heading, "card", "h3");
      card.append(element("p", "", stream.text));
      grid.append(card);
    });
    const resources = element("div", "resource-links");
    resources.append(
      link(data.syllabusLabel, data.syllabusUrl, "text-link"),
      link(data.cbseLabel, data.cbseUrl, "text-link")
    );
    streams.append(grid, resources);
    shell.append(intro, stages, streams);
  }

  function enquiryForm(data) {
    const form = element("form", "enquiry-form");
    form.noValidate = true;
    form.autocomplete = "off";
    form.setAttribute("aria-describedby", "enquiry-note");
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
    const steps = section(data.stepsHeading, "card callout");
    data.steps.forEach((step) => steps.append(element("p", "", step)));
    const enquiry = section(data.formHeading, "enquiry-section");
    const note = element("p", "section-note", data.formNote);
    note.id = "enquiry-note";
    enquiry.append(note, enquiryForm(data));
    shell.append(steps, enquiry);
  }

  function renderDisclosure() {
    const data = content.disclosure;
    const shell = pageShell(data.heading);
    const list = element("div", "disclosure-list");
    data.sections.forEach((item, sectionIndex) => {
      const details = element("details", "disclosure-section");
      const summary = element("summary");
      const action = element("span", "disclosure-action");
      action.setAttribute("aria-hidden", "true");
      const label = element("span", "", data.expandLabel);
      action.append(label, icon("chevron"));
      summary.append(element("span", "disclosure-title", item.title), action);
      const rows = element("dl", "disclosure-rows");
      item.rows.forEach((row, rowIndex) => rows.append(dataRow(
        row.label,
        sectionIndex === 0 && rowIndex === 0 ? config.schoolName : row.value
      )));
      details.append(summary, rows);
      details.addEventListener("toggle", () => {
        label.textContent = details.open ? data.collapseLabel : data.expandLabel;
      });
      list.append(details);
    });
    shell.append(link(data.sarasLabel, data.sarasUrl, "text-link"), list);
  }

  function tableSection(key, heading, noteText, headers, rows) {
    const wrapper = section(heading, "table-section");
    const headingId = `${key}-heading`;
    const noteId = `${key}-note`;
    wrapper.firstElementChild.id = headingId;
    const note = element("p", "section-note", noteText);
    note.id = noteId;
    const box = element("div", "table-box");
    box.tabIndex = 0;
    box.setAttribute("role", "region");
    box.setAttribute("aria-labelledby", headingId);
    const table = element("table", `data-table ${key}-table`);
    table.setAttribute("aria-labelledby", headingId);
    table.setAttribute("aria-describedby", noteId);
    const head = element("thead");
    const headings = element("tr");
    headers.forEach((header) => {
      const cell = element("th", "", header);
      cell.scope = "col";
      headings.append(cell);
    });
    head.append(headings);
    const body = element("tbody");
    rows.forEach((values) => {
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
    wrapper.append(note, box);
    return wrapper;
  }

  function renderParent() {
    const data = content.parent;
    const shell = pageShell(data.title);
    const notices = section(data.noticesHeading, "callout");
    notices.append(noticeList(data.notices));
    shell.append(
      notices,
      tableSection("calendar", data.calendarHeading, data.calendarNote, data.calendarHeaders, data.calendarRows),
      tableSection("fee", data.feeHeading, data.feeNote, data.feeHeaders, data.feeRows)
    );
  }

  function renderCampus() {
    const data = content.campus;
    const shell = pageShell(data.title);
    const facilities = section(data.heading);
    const grid = element("div", "card-grid two-column");
    data.cards.forEach((item) => {
      const card = section(item.title, "card", "h3");
      card.append(element("p", "", item.text));
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
    const links = element("div", "button-row");
    links.append(
      link(data.websiteLabel, data.websiteUrl, "button"),
      link(data.mapsLabel, data.mapsUrl, "button button-secondary")
    );
    contact.append(details, links);
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
