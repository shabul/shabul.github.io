(() => {
  "use strict";

  const output = document.getElementById("terminal-output");
  const input = document.getElementById("command-input");
  const form = document.getElementById("prompt-form");
  const history = [];
  let historyIndex = 0;

  const links = {
    github: ["GitHub", "https://github.com/shabul"],
    linkedin: ["LinkedIn", "https://www.linkedin.com/in/shabul/"],
    portfolio: ["Portfolio", "https://shabul.github.io/"],
    email: ["Email", "mailto:abdul.shabul@outlook.com"],
  };

  const projects = [
    ["model-foundry", "LoRA fine-tunes, evaluations, and Hugging Face deployments built on Apple Silicon.", "https://github.com/shabul/model-foundry"],
    ["teach-langchain-and-langgraph", "Learning notes, snippets, and mini-projects for LangChain and LangGraph.", "https://github.com/shabul/teach-langchain-and-langgraph"],
    ["claude-local-api", "A lightweight Unix-socket bridge from local scripts to the Claude Code CLI.", "https://github.com/shabul/claude-local-api"],
    ["pocket-brain", "An experiment running a Gemma 2B model on Android with Termux and a local API.", "https://github.com/shabul/pocket-brain"],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function paragraph(parent, text, className = "") {
    parent.append(el("p", className, text));
  }

  function title(parent, text) {
    parent.append(el("h2", "output-title", text));
  }

  function link(parent, label, href) {
    const anchor = el("a", "", label);
    anchor.href = href;
    if (!href.startsWith("mailto:")) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    parent.append(anchor);
  }

  function addEntry(command, render) {
    const entry = el("div", "entry");
    if (command !== null) {
      const line = el("div", "command-line");
      line.append(el("span", "prompt", "shabul@ai:~$ "), el("span", "typed", command));
      entry.append(line);
    }
    const body = el("div", "output");
    render(body);
    entry.append(body);
    output.append(entry);
    output.scrollTop = output.scrollHeight;
  }

  const commands = {
    help(body) {
      title(body, "Available commands");
      const items = [
        ["whoami", "the person behind the prompt"],
        ["systems", "what I build in applied AI"],
        ["skills", "the tools and methods"],
        ["projects", "public code and experiments"],
        ["career", "where I've worked"],
        ["contact", "links and email"],
        ["clear", "wipe the console"],
      ];
      for (const [name, description] of items) {
        const row = el("p");
        row.append(el("span", "accent", name.padEnd(12, " ")), el("span", "soft", description));
        body.append(row);
      }
      paragraph(body, "Tip: use ↑ / ↓ for history and Tab to complete a command.", "soft");
    },
    whoami(body) {
      title(body, "Shabul Hussain Abdul");
      paragraph(body, "Senior Applied AI/ML Scientist at JPMorgan Chase, based in Bengaluru, India.", "output-lead");
      paragraph(body, "I work where machine learning meets usable software: agent workflows, retrieval, model quality, and efficient deployment.");
      paragraph(body, "Previously: Amazon and TCS. More than seven years in ML and data science.", "soft");
    },
    systems(body) {
      title(body, "The systems around the model");
      paragraph(body, "My focus is practical GenAI: make it useful, measurable, and efficient.", "output-lead");
      const cards = [
        ["01 / ORCHESTRATE", "Agent systems", "Multi-agent workflows and MCP-connected tools."],
        ["02 / EVALUATE", "Model quality", "LLM evaluations, guardrails, and prompt optimization."],
        ["03 / OPTIMIZE", "Model efficiency", "LoRA, quantization, and distillation."],
        ["04 / RETRIEVE", "Knowledge systems", "RAG, vector search, and graph search."],
      ];
      const grid = el("div", "output-grid");
      for (const [label, heading, description] of cards) {
        const card = el("div", "output-card");
        card.append(el("small", "", label), el("h3", "", heading), el("p", "", description));
        grid.append(card);
      }
      body.append(grid);
    },
    skills(body) {
      title(body, "Working toolkit");
      const terms = [
        ["Agents", "Multi-agent systems · LangGraph · MCP"],
        ["LLMs", "Evaluation · Guardrails · Prompt optimization"],
        ["Efficiency", "LoRA · Quantization · Distillation"],
        ["Retrieval", "RAG · Vector search · Graph search"],
        ["Practice", "Python · Model experimentation · Deployment"],
      ];
      const list = el("dl");
      for (const [label, value] of terms) {
        const row = el("div", "skill-row");
        row.append(el("dt", "", label), el("dd", "", value));
        list.append(row);
      }
      body.append(list);
    },
    projects(body) {
      title(body, "Code in the open");
      paragraph(body, "A few public projects and learning experiments—not a claim about proprietary work.", "soft");
      for (const [name, description, href] of projects) {
        const row = el("div", "project-row");
        link(row, `${name} ↗`, href);
        paragraph(row, description);
        body.append(row);
      }
    },
    career(body) {
      title(body, "Experience");
      const roles = [
        ["NOW", "Sr. Applied AI/ML Scientist", "JPMorgan Chase"],
        ["BEFORE", "Applied science and ML roles", "Amazon"],
        ["EARLIER", "Technology and data work", "TCS"],
      ];
      for (const [when, role, company] of roles) {
        const row = el("p");
        row.append(el("span", "accent", `${when.padEnd(10, " ")}`), el("strong", "", `${role} · `), el("span", "soft", company));
        body.append(row);
      }
      paragraph(body, "Public profile only; confidential work stays confidential.", "soft");
    },
    contact(body) {
      title(body, "Find me elsewhere");
      for (const [label, href] of Object.values(links)) {
        const row = el("p");
        row.append(el("span", "accent", label.padEnd(12, " ")));
        link(row, href.replace(/^mailto:/, ""), href);
        body.append(row);
      }
    },
  };

  const aliases = { about: "whoami", work: "systems", stack: "skills", ls: "projects", experience: "career", links: "contact" };
  const commandNames = [...Object.keys(commands), "clear", ...Object.keys(aliases)];

  function run(raw) {
    const entered = raw.trim();
    if (!entered) return;
    history.push(entered);
    historyIndex = history.length;
    const normalized = entered.toLowerCase().replace(/\s+/g, " ");
    const command = aliases[normalized] || normalized;
    if (command === "clear") {
      output.replaceChildren();
      return;
    }
    if (commands[command]) {
      addEntry(entered, commands[command]);
    } else {
      addEntry(entered, body => {
        paragraph(body, `Command not found: ${entered}`, "amber");
        paragraph(body, "Type help to see what this terminal can do.", "soft");
      });
    }
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    run(input.value);
    input.value = "";
    input.focus();
  });

  document.querySelectorAll("[data-command]").forEach(button => {
    button.addEventListener("click", () => {
      run(button.dataset.command);
      input.focus();
    });
  });

  input.addEventListener("keydown", event => {
    if (event.key === "ArrowUp" && history.length) {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (event.key === "ArrowDown" && history.length) {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || "";
    } else if (event.key === "Tab") {
      const partial = input.value.trim().toLowerCase();
      const matches = commandNames.filter(name => name.startsWith(partial));
      if (partial && matches.length === 1) {
        event.preventDefault();
        input.value = matches[0];
      }
    }
  });

  document.addEventListener("keydown", event => {
    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      output.replaceChildren();
      input.focus();
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  addEntry(null, body => {
    paragraph(body, "SHABUL / AI SYSTEMS                                      v1.0", "accent");
    paragraph(body, "An interactive field guide to my AI, ML, and GenAI work.");
    paragraph(body, "Try: whoami · systems · projects · skills · career · contact", "soft");
  });
})();
