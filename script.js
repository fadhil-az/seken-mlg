let products = [];
let currentCategory = "Semua";
let points = 120;


// ======================================================
// LOAD PRODUCTS DARI SUPABASE
// ======================================================

async function loadProducts() {
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
  .eq("status", "approved")
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


// ======================================================
// MENAMPILKAN PRODUK
// ======================================================

function renderProducts() {

  const grid = document.getElementById("productGrid");

  if (!grid) return;

  const searchInput =
    document.getElementById("searchInput");

  const conditionFilter =
    document.getElementById("conditionFilter");

  const priceFilter =
    document.getElementById("priceFilter");

  const search =
    searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

  const condition =
    conditionFilter
      ? conditionFilter.value
      : "Semua";

  const price =
    priceFilter
      ? priceFilter.value
      : "default";


  let filtered = products.filter(product => {

    /* FILTER KATEGORI */

    const matchCategory =
      currentCategory === "Semua" ||
      product.category === currentCategory;


    /* FILTER PENCARIAN */

    const matchSearch =
      (product.name || "")
        .toLowerCase()
        .includes(search) ||

      (product.description || "")
        .toLowerCase()
        .includes(search) ||

      (product.location || "")
        .toLowerCase()
        .includes(search);


    /* FILTER KONDISI */

    const matchCondition =
      condition === "Semua" ||
      product.condition === condition;


    return (
      matchCategory &&
      matchSearch &&
      matchCondition
    );

  });


  /* URUTKAN HARGA */

  if (price === "low") {

    filtered.sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    );

  }

  if (price === "high") {

    filtered.sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    );

  }


  /* JIKA TIDAK ADA BARANG */

  if (filtered.length === 0) {

    grid.innerHTML = `
      <div
        style="
          grid-column:1/-1;
          text-align:center;
          padding:40px;
        "
      >

        <h3>Barang tidak ditemukan</h3>

        <p>
          Coba gunakan kata pencarian,
          kondisi, atau kategori lain.
        </p>

      </div>
    `;

    return;
  }


  /* TAMPILKAN BARANG */

  grid.innerHTML = filtered.map(product => {

    const price =
      Number(product.price || 0)
      .toLocaleString("id-ID");


    return `
      <article
        class="product-card"
        onclick="showDetail('${product.id}')"
      >

        <div class="product-image">

          ${
            product.image_url
              ? `
                <img
                  src="${product.image_url}"
                  alt="${product.name}"
                >
              `
              : `
                <div class="no-image">
                  📦
                </div>
              `
          }

        </div>


        <div class="product-info">

          <span class="product-category">
            ${product.category}
          </span>

          <h3>
            ${product.name}
          </h3>

          <strong class="product-price">
            Rp ${price}
          </strong>

          <p>
            ${product.condition}
          </p>

          <small>
            📍 ${product.location || "Malang"}
          </small>

        </div>

      </article>
    `;

  }).join("");

}
function applyFilters() {
  renderProducts();
}


function resetFilters() {

  const searchInput =
    document.getElementById("searchInput");

  const conditionFilter =
    document.getElementById("conditionFilter");

  const priceFilter =
    document.getElementById("priceFilter");


  if (searchInput) {
    searchInput.value = "";
  }


  if (conditionFilter) {
    conditionFilter.value = "Semua";
  }


  if (priceFilter) {
    priceFilter.value = "default";
  }


  currentCategory = "Semua";


  document.querySelectorAll(".cat").forEach(button => {
    button.classList.remove("active");
  });


  const allButton =
    document.querySelectorAll(".cat")[0];


  if (allButton) {
    allButton.classList.add("active");
  }


  renderProducts();
}

// ======================================================
// FILTER KATEGORI
// ======================================================

function setCategory(category, button) {

  currentCategory = category;


  document.querySelectorAll(".cat").forEach(btn => {

    btn.classList.remove("active");

  });


  if (button) {
    button.classList.add("active");
  }


  renderProducts();
}


// ======================================================
// DETAIL PRODUK
// ======================================================

