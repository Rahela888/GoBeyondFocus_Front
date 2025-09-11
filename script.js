console.log('Script učitan');

// === DOM CONTENT LOADED ===
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM spreman');
  
  // Provjeri postoje li stranice
  const stranice = document.querySelectorAll('.page');
  console.log('Broj stranica:', stranice.length);
  stranice.forEach(s => console.log('Stranica ID:', s.id));

  // FAKE REGISTRACIJA - JEDNOSTAVNO
// FAKE REGISTRACIJA - KORISTI BACKEND
const formaRegistracija = document.getElementById('forma_registracija');
if (formaRegistracija) {
  formaRegistracija.addEventListener('submit', async e => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://gobeyondfocus-back-3.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: `demo${Math.random().toString(36).substring(7)}@test.com`, 
          username: 'Demo korisnik', 
          password: 'demo123' 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.korisnik.id,
          username: data.korisnik.username,
          coins: data.korisnik.coins,
          selectedCharacter: '',
          ownedOutfits: []
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('korisnikId', userData.id);
        localStorage.setItem('korisnickoIme', userData.username);
        localStorage.setItem('kovanice', userData.coins.toString());
        
        alert('Registracija uspješna!');
        showPage('odabir');
      }
    } catch (err) {
      console.error('Greška registracije:', err);
      alert('Greška registracije!');
    }
  });
}


  // FAKE PRIJAVA - JEDNOSTAVNO  
  const formaPrijava = document.getElementById('forma_prijava');
  if (formaPrijava) {
    console.log('Login forma pronađena');
    formaPrijava.addEventListener('submit', e => {
      e.preventDefault();
      console.log('Fake login submit');
      
      // Učitaj postojeće podatke ili stvori nove
      let userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (!userData.id) {
        userData = {
          id: 'fake_user_123',
          username: 'Demo korisnik',
          coins: 50,
          selectedCharacter: '',
          ownedOutfits: []
        };
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      localStorage.setItem('korisnikId', userData.id);
      localStorage.setItem('korisnickoIme', userData.username);
      localStorage.setItem('kovanice', userData.coins.toString());
      
      if (userData.selectedCharacter) {
        localStorage.setItem('odabraniLik', userData.selectedCharacter);
        showPage('vrijeme');
      } else {
        showPage('odabir');
      }
      
      alert('Prijava uspješna!');
      prikaziUsername();
      prikaziOdabranogLika();
      prikaziAvatar();
    });
  }

  // LOGIN/REGISTRACIJA LINKOVI
  const linkLogin = document.getElementById('link_login');
  if (linkLogin) {
    linkLogin.addEventListener('click', e => {
      e.preventDefault();
      showPage('prijava');
    });
  }

  const linkRegistracija = document.getElementById('link_registracija');
  if (linkRegistracija) {
    linkRegistracija.addEventListener('click', e => {
      e.preventDefault();
      showPage('registracija');
    });
  }

  // NAVIGACIJA GUMBOVI
  const gumbOutfit = document.getElementById('gumb_outfit');
  if (gumbOutfit) {
    gumbOutfit.addEventListener('click', () => {
      showPage('outfit');
      prikaziOutfiteZaTrenutnogLika();
      prikaziAvatar();
      prikaziUsername();
    });
  }

  const gumbVrijeme = document.getElementById('gumb_vrijeme');
  if (gumbVrijeme) {
    gumbVrijeme.addEventListener('click', () => {
      showPage('vrijeme');
    });
  }

  const gumbVrijemeOutfit = document.getElementById('gumb_vrijeme_outfit');
  if (gumbVrijemeOutfit) {
    gumbVrijemeOutfit.addEventListener('click', () => {
      showPage('vrijeme');
    });
  }

  const btnFokus = document.getElementById('btn_pocni_fokus');
  if (btnFokus) {
    btnFokus.addEventListener('click', zapocniFokus);
  }

  // ODABIR LIKA - S BACKEND POZIVOM
  document.querySelectorAll('.odabir_kartica').forEach(kartica => {
    kartica.addEventListener('click', async () => {
      const odabraniLik = kartica.getAttribute('data-lik');
      console.log('KLIK NA KARTICU!', odabraniLik);
      
      if (!odabraniLik || !LIKOVI[odabraniLik]) {
        console.error('Lik ne postoji:', odabraniLik);
        return;
      }
      
      const korisnikId = localStorage.getItem('korisnikId');
      if (korisnikId && korisnikId !== 'fake_user_123') {
        try {
          await fetch('https://gobeyondfocus-back-2.onrender.com/update-character', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'user-id': korisnikId
            },
            body: JSON.stringify({ selectedCharacter: odabraniLik })
          });
        } catch (err) {
          console.error('Greška backend poziva:', err);
        }
      }
      
      // LOKALNO SPREMANJE
      localStorage.setItem('odabraniLik', odabraniLik);
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      userData.selectedCharacter = odabraniLik;
      localStorage.setItem('userData', JSON.stringify(userData));
      
      prikaziOdabranogLika();
      prikaziAvatar();
      showPage('vrijeme');
    });
  });

  // KONTROLE VREMENA
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

  // POČETNA LOGIKA
  setTimeout(() => {
    showPage('registracija');
    prikaziUsername();
    prikaziOdabranogLika();
    prikaziAvatar();
  }, 100);
});

