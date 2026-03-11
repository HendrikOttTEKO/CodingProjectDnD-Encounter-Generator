async function main() {
    let Score = await getScoreOfCharacter();  
    const Monster = await calculateMonster(Score);
    
    const SpeciesResult = document.getElementById('Species');
    SpeciesResult.innerText = Monster[0]
    const acResult = document.getElementById('ac');
    acResult.innerText = Monster[1]
    const hpResult = document.getElementById('hp');
    hpResult.innerText = Monster[2]
    const SpeedResult = document.getElementById('Speed');
    SpeedResult.innerText = Monster[3]
    const STRResult = document.getElementById('STR');
    STRResult.innerText = Monster[4]
    const STRmodResult = document.getElementById('STRmod');
    STRmodResult.innerText = Monster[5]
    const DEXResult = document.getElementById('DEX');
    DEXResult.innerText = Monster[6]
    const DEXmodResult = document.getElementById('DEXmod');
    DEXmodResult.innerText = Monster[7]
    const CONResult = document.getElementById('CON');
    CONResult.innerText = Monster[8]
    const CONmodResult = document.getElementById('CONmod');
    CONmodResult.innerText = Monster[9]
    const INTResult = document.getElementById('INT');
    INTResult.innerText = Monster[10]
    const INTmodResult = document.getElementById('INTmod');
    INTmodResult.innerText = Monster[11]
    const WISResult = document.getElementById('WIS');
    WISResult.innerText = Monster[12]
    const WISmodResult = document.getElementById('WISmod');
    WISmodResult.innerText = Monster[13]
    const CHAResult = document.getElementById('CHA');
    CHAResult.innerText = Monster[14]
    const CHAmodResult = document.getElementById('CHAmod');
    CHAmodResult.innerText = Monster[15]
    const SkillsResult = document.getElementById('Skills');
    SkillsResult.innerText = Monster[16]
    const SensesResult = document.getElementById('Senses');
    SensesResult.innerText = Monster[17]
    const LanguagesResult = document.getElementById('Languages');
    LanguagesResult.innerText = Monster[18]
    const CRResult = document.getElementById('CR');
    CRResult.innerText = Monster[19]
    const bonusResult = document.getElementById('bonus');
    bonusResult.innerText = Monster[20]
    const actionResult = document.getElementById('action');
    actionResult.innerText = Monster[21]
    const reactionResult = document.getElementById('reaction');
    reactionResult.innerText = Monster[22]
}
window.main = main;

// Diese Funktion ladet die Daten des Spielers die hochgeladen wurde. Aktuell nur eine Übergangslösung, später werden die Daten direkt in einer Variable beim hochladen gespeichert.
async function loadData(){
  const response = await fetch("charactersheet.json");
  const JsonData = await response.json();
  return JsonData
}

// Diese Funktion ladet die "Feats", welche extern in einem JSON gespeichert werden
async function loadDataFeats(){
  const response = await fetch("feats.json");
  const FeatsData = await response.json();
  return FeatsData
}

// Zum Laden der verschiedenen Würfel-kombinationen
async function loadDataDice(){
  const response = await fetch("dice.json");
  const DiceJson = await response.json();
  return DiceJson
}

// Ermittelt den "Score" des Charakters, der hochgeladen wurde. Der Score ist das Budget zur Generierung eines Monsters
async function getScoreOfCharacter() {
  const JsonData = await loadData();
  const FeatsData = await loadDataFeats();
  let Level = JsonData.level;
  let HP = JsonData.max_hp;
  let AC = JsonData.ac;
  let data; 
  try {
  data = JSON.parse(JsonData.defenses);
  }
  catch {
  data = ["1"];
  }
  let AnzahlResistenz = data.length;
  let AnzahlImmunitaet = data.length; 
  let AvgDamage = getAvgDamage(JsonData); 
  let Hit = getHit(JsonData);
  //let AnzahlAngriffe = getNumberOfAttacks();
  let HoechstesSpellLevel = getHighestSpellLevel();
  let AvgSpellDamage = getAvgSpellDamage();
  let Feats = calculateFeats(JsonData, FeatsData);
  let Speed = JsonData.speed;
  let Initiative = JsonData.initiative;
  let ScoreCharacter = Number(Level) * 2 + Number(HP) + ((Number(AC) - 10)*5) + 5 * AnzahlResistenz + 10 * AnzahlImmunitaet + (AvgDamage + Hit) /* * AnzahlAngriffe*/ + HoechstesSpellLevel * 5 + AvgSpellDamage / 2 + Feats * 5 + Number(Speed) / 5 + Number(Initiative)
  return ScoreCharacter;
}

