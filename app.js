const $ = id => document.getElementById(id);

const DEFAULT_DEPARTMENTS = [
  "Boshqaruv",
  "Hisob bo‘limi",
  "Savdo bo‘limi"
];

function load(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

let xodimlar = load("ishxonaXodimlari", []);
let bolimlar = load("ishxonaBolimlari", DEFAULT_DEPARTMENTS);
let boshliq = load("ishxonaBoshliq", {
  name: "", surname: "", age: "", phone: ""
});
let yangiRasm = "";
let oldingiRasm = "";

// Login
function kirish() {
  if ($("login").value === "admin" &&
      $("password").value === "12345") {
    $("loginBox").hidden = true;
    $("main").hidden = false;
    $("xato").textContent = "";
    yangilash();
    sahifaOchish("dashboard");
  } else {
    $("xato").textContent = "Login yoki parol noto‘g‘ri!";
  }
}

function chiqish() {
  $("main").hidden = true;
  $("loginBox").hidden = false;
  $("password").value = "";
}

// Menyularni almashtirish
const nomlar = {
  dashboard: "Bosh menyu",
  boss: "Boshliq",
  employees: "Xodimlar",
  departments: "Bo‘limlar",
  salaries: "Maoshlar",
  reports: "Hisobotlar"
};

function sahifaOchish(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.hidden = page.id !== id;
  });

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.page === id);
  });

  $("pageTitle").textContent = nomlar[id];
}

document.querySelectorAll(".nav").forEach(button => {
  button.addEventListener("click", () => {
    sahifaOchish(button.dataset.page);
  });
});

// Ma'lumotlarni saqlash
function saqlash() {
  try {
    localStorage.setItem("ishxonaXodimlari", JSON.stringify(xodimlar));
    localStorage.setItem("ishxonaBolimlari", JSON.stringify(bolimlar));
    localStorage.setItem("ishxonaBoshliq", JSON.stringify(boshliq));
    return true;
  } catch {
    alert("Xotira to‘ldi. Rasm hajmini kichraytirib ko‘ring.");
    return false;
  }
}

function pul(son) {
  return Number(son || 0).toLocaleString("uz-UZ") + " so‘m";
}

// Rasm yuklash va ko‘rsatish
$("photo").addEventListener("change", function() {
  const file = this.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Rasm faylini tanlang.");
    this.value = "";
    return;
  }

  if (file.size > 700 * 1024) {
    alert("Rasm 700 KB dan kichik bo‘lsin.");
    this.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    yangiRasm = reader.result;
    $("photoPreview").src = yangiRasm;
    $("photoPreview").hidden = false;
  };

  reader.readAsDataURL(file);
});

// Bo‘lim tanlash ro‘yxati
function bolimTanlash() {
  const select = $("department");
  const oldingi = select.value;

  select.replaceChildren();

  bolimlar.forEach(nom => {
    const option = document.createElement("option");
    option.value = nom;
    option.textContent = nom;
    select.appendChild(option);
  });

  if (bolimlar.includes(oldingi)) select.value = oldingi;
}

// Xodim qo‘shish yoki tahrirlash
$("employeeForm").addEventListener("submit", function(e) {
  e.preventDefault();

  if (bolimlar.length === 0) {
    alert("Avval Bo‘limlar menyusidan bo‘lim qo‘shing.");
    return;
  }

  const id = $("employeeId").value;
  const eski = xodimlar.find(x => String(x.id) === id);

  const xodim = {
    id: eski ? eski.id : Date.now(),
    rasm: yangiRasm  (eski && eski.rasm),
    lavozim: $("position").value.trim(),
    ism: $("name").value.trim(),
    familiya: $("surname").value.trim(),
    yosh: $("age").value,
    telefon: $("phone").value.trim(),
    bolim: $("department").value,
    maosh: Number($("salary").value)
  };

  const oldingi = [...xodimlar];

  if (eski) {
    xodimlar = xodimlar.map(x => x.id === eski.id ? xodim : x);
  } else {
    xodimlar.push(xodim);
  }

  if (!saqlash()) {
    xodimlar = oldingi;
    return;
  }

  formReset();
  yangilash();
  alert(eski ? "Xodim ma’lumoti yangilandi!" : "Xodim qo‘shildi!");
});
// Formani tozalash
function formReset() {
  $("employeeForm").reset();
  $("employeeId").value = "";
  yangiRasm = "";
  oldingiRasm = "";
  $("photoPreview").hidden = true;
  $("photoPreview").removeAttribute("src");
  $("employeeFormTitle").textContent = "Yangi xodim qo‘shish";
  $("saveEmployee").textContent = "Xodim qo‘shish";
}