const LIKOVI = {
  luffy: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffy_logo.png?alt=media&token=944ae180-b307-453c-b729-31e6aab43b5f",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffy_logo.png?alt=media&token=944ae180-b307-453c-b729-31e6aab43b5f",
    boja: "#A74449",
    defaultSprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/pocetniluffysprite.png?alt=media&token=62c472aa-951c-456a-a6b6-106249e3cb3f",
      frameWidth: 195,      
      frameHeight: 195,   
      frameCount: 3,
      frameDuration: 100,   
      cssClass: "sprite-luffy-default"
    }
  },
  zoro: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro_logo.png?alt=media&token=dabeabc4-3c05-4474-9a8c-bbdf8f10b5bc",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/lufi_pfp.png?alt=media&token=e07d330e-66ad-4556-9399-f68318e23cf8",
    boja: "#599970",
     defaultSprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/pocetnizorosprite.png?alt=media&token=afcd452e-fa36-41e5-963a-ed24003ecc8e",
      frameWidth: 268,     
      frameHeight: 268,     
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-zoro-default"
    }
  },
  sanji: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji_logo.png?alt=media&token=3363674a-3627-4dc0-8548-fa7acfed94f2",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji_pfp.png?alt=media&token=c5ac08e7-2433-492b-a1fd-4630de1fba9d",
    boja: "#C8C59C",
     defaultSprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/pocetnisanjisprite.png?alt=media&token=f3563639-fe07-40a7-ac7f-27e51c170f71",
      frameWidth: 233,      
      frameHeight: 233,     
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-sanji-default"
    }
  },
  nami: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami_logo.png?alt=media&token=606ed272-3d15-4a64-b3c4-bb26fe3da56c",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami_pfp.png?alt=media&token=64a64226-9d8d-4212-ad12-b579ea63bdd1",
    boja: "#BF6F2D",
     defaultSprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/pocetninamisprite.png?alt=media&token=2e95f59b-4904-4833-b78f-ed6fd1273aee",
      frameWidth: 245,     
      frameHeight: 245,     
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-nami-default"
    }
  },
  chopper: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali_logo.png?alt=media&token=9c5ea1c3-37c2-4a29-afa1-4a583c1fbc86",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/chopper_pfp.png?alt=media&token=db32982c-9871-402d-bc57-2c557bbf1a24",
    boja: "#D08056",
     defaultSprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/pocetnichoppersprite.png?alt=media&token=733cf516-af64-44f8-8633-25745a6a6fe3",
      frameWidth: 249,      
      frameHeight: 249,     
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-chopper-default"
    }
  },
  usop: {
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop_logo.png?alt=media&token=968cb119-a991-46f9-afa6-5b796c06b140",
    pfp: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop_pfp.png?alt=media&token=c2bbfa82-e15b-46d3-9d1f-af94b80d3ae5",
    boja: "#7B5532",
     defaultSprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/pocetniusopsprite.png?alt=media&token=d3d26432-10d0-41c5-bbf9-4326a58dbef2",
      frameWidth: 193,      
      frameHeight: 193,    
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-usop-default"
    }
  }
};