async function showDetail(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  const detail = document.getElementById("detailContent");
  const price = Number(product.price || 0).toLocaleString("id-ID");

  // Ambil data profil penjual
  let seller = null;

  if (product.seller_id) {
    const { data, error } = await window.supabaseClient
      .from("profiles")
      .select("name, phone, location")
      .eq("id", product.seller_id)
      .maybeSingle();

    if (error) {
      console.error("Gagal mengambil profil penjual:", error);
    } else {
      seller = data;
    }
  }

  const sellerName =
    seller?.name ||
    product.seller_name ||
    "Penjual Seken.mlg";

  const sellerLocation =
    seller?.location ||
    product.location ||
    "Malang, Jawa Timur";

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
          <b>Kondisi:</b>
          ${product.condition}
        </p>

        <p>
          <b>Lokasi:</b>
          ${product.location || "Malang"}
        </p>

        <p>
          ${product.description || "Tidak ada deskripsi."}
        </p>

        <!-- PROFIL PENJUAL -->
        <div class="seller-box">

          <h3>👤 Penjual</h3>

          <p>
            <b>${sellerName}</b>
          </p>

          <p>
            📍 ${sellerLocation}
          </p>

        </div>

        <button
          class="primary"
          id="contactSellerButton"
          onclick="contactSeller('${product.id}')">
          💬 Hubungi Penjual
        </button>

      </div>
    </div>
  `;

  showPage("detail");
}
// ======================================================
// HUBUNGI PENJUAL VIA WHATSAPP
// ======================================================

async function contactSeller(productId) {

  try {

    const product =
      products.find(item => item.id === productId);

    if (!product) {
      alert("Data barang tidak ditemukan.");
      return;
    }

    if (!product.seller_id) {
      alert("Data penjual belum tersedia.");
      return;
    }

    const {
      data: seller,
      error
    } = await window.supabaseClient
      .from("profiles")
      .select("name, phone")
      .eq("id", product.seller_id)
      .maybeSingle();

    if (error) {

      console.error(
        "Gagal mengambil data penjual:",
        error
      );

      alert(
        "Data penjual gagal dimuat:\n" +
        error.message
      );

      return;
    }

    if (!seller || !seller.phone) {

      alert(
        "Penjual belum memasukkan nomor WhatsApp."
      );

      return;
    }

    let phone =
      seller.phone.replace(/\D/g, "");

    if (phone.startsWith("0")) {

      phone =
        "62" + phone.substring(1);

    }

    const message =
      encodeURIComponent(
        `Halo ${seller.name || "Penjual"}, saya tertarik dengan barang "${product.name}" di Seken.mlg. Apakah barangnya masih tersedia?`
      );

    const whatsappUrl =
      `https://wa.me/${phone}?text=${message}`;

    window.open(
      whatsappUrl,
      "_blank"
    );

  } catch (error) {

    console.error(
      "Error contactSeller:",
      error
    );

    alert(
      "Terjadi kesalahan saat menghubungi penjual."
    );

  }
}

 


// ======================================================
// PINDAH HALAMAN
// ======================================================

function showPage(page) {

  document.querySelectorAll(".page").forEach(section => {

    section.classList.remove("active");

  });


  const target =
    document.getElementById(page);


  if (target) {

    target.classList.add("active");

  }


  document.querySelectorAll(".nav-link").forEach(link => {

    link.classList.remove("active");


    if (link.dataset.page === page) {

      link.classList.add("active");

    }

  });


  // ====================================================
  // LOAD PROFILE SAAT HALAMAN PROFIL DIBUKA
  // ====================================================

  if (page === "profil") {

    loadProfile();

  }


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });
}


// ======================================================
// LOAD PROFILE DARI SUPABASE
// ======================================================

