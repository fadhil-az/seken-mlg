const products=[
{id:1,name:"Laptop ASUS VivoBook",category:"Elektronik",price:2800000,condition:"Baik",location:"Lowokwaru, Malang",icon:"💻",seller:"Rizky",rating:"4.8",desc:"Laptop masih berfungsi dengan baik, cocok untuk kuliah dan pekerjaan ringan. Charger tersedia."},
{id:2,name:"Buku Pemrograman Arduino",category:"Buku",price:75000,condition:"Baik",location:"Sukun, Malang",icon:"📚",seller:"Alya",rating:"4.9",desc:"Buku referensi Arduino kondisi baik, beberapa halaman diberi tanda stabilo."},
{id:3,name:"Sepatu Sneakers",category:"Fashion",price:180000,condition:"Seperti Baru",location:"Klojen, Malang",icon:"👟",seller:"Dimas",rating:"5.0",desc:"Sneakers jarang dipakai. Ukuran 42 dan masih sangat layak."},
{id:4,name:"Kursi Kos Minimalis",category:"Kos",price:120000,condition:"Cukup Baik",location:"Blimbing, Malang",icon:"🪑",seller:"Nadia",rating:"4.7",desc:"Kursi untuk kebutuhan kamar kos, kokoh dan masih nyaman digunakan."},
{id:5,name:"Headset Bluetooth",category:"Elektronik",price:95000,condition:"Baik",location:"Dinoyo, Malang",icon:"🎧",seller:"Fajar",rating:"4.8",desc:"Headset Bluetooth dengan suara jernih dan baterai masih normal."},
{id:6,name:"Jaket Denim",category:"Fashion",price:130000,condition:"Baik",location:"Tlogomas, Malang",icon:"🧥",seller:"Sinta",rating:"4.9",desc:"Jaket denim ukuran M, tidak ada kerusakan dan siap dipakai."},
{id:7,name:"Kalkulus Dasar",category:"Buku",price:50000,condition:"Baik",location:"Ketawanggede, Malang",icon:"📖",seller:"Bima",rating:"4.8",desc:"Buku kalkulus untuk mahasiswa. Isi lengkap dan cukup terawat."},
{id:8,name:"Lampu Meja Belajar",category:"Kos",price:60000,condition:"Baik",location:"Sawojajar, Malang",icon:"💡",seller:"Nanda",rating:"4.9",desc:"Lampu meja cocok untuk belajar, kabel dan sakelar berfungsi."}
];
let currentCategory="Semua", points=120;

function formatPrice(n){return "Rp "+n.toLocaleString("id-ID")}
function renderProducts(){
 const q=(document.getElementById("searchInput")?.value||"").toLowerCase();
 const data=products.filter(p=>(currentCategory==="Semua"||p.category===currentCategory)&&(p.name+" "+p.category+" "+p.location).toLowerCase().includes(q));
 document.getElementById("productGrid").innerHTML=data.length?data.map(p=>`
 <article class="product" onclick="showDetail(${p.id})"><div class="product-img">${p.icon}</div><div class="product-body">
 <span class="tag">${p.category}</span><h3>${p.name}</h3><div class="price">${formatPrice(p.price)}</div><div class="meta">📍 ${p.location} · ${p.condition}</div></div></article>`).join(""):`<div style="grid-column:1/-1;text-align:center;padding:50px;color:#78827a">Barang tidak ditemukan. Coba kata kunci lain.</div>`;
}
function setCategory(cat,el){currentCategory=cat;document.querySelectorAll(".cat").forEach(x=>x.classList.remove("active"));el.classList.add("active");renderProducts()}
function showPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));document.getElementById(id).classList.add("active");
 document.querySelectorAll(".nav-link").forEach(n=>n.classList.toggle("active",n.dataset.page===id));
 window.scrollTo({top:0,behavior:"smooth"});
}
function showDetail(id){
 const p=products.find(x=>x.id===id);
 document.getElementById("detailContent").innerHTML=`<button class="back" onclick="showPage('home')">← Kembali ke barang</button>
 <div class="detail-card"><div class="detail-img">${p.icon}</div><div class="detail-info"><span class="tag">${p.category}</span><h1>${p.name}</h1>
 <div class="detail-price">${formatPrice(p.price)}</div><p>${p.desc}</p>
 <div class="info-list"><div><b>Kondisi:</b> <span>${p.condition}</span></div><div><b>Lokasi:</b> <span>📍 ${p.location}</span></div><div><b>Penjual:</b> <span>${p.seller} · ⭐ ${p.rating}</span></div></div>
 <button class="primary" onclick="contactSeller('${p.seller}')">Hubungi Penjual</button> <button class="secondary" onclick="showToast('Barang disimpan ke favorit ❤️')">♡ Simpan</button></div></div>`;
 showPage("detail");
}
function contactSeller(name){showToast("Chat dengan "+name+" dibuka (simulasi prototype).")}
function submitProduct(e){
 e.preventDefault();
 const name=document.getElementById("sellName").value;
 products.unshift({id:Date.now(),name,category:document.getElementById("sellCategory").value,price:Number(document.getElementById("sellPrice").value),condition:document.getElementById("sellCondition").value,location:document.getElementById("sellLocation").value,icon:"📦",seller:"Fadhil",rating:"5.0",desc:document.getElementById("sellDesc").value});
 e.target.reset();showToast("Barang berhasil ditambahkan ke katalog!");showPage("home");renderProducts();
}
function addPoints(){points+=10;document.getElementById("navPoints").textContent=points;document.getElementById("profilePoints").textContent=points;document.getElementById("pointBig").textContent=points;showToast("Berhasil mendapatkan +10 COD Point ⭐")}
function showToast(msg){const t=document.getElementById("toast");t.textContent=msg;t.style.display="block";clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.style.display="none",2600)}
renderProducts();