const OUTFITI = {
  luffy: [
  {
    ime: "Straw Vest",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffyobican.png?alt=media&token=5a779aea-5be9-40e2-b066-a94bd235415a",
    cijena: 20,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteluffy20.png?alt=media&token=f8e8afc8-8071-434b-8b3b-38142744e52e",
frameWidth: 195,     
      frameHeight: 195,    
      frameCount: 3,
      frameDuration:150,  
      cssClass: "sprite-luffy20"
    }
  },
  {
    ime: "Prison Stripes",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffyomot.png?alt=media&token=741df247-c34b-4c42-ac7f-f679f47bcada",
    cijena: 35,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteluffy30.png?alt=media&token=e324f0d8-7517-44df-8b0c-8c5ca15288cf",
     frameWidth: 142,      // Nova širina
      frameHeight: 142,     // Nova visina
      frameCount: 5,
      frameDuration:100, 
      cssClass: "sprite-luffy35"
    }
  },
{
    ime: "Boxing Champion",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffyboks.png?alt=media&token=16717286-7e69-4c9a-80c7-82bd136088f3",
    cijena: 40,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spritemali45.png?alt=media&token=d465d492-9f6a-4dba-9f6c-83d3f6c01f0e",
      frameWidth: 193,      // Nova širina
      frameHeight: 193,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-luffy45"
    }
  },
{
    ime: "Wano kimono",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffykina.png?alt=media&token=338d34be-b8ac-4da3-8764-dc392d0d9d59",
    cijena: 60,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteluffy60.png?alt=media&token=e6420f57-2dda-44ac-9e46-00e07757a09f",
    frameWidth: 196,      // Nova širina
      frameHeight: 196,     // Nova visina
      frameCount: 5,
      frameDuration:100, 
      cssClass: "sprite-luffy60"
    }
  },
{
    ime: "Haloween",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/lufyhello.png?alt=media&token=031c0f09-fea9-486e-9198-638564d2fda7",
    cijena: 80,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteluffy80.png?alt=media&token=ac756410-14ef-4d07-b85d-026cee2c6302",
    frameWidth: 144,      // Nova širina
      frameHeight: 144,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-luffy80"
    }
  },
{
    ime: "Fire",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/luffyvatra.png?alt=media&token=cf14900d-6a5a-4191-8d7e-e7140dac0530",
    cijena: 100,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteluffy100.png?alt=media&token=c151c915-79ed-4f84-bca7-fc8f933dac91",
      frameWidth: 273,      // Nova širina
      frameHeight: 273,     // Nova visina
      frameCount: 5,
      frameDuration:100, 
      cssClass: "sprite-luffy100"
    }
  },
],
 zoro: [
  {
    ime: "Classic swordsman",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro20.png?alt=media&token=bdd5886d-4056-4359-83b7-ebb3453fd0cf",
    cijena: 20,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zorosprite20.png?alt=media&token=2644c445-c9d2-4e3f-95cf-a81cf000335e",
frameWidth: 255,      // Nova širina
      frameHeight: 255,     // Nova visina
      frameCount: 3,
      frameDuration:150, 
 
      cssClass: "sprite-zoro20"
    }
  },
  {
    ime: "Red kimono",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro35.png?alt=media&token=46f97b36-0ae3-4596-b567-fb387f8602d0",
    cijena: 35,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zorosprite35.png?alt=media&token=e7ebccf8-0bb3-4f77-9a26-3e7eab6c7c45",
     frameWidth: 254,      // Nova širina
      frameHeight: 254,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-zoro35"
    }
  },
{
    ime: "Googles fighter",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro45.png?alt=media&token=afcccc55-46e3-4367-8ad9-27d723c82ce3",
    cijena: 40,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zorosprite45.png?alt=media&token=c9c7016d-504a-4d79-8dfa-f04b3d0e0d74",
   frameWidth: 338,      // Nova širina
      frameHeight: 338,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-zoro45"
    }
  },
{
    ime: "Samurai",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro60.png?alt=media&token=3df7999d-bade-467f-bda4-adc191c77be5",
    cijena: 60,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zorosprite60.png?alt=media&token=ed3b3e84-408a-4fca-be90-85f0769a080a",
   frameWidth: 225,      // Nova širina
      frameHeight: 225,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-zoro60"
    }
  },
{
    ime: "Black suit",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro80.png?alt=media&token=f29bb6b4-1bcc-4625-a2ca-d71688725722",
    cijena: 80,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zorosprite80.png?alt=media&token=40b78828-4109-42b4-b77d-7dd307e6b66c",
    frameWidth: 244,      // Nova širina
      frameHeight: 244,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-zoro80"
    }
  },
{
    ime: "Bandaged warrior",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zoro100.png?alt=media&token=6bc21d64-7f25-450a-a4b9-cb4ecf27bf4c",
    cijena: 100,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/zorosprite100.png?alt=media&token=8af73b27-ce20-4c17-a1cc-db2d677cef4a",
     frameWidth: 244,      // Nova širina
      frameHeight: 244,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-zoro100"
    }
  },
],
  sanji: [
  {
    ime: "Pink Shirt",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji20.png?alt=media&token=be21116c-7fa2-4665-8caf-3660ce770e65",
    cijena: 20,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanjisprite20.png?alt=media&token=b4f1a91b-1e58-4588-b382-36c0d8c5de1b",
     frameWidth: 179,      // Nova širina
      frameHeight: 179,     // Nova visina
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-sanji20"
    }
  },
  {
    ime: "Leather kicks",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji30.png?alt=media&token=a498c6d1-f89b-4c3f-9145-07ef7d8bb0ab",
    cijena: 35,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanjisprite30.png?alt=media&token=4fecad62-9ae4-4ea4-a3ca-ddfbedfe474e",
    frameWidth: 203,      // Nova širina
      frameHeight: 203,     // Nova visina
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-sanji30"
    }
  },
{
    ime: "Yukata Casual",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji45.png?alt=media&token=9a8aa5f1-3861-473b-aa8e-78877f0dbf71",
    cijena: 40,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanjisprite45.png?alt=media&token=2cb7113c-073e-45b2-a52a-b1c5cc8a4f82",
    frameWidth: 195,      // Nova širina
      frameHeight: 195,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-sanji45"
    }
  },
{
    ime: "Haloewwn pumpkin",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji60.png?alt=media&token=8415eb9d-adc2-42bb-aca2-f709318f1344",
    cijena: 60,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanjisprite60.png?alt=media&token=a86d7b45-ebde-47ac-b04c-d783aa46fb7a",
    frameWidth: 158,      // Nova širina
      frameHeight: 158,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-sanji60"
    }
  },
{
    ime: "Black Suit",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji80.png?alt=media&token=42b207b0-dd9a-4c4a-b01c-e8ec55f9b91a",
    cijena: 80,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanjisprite80.png?alt=media&token=f543bee9-b8b0-4ad3-896e-23bb871d3ddc",
    frameWidth: 228,      // Nova širina
      frameHeight: 228,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-sanji80"
    }
  },
{
    ime: "White dress",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanji100.png?alt=media&token=09648153-a1eb-4550-8338-faffd3191339",
    cijena: 100,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/sanjisprite100.png?alt=media&token=75b3a181-6952-4809-b650-08d77cc16f9c",
    frameWidth: 163,      // Nova širina
      frameHeight: 163,     // Nova visina
      frameCount: 6,
      frameDuration:100, 
      cssClass: "sprite-sanji100"
    }
  },
]
,
  nami: [
  {
    ime: "Blue coat",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami20.png?alt=media&token=3771afaf-43ac-4c5f-8a57-1094a58008c4",
    cijena: 20,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/namisprite20.png?alt=media&token=78713b14-d07c-48d7-8c59-8e24e55ad390",
frameWidth: 128,      // Nova širina
      frameHeight: 128,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-nami20"
    }
  },
  {
    ime: "Lab coat",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami35.png?alt=media&token=c06367a9-dc7d-443a-aa33-cfd6a4340272",
    cijena: 35,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/namisprite35.png?alt=media&token=c93c4eb0-38b2-41cb-a486-87622addd50a",
    frameWidth: 314,      // Nova širina
      frameHeight: 314,     // Nova visina
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-nami35"
    }
  },
{
    ime: "Athlete gear",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami45.png?alt=media&token=119b66e1-9509-4f2b-8b4e-728e392bd794",
    cijena: 40,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/namisprite45.png?alt=media&token=e4ca6310-7391-4f68-853b-524297fbcb2a",
frameWidth: 183,      // Nova širina
      frameHeight: 183,     // Nova visina
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-nami45"
    }
  },
{
    ime: "Wrench mechanic",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami60.png?alt=media&token=4cad84cd-4364-47e6-a055-6e9249b3e18a",
    cijena: 60,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/namisprite60.png?alt=media&token=58419812-37fc-4eca-a68f-ac869bd26ed2",
    frameWidth: 252,      // Nova širina
      frameHeight: 252,     // Nova visina
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-nami60"
    }
  },
{
    ime: "Pirate queen",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami80.png?alt=media&token=840e983b-a5de-4866-9f6f-24bc61518b14",
    cijena: 80,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/namisprite80.png?alt=media&token=e729b1ca-d380-4c83-9b8d-d08ea942a5c4",
     frameWidth: 200,      // Nova širina
      frameHeight: 200,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-nami80"
    }
  },
{
    ime: "Elegant dress",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/nami100.png?alt=media&token=9c17b5b2-1ba1-4fdc-aaaf-181ac14342e9",
    cijena: 100,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/namisprite100.png?alt=media&token=cb1d707e-8566-4ef8-a345-757c571cb622",
  frameWidth: 201,      // Nova širina
      frameHeight: 201,     // Nova visina
      frameCount: 2,
      frameDuration:100, 
      cssClass: "sprite-nami100"
    }
  },
],

