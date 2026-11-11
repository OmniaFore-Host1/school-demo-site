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

  function phoneLink(phone, className = "text-link", label = phone) {
    const number = phone.replace(/\D/g, "").replace(/^0/, "");
    return link(label, `tel:+91${number}`, className);
  }

  function phoneLinks() {
    const list = element("ul", "phone-links");
    content.facts.phones.forEach((phone) => {
      const item = element("li");
      item.append(phoneLink(phone));
      list.append(item);
    });
    return list;
  }

  function contactActions() {
    const actions = element("div", "contact-actions");
    actions.append(
      phoneLink(content.facts.phones[0], "button", content.ui.callButton),
      link(content.ui.directionsButton, content.contact.mapsUrl, "button button-secondary")
    );
    return actions;
  }

  function section(heading, className, level = "h2", id) {
    const node = element("section", className);
    if (id) {
      node.id = id;
      node.tabIndex = -1;
      node.dataset.sectionLabel = heading;
    }
    node.append(element(level, "section-heading", heading));
    return node;
  }

  function renderPageNavigation() {
    const navigation = element("nav", "page-navigation");
    const heading = element("h2", "page-navigation-heading", content.ui.onThisPage);
    heading.id = "page-navigation-heading";
    navigation.setAttribute("aria-labelledby", heading.id);
    const list = element("ul", "page-navigation-list");
    main.querySelectorAll("[data-section-label]").forEach((target) => {
      const item = element("li");
      item.append(link(target.dataset.sectionLabel, `#${target.id}`));
      list.append(item);
    });
    navigation.append(heading, list);
    main.querySelector(".page-shell").firstElementChild.after(navigation);
  }

  function demoLabel(inline = false, label = content.ui.demoLabel) {
    return element(inline ? "span" : "p", inline ? "demo-badge" : "demo-label", label);
  }

  function factValue(key) {
    const value = content.facts[key];
    return Array.isArray(value) ? value.join(", ") : String(value);
  }

  function dataRow(label, value, demo = false, demoText) {
    const row = element("div", "data-row");
    const term = element("dt", "", label);
    if (demo) term.append(demoLabel(true, demoText));
    const description = element("dd");
    if (value !== undefined) description.append(value);
    row.append(term, description);
    return row;
  }

  function noticeList() {
    const list = element("ul", "notice-list");
    content.notices.forEach((notice) => {
      const item = element("li");
      if (notice.demo) item.append(demoLabel(true));
      item.append(element("p", "", notice.text));
      list.append(item);
    });
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

  function photosFor(placement) {
    return content.images.filter((photo) => photo.placements.includes(placement)).map((photo) => {
      const figure = element("figure", "school-photo");
      const image = element("img");
      image.src = photo.src;
      image.alt = photo.alt;
      image.width = photo.width;
      image.height = photo.height;
      image.loading = "lazy";
      image.decoding = "async";
      figure.append(image, element("figcaption", "", photo.caption));
      return figure;
    });
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
    const buttonLabel = element("span", "menu-label");
    const desktop = window.matchMedia("(min-width: 64rem)");

    function updateHeaderHeight() {
      document.documentElement.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`);
    }

    function setMenu(open) {
      navigation.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      buttonLabel.textContent = open ? content.ui.menuClose : content.ui.menuOpen;
      button.replaceChildren(icon(open ? "close" : "menu"), buttonLabel);
      updateHeaderHeight();
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
    navigation.addEventListener("click", (event) => {
      if (!desktop.matches && event.target.closest("a[href]")) {
        setMenu(false);
        button.focus();
      }
    });
    header.addEventListener("focusout", (event) => {
      if (!desktop.matches && !header.contains(event.relatedTarget)) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !desktop.matches && !navigation.hidden) {
        event.preventDefault();
        setMenu(false);
        button.focus();
      }
    });
    desktop.addEventListener("change", syncMenu);
    syncMenu();
    inner.append(brand, button, navigation);
    header.append(inner);
    updateHeaderHeight();
    new ResizeObserver(updateHeaderHeight).observe(header);
  }

  function philosophyCards(level = "h2") {
    const data = content.about;
    const values = element("div", "card-grid two-column");
    const vision = section(data.visionHeading, "card", level);
    vision.append(element("p", "", data.vision));
    const mission = section(data.missionHeading, "card", level);
    mission.append(element("p", "", data.mission));
    values.append(vision, mission);
    return values;
  }

  function renderHome() {
    const data = content.home;
    const shell = element("div", "container page-shell home-shell");
    const hero = element("section", "hero");
    const inner = element("div", "hero-inner");
    const logoCard = element("div", "card hero-logo-card");
    logoCard.append(schoolLogo("hero-logo", config.schoolName));
    const codes = element("p", "school-codes");
    codes.append(
      element("span", "", `${data.affiliationLabel} ${factValue("affiliation")}`),
      " ",
      element("span", "", `${data.schoolCodeLabel} ${factValue("schoolCode")}`)
    );
    const actions = element("div", "hero-actions");
    actions.append(
      link(content.admissions.menuLabel, "admissions.html", "button", "arrow"),
      link(content.ui.disclosureButton, "disclosure.html", "button button-secondary")
    );
    inner.append(
      element("p", "eyebrow", data.session),
      logoCard,
      element("h1", "", data.heroHeading),
      element("p", "hero-tagline", data.tagline),
      codes,
      actions
    );
    hero.append(inner);
    const stats = section(data.statsHeading, "stats-strip", "h2", "school-at-a-glance");
    const statsList = element("dl", "stats-grid");
    data.stats.forEach((item) => {
      const stat = element("div", "stat-item");
      stat.append(
        element("dt", "stat-label", item.label),
        element("dd", "stat-value", factValue(item.fact))
      );
      statsList.append(stat);
    });
    stats.append(statsList);
    const philosophy = section(data.philosophyHeading, "", "h2", "our-philosophy");
    philosophy.append(philosophyCards("h3"));
    const pathways = section(data.pathwaysHeading, "", "h2", "academic-pathways");
    const pathwayLinks = element("div", "pathway-grid");
    content.academics.stages.forEach((stage) => {
      pathwayLinks.append(link(stage.heading, `academics.html#${stage.id}`, "card quick-link", "arrow"));
    });
    pathways.append(pathwayLinks);
    const quickLinks = section(data.quickLinksHeading, "", "h2", "quick-links");
    const grid = element("div", "quick-grid");
    data.quickLinks.forEach((item) => {
      grid.append(link(item.label, item.href, "card quick-link", "arrow"));
    });
    quickLinks.append(grid);
    const notices = section(data.noticesHeading, "callout", "h2", "notices");
    notices.append(noticeList());
    shell.append(hero, stats, philosophy, pathways, quickLinks, notices);
    main.append(shell);
  }

  function renderAbout() {
    const data = content.about;
    const shell = pageShell(data.title);
    const intro = element("div", "about-intro photo-layout");
    const introText = element("div", "photo-copy");
    data.paragraphs.forEach((paragraph) => introText.append(element("p", "", paragraph)));
    intro.append(introText, ...photosFor("about.intro"));
    const values = philosophyCards();
    const principal = section(data.principalHeading, "", "h2", "principals-message");
    const principalLayout = element("div", "principal-layout");
    const principalDetails = element("dl", "card principal-details");
    principalDetails.append(
      element("dt", "", data.principalNameLabel),
      element("dd", "", data.principalName),
      element("dt", "", data.principalQualificationLabel),
      element("dd", "", data.principalQualification)
    );
    const message = element("div", "callout principal-message");
    if (data.principalMessageDemo) message.append(demoLabel(false, data.principalMessageDemoLabel));
    message.append(element("p", "", data.principalMessage));
    principalLayout.append(principalDetails, message);
    principal.append(principalLayout);
    const staff = section(data.staffHeading, "", "h2", "staff");
    const staffList = element("dl", "staff-list");
    data.staffRows.forEach((row) => staffList.append(dataRow(row.label, row.value, row.demo)));
    staff.append(
      element("p", "section-note", data.staffNote.replace("{classrooms}", factValue("classrooms"))),
      staffList
    );
    const alumni = section(data.alumniHeading, "", "h2", "alumni");
    const alumniProfiles = element("div", "card-grid two-column");
    data.alumniProfiles.forEach((profile) => {
      const card = section(data.alumniProfileLabel, "card", "h3");
      if (profile.demo) card.append(demoLabel());
      card.append(element("p", "", profile.text));
      alumniProfiles.append(card);
    });
    alumni.append(alumniProfiles);
    const affiliation = section(data.affiliationHeading, "", "h2", "affiliation");
    const affiliationDetails = element("dl", "fact-list");
    affiliationDetails.append(
      dataRow(data.affiliationLabel, factValue("affiliation")),
      dataRow(data.schoolCodeLabel, factValue("schoolCode"))
    );
    affiliation.append(affiliationDetails);
    shell.append(intro, values, principal, staff, alumni, affiliation);
  }

  function renderAcademics() {
    const data = content.academics;
    const shell = pageShell(data.title);
    const intro = section(data.introHeading, "intro");
    intro.append(element("p", "", data.intro));
    const stages = section(data.stagesHeading, "", "h2", "stages");
    const stagesLayout = element("div", "stages-layout");
    const list = element("div", "card-grid two-column");
    data.stages.forEach((item) => {
      const stage = section(item.heading, "card academic-stage", "h3");
      stage.id = item.id;
      stage.tabIndex = -1;
      stage.append(element("p", "", item.text));
      const photos = photosFor(`academics.${item.id}`);
      if (photos.length) {
        stage.classList.add("card-with-photo");
        stage.append(...photos);
      }
      list.append(stage);
    });
    stagesLayout.append(list, ...photosFor("academics.stages"));
    stages.append(stagesLayout);
    const streams = section(data.streamsHeading, "", "h2", "senior-secondary-streams");
    streams.append(element("p", "section-note", data.streamsNote));
    const grid = element("div", "card-grid three-column");
    data.streams.forEach((stream) => {
      const card = section(stream.heading, "card", "h3");
      const description = element("p", "", stream.text);
      if (stream.demo) description.prepend(demoLabel(true));
      card.append(description);
      if (stream.alternative) card.append(element("p", "stream-alternative", stream.alternative));
      grid.append(card);
    });
    const resources = element("div", "resource-links");
    resources.append(
      link(data.syllabusLabel, data.syllabusUrl, "text-link"),
      link(data.cbseLabel, data.cbseUrl, "text-link")
    );
    streams.append(grid, resources);
    const books = section(data.booksHeading, "", "h2", "sample-book-list");
    if (data.booksDemo) books.append(demoLabel());
    books.append(element("p", "section-note", data.booksNote));
    const bookGrid = element("div", "card-grid three-column");
    data.books.forEach((book) => {
      const card = section(book.className, "card", "h3");
      const details = element("dl");
      details.append(
        dataRow(data.bookPublisherLabel, book.publisher),
        dataRow(data.bookEditionLabel, book.edition)
      );
      card.append(element("p", "section-note", book.title), details);
      bookGrid.append(card);
    });
    books.append(bookGrid);
    shell.append(intro, stages, streams, books);
  }

  function enquiryForm(data) {
    const form = element("form", "enquiry-form");
    form.noValidate = true;
    form.autocomplete = "on";
    form.setAttribute("aria-describedby", "enquiry-note enquiry-required-note");
    const fields = [
      { name: "student-name", label: data.studentNameLabel, type: "text", required: true, autocomplete: "section-student name" },
      { name: "parent-name", label: data.parentNameLabel, type: "text", required: true, autocomplete: "section-guardian name" },
      { name: "phone", label: data.phoneLabel, type: "tel", required: true, autocomplete: "section-guardian tel" },
      { name: "email", label: data.emailLabel, type: "email", required: false, autocomplete: "section-guardian email" },
      { name: "child-class", label: data.childClassLabel, type: "select", required: true, autocomplete: "on" },
      { name: "message", label: data.messageLabel, type: "textarea", required: false, autocomplete: "on" }
    ].map((spec) => {
      const wrapper = element("div", "field");
      const label = element("label", "", spec.label);
      if (spec.required) {
        const marker = element("span", "", " *");
        marker.setAttribute("aria-hidden", "true");
        label.append(marker);
      }
      const tag = spec.type === "textarea" || spec.type === "select" ? spec.type : "input";
      const input = element(tag);
      input.id = spec.name;
      input.name = spec.name;
      input.required = spec.required;
      input.autocomplete = spec.autocomplete;
      if (tag === "input") input.type = spec.type;
      if (spec.type === "select") {
        const placeholder = element("option", "", data.classPlaceholder);
        placeholder.value = "";
        input.append(placeholder);
        data.classOptions.forEach((className) => {
          const option = element("option", "", className);
          option.value = className;
          input.append(option);
        });
      }
      if (spec.name === "phone") input.inputMode = "tel";
      label.htmlFor = input.id;
      const error = element("p", "field-error");
      error.id = `${spec.name}-error`;
      error.hidden = true;
      error.setAttribute("aria-live", "polite");
      input.setAttribute("aria-describedby", error.id);

      function validate() {
        const value = input.value.trim();
        let message = "";
        if (input.required && !value) {
          message = data.requiredError;
        } else if (value && spec.name === "phone" && !/^\+?\d{10,15}$/.test(value.replace(/[\s().-]/g, ""))) {
          message = content.ui.phoneError;
        } else if (value && spec.type === "email" && input.validity.typeMismatch) {
          message = data.emailError;
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
      input.addEventListener("change", validate);
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
      form.reset();
      const thanks = element("div", "thank-you");
      const message = element("p", "", data.thankYou);
      message.setAttribute("role", "status");
      message.tabIndex = -1;
      const actions = element("div", "button-row");
      const tryAgain = element("button", "button button-secondary", data.tryAgainButton);
      tryAgain.type = "button";
      tryAgain.addEventListener("click", () => {
        const freshForm = enquiryForm(data);
        thanks.replaceWith(freshForm);
        freshForm.elements.namedItem("student-name").focus();
      });
      actions.append(tryAgain, phoneLink(content.facts.phones[0], "button", data.callSchoolButton));
      thanks.append(message, actions);
      form.replaceWith(thanks);
      message.focus();
    });
    return form;
  }

  function renderAdmissions() {
    const data = content.admissions;
    const shell = pageShell(data.title);
    const steps = section(data.stepsHeading, "card callout", "h2", "how-to-apply");
    const stepsLayout = element("div", "photo-layout");
    const stepsText = element("div", "photo-copy");
    data.steps.forEach((step) => stepsText.append(element("p", "", step)));
    stepsLayout.append(stepsText, ...photosFor("admissions.how-to-apply"));
    steps.append(stepsLayout);
    const enquiry = section(data.formHeading, "enquiry-section", "h2", "enquiry-form");
    const note = element("p", "section-note", data.formNote);
    note.id = "enquiry-note";
    const requiredNote = element("p", "section-note", data.requiredNote);
    requiredNote.id = "enquiry-required-note";
    enquiry.append(note, requiredNote, enquiryForm(data));
    shell.append(contactActions(), steps, enquiry);
  }

  function documentCatalogueRecord(recordId) {
    const data = content.disclosure;
    const record = element("details", "document-record");
    record.id = recordId;
    record.open = true;
    const body = element("div", "document-record-content");
    body.append(
      element("p", "document-record-id", recordId),
      element("p", "", data.demoCatalogueDate),
      element("p", "", data.demoRecordNote)
    );
    record.append(element("summary", "", data.demoRecordLabel), body);
    return record;
  }

  function renderDisclosure() {
    const data = content.disclosure;
    const shell = pageShell(data.heading);
    const list = element("div", "disclosure-list");
    data.sections.forEach((item) => {
      const details = element("details", "disclosure-section");
      details.id = `disclosure-${item.key}`;
      details.tabIndex = -1;
      details.dataset.sectionLabel = item.title;
      const summary = element("summary");
      const action = element("span", "disclosure-action");
      action.setAttribute("aria-hidden", "true");
      const label = element("span", "", data.expandLabel);
      action.append(label, icon("chevron"));
      const title = element("span", "disclosure-title", item.title);
      if (item.demo) title.append(demoLabel(true));
      summary.append(title, action);
      const rows = element("dl", "disclosure-rows");
      item.rows.forEach((row) => {
        const value = row.key === "school-name" ? config.schoolName
          : row.fact === "phones" ? phoneLinks()
          : row.recordId ? documentCatalogueRecord(row.recordId)
          : row.href ? link(row.value, row.href, "text-link")
          : row.fact ? factValue(row.fact) + (row.suffix || "") : row.value;
        const node = dataRow(row.label, value, row.demo, row.demoLabel);
        node.id = `${details.id}-${row.key}`;
        rows.append(node);
      });
      details.append(summary, rows);
      details.addEventListener("toggle", () => {
        label.textContent = details.open ? data.collapseLabel : data.expandLabel;
      });
      list.append(details);
    });
    shell.append(link(data.sarasLabel, data.sarasUrlBase + factValue("affiliation"), "text-link"), list);

    function openLinkedSection() {
      let id;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      const details = target && target.closest("details.disclosure-section");
      if (!details) return;
      details.open = true;
      details.scrollIntoView({ block: "start" });
    }

    window.addEventListener("hashchange", openLinkedSection);
    // Wait for the page navigation and footer before positioning a direct link.
    requestAnimationFrame(openLinkedSection);

    // Print all rows and their demo labels, then restore the reader's open sections.
    let printState;
    window.addEventListener("beforeprint", () => {
      if (printState) return;
      printState = Array.from(list.querySelectorAll("details"), (details) => [details, details.open]);
      printState.forEach(([details]) => { details.open = true; });
    });
    window.addEventListener("afterprint", () => {
      if (!printState) return;
      printState.forEach(([details, open]) => { details.open = open; });
      printState = undefined;
    });
  }

  function tableSection(key, heading, noteText, headers, rows, demo = false) {
    const wrapper = section(heading, "table-section", "h2", key);
    const headingId = `${key}-heading`;
    const noteId = `${key}-note`;
    wrapper.firstElementChild.id = headingId;
    if (demo) wrapper.append(demoLabel());
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

  function transferCertificateLookup(data) {
    const lookup = section(data.heading, "tc-lookup-section", "h2", "tc-lookup");
    if (data.demo) lookup.append(demoLabel());
    const note = element("p", "section-note", data.note);
    note.id = "tc-lookup-note";
    const form = element("form", "tc-lookup-form");
    const field = element("div", "field");
    const label = element("label", "", data.numberLabel);
    const input = element("input");
    input.id = "tc-number";
    input.name = "tc-number";
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-describedby", note.id);
    label.htmlFor = input.id;
    field.append(label, input);
    const search = element("button", "button", data.searchLabel);
    search.type = "submit";
    const result = element("p", "tc-lookup-result");
    result.setAttribute("role", "status");
    result.setAttribute("aria-atomic", "true");
    form.append(field, search);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const record = data.records.find((item) => item.number === input.value);
      result.textContent = record ? record.text : data.noMatch;
    });
    input.addEventListener("input", () => { result.textContent = ""; });
    lookup.append(note, form, result);
    return lookup;
  }

  function renderParent() {
    const data = content.parent;
    const shell = pageShell(data.title);
    const notices = section(data.noticesHeading, "callout", "h2", "notices");
    notices.append(noticeList());
    shell.append(
      notices,
      tableSection("calendar", data.calendarHeading, data.calendarNote, data.calendarHeaders, data.calendarRows, data.calendarDemo),
      tableSection("fee", data.feeHeading, data.feeNote, data.feeHeaders, data.feeRows, data.feeDemo),
      transferCertificateLookup(data.tc)
    );
  }

  function renderCampus() {
    const data = content.campus;
    const shell = pageShell(data.title);
    const facilities = section(data.heading, "", "h2", "facilities-and-activities");
    const grid = element("div", "card-grid two-column");
    data.cards.forEach((item) => {
      const card = section(item.title, "card", "h3");
      card.append(element("p", "", item.text));
      const photos = photosFor(`campus.${item.id}`);
      if (photos.length) {
        card.classList.add("card-with-photo");
        card.append(...photos);
      }
      grid.append(card);
    });
    const facilityPhotos = element("div", "photo-grid facility-photos");
    facilityPhotos.append(...photosFor("campus.facilities"));
    facilities.append(grid, facilityPhotos);
    const gallery = section(data.galleryHeading, "", "h2", data.galleryId);
    const galleryPhotos = element("div", "photo-grid");
    galleryPhotos.append(...photosFor("campus.gallery"));
    gallery.append(galleryPhotos);
    const videos = section(data.videosHeading, "", "h2", "videos");
    videos.append(element("p", "", data.videosNote));
    shell.append(facilities, gallery, videos);
  }

  function renderContact() {
    const data = content.contact;
    const shell = pageShell(data.title);
    const contact = section(data.heading, "", "h2", "contact-the-school");
    const details = element("dl", "contact-details");
    details.append(
      dataRow(data.addressLabel, data.address),
      dataRow(data.phoneLabel, phoneLinks()),
      dataRow(data.emailLabel, data.email, data.emailDemo, data.emailDemoLabel)
    );
    contact.append(details, link(data.websiteLabel, data.websiteUrl, "text-link"));
    shell.append(contactActions(), contact);
  }

  function renderFooter() {
    const footer = element("div", "container footer-inner");
    const details = element("div", "footer-details");
    const address = element("address", "footer-address");
    address.append(element("p", "", content.contact.address), phoneLinks());
    details.append(element("p", "footer-school-name", config.schoolName), address);

    const navigation = element("nav", "footer-navigation");
    navigation.setAttribute("aria-label", content.footer.navigationLabel);
    const list = element("ul", "footer-links");
    routes.forEach(([key, href]) => {
      const item = element("li");
      const anchor = link(content[key].menuLabel, href, "text-link");
      if (key === page) anchor.setAttribute("aria-current", "page");
      item.append(anchor);
      list.append(item);
    });
    navigation.append(list);
    footer.append(details, navigation, element("p", "footer-copyright", content.footer.text));
    document.getElementById("site-footer").append(footer);
  }

  Object.entries(config.colours).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
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
  renderPageNavigation();
  renderFooter();
})();