async function loadProfile() {

  try {

    // ==================================================
    // CEK USER YANG SEDANG LOGIN
    // ==================================================

    const {
      data: { user },
      error: userError
    } = await window.supabaseClient.auth.getUser();


    // ==================================================
    // JIKA BELUM LOGIN
    // ==================================================

    if (userError || !user) {

      document.getElementById("profileName").textContent =
        "Belum Login";

      document.getElementById("profileLocation").textContent =
        "Silakan login terlebih dahulu";

      document.getElementById("profileAvatar").textContent =
        "U";

      document.getElementById("profileSold").textContent =
        "0";

      document.getElementById("profileBought").textContent =
        "0";

      document.getElementById("myProducts").innerHTML = `
        <div class="activity">
          <span>🔐</span>

          <div>
            <b>Silakan login untuk melihat profil</b>

            <small>
              Login untuk melihat data profil dan barang.
            </small>
          </div>
        </div>
      `;

      return;
    }


    // ==================================================
    // AMBIL DATA PROFILE
    // ==================================================

    const {
      data: profile,
      error: profileError
    } = await window.supabaseClient
      .from("profiles")
      .select("name, location, avatar_url")
      .eq("id", user.id)
      .maybeSingle();


    if (profileError) {

      console.error(
        "Gagal mengambil profil:",
        profileError
      );

    }


    // ==================================================
    // DATA PROFILE
    // ==================================================

    const name =
      profile?.name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Pengguna";


    const location =
      profile?.location ||
      user.user_metadata?.location ||
      "Malang, Jawa Timur";


    // ==================================================
    // TAMPILKAN DATA PROFILE
    // ==================================================

    document.getElementById("profileName").textContent =
      name;


    document.getElementById("profileLocation").textContent =
      location;


    document.getElementById("profileAvatar").textContent =
      name.charAt(0).toUpperCase();


    // ==================================================
    // AMBIL BARANG MILIK USER
    // ==================================================

    const {
      data: myProducts,
      error: productsError
    } = await window.supabaseClient
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", {
        ascending: false
      });


    if (productsError) {

      console.error(
        "Gagal mengambil barang:",
        productsError
      );


      document.getElementById("myProducts").innerHTML = `
        <div class="activity">

          <span>⚠️</span>

          <div>

            <b>Gagal memuat barang</b>

            <small>
              ${productsError.message}
            </small>

          </div>

        </div>
      `;

      return;
    }


    const productsSaya =
      myProducts || [];


    // ==================================================
    // JUMLAH BARANG DIJUAL
    // ==================================================

    document.getElementById("profileSold").textContent =
      productsSaya.length;


    // Untuk sementara belum ada sistem pembelian
    document.getElementById("profileBought").textContent =
      "0";


    // ==================================================
    // COD POINT
    // ==================================================

    document.getElementById("profilePoints").textContent =
      points;


    document.getElementById("pointBig").textContent =
      points;


    // ==================================================
    // TAMPILKAN BARANG SAYA
    // ==================================================

    const container =
      document.getElementById("myProducts");


    // Jika belum punya barang
    if (productsSaya.length === 0) {

      container.innerHTML = `
        <div class="activity">

          <span>📦</span>

          <div>

            <b>Belum ada barang</b>

            <small>
              Barang yang kamu jual akan muncul di sini.
            </small>

          </div>

        </div>
      `;

      return;
    }

// ==================================================
// TAMPILKAN DAFTAR BARANG + STATUS + HAPUS
// ==================================================

container.innerHTML =
  productsSaya.map(product => {

    const image =
      product.image_url
        ? `
          <img
            src="${product.image_url}"
            alt="${product.name}"
          >
        `
        : `
          <div class="no-image">
            📦
          </div>
        `;

    const price =
      Number(product.price || 0)
        .toLocaleString("id-ID");

    // ==================================================
    // STATUS BARANG
    // ==================================================

    const status = product.status || "pending";

    let statusLabel = "⏳ Pending";
    let statusClass = "status-pending";

    if (status === "approved") {
      statusLabel = "✓ Disetujui";
      statusClass = "status-approved";
    }

    if (status === "rejected") {
      statusLabel = "✕ Ditolak";
      statusClass = "status-rejected";
    }

    const rejectionReason =
      status === "rejected" && product.rejection_reason
        ? `
          <small class="rejection-reason">
            Alasan: ${product.rejection_reason}
          </small>
        `
        : "";

    // Barang yang belum disetujui tidak perlu dibuka ke detail
    const clickAction =
      status === "approved"
        ? `onclick="showDetail('${product.id}')"`
        : "";

    return `
      <article
        class="product-card"
        ${clickAction}
      >

        <div class="product-image">
          ${image}
        </div>

        <div class="product-info">

          <span class="product-category">
            ${product.category}
          </span>

          <h3>
            ${product.name}
          </h3>

          <strong class="product-price">
            Rp ${price}
          </strong>

          <p>
            ${product.condition}
          </p>

          <small>
            📍 ${product.location || "Malang"}
          </small>

          <!-- STATUS BARANG -->
          <div class="product-status ${statusClass}">
            ${statusLabel}
          </div>

          ${rejectionReason}

          <!-- TOMBOL HAPUS -->
          <button
            type="button"
            class="secondary"
            style="
              margin-top:12px;
              width:100%;
              color:#c0392b;
            "
            onclick="event.stopPropagation(); deleteProduct('${product.id}')"
          >
            🗑️ Hapus Barang
          </button>

        </div>

      </article>
    `;

  }).join("");

  } catch (error) {

    console.error(
      "Error loadProfile:",
      error
    );

  }
}