chopper: [
  {
    ime: "Little",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali20.png?alt=media&token=5992644d-015b-4020-8116-d8e743798ecd",
    cijena: 20,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spritemali20.png?alt=media&token=d46e1098-30f8-40d0-87b4-669aeb3d4581",
   frameWidth: 183,      // Nova širina
      frameHeight: 183,     // Nova visina
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-chopper20"
    }
  },
  {
    ime: "Fat blob",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali35.png?alt=media&token=6a2966de-9cd5-4192-9b97-e324168ae641",
    cijena: 35,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spritemali35.png?alt=media&token=6dd04777-81cd-44b7-8277-80fe85b9ad5e",
     frameWidth: 305,      // Nova širina
      frameHeight: 305,     // Nova visina
      frameCount: 2,
      frameDuration:100, 
      cssClass: "sprite-chopper35"
    }
  },
{
    ime: "Forest Guardian",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali45.png?alt=media&token=766bb9ba-a8a4-44dd-b283-853b48ed3a7f",
    cijena: 40,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spritemali45.png?alt=media&token=d465d492-9f6a-4dba-9f6c-83d3f6c01f0e",
     frameWidth: 245,      // Nova širina
      frameHeight: 245,     // Nova visina
      frameCount: 2,
      frameDuration:100, 
      cssClass: "sprite-chopper45"
    }
  },
{
    ime: "Strong deer",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali60.png?alt=media&token=2124b712-7dd8-493b-982d-b957f57703aa",
    cijena: 60,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spritemali60.png?alt=media&token=2e07a203-06f8-41ae-8688-822122d3e5d7",
    frameWidth: 188,      // Nova širina
      frameHeight: 188,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-chopper60"
    }
  },
{
    ime: "Halloween deer",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali80.png?alt=media&token=b45b19c4-dc29-49e5-9ffa-f8f035b73c15",
    cijena: 80,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spritemali80.png?alt=media&token=0a5fdca5-0a8b-4827-a3d0-50b567998010",
    frameWidth: 126,      // Nova širina
      frameHeight: 126,     // Nova visina
      frameCount: 8,
      frameDuration:100, 
      cssClass: "sprite-chopper80"
    }
  },
{
    ime: "Big strong deer",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/mali100.png?alt=media&token=7f774873-4229-4b16-b206-e4b2f735d1fe",
    cijena: 100,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spritemali100.png?alt=media&token=570d6745-64ca-43c7-b839-472618815add",
   frameWidth: 236,      // Nova širina
      frameHeight: 236,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-chopper100"
    }
  },
],