// Xavfsiz matn ko‘rsatish
function matn(element, value) {
  element.textContent = value ?? "";
}

function rasmYarat(x) {
  const img = document.createElement("img");
  img.className = "employee-photo";
  img.alt = x.ism + " " + x.familiya + " rasmi";

  if (x.rasm) {
    img.src = x.rasm;
  } else {
    img.alt = "Rasm yuklanmagan";
    img.src = "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
        '<rect width="100%" height="100%" fill="#dbeafe"/>' +
        '<text x="50%" y="55%" text-anchor="middle" font-size="38" fill="#2459a9">?</text>' +
        '</svg>'
      );
  }

  return img;
}

// Xodim kartochkasi
function xodimKarta(x) {
  const card = document.createElement("div");
  card.className = "employee-card";
  card.appendChild(rasmYarat(x));

  const info = document.createElement("div");
  info.className = "employee-info";

  const h3 = document.createElement("h3");
  matn(h3, x.ism + " " + x.familiya);
  info.appendChild(h3);

  [
    "Lavozimi: " + x.lavozim,
    "Yoshi: " + x.yosh,
    "Telefon: " + x.telefon,
    "Bo‘lim: " + x.bolim,
    "Maosh: " + pul(x.maosh)
  ].forEach(text => {
    const p = document.createElement("p");
    matn(p, text);
    info.appendChild(p);
  });

  const actions = document.createElement("div");
  actions.className = "actions";

  const edit = document.createElement("button");
  edit.className = "edit";
  edit.textContent = "Tahrirlash";
  edit.onclick = () => tahrirlash(x.id);

  const del = document.createElement("button");
  del.className = "delete";
  del.textContent = "O‘chirish";
  del.onclick = () => ochirish(x.id);

  actions.append(edit, del);
  info.appendChild(actions);
  card.appendChild(info);

  return card;
}

// Xodimlarni chiqarish va qidirish
function xodimlarniChiqar() {
  const list = $("employeeList");
  list.replaceChildren();

  const q = $("search").value.toLowerCase().trim();

  const natija = xodimlar.filter(x =>
    [x.ism, x.familiya, x.telefon, x.lavozim, x.bolim]
      .some(v => String(v || "").toLowerCase().includes(q))
  );

  if (!natija.length) {
    const p = document.createElement("p");
    matn(p, "Xodim topilmadi.");
    list.appendChild(p);
    return;
  }

  natija.forEach(x => list.appendChild(xodimKarta(x)));
}

$("search").addEventListener("input", xodimlarniChiqar);

// Xodimni tahrirlash
function tahrirlash(id) {
  const x = xodimlar.find(item => item.id === id);
  if (!x) return;

  sahifaOchish("employees");
  bolimTanlash();

  $("employeeId").value = x.id;
  $("position").value = x.lavozim;
  $("name").value = x.ism;
  $("surname").value = x.familiya;
  $("age").value = x.yosh;
  $("phone").value = x.telefon;
  $("department").value = x.bolim;
  $("salary").value = x.maosh;

  yangiRasm = "";
  oldingiRasm = x.rasm || "";

  if (x.rasm) {
    $("photoPreview").src = x.rasm;
    $("photoPreview").hidden = false;
  } else {
    $("photoPreview").hidden = true;
  }

  $("employeeFormTitle").textContent = "Xodimni tahrirlash";
  $("saveEmployee").textContent = "O‘zgarishlarni saqlash";
  $("employeeFormTitle").scrollIntoView({ behavior: "smooth" });
}

// Xodimni o‘chirish
function ochirish(id) {
  const x = xodimlar.find(item => item.id === id);
  if (!x) return;

  if (!confirm(x.ism + " " + x.familiya + "ni o‘chirasizmi?")) return;

  const oldingi = [...xodimlar];
  xodimlar = xodimlar.filter(item => item.id !== id);

  if (!saqlash()) {
    xodimlar = oldingi;
    return;
  }

  yangilash();
}
// Boshliq ma'lumotlari
function bossniChiqar() {
  $("bossName").value = boshliq.name || "";
  $("bossSurname").value = boshliq.surname || "";
  $("bossAge").value = boshliq.age || "";
  $("bossPhone").value = boshliq.phone || "";
}