// ======================================================
// HAPUS BARANG
// ======================================================

async function deleteProduct(productId) {

  const confirmDelete =
    confirm(
      "Apakah kamu yakin ingin menghapus barang ini?"
    );

  if (!confirmDelete) {
    return;
  }

  try {

    // Cek user yang sedang login
    const {
      data: { user },
      error: userError
    } = await window.supabaseClient.auth.getUser();

    if (userError || !user) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    // Hapus barang milik user
    const {
      error
    } = await window.supabaseClient
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("seller_id", user.id);

    if (error) {

      console.error(
        "Gagal menghapus barang:",
        error
      );

      alert(
        "Barang gagal dihapus:\n" +
        error.message
      );

      return;
    }

    alert(
      "Barang berhasil dihapus."
    );

    // Muat ulang profil
    await loadProfile();

    // Muat ulang produk di halaman utama
    await loadProducts();

  } catch (error) {

    console.error(
      "Error deleteProduct:",
      error
    );

    alert(
      "Terjadi kesalahan saat menghapus barang."
    );

  }
}
// ======================================================
// EDIT PROFILE
// ======================================================

async function editProfile() {

  try {

    // Cek user yang sedang login
    const {
      data: { user },
      error: userError
    } = await window.supabaseClient.auth.getUser();

    if (userError || !user) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    // Ambil data profile dari Supabase
    const {
      data: profile,
      error: profileError
    } = await window.supabaseClient
      .from("profiles")
      .select("name, phone, location")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {

      console.error(
        "Gagal mengambil profil:",
        profileError
      );

      alert(
        "Gagal mengambil data profil:\n" +
        profileError.message
      );

      return;
    }

    // Masukkan data ke form
    document.getElementById("editName").value =
      profile?.name ||
      user.user_metadata?.name ||
      "";

    document.getElementById("editPhone").value =
      profile?.phone ||
      "";

    document.getElementById("editLocation").value =
      profile?.location ||
      user.user_metadata?.location ||
      "Malang, Jawa Timur";

    // Tampilkan modal
    document.getElementById("editProfileModal").style.display =
      "flex";

  } catch (error) {

    console.error(
      "Error editProfile:",
      error
    );

    alert(
      "Terjadi kesalahan saat membuka Edit Profil."
    );

  }
}


// ======================================================
// LOGOUT
// ======================================================

async function logout() {

  const { error } =
    await window.supabaseClient.auth.signOut();

  if (error) {

    alert(
      "Gagal logout: " +
      error.message
    );

    return;
  }

  window.location.href =
    "login.html";
}


// ======================================================
// TUTUP MODAL EDIT PROFILE
// ======================================================

function closeEditProfile() {

  const modal =
    document.getElementById("editProfileModal");

  if (modal) {
    modal.style.display = "none";
  }

}


// ======================================================
// SIMPAN PROFILE KE SUPABASE
// ======================================================

async function saveProfile(event) {

  event.preventDefault();

  const button =
    document.getElementById("saveProfileButton");

  try {

    // Cek user login
    const {
      data: { user },
      error: userError
    } = await window.supabaseClient.auth.getUser();

    if (userError || !user) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    // Ambil data dari form
    const name =
      document.getElementById("editName").value.trim();

    const phone =
      document.getElementById("editPhone").value.trim();

    const location =
      document.getElementById("editLocation").value.trim();

    // Validasi nama
    if (!name) {
      alert("Nama tidak boleh kosong.");
      return;
    }

    // Validasi lokasi
    if (!location) {
      alert("Lokasi tidak boleh kosong.");
      return;
    }

    // Ubah tombol menjadi loading
    button.disabled = true;
    button.textContent = "Menyimpan...";

    // Simpan ke Supabase
    const {
      error
    } = await window.supabaseClient
      .from("profiles")
      .upsert({
        id: user.id,
        name: name,
        phone: phone,
        location: location
      }, {
        onConflict: "id"
      });

    // Jika gagal
    if (error) {

      console.error(
        "Gagal menyimpan profil:",
        error
      );

      alert(
        "Profil gagal disimpan:\n" +
        error.message
      );

      return;
    }

    // Update tampilan profil
    document.querySelector("#profil .avatar").textContent =
      name.charAt(0).toUpperCase();

    document.querySelector("#profil .profile-main h2").textContent =
      name;

    document.querySelector("#profil .profile-main p").textContent =
      location;

    // Tutup modal
    closeEditProfile();

    alert("Profil berhasil diperbarui!");

  } catch (error) {

    console.error(
      "Error saveProfile:",
      error
    );

    alert(
      "Terjadi kesalahan saat menyimpan profil."
    );

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent = "Simpan Perubahan";
    }

  }
}
// ======================================================
// JUAL BARANG + UPLOAD FOTO
// ======================================================