usop: [
  {
    ime: "Googles cap",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop20.png?alt=media&token=87d346f0-5d9d-44be-8f09-b9b6c4cfeffc",
    cijena: 20,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteusop20.png?alt=media&token=f8895bee-4e39-437c-8604-e5038a1f5bee",
    frameWidth: 186,      // Nova širina
      frameHeight: 186,     // Nova visina
      frameCount: 3,
      frameDuration:100, 
      cssClass: "sprite-usop20"
    }
  },
  {
    ime: "Sumo fighter",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop35.png?alt=media&token=f52fa0a9-4d84-45c6-a821-15d225636caf",
    cijena: 35,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteusop35.png?alt=media&token=61de7fb6-e9cb-4239-a16e-64cac06c2059",
  frameWidth: 257,      // Nova širina
      frameHeight: 257,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-usop35"
    }
  },
{
    ime: "pirate mask",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop45.png?alt=media&token=1f01d079-575d-4e87-9701-17beda3b8266",
    cijena: 40,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteusop45.png?alt=media&token=40671755-fbf4-4d08-9123-064b0d88ca4a",
    frameWidth: 368,      // Nova širina
      frameHeight: 368,     // Nova visina
      frameCount: 2,
      frameDuration:100, 
      cssClass: "sprite-usop45"
    }
  },
{
    ime: "Red samurai",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop60.png?alt=media&token=9dca821b-174f-40d4-93f5-4afb0686470d",
    cijena: 60,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteusop60.png?alt=media&token=8cee6cec-736c-4315-89e2-c541269a178e",
   frameWidth: 260,      // Nova širina
      frameHeight: 260,     // Nova visina
      frameCount: 4,
      frameDuration:100, 
      cssClass: "sprite-usop60"
    }
  },
{
    ime: "Haloween ghost",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop80.png?alt=media&token=3ec84be8-1991-43e2-af24-1c8c311631da",
    cijena: 80,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteusop80.png?alt=media&token=c0636ea2-7c2d-4f10-8317-d4cbe51dd7c3",
      frameWidth: 169,      // Nova širina
      frameHeight: 169,     // Nova visina
      frameCount: 6,
      frameDuration:100, 
      cssClass: "sprite-usop80"
    }
  },
{
    ime: "Knight helmet",
    slika: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/usop100.png?alt=media&token=e501c334-5aef-413a-aa9a-9aaaba24d399",
    cijena: 100,
    sprite: {
      url: "https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/spriteusop100.png?alt=media&token=ea2f8389-5600-4e61-955b-a27e8386a06c",
  frameWidth: 347,      // Nova širina
      frameHeight: 347,     // Nova visina
      frameCount: 2,
      frameDuration:100, 
      cssClass: "sprite-usop100"
    }
  },
]

};

