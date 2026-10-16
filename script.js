/* ---------- MENU DATA ----------
   Placeholder dishes with no prices. Replace with the café's real menu:
   set price to e.g. "£9.30" and edit names/descriptions. */
const MENU = {
  Crêpes: [
    ["Savoury crêpe", "Freshly made with your choice of fillings."],
    ["Feta & spinach crêpe", "A savoury favourite."],
    ["Big breakfast crêpe", "Bacon, egg, cheese, tomato and mushrooms."],
    ["Sweet crêpe", "Chocolate, fruit, cream and more."],
    ["Nutella, cream & banana crêpe", "A sweet classic."],
    ["Lemon & sugar crêpe", "Simple and zesty."]
  ],
  Breakfast: [
    ["Eggs on toast", "Cooked your way."],
    ["Full breakfast", "A proper start to the day."],
    ["Pastry & coffee", "Quick and satisfying."],
    ["Porridge", "Warm, with toppings."]
  ],
  Lunch: [
    ["Chicken Mexican panini", "Served with salad."],
    ["Baguette of the day", "Ask what's on today."],
    ["Soup of the day", "Homemade, with bread."],
    ["Fresh salad", "Light and crisp."]
  ],
  Drinks: [
    ["Coffee", "Americano, latte, cappuccino and more."],
    ["Hot chocolate", "Rich and creamy."],
    ["Fresh juice", "Pressed to order."],
    ["Smoothie", "Fruit blended fresh."],
    ["Tea", "Classic and herbal."],
    ["Cold drinks", "Soft drinks and water."]
  ]
};
const PRICE_PLACEHOLDER = "£–.––";

/* ---------- OPENING HOURS (0 = Sunday) ---------- */
const HOURS = [
  { d: "Monday to Friday", days: [1, 2, 3, 4, 5], t: [8.5, 15.5] },
  { d: "Saturday", days: [6], t: [8.5, 16] },
  { d: "Sunday", days: [0], t: null }
];
const fmt = h => `${Math.floor(h)}:${h % 1 ? "30" : "00"}`;

const $ = s => document.querySelector(s);

/* ---------- Mobile nav ---------- */
const burger = $("#burger"), menu = $("#navMenu");
function setNav(open) {
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
burger.addEventListener("click", () => setNav(!menu.classList.contains("open")));
menu.addEventListener("click", e => e.target.closest("a") && setNav(false));
document.addEventListener("keydown", e => e.key === "Escape" && setNav(false));
document.addEventListener("click", e => {
  if (!e.target.closest("#nav")) setNav(false);
});
const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("stuck", scrollY > 10), { passive: true });

/* ---------- Menu tabs ---------- */
const tabs = $("#tabs"), items = $("#items");
function show(cat) {
  tabs.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", b.dataset.cat === cat));
  items.innerHTML = MENU[cat].map(([n, d], i) =>
    `<div class="item" style="animation-delay:${i * 40}ms"><div><h3>${n}</h3><p>${d}</p></div><span class="price">${PRICE_PLACEHOLDER}</span></div>`
  ).join("");
}
Object.keys(MENU).forEach((cat, i) => {
  const b = document.createElement("button");
  b.className = "tab"; b.type = "button"; b.dataset.cat = cat; b.textContent = cat;
  b.setAttribute("role", "tab");
  b.onclick = () => show(cat);
  tabs.appendChild(b);
});
show(Object.keys(MENU)[0]);

/* ---------- Opening hours + open/closed status (UK time) ---------- */
function ukNow() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", weekday: "short", hour: "numeric", minute: "numeric", hour12: false
  }).formatToParts(new Date()).map(x => [x.type, x.value]));
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { day, time: (+p.hour % 24) + +p.minute / 60 };
}
function render() {
  const { day, time } = ukNow();
  $("#hours").innerHTML = HOURS.map(r =>
    `<div class="${r.days.includes(day) ? "today" : ""}"><dt>${r.d}</dt><dd>${r.t ? fmt(r.t[0]) + " to " + fmt(r.t[1]) : "Closed"}</dd></div>`
  ).join("");
  const today = HOURS.find(r => r.days.includes(day));
  const isOpen = today.t && time >= today.t[0] && time < today.t[1];
  let msg;
  if (isOpen) msg = `Open now, until ${fmt(today.t[1])}`;
  else {
    let next = null;
    for (let i = 0; i < 7 && !next; i++) {
      const d = (day + i) % 7, r = HOURS.find(x => x.days.includes(d));
      if (r.t && (i > 0 || time < r.t[0])) next = { i, r };
    }
    const when = next.i === 0 ? "today" : next.i === 1 ? "tomorrow" : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][(day + next.i) % 7];
    msg = `Closed, opens ${when} at ${fmt(next.r.t[0])}`;
  }
  document.querySelectorAll("[data-status]").forEach(el => {
    el.textContent = msg; el.classList.toggle("open", !!isOpen);
  });
}
render(); setInterval(render, 60000);

/* ---------- Active nav link ---------- */
const links = [...menu.querySelectorAll("a")];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.hash === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
["menu", "order", "about", "visit"].forEach(id => spy.observe($("#" + id)));

/* ---------- One gentle reveal on the headline block ---------- */
document.querySelector(".hero-text").classList.add("rv");
requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector(".hero-text").classList.add("show")));

$("#year").textContent = new Date().getFullYear();