// Ermittelt den Durschnittschaden des Spielers
function getAvgDamage(JsonData) {
  let AllDamage = []
  AllDamage = getAllDamageinArray(AllDamage, JsonData);
  let AvgDamageInFunction = AllDamage.reduce((acc, curr) => acc + curr, 0);
  return AvgDamageInFunction / JsonData.items.length
}

// Die Funktion nimmt alle Werte des Spielers und setzt diese in ein Array zur weiterverarbeitung in verschiedenen Funktionen
function getAllDamageinArray(AllDamage, JsonData) {
  for (let i = 0; i < JsonData.items.length; i++) {
     let WeaponDamage = JsonData.items[i].damage;
     try {
      WeaponDamage = WeaponDamage.replace("d", "*");
     }
     catch{

     }
    WeaponDamage = eval(WeaponDamage);
     AllDamage.push(WeaponDamage);
  }
  return AllDamage;
}

// Ermittelt den grössten "Hit" Wert des Spielers
function getHit(JsonData) {
  let AllDamage = [];
  AllDamage = getAllDamageinArray(AllDamage, JsonData);
  let StrongestWeaponIndex = AllDamage.indexOf(Math.max(...AllDamage));
  let StrongestWeapon = JsonData.items[StrongestWeaponIndex].hit;
  StrongestWeapon = Number(StrongestWeapon);
  return StrongestWeapon;
}

// Ermittelt die Anzahl von Angriffen des Spielers, aktuell nur Placeholder
function getNumberOfAttacks() {
  return 1;
}

// Ermittelt den Höchsten Spell Level, aktuell nur Placeholder
function getHighestSpellLevel() {
  return 1;
}

// Ermittelt den Durschnittlichen Spell Schaden, aktuell nur Placeholder
function getAvgSpellDamage() {
  return 5;
}

// Ermittelt wie viel "Score" die Feats des Spielers zusammen ergeben.
function calculateFeats(JsonData, FeatsData) {
  let featsCounter = []
   for (let i = 0; i < JsonData.features_traits_feats.length; i++) {
    let z = 0
    while(true) {
    try {
    if (JsonData.features_traits_feats[i] == FeatsData.feats[z].name) {
      featsCounter.push(FeatsData.feats[z].score)
      break;
     }
    else if (z == FeatsData.feats.length) {
      break;
    }
    else {
      z = z + 1;
    }
    }
    catch {
      break;
    }
    }
   }
    featsCounter = featsCounter.reduce((acc, curr) => acc + curr, 0);
  return featsCounter;
}

