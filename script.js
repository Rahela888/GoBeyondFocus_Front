// -------------------------
// DOMContentLoaded dio
// -------------------------
window.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000';


const linkLogin = document.getElementById('link_login');
if (linkLogin) {
  linkLogin.addEventListener('click', e => {
    e.preventDefault();  // spriječi defaultni scroll na vrh/pomak
    showPage('prijava'); // prikaži prijava stranicu
  });
}

const linkRegistracija = document.getElementById('link_registracija');
if (linkRegistracija) {
  linkRegistracija.addEventListener('click', e => {
    e.preventDefault();
    showPage('registracija'); // prikaži registracija stranicu
  });
}



  const btnFokus = document.getElementById('btn_pocni_fokus');
  if (btnFokus) {
    btnFokus.addEventListener('click', zapocniFokus);
  }

  // Navigacija stranica
  const gumbOutfit = document.getElementById('gumb_outfit');
  if (gumbOutfit) {
    gumbOutfit.addEventListener('click', () => {
      showPage('outfit');
    });
  }

  const gumbVrijeme = document.getElementById('gumb_vrijeme');
  if (gumbVrijeme) {
    gumbVrijeme.addEventListener('click', () => {
      showPage('vrijeme');
    });
  }

 

  // Registracija
  if (document.getElementById('forma_registracija')) {
    document.getElementById('forma_registracija').addEventListener('submit', async e => {
      e.preventDefault();
      clearErrors();

      const email = document.getElementById('regEmail').value.trim();
      const username = document.getElementById('regUsername').value.trim();
      const password = document.getElementById('regLozinka').value.trim();

      if (!email || !username || !password) {
        document.getElementById('greska_registracija').textContent = 'Molimo ispunite sva polja.';
        return;
      }

      try {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        });

        if (!res.ok) throw new Error(await res.text());

        alert('Registracija uspješna!');
      } catch (err) {
        document.getElementById('greska_registracija').textContent = err.message || 'Greška pri registraciji';
      }
    });
  }

  // Prijava
  if (document.getElementById('forma_prijava')) {
    document.getElementById('forma_prijava').addEventListener('submit', async e => {
      e.preventDefault();
      clearErrors();

      const username = document.getElementById('logUsername').value.trim();
      const password = document.getElementById('logLozinka').value.trim();

      if (!username || !password) {
        document.getElementById('greska_prijava').textContent = 'Molimo unesite korisničko ime i lozinku.';
        return;
      }

      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!res.ok) throw new Error(await res.text());
        const podatak = await res.json();

        localStorage.setItem('korisnikId', podatak.korisnik._id);
        localStorage.setItem('korisnickoIme', podatak.korisnik.username);
        localStorage.setItem('kovanice', podatak.korisnik.coins || 0);

        prikaziKovanice(podatak.korisnik.coins || 0);
        showPage('vrijeme');


        alert('Prijava uspješna!');
      } catch (err) {
        document.getElementById('greska_prijava').textContent = err.message || 'Greška pri prijavi';
      }
    });
  }

  // Kontrole vremena
  let sati = 0;
  let minute = 0;

  function azurirajPrikaz() {
    const prikaz = document.getElementById('vrijeme_prikaz');
    if (!prikaz) return;
    const satStr = sati.toString().padStart(2, '0');
    const minStr = minute.toString().padStart(2, '0');
    prikaz.textContent = `${satStr}:${minStr}`;
  }

  const goreDugme = document.getElementById('gore_vrijeme');
  const doljeDugme = document.getElementById('dolje_vrijeme');

  if (goreDugme) {
    goreDugme.addEventListener('click', () => {
      minute += 10;
      if (minute >= 60) {
        minute = 0;
        sati++;
      }
      if (sati > 23) {
        sati = 23;
        minute = 50;
      }
      azurirajPrikaz();
    });
  }

  if (doljeDugme) {
    doljeDugme.addEventListener('click', () => {
      minute -= 10;
      if (minute < 0) {
        if (sati > 0) {
          sati--;
          minute = 50;
        } else {
          sati = 0;
          minute = 0;
        }
      }
      azurirajPrikaz();
    });
  }

  azurirajPrikaz();

  // Odabir lika (Samo jednom event listener)
  document.querySelectorAll('.odabir_kartica').forEach(kartica => {
    kartica.addEventListener('click', () => {
      const odabraniLik = kartica.getAttribute('data-lik');
      localStorage.setItem('odabraniLik', odabraniLik);
      prikaziOdabranogLika();
      prikaziAvatar();
    });
  });

  // Outfit stranica init
  if (document.getElementById('outfit_content_scroll')) {
    prikaziOutfiteZaTrenutnogLika();
    prikaziAvatar();
    prikaziUsername();
    prikaziKovanice(localStorage.getItem('kovanice') || 0);
  }

  // Na početku startamo prikaze korisnika i lika
  prikaziUsername();
  prikaziOdabranogLika();
  prikaziAvatar();
});