$("bossForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const eski = boshliq;
  boshliq = {
    name: $("bossName").value.trim(),
    surname: $("bossSurname").value.trim(),
    age: $("bossAge").value,
    phone: $("bossPhone").value.trim()
  };

  if (!saqlash()) {
    boshliq = eski;
    return;
  }

  alert("Boshliq ma’lumotlari saqlandi!");
});

// Bo‘lim qo‘shish
$("departmentForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const nom = $("departmentName").value.trim();

  if (bolimlar.some(b => b.toLowerCase() === nom.toLowerCase())) {
    alert("Bu bo‘lim mavjud!");
    return;
  }

  const eski = [...bolimlar];
  bolimlar.push(nom);

  if (!saqlash()) {
    bolimlar = eski;
    return;
  }

  $("departmentForm").reset();
  yangilash();
});

// Bo‘limlar ro‘yxati
function bolimlarniChiqar() {
  const list = $("departmentList");
  list.replaceChildren();

  bolimlar.forEach(nom => {
    const item = document.createElement("div");
    item.className = "item";

    const title = document.createElement("strong");
    matn(title, nom);

    const count = xodimlar.filter(x => x.bolim === nom).length;
    const p = document.createElement("p");
    matn(p, "Xodimlar: " + count);

    const btn = document.createElement("button");
    btn.className = "delete";
    btn.textContent = "Bo‘limni o‘chirish";

    btn.onclick = () => {
      if (xodimlar.some(x => x.bolim === nom)) {
        alert("Bu bo‘limda xodim bor. Avval xodimlarni boshqa bo‘limga o‘tkazing.");
        return;
      }

      if (!confirm(nom + " bo‘limini o‘chirasizmi?")) return;

      const eski = [...bolimlar];
      bolimlar = bolimlar.filter(b => b !== nom);

      if (!saqlash()) {
        bolimlar = eski;
        return;
      }

      yangilash();
    };

    item.append(title, p, btn);
    list.appendChild(item);
  });
}

// Maoshlar ro‘yxati
function maoshlarniChiqar() {
  const list = $("salaryList");
  list.replaceChildren();

  xodimlar.forEach(x => {
    const item = document.createElement("div");
    item.className = "item";
    matn(item, x.ism + " " + x.familiya + " — " + pul(x.maosh));
    list.appendChild(item);
  });

  const jami = xodimlar.reduce((sum, x) => sum + Number(x.maosh || 0), 0);
  $("salaryTotal").textContent = pul(jami);
  $("totalSalary").textContent = pul(jami);
}

// Hisobotlar
function hisobotChiqar() {
  const jami = xodimlar.reduce((sum, x) => sum + Number(x.maosh || 0), 0);

  $("reportEmployees").textContent = xodimlar.length;
  $("reportDepartments").textContent = bolimlar.length;
  $("averageSalary").textContent =
    pul(xodimlar.length ? Math.round(jami / xodimlar.length) : 0);

  const report = $("departmentReport");
  report.replaceChildren();

  bolimlar.forEach(nom => {
    const count = xodimlar.filter(x => x.bolim === nom).length;
    const item = document.createElement("div");
    item.className = "item";
    matn(item, nom + ": " + count + " nafar xodim");
    report.appendChild(item);
  });
}

// Bosh menyu va umumiy yangilash
function boshMenyu() {
  $("totalEmployees").textContent = xodimlar.length;
  $("totalDepartments").textContent = bolimlar.length;

  const recent = $("recentEmployees");
  recent.replaceChildren();

  xodimlar.slice(-5).reverse().forEach(x => {
    recent.appendChild(xodimKarta(x));
  });

  if (!xodimlar.length) {
    const p = document.createElement("p");
    matn(p, "Hozircha xodimlar yo‘q.");
    recent.appendChild(p);
  }
}

function yangilash() {
  bolimTanlash();
  bossniChiqar();
  xodimlarniChiqar();
  bolimlarniChiqar();
  maoshlarniChiqar();
  hisobotChiqar();
  boshMenyu();
}

// Dastlabki ishga tushirish
bolimTanlash();