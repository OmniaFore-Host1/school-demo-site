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
      up: ["M12 19V5m-6 6 6-6 6 6"],
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
    if (page !== "disclosure" && page !== "parent") return;
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

  function markDemo(node) {
    const heading = node.querySelector(".section-heading");
    const row = element("div", "section-heading-row");
    heading.replaceWith(row);
    row.append(heading, element("span", "demo-badge", content.ui.demoLabel));
  }

  function factValue(key) {
    const value = content.facts[key];
    return Array.isArray(value) ? value.join(", ") : String(value);
  }

  function dataRow(label, value) {
    const row = element("div", "data-row");
    const term = element("dt", "", label);
    const description = element("dd");
    if (value !== undefined) description.append(value);
    row.append(term, description);
    return row;
  }

  function noticeList() {
    const list = element("ul", "notice-list");
    content.notices.forEach((notice) => {
      const item = element("li");
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

  function photoImage(photo, eager = false) {
    const image = element("img");
    image.src = photo.src;
    image.alt = photo.alt;
    image.width = photo.width;
    image.height = photo.height;
    image.loading = eager ? "eager" : "lazy";
    image.decoding = "async";
    if (eager) image.fetchPriority = "high";
    return image;
  }

  function schoolPhoto(photo) {
    const figure = element("figure", "school-photo");
    figure.append(photoImage(photo), element("figcaption", "", photo.caption));
    return figure;
  }

  function photosFor(placement) {
    return content.images.filter((photo) => photo.placements.includes(placement)).map(schoolPhoto);
  }

  function photoNamed(src) {
    return content.images.find((photo) => photo.src === src);
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
      header.classList.toggle("is-menu-open", open && !desktop.matches);
      if (open) header.classList.remove("is-hidden");
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
    header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
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
    const stage = element("div", "hero-stage");
    const inner = element("div", "hero-inner");
    const identity = element("div", "hero-identity");
    const logoCard = element("div", "card hero-logo-card");
    logoCard.append(schoolLogo("hero-logo"));
    identity.append(logoCard);
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
      identity,
      element("h1", "", data.heroHeading),
      element("p", "hero-tagline", data.tagline),
      actions,
      codes
    );
    const photo = photoNamed("images/assembly.svg");
    const media = element("div", "hero-media");
    media.append(photoImage(photo, true));
    stage.append(inner, media);
    hero.append(stage, element("p", "hero-caption", photo.caption));
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
    if (content.notices.some((notice) => notice.demo)) markDemo(notices);
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
    if (data.principalMessageDemo) markDemo(principal);
    const principalLayout = element("div", "principal-layout");
    const principalDetails = element("dl", "card principal-details");
    principalDetails.append(
      element("dt", "", data.principalNameLabel),
      element("dd", "", data.principalName),
      element("dt", "", data.principalQualificationLabel),
      element("dd", "", data.principalQualification)
    );
    const message = element("div", "callout principal-message");
    if (data.principalMessageDemo) message.append(element("p", "section-note", data.principalMessageDemoLabel));
    message.append(element("p", "", data.principalMessage));
    principalLayout.append(principalDetails, message);
    principal.append(principalLayout);
    const staff = section(data.staffHeading, "", "h2", "staff");
    if (data.staffRows.some((row) => row.demo)) markDemo(staff);
    const staffList = element("dl", "staff-list");
    data.staffRows.forEach((row) => staffList.append(dataRow(row.label, row.value)));
    staff.append(
      element("p", "section-note", data.staffNote.replace("{classrooms}", factValue("classrooms"))),
      staffList
    );
    const alumni = section(data.alumniHeading, "", "h2", "alumni");
    if (data.alumniProfiles.some((profile) => profile.demo)) markDemo(alumni);
    const alumniProfiles = element("div", "card-grid two-column");
    data.alumniProfiles.forEach((profile) => {
      const card = section(data.alumniProfileLabel, "card", "h3");
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
    const banner = element("div", "academics-banner");
    banner.append(...photosFor("academics.stages"));
    intro.append(banner);
    const stages = section(data.stagesHeading, "", "h2", "stages");
    const list = element("div", "card-grid academic-stages");
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
    stages.append(list);
    const streams = section(data.streamsHeading, "", "h2", "senior-secondary-streams");
    if (data.streams.some((stream) => stream.demo)) markDemo(streams);
    streams.append(element("p", "section-note", data.streamsNote));
    const grid = element("div", "card-grid three-column");
    data.streams.forEach((stream) => {
      const card = section(stream.heading, "card", "h3");
      const description = element("p", "", stream.text);
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
    if (data.booksDemo) markDemo(books);
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
    const layout = element("div", "split-layout admissions-layout");
    const steps = section(data.stepsHeading, "card callout admissions-sidebar", "h2", "how-to-apply");
    const stepsText = element("div", "photo-copy");
    data.steps.forEach((step) => stepsText.append(element("p", "", step)));
    steps.append(stepsText, contactActions(), schoolPhoto(photoNamed("images/classroom-empty.svg")));
    const enquiry = section(data.formHeading, "enquiry-section", "h2", "enquiry-form");
    const note = element("p", "section-note", data.formNote);
    note.id = "enquiry-note";
    const requiredNote = element("p", "section-note", data.requiredNote);
    requiredNote.id = "enquiry-required-note";
    enquiry.append(note, requiredNote, enquiryForm(data));
    layout.append(steps, enquiry);
    shell.append(layout);
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
    list.id = "disclosure-sections";
    const controls = element("div", "disclosure-controls");
    const toggleAll = element("button", "button button-secondary", content.ui.expandAll);
    toggleAll.type = "button";
    toggleAll.setAttribute("aria-controls", list.id);
    const sections = [];

    function syncToggleAll() {
      const allOpen = sections.every((details) => details.open);
      toggleAll.textContent = allOpen ? content.ui.collapseAll : content.ui.expandAll;
    }

    toggleAll.addEventListener("click", () => {
      const open = !sections.every((details) => details.open);
      sections.forEach((details) => { details.open = open; });
      syncToggleAll();
    });
    controls.append(element("p", "", data.summary), toggleAll);
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
      const heading = element("h2", "disclosure-heading");
      const title = element("span", "disclosure-title", item.title);
      if (item.demo || item.rows.some((row) => row.demo)) {
        title.append(element("span", "demo-badge", content.ui.demoLabel));
      }
      heading.append(title, action);
      summary.append(heading);
      const rows = element("dl", "disclosure-rows");
      item.rows.forEach((row) => {
        const value = row.key === "school-name" ? config.schoolName
          : row.fact === "phones" ? phoneLinks()
          : row.recordId ? documentCatalogueRecord(row.recordId)
          : row.href ? link(row.value, row.href, "text-link")
          : row.fact ? factValue(row.fact) + (row.suffix || "") : row.value;
        const node = dataRow(row.label, value);
        if (row.demo && row.demoLabel) node.lastElementChild.append(element("p", "data-note", row.demoLabel));
        node.id = `${details.id}-${row.key}`;
        rows.append(node);
      });
      details.append(summary, rows);
      details.addEventListener("toggle", () => {
        label.textContent = details.open ? data.collapseLabel : data.expandLabel;
        syncToggleAll();
      });
      sections.push(details);
      list.append(details);
    });
    shell.append(link(data.sarasLabel, data.sarasUrlBase + factValue("affiliation"), "text-link"), controls, list);

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
    if (demo) markDemo(wrapper);
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
    if (data.demo) markDemo(lookup);
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
    if (content.notices.some((notice) => notice.demo)) markDemo(notices);
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
    const layout = element("div", "split-layout contact-layout");
    const contact = section(data.heading, "", "h2", "contact-the-school");
    if (data.emailDemo) markDemo(contact);
    const details = element("dl", "contact-details");
    const email = dataRow(data.emailLabel, data.email);
    if (data.emailDemo) email.lastElementChild.append(element("p", "data-note", data.emailDemoLabel));
    details.append(
      dataRow(data.addressLabel, data.address),
      dataRow(data.phoneLabel, phoneLinks()),
      email
    );
    contact.append(details, link(data.websiteLabel, data.websiteUrl, "text-link"));
    const sidebar = element("aside", "card contact-sidebar");
    sidebar.setAttribute("aria-label", data.title);
    sidebar.append(contactActions(), schoolPhoto(photoNamed("images/assembly.svg")));
    layout.append(contact, sidebar);
    shell.append(layout);
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
    const copyright = `© ${new Date().getFullYear()} ${config.schoolName}. ${content.footer.text}`;
    footer.append(details, navigation, element("p", "footer-copyright", copyright));
    document.getElementById("site-footer").append(footer);
  }

  function enableScrolling() {
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    const viewport = element("div", "site-viewport");
    // A separate, reserved control strip keeps the fixed button off the content.
    header.before(viewport);
    viewport.append(header, main, footer);
    document.body.classList.add("scroll-enhanced");
    const controls = element("div", "scroll-controls");
    controls.hidden = true;
    const backToTop = element("button", "button back-to-top", content.ui.backToTop);
    backToTop.type = "button";
    backToTop.prepend(icon("up"));
    controls.append(backToTop);
    viewport.after(controls);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const chips = Array.from(main.querySelectorAll(".page-navigation-list a"), (anchor) => ({
      anchor,
      target: document.getElementById(anchor.hash.slice(1))
    }));
    const chipList = page === "disclosure" ? main.querySelector(".page-navigation-list") : null;
    const compactChips = window.matchMedia("screen and (width < 600px)");
    let lastScroll = viewport.scrollTop;
    let pending = false;

    function revealChip(anchor) {
      if (!chipList || !compactChips.matches) return;
      const listBounds = chipList.getBoundingClientRect();
      const chipBounds = anchor.getBoundingClientRect();
      const padding = parseFloat(getComputedStyle(chipList).scrollPaddingInlineStart) || 0;
      const left = chipBounds.left - listBounds.left - padding;
      const right = chipBounds.right - listBounds.right + padding;
      // Scroll only the chip row, leaving the page position and focus unchanged.
      if (left < 0 || right > 0) {
        chipList.scrollBy({ left: left < 0 ? left : right, behavior: "instant" });
      }
    }

    if (chipList) {
      chips.forEach(({ anchor }) => {
        anchor.addEventListener("focus", () => revealChip(anchor));
      });
    }

    function updateCurrentSection() {
      if (!chips.length) return;
      const boundary = header.offsetHeight + 24;
      let current = chips[0];
      for (const chip of chips) {
        if (chip.target.getBoundingClientRect().top <= boundary) current = chip;
      }
      if (viewport.scrollTop > 0 && viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2) {
        current = chips[chips.length - 1];
      }
      chips.forEach((chip) => {
        if (chip === current) chip.anchor.setAttribute("aria-current", "location");
        else chip.anchor.removeAttribute("aria-current");
      });
      const focused = chips.find((chip) => chip.anchor === document.activeElement);
      revealChip((focused || current).anchor);
    }

    function updateScroll() {
      pending = false;
      const current = Math.max(0, viewport.scrollTop);
      const keepHeader = current <= header.offsetHeight
        || header.classList.contains("is-menu-open")
        || header.contains(document.activeElement);
      if (keepHeader || current < lastScroll) header.classList.remove("is-hidden");
      else if (current > lastScroll) header.classList.add("is-hidden");
      lastScroll = current;
      // Keep the focused control available until keyboard focus moves away.
      controls.hidden = current <= 600 && document.activeElement !== backToTop;
      updateCurrentSection();
    }

    function scheduleUpdate() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(updateScroll);
    }

    backToTop.addEventListener("click", () => {
      header.classList.remove("is-hidden");
      header.querySelector(".brand").focus({ preventScroll: true });
      viewport.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
    });
    backToTop.addEventListener("blur", scheduleUpdate);
    viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    new ResizeObserver(() => {
      if (!controls.hidden) controls.style.setProperty("--control-height", `${backToTop.offsetHeight}px`);
    }).observe(backToTop);
    new ResizeObserver(scheduleUpdate).observe(main);

    function targetFromHash(hash) {
      try {
        return document.getElementById(decodeURIComponent(hash.slice(1)));
      } catch {
        return null;
      }
    }

    function goToTarget(target, focus = false) {
      // Open every enclosing record before positioning a deep disclosure link.
      for (let node = target; node && node !== main; node = node.parentElement) {
        if (node.tagName === "DETAILS") node.open = true;
      }
      header.classList.remove("is-hidden");
      if (focus) {
        if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });
        scheduleUpdate();
      });
    }

    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
      const target = targetFromHash(url.hash);
      if (!target) return;
      event.preventDefault();
      if (window.location.hash !== url.hash) {
        // Native hash navigation also works when the site is opened from disk.
        window.location.hash = url.hash;
      }
      goToTarget(target, true);
    });
    window.addEventListener("hashchange", () => {
      const target = targetFromHash(window.location.hash);
      if (target) goToTarget(target);
    });
    const initialTarget = targetFromHash(window.location.hash);
    if (initialTarget) goToTarget(initialTarget);
    scheduleUpdate();
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
  enableScrolling();
})();