// -------------------------
// IZVAN DOMContentLoaded
// -------------------------

const API_URL = 'http://localhost:3000'; // Globalno, ako treba izvan DOM


// Clear error messages helper
function clearErrors() {
  const regErr = document.getElementById('greska_registracija');
  const logErr = document.getElementById('greska_prijava');
  if (regErr) regErr.textContent = '';
  if (logErr) logErr.textContent = '';
}

// Funkcija koju koristi klik gumb za start fokusa
function zapocniFokus() {
  const prikaz = document.getElementById('vrijeme_prikaz');
  if (!prikaz) return;
  const [satStr, minStr] = prikaz.textContent.split(':');
  let totalSec = parseInt(satStr, 10) * 3600 + parseInt(minStr, 10) * 60;
  if (totalSec <= 0) return;

  localStorage.setItem('zadnje_fokus_vrijeme', prikaz.textContent);
  showPage('fokus');

  const fokusVrijeme = document.getElementById('fokus_vrijeme');
  if (fokusVrijeme) fokusVrijeme.textContent = prikaz.textContent;

  let preostalo = totalSec;
  const interval = setInterval(() => {
    preostalo -= 60; // Update na svake minute
    if (preostalo <= 0) {
      fokusVrijeme.textContent = '00:00';
      clearInterval(interval);
      zavrsiFokus(totalSec);
      return;
    }
    const minTotal = Math.floor(preostalo / 60);
    const satiF = Math.floor(minTotal / 60);
    const minF = minTotal % 60;
    fokusVrijeme.textContent = `${String(satiF).padStart(2, '0')}:${String(minF).padStart(2, '0')}`;
  }, 60000);

  // Odmah na startu update displaya
  const minTotal = Math.floor((preostalo - 60) / 60);
  const satiF = Math.floor(minTotal / 60);
  const minF = minTotal % 60;
  setTimeout(() => {
    if (fokusVrijeme) fokusVrijeme.textContent = `${String(satiF).padStart(2, '0')}:${String(minF).padStart(2, '0')}`;
  }, 1);
}



function showPage(pageId) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('visible'));
  const pageToShow = document.getElementById(pageId);
  if (pageToShow) pageToShow.classList.add('visible');
  clearErrors();
  prikaziKovanice(localStorage.getItem('kovanice') || 0);
}


