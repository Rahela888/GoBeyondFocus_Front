window.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000';

  // *************************
  // KONTROLA PRIKAZA SPRITEA
  // *************************
  const spriteDiv = document.getElementById('sprite');
  const frameWidth = 300;
  const totalFrames = 12;
  let currentFrame = 0;
  let animInterval = null;

  if (spriteDiv) {
    spriteDiv.style.backgroundPosition = '0px 0px';
  }

  function animateSpriteStart() {
    if (animInterval) clearInterval(animInterval);
    animInterval = setInterval(() => {
      currentFrame = (currentFrame + 1) % totalFrames;
      const posX = -currentFrame * frameWidth;
      spriteDiv.style.backgroundPosition = `${posX}px 0px`;
    }, 100);
  }

  function animateSpriteStop() {
    if (animInterval) clearInterval(animInterval);
    animInterval = null;
    currentFrame = 0;
    spriteDiv.style.backgroundPosition = '0px 0px';
  }

  function addSpriteHoverListeners() {
    spriteDiv.addEventListener('mouseenter', animateSpriteStart);
    spriteDiv.addEventListener('mouseleave', animateSpriteStop);
  }

  function stopSpriteAnimation() {
    animateSpriteStop();
    spriteDiv.removeEventListener('mouseenter', animateSpriteStart);
    spriteDiv.removeEventListener('mouseleave', animateSpriteStop);
  }

  function clearErrors() {
    const regErr = document.getElementById('greska_registracija');
    const logErr = document.getElementById('greska_prijava');
    if (regErr) regErr.textContent = '';
    if (logErr) logErr.textContent = '';
  }

  // *************************
  // NAVIGACIJA STRANICA
  // *************************
  function showPage(pageId) {
    document.querySelectorAll('.page').forEach(el => el.classList.remove('visible'));
    document.getElementById(pageId).classList.add('visible');
    clearErrors();

    if (pageId === 'odabir' && spriteDiv) {
      addSpriteHoverListeners();
    } else if (spriteDiv) {
      stopSpriteAnimation();
    }
  }

  // *************************
  // REGISTRACIJA & LOGIN
  // *************************
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

        alert('Prijava uspješna!');
      } catch (err) {
        document.getElementById('greska_prijava').textContent = err.message || 'Greška pri prijavi';
      }
    });
  }

  // *************************
  // KONTROLA VREMENA
  // *************************
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
});


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

// Odabir lika i spremanje u localStorage
document.querySelectorAll('.odabir_kartica').forEach(kartica => {
  kartica.addEventListener('click', () => {
    const odabraniLik = kartica.getAttribute('data-lik');
    localStorage.setItem('odabraniLik', odabraniLik);
    prikaziOdabranogLika();
    prikaziAvatar();
  });
});

// Prikaz odabranog lika u crvenoj kocki
function prikaziOdabranogLika() {
  const odabraniLik = localStorage.getItem('odabraniLik');
  const element = document.getElementById('vrijeme_lik');
  if (LIKOVI[odabraniLik] && element) {
    element.innerHTML = `<img src="${LIKOVI[odabraniLik].slika}" alt="${odabraniLik}" style="width:95px; height:95px; border-radius: 10px;">`;
  } else if (element) {
    element.innerHTML = ''; // ako nema odabira, obriši
  }
}

// Prikaz avatara i pozadine u headeru
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
}

// Prikaz korisničkog imena
function prikaziUsername() {
  const username = localStorage.getItem('korisnickoIme') || "Username";
  document.querySelectorAll('.vrijeme_username, .odabir_username').forEach(el => {
    el.textContent = username;
  });
}

// Postavi korisničko ime u localStorage i prikaz
function postaviUsername(novoIme) {
  localStorage.setItem('korisnickoIme', novoIme);
  prikaziUsername();
}

// Na početku učitavanja prikazi username i lik
prikaziUsername();
prikaziOdabranogLika();
prikaziAvatar();
