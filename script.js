let products = [];
let currentCategory = "Semua";
let points = 120;

async function submitProduct(event) {
  event.preventDefault();

  const {
    data: { user }
  } = await window.supabaseClient.auth.getUser();

  if (!user) {
    alert("Silakan login terlebih dahulu untuk menjual barang.");
    window.location.href = "login.html";
    return;
  }

  const name = document.getElementById("sellName").value;
  const category = document.getElementById("sellCategory").value;
  const price = document.getElementById("sellPrice").value;
  const condition = document.getElementById("sellCondition").value;
  const location = document.getElementById("sellLocation").value;
  const description = document.getElementById("sellDesc").value;

  // Mengambil foto
  const imageInput = document.getElementById("sellImage");
  const imageFile = imageInput.files[0];

  let imageUrl = null;

  // Upload foto ke Supabase Storage
  if (imageFile) {

    const fileExt = imageFile.name.split(".").pop().toLowerCase();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } =
      await window.supabaseClient.storage
        .from("product-images")
        .upload(fileName, imageFile);

    if (uploadError) {
      console.error("Upload foto gagal:", uploadError);
      alert("Foto gagal di-upload: " + uploadError.message);
      return;
    }

    // Mengambil URL foto
    const { data: publicUrlData } =
      window.supabaseClient.storage
        .from("product-images")
        .getPublicUrl(fileName);

    imageUrl = publicUrlData.publicUrl;
  }

  // Simpan produk ke database
  const { error } = await window.supabaseClient
    .from("products")
    .insert({
      name: name,
      category: category,
      price: price,
      condition: condition,
      description: description,
      location: location,
      image_url: imageUrl,
      seller_id: user.id,
      seller_name: user.user_metadata?.name || user.email
    });

  if (error) {
    console.error("Gagal menyimpan produk:", error);
    alert("Barang gagal diterbitkan: " + error.message);
    return;
  }

  alert("Barang dan foto berhasil diterbitkan!");

  event.target.reset();

  await loadProducts();

  showPage("home");
}
  const grid = document.getElementById("productGrid");

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:30px;">
      Memuat barang...
    </div>
  `;

  try {
    const { data, error } = await window.supabaseClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:30px;">
          Gagal memuat barang.
        </div>
      `;
      return;
    }

    products = data || [];
    renderProducts();

  } catch (error) {
    console.error(error);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:30px;">
        Terjadi kesalahan saat memuat barang.
      </div>
    `;
  }
}


function renderProducts() {
  const grid = document.getElementById("productGrid");
  const search = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  let filtered = products.filter(product => {

    const matchCategory =
      currentCategory === "Semua" ||
      product.category === currentCategory;

    const matchSearch =
      product.name.toLowerCase().includes(search) ||
      (product.description || "").toLowerCase().includes(search) ||
      (product.location || "").toLowerCase().includes(search);

    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;">
        <h3>Belum ada barang</h3>
        <p>Coba gunakan kata pencarian atau kategori lain.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {

    const price = Number(product.price || 0).toLocaleString("id-ID");

    return `
      <article class="product-card"
        onclick="showDetail('${product.id}')">

        <div class="product-image">
          ${
            product.image_url
              ? `<img src="${product.image_url}" alt="${product.name}">`
              : `<div class="no-image">📦</div>`
          }
        </div>

        <div class="product-info">
          <span class="product-category">
            ${product.category}
          </span>

          <h3>${product.name}</h3>

          <strong class="product-price">
            Rp ${price}
          </strong>

          <p>${product.condition}</p>

          <small>📍 ${product.location || "Malang"}</small>
        </div>

      </article>
    `;
  }).join("");
}


function setCategory(category, button) {
  currentCategory = category;

  document.querySelectorAll(".cat").forEach(btn => {
    btn.classList.remove("active");
  });

  button.classList.add("active");

  renderProducts();
}


function showDetail(id) {
  const product = products.find(item => item.id === id);

  if (!product) return;

  const detail = document.getElementById("detailContent");

  const price = Number(product.price || 0).toLocaleString("id-ID");

  detail.innerHTML = `
    <button class="secondary" onclick="showPage('home')">
      ← Kembali
    </button>

    <div class="detail-card">

      <div class="detail-image">
        ${
          product.image_url
            ? `<img src="${product.image_url}" alt="${product.name}">`
            : `<div class="no-image">📦</div>`
        }
      </div>

      <div class="detail-info">

        <span class="product-category">
          ${product.category}
        </span>

        <h1>${product.name}</h1>

        <h2>Rp ${price}</h2>

        <p>
          <b>Kondisi:</b> ${product.condition}
        </p>

        <p>
          <b>Lokasi:</b> ${product.location || "Malang"}
        </p>

        <p>
          ${product.description || "Tidak ada deskripsi."}
        </p>

        <button class="primary"
          onclick="alert('Silakan hubungi penjual untuk melakukan transaksi.')">
          Hubungi Penjual
        </button>

      </div>

    </div>
  `;

  showPage("detail");
}


function showPage(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active");
  });

  const target = document.getElementById(page);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");

    if (link.dataset.page === page) {
      link.classList.add("active");
    }
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


async function submitProduct(event) {
  event.preventDefault();

  const {
    data: { user }
  } = await window.supabaseClient.auth.getUser();

  if (!user) {
    alert("Silakan login terlebih dahulu untuk menjual barang.");
    window.location.href = "login.html";
    return;
  }

  const name = document.getElementById("sellName").value;
  const category = document.getElementById("sellCategory").value;
  const price = document.getElementById("sellPrice").value;
  const condition = document.getElementById("sellCondition").value;
  const location = document.getElementById("sellLocation").value;
  const description = document.getElementById("sellDesc").value;

  const { error } = await window.supabaseClient
    .from("products")
    .insert({
      name: name,
      category: category,
      price: price,
      condition: condition,
      description: description,
      location: location,
      seller_id: user.id,
      seller_name: user.user_metadata?.name || user.email
    });

  if (error) {
    console.error(error);
    alert("Gagal menerbitkan barang: " + error.message);
    return;
  }

  alert("Barang berhasil diterbitkan!");

  event.target.reset();

  await loadProducts();

  showPage("home");
}


function addPoints() {
  points += 10;

  document.getElementById("navPoints").textContent = points;
  document.getElementById("profilePoints").textContent = points;
  document.getElementById("pointBig").textContent = points;

  alert("Berhasil mendapatkan +10 COD Point!");
}


document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});