// === FUNKCIJE IZVAN DOM-a ===
function showPage(pageId) {
  console.log('Prikazujem stranicu:', pageId);
  document.querySelectorAll('.page').forEach(el => {
    el.classList.remove('visible');
  });
  
  const pageToShow = document.getElementById(pageId);
  if (pageToShow) {
    pageToShow.classList.add('visible');
    console.log('Stranica prikazana:', pageId);
  }
  
  const kovanice = localStorage.getItem('kovanice') || 0;
  prikaziKovanice(kovanice);
}

// ZAPOCNI FOKUS - BACKEND
async function zapocniFokus() {
  const prikaz = document.getElementById('vrijeme_prikaz');
  const [satStr, minStr] = prikaz.textContent.split(':');
  const totalMinutes = parseInt(satStr, 10) * 60 + parseInt(minStr, 10);
  
  if (totalMinutes <= 0) {
    alert('Postavite vrijeme fokusa!');
    return;
  }

  const korisnikId = localStorage.getItem('korisnikId');
  if (!korisnikId) {
    alert('Molimo prijavite se ponovno!');
    showPage('prijava');
    return;
  }

  try {
    const response = await fetch('https://gobeyondfocus-back-3.onrender.com/start-focus', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': korisnikId
      },
      body: JSON.stringify({ minutes: totalMinutes })
    });

    if (!response.ok) {
      const error = await response.text();
      alert('Greška pokretanja fokusa: ' + error);
      return;
    }

    showPage('fokus');
    
    // PRIKAŽI SPRITE ANIMACIJU - KORISTI TRENUTNI OUTFIT
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const odabraniLik = userData.selectedCharacter;

    setTimeout(() => {
      const currentSprite = getCurrentOutfitSprite(odabraniLik);
      if (currentSprite) {
        animateSprite(
          'fokus_sprite', 
          currentSprite.url,
          currentSprite.frameWidth,
          currentSprite.frameHeight,
          currentSprite.frameCount,
          currentSprite.frameDuration
        );
      }
    }, 100);
    
    // POKRENI BACKEND TIMER - PRATI STATUS
    startBackendTimer();
    
  } catch (err) {
    console.error('Greška pokretanja fokusa:', err);
    alert('Greška pri pokretanju fokusa');
  }
}