// Kad fokus završi, šalje backend kovanice
async function zavrsiFokus(totalSec) {
  const dodatnihKovanica = Math.floor(totalSec / (30 * 60)) * 5;
  const korisnikId = localStorage.getItem('korisnikId');
  if (korisnikId) {
    try {
      const res = await fetch(`${API_URL}/update-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ korisnikId, coins: dodatnihKovanica })
      });
      const data = await res.json();
      localStorage.setItem('kovanice', data.coins);
      prikaziKovanice(data.coins);
    } catch (e) {
      alert('Greška pri spremanju kovanica!');
    }
  }
  showPage('vrijeme');
}

// Funkcija za prikaz stranice (koristi i iz DOM i izvan DOM)
function showPage(pageId) {
  // Ukloni 'visible' sa svih stranica
  document.querySelectorAll('.page').forEach(el => el.classList.remove('visible'));

  // Prikaži samo traženu stranicu
  const pageToShow = document.getElementById(pageId);
  if (pageToShow) pageToShow.classList.add('visible');

  clearErrors();
  prikaziKovanice(localStorage.getItem('kovanice') || 0);
}


// Podaci o likovima
const LIKOVI = {
  luffy: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffy_logo.png?alt=media&token=944ae180-b307-453c-b729-31e6aab43b5f",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffy_logo.png?alt=media&token=944ae180-b307-453c-b729-31e6aab43b5f",
    boja: "#A74449"
  },
  zoro: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro_logo.png?alt=media&token=dabeabc4-3c05-4474-9a8c-bbdf8f10b5bc",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro_pfp.png?alt=media&token=c5b9b845-6dc1-486d-bd08-83c66b4ba306",
    boja: "#599970"
  },
  sanji: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji_logo.png?alt=media&token=3363674a-3627-4dc0-8548-fa7acfed94f2",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji_pfp.png?alt=media&token=c5ac08e7-2433-492b-a1fd-4630de1fba9d",
    boja: "#C8C59C"
  },
  nami: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami_logo.png?alt=media&token=606ed272-3d15-4a64-b3c4-bb26fe3da56c",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami_pfp.png?alt=media&token=64a64226-9d8d-4212-ad12-b579ea63bdd1",
    boja: "#BF6F2D"
  },
  chopper: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali_logo.png?alt=media&token=9c5ea1c3-37c2-4a29-afa1-4a583c1fbc86",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/chopper_pfp.png?alt=media&token=db32982c-9871-402d-bc57-2c557bbf1a24",
    boja: "#D08056"
  },
  usop: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop_logo.png?alt=media&token=968cb119-a991-46f9-afa6-5b796c06b140",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop_pfp.png?alt=media&token=c2bbfa82-e15b-46d3-9d1f-af94b80d3ae5",
    boja: "#7B5532"
  }
};

// Outfit podaci sa ispravkama linkova (Sanji ispravljen)
const OUTFITI = {
  luffy: [
    { ime: "Straw Vest", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffyobican.png?alt=media&token=5a779aea-5be9-40e2-b066-a94bd235415a", cijena: 20 },
    { ime: "Prison Stripes", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffyomot.png?alt=media&token=741df247-c34b-4c42-ac7f-f679f47bcada", cijena: 35 },
    { ime: "Boxing Champion", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffyboks.png?alt=media&token=16717286-7e69-4c9a-80c7-82bd136088f3", cijena: 45 },
    { ime: "Wano Kimono", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffykina.png?alt=media&token=338d34be-b8ac-4da3-8764-dc392d0d9d59", cijena: 60 },
    { ime: "Dress Rosa", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/lufyhello.png?alt=media&token=031c0f09-fea9-486e-9198-638564d2fda7", cijena: 80 },
    { ime: "Gear Fourth", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffyvatra.png?alt=media&token=cf14900d-6a5a-4191-8d7e-e7140dac0530", cijena: 100 }
  ],
  zoro: [
    { ime: "Classic swordsman", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro20.png?alt=media&token=bdd5886d-4056-4359-83b7-ebb3453fd0cf", cijena: 20 },
    { ime: "Red kimono", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro35.png?alt=media&token=46f97b36-0ae3-4596-b567-fb387f8602d0", cijena: 35 },
    { ime: "Googles fighter", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro45.png?alt=media&token=afcccc55-46e3-4367-8ad9-27d723c82ce3", cijena: 45 },
    { ime: "Samurai", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro60.png?alt=media&token=3df7999d-bade-467f-bda4-adc191c77be5", cijena: 60 },
    { ime: "Black suit", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro80.png?alt=media&token=f29bb6b4-1bcc-4625-a2ca-d71688725722", cijena: 80 },
    { ime: "Bandaged warrior", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro100.png?alt=media&token=6bc21d64-7f25-450a-a4b9-cb4ecf27bf4c", cijena: 100 }
  ],
  sanji: [
    { ime: "Pink shirt", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji20.png?alt=media&token=be21116c-7fa2-4665-8caf-3660ce770e65", cijena: 20 },
    { ime: "Leather Kicks", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji30.png?alt=media&token=a498c6d1-f89b-4c3f-9145-07ef7d8bb0ab", cijena: 35 },
    { ime: "Yukata Casual", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji45.png?alt=media&token=9a8aa5f1-3861-473b-aa8e-78877f0dbf71", cijena: 45 },
    { ime: "Blank", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji60.png?alt=media&token=8415eb9d-adc2-42bb-aca2-f709318f1344", cijena: 60 },
    { ime: "Black Suit", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji80.png?alt=media&token=42b207b0-dd9a-4c4a-b01c-e8ec55f9b91a", cijena: 80 },
    { ime: "nis", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji100.png?alt=media&token=569c4b6b-58fb-42df-913b-cab5ef46d336", cijena: 100 }
  ],
  nami: [
    { ime: "Blue coat", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami20.png?alt=media&token=3771afaf-43ac-4c5f-8a57-1094a58008c4", cijena: 20 },
    { ime: "Lab coat", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami35.png?alt=media&token=c06367a9-dc7d-443a-aa33-cfd6a4340272", cijena: 35 },
    { ime: "Athlete gear", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami45.png?alt=media&token=119b66e1-9509-4f2b-8b4e-728e392bd794", cijena: 45 },
    { ime: "Wrench mechanic", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami60.png?alt=media&token=4cad84cd-4364-47e6-a055-6e9249b3e18a", cijena: 60 },
    { ime: "Pirate queen", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami80.png?alt=media&token=840e983b-a5de-4866-9f6f-24bc61518b14", cijena: 80 },
    { ime: "Elegant dress", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami100.png?alt=media&token=9c17b5b2-1ba1-4fdc-aaaf-181ac14342e9", cijena: 100 }
  ],
  chopper: [
    { ime: "Doctor", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali20.png?alt=media&token=5992644d-015b-4020-8116-d8e743798ecd", cijena: 20 },
    { ime: "Big ball", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali35.png?alt=media&token=6a2966de-9cd5-4192-9b97-e324168ae641", cijena: 35 },
    { ime: "Beast", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali45.png?alt=media&token=766bb9ba-a8a4-44dd-b283-853b48ed3a7f", cijena: 45 },
    { ime: "Tank top", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali60.png?alt=media&token=2124b712-7dd8-493b-982d-b957f57703aa", cijena: 60 },
    { ime: "", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali80.png?alt=media&token=b45b19c4-dc29-49e5-9ffa-f8f035b73c15", cijena: 80 },
    { ime: "Big strong reindeer", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali100.png?alt=media&token=7f774873-4229-4b16-b206-e4b2f735d1fe", cijena: 100 }
  ],
  usop: [
    { ime: "Green vest", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop20.png?alt=media&token=87d346f0-5d9d-44be-8f09-b9b6c4cfeffc", cijena: 20 },
    { ime: "Pirate mask", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop45.png?alt=media&token=1f01d079-575d-4e87-9701-17beda3b8266", cijena: 35 },
    { ime: "Sumo fighter", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop35.png?alt=media&token=f52fa0a9-4d84-45c6-a821-15d225636caf", cijena: 45 },
    { ime: "Red samurai", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop60.png?alt=media&token=9dca821b-174f-40d4-93f5-4afb0686470d", cijena: 60 },
    { ime: "Snowman suit", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop80.png?alt=media&token=3ec84be8-1991-43e2-af24-1c8c311631da", cijena: 80 },
    { ime: "Knight helmet", slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop100.png?alt=media&token=e501c334-5aef-413a-aa9a-9aaaba24d399", cijena: 100 }
  ]
};

// Funkcija za prikaz outfita za lik
function prikaziOutfiteZaTrenutnogLika() {
  const wrapper = document.getElementById('outfit_cards_wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';
  const odabraniLik = localStorage.getItem('odabraniLik') || 'luffy';
  const outfitiZaLik = OUTFITI[odabraniLik] || [];

  // Kreiraj grid
  const grid = document.createElement('div');
  grid.className = 'outfit_cards_grid';

  outfitiZaLik.forEach((outfit, idx) => {
    const card = document.createElement('div');
    card.className = 'outfit_card';
    card.innerHTML = `
      <img src="${outfit.slika}" alt="Outfit ${idx + 1}">
      <span class="outfit_card_name">${outfit.ime}</span>
      <div class="outfit_card_price">${outfit.cijena} <img src="https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/kovanice.png?alt=media&token=5336525d-db0a-416c-8764-2af36f79ec15" style="width:18px;height:18px; vertical-align:middle;"> </div>
      <button class="outfit_card_btn">Kupi outfit</button>
    `;
    grid.appendChild(card);
  });

  wrapper.appendChild(grid);
}

// Prikaz odabranog lika u crvenoj kocki
function prikaziOdabranogLika() {
  const odabraniLik = localStorage.getItem('odabraniLik');
  const element = document.getElementById('vrijeme_lik');
  if (LIKOVI[odabraniLik] && element) {
    element.innerHTML = `<img src="${LIKOVI[odabraniLik].slika}" alt="${odabraniLik}" style="width:95px; height:95px; border-radius: 10px;">`;
  } else if (element) {
    element.innerHTML = '';  // nema lika, prazno
  }
}

// Prikaz avatara (boja i slika) na više mjesta
function prikaziAvatar() {
  const odabraniLik = localStorage.getItem('odabraniLik');
  const avatarEl = document.getElementById('vrijeme_avatar');
  if (LIKOVI[odabraniLik] && avatarEl) {
    avatarEl.style.backgroundColor = LIKOVI[odabraniLik].boja;
    avatarEl.style.backgroundImage = `url(${LIKOVI[odabraniLik].pfp})`;
    avatarEl.style.backgroundSize = "cover";
    avatarEl.style.backgroundPosition = "center";
    avatarEl.style.backgroundRepeat = "no-repeat";
  } else if (avatarEl) {
    avatarEl.style.background = "transparent";
    avatarEl.style.backgroundImage = "none";
  }

  const outfitAvatarEl = document.getElementById('outfit_avatar');
  if (LIKOVI[odabraniLik] && outfitAvatarEl) {
    outfitAvatarEl.style.backgroundColor = LIKOVI[odabraniLik].boja;
    outfitAvatarEl.style.backgroundImage = `url(${LIKOVI[odabraniLik].pfp})`;
    outfitAvatarEl.style.backgroundSize = "cover";
    outfitAvatarEl.style.backgroundPosition = "center";
    outfitAvatarEl.style.backgroundRepeat = "no-repeat";
  } else if (outfitAvatarEl) {
    outfitAvatarEl.style.background = "transparent";
    outfitAvatarEl.style.backgroundImage = "none";
  }
}

// Prikaz korisničkog imena na svim relevantnim mjestima
function prikaziUsername() {
  const username = localStorage.getItem('korisnickoIme') || "Username";
  document.querySelectorAll('.vrijeme_username, .odabir_username, .outfit_username').forEach(el => {
    el.textContent = username;
  });
}

// Prikaz kovanica (novčića) na mjestima za to
function prikaziKovanice(kolicina) {
  document.querySelectorAll('#koin_iznos, #koin_iznos_outfit').forEach(el => {
    if (el) {
      el.innerHTML = `${kolicina} <img src="https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/kovanice.png?alt=media&token=5336525d-db0a-416c-8764-2af36f79ec15">`;
    }
  });
}

// Postavi novo korisničko ime u localStorage i odmah prikaži
function postaviUsername(novoIme) {
  localStorage.setItem('korisnickoIme', novoIme);
  prikaziUsername();
}

// Na početku, učitaj i prikaži korisničko ime i lika i avatar
prikaziUsername();
prikaziOdabranogLika();
prikaziAvatar();
prikaziKovanice(localStorage.getItem('kovanice') || 0);