// Die Funktion die das Monster mithilfe eines Budget, dem Score, generieren.
async function calculateMonster(Score){
  const DiceJson = await loadDataDice();
  const CR = getCR(Score);
  const species = "Human"; // SpeciesData.name[Math.random(1 - 0 + 1) + 0]
  let MonsterScore = Score;
  let ACScore = Math.random() * ((MonsterScore / 100 * 25) - (MonsterScore / 100 * 10) + 1) + (MonsterScore / 100 * 10);
  MonsterScore = MonsterScore - ACScore;
  const AC = 10 + Math.round((ACScore / 3));
  let HPScore = Math.random() * ((MonsterScore / 100 * 45) - (MonsterScore / 100 * 15) + 1) + (MonsterScore / 100 * 15);
  MonsterScore = MonsterScore - HPScore;
  const HP = Math.round((HPScore));
  let HitScore1 = Math.random() * ((MonsterScore / 100 * 25) - (MonsterScore / 100 * 15) + 1) + (MonsterScore / 100 * 15);
  MonsterScore = MonsterScore - HitScore1;
  const Hit1 = Math.round((HitScore1 / 2));
  let DMGScore1 = Math.random() * ((MonsterScore / 100 * 25) - (MonsterScore / 100 * 15) + 1) + (MonsterScore / 100 * 15);
  MonsterScore = MonsterScore - DMGScore1;
  DMGScore1 = Math.round(DMGScore1);
  const DMG1 = DiceJson.dice[Math.round(DMGScore1 / 2)] + "+" + DMGScore1;
  let HitScore2 = Math.random() * ((MonsterScore / 100 * 25) - (MonsterScore / 100 * 15) + 1) + (MonsterScore / 100 * 15);
  MonsterScore = MonsterScore - HitScore2;
  const Hit2 = Math.round((HitScore2 / 2));
  let DMGScore2 = Math.random() * ((MonsterScore / 100 * 25) - (MonsterScore / 100 * 15) + 1) + (MonsterScore / 100 * 15);
  MonsterScore = MonsterScore - DMGScore2;
  DMGScore2 = Math.round(DMGScore2);
  const DMG2 = DiceJson.dice[Math.round(DMGScore2 / 2)] + "+" + DMGScore2;
  try{ let MonsterFeats = []
  while (MonsterScore > 1) {
  let FeatsScore = Math.random() * ((Math.round(MonsterScore)) - 0 + 1) + 0;
  MonsterFeats.push(MonsterFeatsJson.name[FeatsScore])
  MonsterScore = MonsterScore - FeatsScore
  }
  }
  catch {

  }
  let Stats = [8,8,8,8,8,8]
  const Monster = [species, AC, HP, 30, Stats[0], (Stats[0] - 10) / 2, Stats[1], (Stats[1] - 10 / 2), Stats[2], (Stats[2] - 10) / 2, Stats[3], (Stats[3] - 10) / 2, Stats[4], (Stats[4] - 10) / 2, Stats[5], (Stats[5] - 10) / 2, "N/A", "N/A", "N/A", CR, "N/A", DMG1, DMG2];
  return Monster;
}

function getCR(Score) {
  let CR = Score / 2 / 100;
  return Math.round(CR * 4) / 4
}

// Die Funktion uploadPdf wurde mithilfe der Gemeni Ki generiert
// Die Funktion behandelt das umwandeln und hochladen des PDF zur Gemeni KI zur umwandlung zum JSON File
async function uploadPdf() {
  const fileInput = document.getElementById('pdfFile');
  const resultDisplay = document.getElementById('result');

  if (fileInput.files.length === 0) return alert("Bitte PDF wählen");

  resultDisplay.innerText = "Verarbeite PDF (Seiten werden optimiert)...";

  try {
    const file = fileInput.files[0];
    
    // 1. Datei als ArrayBuffer laden (wichtig für pdf-lib)
    const arrayBuffer = await file.arrayBuffer();

    // 2. PDF laden und neues Dokument erstellen
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFLib.PDFDocument.create();

    // 3. Seiten auswählen (Index 0 = Seite 1, Index 1 = Seite 2, Index 3 = Seite 4)
    // Seite 3 (Index 2) wird hier automatisch ignoriert
    const totalPages = pdfDoc.getPageCount();
    const pagesToKeep = [0, 1, 3].filter(index => index < totalPages); 

    // 4. Gewünschte Seiten kopieren und in das neue Dokument einfügen
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToKeep);
    copiedPages.forEach(page => newPdfDoc.addPage(page));

    // 5. Das neue, gekürzte PDF speichern und in Base64 umwandeln
    const pdfBytes = await newPdfDoc.save();
    
    // Kleiner Helfer für die Base64 Umwandlung ohne FileReader
    const base64String = btoa(
      new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    resultDisplay.innerText = "Sende an Gemini API...";

    // 6. Ab hier dein bekannter Fetch-Aufruf
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyqjY5IcVOXAq-run4Vkp1KjgbXm9kNeO6N0WgSP127dEhzPTSnsSetg_nzBuob2Go-Aw/exec";

    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify({ pdfBase64: base64String })
    });

    const json = await response.json();
    resultDisplay.innerText = JSON.stringify(json, null, 2);

  } catch (error) {
    console.error(error);
    resultDisplay.innerText = "Fehler: " + error.message;
  }
}