// BACKEND TIMER
function startBackendTimer() {
  const fokusVrijeme = document.getElementById('fokus_vrijeme');
  const korisnikId = localStorage.getItem('korisnikId');
  
  // Provjeri status svakih 10 sekundi
  const statusInterval = setInterval(async () => {
    try {
      const response = await fetch('https://gobeyondfocus-back-3.onrender.com/focus-status', {
        method: 'GET',
        headers: { 'user-id': korisnikId }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (!data.inFocus || data.remainingMinutes <= 0) {
          // FOKUS ZAVRŠEN - POZOVI BACKEND
          clearInterval(statusInterval);
          await endBackendFocus();
          return;
        }
        
        // AŽURIRAJ PRIKAZ VREMENA - SATI:MINUTE
        const hours = Math.floor(data.remainingMinutes / 60);
        const mins = data.remainingMinutes % 60;
        fokusVrijeme.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        
        // Ako je blizu kraja
        if (data.remainingMinutes <= 0) {
          fokusVrijeme.style.color = '#00ff00';
          fokusVrijeme.style.fontWeight = 'bold';
        }
      }
    } catch (err) {
      console.error('Greška provjere statusa:', err);
    }
  }, 10000); // Provjeri svakih 10 sekundi
}

// ZAVRŠI FOKUS
async function endBackendFocus() {
  const korisnikId = localStorage.getItem('korisnikId');
  
  try {
    const response = await fetch('https://gobeyondfocus-back-3.onrender.com/end-focus', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': korisnikId
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      // AŽURIRAJ LOKALNE KOVANICE
      localStorage.setItem('kovanice', data.totalCoins);
      
      // PRIKAŽI REZULTATE
      alert(`🎉 Fokus završen! 
⏰ Vrijeme provedeno: ${data.timeSpent} minuta
💰 Zaradili ste: ${data.coinsEarned} kovanica
🪙 Ukupno kovanica: ${data.totalCoins}`);
      
      // VRATI NA VRIJEME STRANICU
      showPage('vrijeme');
      prikaziKovanice(data.totalCoins);
    } else {
      console.error('Greška završavanja fokusa');
      showPage('vrijeme');
    }
    
  } catch (err) {
    console.error('Greška završavanja fokusa:', err);
    showPage('vrijeme');
  }
}

// KUPOVINA OUTFITA - BACKEND
async function buyOutfit(outfitName, price) {
  const korisnikId = localStorage.getItem('korisnikId');
  if (!korisnikId) {
    alert('Molimo prijavite se!');
    return;
  }

  // ZA FAKE KORISNIKA - LOKALNA SIMULACIJA
  if (korisnikId === 'fake_user_123') {
    const kovanice = parseInt(localStorage.getItem('kovanice') || '0');
    
    if (kovanice < price) {
      alert('Nedovoljno kovanica!');
      return;
    }
    
    // Oduzmi kovanice
    const noviSaldo = kovanice - price;
    localStorage.setItem('kovanice', noviSaldo.toString());
    
    // Dodaj outfit
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.ownedOutfits.includes(outfitName)) {
      userData.ownedOutfits.push(outfitName);
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    alert('Outfit kupljen uspješno!');
    prikaziOutfiteZaTrenutnogLika();
    prikaziKovanice(noviSaldo);
    return;
  }

 
  try {
    const response = await fetch('https://gobeyondfocus-back-3.onrender.com/buy-outfit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': korisnikId
      },
      body: JSON.stringify({ outfitName, price })
    });
    
    if (response.ok) {
      const result = await response.json();
      localStorage.setItem('kovanice', result.coins);
      
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (!userData.ownedOutfits.includes(outfitName)) {
        userData.ownedOutfits.push(outfitName);
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      alert(result.message);
      prikaziOutfiteZaTrenutnogLika();
      prikaziKovanice(result.coins);
      
    } else {
      const error = await response.text();
      alert('Greška: ' + error);
    }
  } catch (err) {
    console.error('Greška kupovine:', err);
    alert('Greška pri kupovini outfita');
  }
}