async function submitProduct(event) {

  event.preventDefault();


  // Cek login
  const {
    data: { user }
  } = await window.supabaseClient.auth.getUser();


  if (!user) {

    alert(
      "Silakan login terlebih dahulu untuk menjual barang."
    );

    window.location.href = "login.html";

    return;
  }


  // Ambil data form
  const name =
    document.getElementById("sellName").value;

  const category =
    document.getElementById("sellCategory").value;

  const price =
    document.getElementById("sellPrice").value;

  const condition =
    document.getElementById("sellCondition").value;

  const location =
    document.getElementById("sellLocation").value;

  const description =
    document.getElementById("sellDesc").value;


  // ==================================================
  // AMBIL FOTO
  // ==================================================

  const imageInput =
    document.getElementById("sellImage");


  const imageFile =
    imageInput ? imageInput.files[0] : null;


  let imageUrl = null;


  // ==================================================
  // UPLOAD FOTO KE SUPABASE STORAGE
  // ==================================================

  if (imageFile) {

    const fileExt =
      imageFile.name
        .split(".")
        .pop()
        .toLowerCase();


    const fileName =
      `${user.id}/${Date.now()}.${fileExt}`;


    const {
      error: uploadError
    } = await window.supabaseClient.storage
      .from("product-images")
      .upload(
        fileName,
        imageFile
      );


    if (uploadError) {

      console.error(
        "Upload foto gagal:",
        uploadError
      );


      alert(
        "Foto gagal di-upload: " +
        uploadError.message
      );

      return;
    }


    // ==================================================
    // AMBIL PUBLIC URL FOTO
    // ==================================================

    const {
      data: publicUrlData
    } = window.supabaseClient.storage
      .from("product-images")
      .getPublicUrl(fileName);


    imageUrl =
      publicUrlData.publicUrl;
  }


  // ==================================================
  // SIMPAN PRODUK KE DATABASE
  // ==================================================

 const { error } = await window.supabaseClient
  .from("products")
  .insert([
    {
      name,
      category,
      price,
      condition,
      description,
      location,
      image_url: imageUrl,
      seller_name: user.user_metadata?.name || user.email,
      seller_id: user.id,
      status: "pending"
    }
  ]);


  if (error) {

    console.error(
      "Gagal menyimpan produk:",
      error
    );


    alert(
      "Barang gagal diterbitkan: " +
      error.message
    );

    return;
  }


  alert(
  "Barang berhasil dikirim!\n\n" +
  "Barang kamu sedang menunggu pemeriksaan admin. " +
  "Barang akan tampil di Beranda setelah disetujui."
);


  // Reset form
  event.target.reset();


  // Muat ulang produk
  await loadProducts();


  // Kembali ke halaman utama
  showPage("home");
}


// ======================================================
// COD POINT
// ======================================================

function addPoints() {

  points += 10;


  const navPoints =
    document.getElementById("navPoints");

  const profilePoints =
    document.getElementById("profilePoints");

  const pointBig =
    document.getElementById("pointBig");


  if (navPoints) {
    navPoints.textContent = points;
  }


  if (profilePoints) {
    profilePoints.textContent = points;
  }


  if (pointBig) {
    pointBig.textContent = points;
  }


  alert(
    "Berhasil mendapatkan +10 COD Point!"
  );
}


// ======================================================
// SAAT WEBSITE DIBUKA
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadProducts();

  }
);