function prikaziOutfiteZaTrenutnogLika() {
  const wrapper = document.getElementById('outfit_cards_wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const odabraniLik = userData.selectedCharacter;
  const ownedOutfits = userData.ownedOutfits || [];
  const equippedOutfit = localStorage.getItem('equippedOutfit') || 'default';
  
  if (!odabraniLik) {
    showPage('odabir');
    return;
  }
  
  const outfitiZaLik = OUTFITI[odabraniLik] || [];
  const grid = document.createElement('div');
  grid.className = 'outfit_cards_grid';

  outfitiZaLik.forEach((outfit, idx) => {
    const card = document.createElement('div');
    card.className = 'outfit_card';
    
    const kupljen = ownedOutfits.includes(outfit.ime);
    const nosen = equippedOutfit === outfit.ime;
    
    card.innerHTML = `                        
      <img src="${outfit.slika}" alt="Outfit ${idx + 1}">
      <span class="outfit_card_name">${outfit.ime}</span>
      <div class="outfit_card_price">${outfit.cijena} <img src="https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/kovanice.png?alt=media&token=5336525d-db0a-416c-8764-2af36f79ec15" style="width:18px;height:18px; vertical-align:middle;"> </div>
      ${!kupljen ? '<button class="outfit_card_btn">Kupi outfit</button>' : ''}
      ${kupljen && !nosen ? '<button class="equip_outfit_btn">Nosi outfit</button>' : ''}
      ${nosen ? '<span class="nosen-label" style="color: gold; font-weight: bold;">Nosite ga!!</span>' : ''}
      ${kupljen && !nosen ? '<span class="kupljeno-label" style="color: green; font-weight: bold;">Kupljeno</span>' : ''}
    `;

    // Event listeneri
    if (!kupljen) {
      const buyBtn = card.querySelector('.outfit_card_btn');
      if (buyBtn) {
        buyBtn.addEventListener('click', async () => {
          await buyOutfit(outfit.ime, outfit.cijena);
        });
      }
    }
    
    if (kupljen && !nosen) {
      const equipBtn = card.querySelector('.equip_outfit_btn');
      if (equipBtn) {
        equipBtn.addEventListener('click', () => {
          localStorage.setItem('equippedOutfit', outfit.ime);
          prikaziOutfiteZaTrenutnogLika(); // Refresh prikaz
        });
      }
    }

    grid.appendChild(card);
  });

  wrapper.appendChild(grid);
}

function getCurrentOutfitSprite(character) {
  const equippedOutfit = localStorage.getItem('equippedOutfit');
  
  // Ako je default ili nema opremljen outfit
  if (!equippedOutfit || equippedOutfit === 'default') {
    return LIKOVI[character]?.defaultSprite;
  }
  
  // Pronađi sprite za opremljen outfit
  const characterOutfits = OUTFITI[character] || [];
  const outfit = characterOutfits.find(o => o.ime === equippedOutfit);
  
  return outfit?.sprite || LIKOVI[character]?.defaultSprite;
}

function animateSprite(elementId, spriteURL, frameWidth, frameHeight, frameCount, frameDuration) {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (el._spriteInterval) {
    clearInterval(el._spriteInterval);
    el._spriteInterval = null;
  }
  
  setTimeout(() => {
    el.style.backgroundImage = `url(${spriteURL})`;
    
    let frame = 0;
    
    el._spriteInterval = setInterval(() => {
      const xPos = -frame * frameWidth;
      el.style.backgroundPosition = `${xPos}px 0px`;
      frame = (frame + 1) % frameCount;
    }, frameDuration);
  }, 10);
}

function prikaziOdabranogLika() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const odabraniLik = userData.selectedCharacter; 

  const element = document.getElementById('vrijeme_lik');
  if (LIKOVI[odabraniLik] && element) {
    element.innerHTML = `<img src="${LIKOVI[odabraniLik].slika}" alt="${odabraniLik}" style="width:95px; height:95px; border-radius: 10px;">`;
  } else if (element) {
    element.innerHTML = '';
  }
}

function prikaziAvatar() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const odabraniLik = userData.selectedCharacter; 
  
  const avatarEl = document.getElementById('vrijeme_avatar');
  if (LIKOVI[odabraniLik] && avatarEl) {
    avatarEl.style.backgroundColor = LIKOVI[odabraniLik].boja;
    avatarEl.style.backgroundImage = `url(${LIKOVI[odabraniLik].pfp})`;
    avatarEl.style.backgroundSize = "cover";
    avatarEl.style.backgroundPosition = "center";
    avatarEl.style.backgroundRepeat = "no-repeat";
  }

  const outfitAvatarEl = document.getElementById('outfit_avatar');
  if (LIKOVI[odabraniLik] && outfitAvatarEl) {
    outfitAvatarEl.style.backgroundColor = LIKOVI[odabraniLik].boja;
    outfitAvatarEl.style.backgroundImage = `url(${LIKOVI[odabraniLik].pfp})`;
    outfitAvatarEl.style.backgroundSize = "cover";
    outfitAvatarEl.style.backgroundPosition = "center";
    outfitAvatarEl.style.backgroundRepeat = "no-repeat";
  }
}

function prikaziUsername() {
  const username = localStorage.getItem('korisnickoIme') || "Username";
  document.querySelectorAll('.vrijeme_username, .odabir_username, .outfit_username').forEach(el => {
    el.textContent = username;
  });
}

function prikaziKovanice(kolicina) {
  document.querySelectorAll('#koin_iznos, #koin_iznos_outfit').forEach(el => {
    if (el) {
      el.innerHTML = `${kolicina} <img src="https://firebasestorage.googleapis.com/v0/b/gobeyondfocus.firebasestorage.app/o/kovanice.png?alt=media&token=5336525d-db0a-416c-8764-2af36f79ec15">`;
    }
  });
}



