let characterData;
async function main() {
  // Laden der Testfunktion - So kann das hochladen des PDFs umgangen werden
  // let characterData = await loadDataTest(); 
  let score = await getScoreOfCharacter(characterData);
  score = score + difficultyAdjustment;
  const monster = await calculateMonster(score);
  updateMonsterUI(monster);
}
window.main = main;

// Testfunktion zum laden von Testdaten um die API zu umgehen
/* async function loadDataTest() {
  const response = await fetch("charctersheet.json");
  const testData = await response.json();
  return testData;
} */


function updateMonsterUI(monster) {
  const speciesResult = document.getElementById('Species');
  speciesResult.innerText = monster[0];
  const acResult = document.getElementById('ac');
  acResult.innerText = monster[1];
  const hpResult = document.getElementById('hp');
  hpResult.innerText = monster[2];
  const SpeedResult = document.getElementById('Speed');
  SpeedResult.innerText = monster[3];
  const STRResult = document.getElementById('STR');
  STRResult.innerText = monster[4];
  const STRmodResult = document.getElementById('STRmod');
  STRmodResult.innerText = monster[5];
  const DEXResult = document.getElementById('DEX');
  DEXResult.innerText = monster[6];
  const DEXmodResult = document.getElementById('DEXmod');
  DEXmodResult.innerText = monster[7];
  const CONResult = document.getElementById('CON');
  CONResult.innerText = monster[8];
  const CONmodResult = document.getElementById('CONmod');
  CONmodResult.innerText = monster[9];
  const INTResult = document.getElementById('INT');
  INTResult.innerText = monster[10];
  const INTmodResult = document.getElementById('INTmod');
  INTmodResult.innerText = monster[11];
  const WISResult = document.getElementById('WIS');
  WISResult.innerText = monster[12];
  const WISmodResult = document.getElementById('WISmod');
  WISmodResult.innerText = monster[13];
  const CHAResult = document.getElementById('CHA');
  CHAResult.innerText = monster[14];
  const CHAmodResult = document.getElementById('CHAmod');
  CHAmodResult.innerText = monster[15];
  const skillsResult = document.getElementById('Skills');
  skillsResult.innerText = monster[16];
  const sensesResult = document.getElementById('Senses');
  sensesResult.innerText = monster[17];
  const languagesResult = document.getElementById('Languages');
  languagesResult.innerText = monster[18];
  const CRResult = document.getElementById('CR');
  CRResult.innerText = monster[19];
  const bonusResult = document.getElementById('bonus');
  bonusResult.innerText = monster[20];
  const actionResult = document.getElementById('action');
  actionResult.innerText = monster[21];
}

// Laden der verschiedenen JSON
async function loadDataFeats() {
  const response = await fetch("feats.json");
  const featsData = await response.json();
  return featsData;
}

async function loadDataDice() {
  const response = await fetch("dice.json");
  const diceJson = await response.json();
  return diceJson;
}

async function loadDataSpecies() {
  const response = await fetch("monster.json");
  const speciesJson = await response.json();
  return speciesJson;
}

async function loadDataWeapon() {
  const response = await fetch("weapons.json");
  const weaponJson = await response.json();
  return weaponJson;
}

async function loadDataSpells() {
  const response = await fetch("spells.json");
  const spellsJson = await response.json();
  return spellsJson;
}

// Ermittelt den "Score" des Charakters, der hochgeladen wurde. Der Score ist das Budget zur Generierung eines Monsters
async function getScoreOfCharacter(characterData) {
  const featsData = await loadDataFeats();
  let level = characterData.level;
  let hp = characterData.max_hp;
  let ac = characterData.ac;
  // Logikabfrage von Resistenzen und Immunitäten, da die KI je nach anzahl ein einzelnen String oder ein Array macht
  let numberOfResistances = 0;
  let numberOfImmunities = 0;
  if (characterData.resistances != "") {
    try {
      numberOfResistances = characterData.resistances.length;
    } catch {
      numberOfResistances = 1;
    }
  }
  if (characterData.immunities != "") {
    try {
      numberOfImmunities = characterData.immunities.length;
    } catch {
      numberOfImmunities = 1;
    }
  }
  let avgDamage = getAvgDamage(characterData);
  let hit = await getHit(characterData);
  let allSpellLevel = await getAllSpellLevel(characterData);
  let avgSpellDamage = await getAvgSpellDamage(characterData);
  let feats = await calculateFeats(characterData, featsData);
  let speed = characterData.speed;
  speed = speed.match(/\d+/g); // Speed wird zur Zahl gekürzt
  let initiative = characterData.initiative;
  let scoreCharacter = Number(level) * 2 + Number(hp) + ((Number(ac) - 10) * 5) + 5 * numberOfResistances + 10 * numberOfImmunities + (avgDamage + hit) + allSpellLevel * 5 + avgSpellDamage / 2 + feats * 5 + Number(speed) / 5 + Number(initiative)
  return scoreCharacter;
}

// Ermittelt den Durschnittschaden des Spielers
function getAvgDamage(characterData) {
  let allDamage = []
  allDamage = getAllDamageinArray(allDamage, characterData);
  let avgDamage = allDamage.reduce((acc, curr) => acc + curr, 0);
  return avgDamage / characterData.items.length
}

// Die Funktion nimmt alle Werte des Spielers und setzt diese in ein Array zur weiterverarbeitung in verschiedenen Funktionen
function getAllDamageinArray(allDamage, characterData) {
  for (let i = 0; i < characterData.items.length; i++) {
    let weaponDamage = characterData.items[i].damage;
    weaponDamage = weaponDamage.match(/(\d+d\d+|\d+|[\+\-])/g).join('');
    try {
      weaponDamage = weaponDamage.replaceAll("d", "*");
    } catch {
      // ignore if damage is a fix value instead of dice
    }
    weaponDamage = eval(weaponDamage);
    allDamage.push(weaponDamage);
  }
  return allDamage;
}

// Ermittelt den grössten "Hit" Wert des Spielers
function getHit(characterData) {
  let allDamage = [];
  allDamage = getAllDamageinArray(allDamage, characterData);
  let strongestWeaponIndex = allDamage.indexOf(Math.max(...allDamage));
  let strongestWeapon = characterData.items[strongestWeaponIndex].hit;
  strongestWeapon = Number(strongestWeapon);
  return strongestWeapon;
}

// Ermittelt den Höchsten Spell Level, aktuell nur Placeholder
async function getAllSpellLevel(characterData) {
  const spellsJson = await loadDataSpells();
  let allSpellLevels = [];
  for (let i = 0; i < characterData.spells.length; i++) {
    let spellName = characterData.spells[i].level;
    let foundSpell = spellsJson.Spells.find(s => s.name === spellName);
    if (foundSpell) {
      if (foundSpell.SpellLevel !== "Cantrip") {
        allSpellLevels.push(foundSpell.SpellLevel);
      } else {
        allSpellLevels.push(0.5);
      }
    }
  }
  const allSpellLevel = allSpellLevels.reduce((acc, curr) => acc + curr, 0);
  return allSpellLevel;
}

// Ermittelt den Durschnittlichen Spell Schaden
async function getAvgSpellDamage(characterData) {
  let allSpellDamage = [];
  const spellsJson = await loadDataSpells();
  for (let i = 0; i < characterData.spells.length; i++) {
    let Spellname = characterData.spells[i];
    let found = spellsJson.Spells.find(s => s.name === Spellname);
    let spellDamage;
    if (found) {
      spellDamage = found.damage;
    } else {
      spellDamage = "0";
    }
    try {
      spellDamage = spellDamage.replace("d", "*");
    } catch {

    }
    spellDamage = eval(spellDamage);
    allSpellDamage.push(spellDamage);
  }
  allSpellDamage = allSpellDamage.reduce((acc, curr) => acc + curr, 0);
  if (allSpellDamage != 0) {
    return allSpellDamage / characterData.spells.length
  } else {
    return 0;
  }
}

// Ermittelt wie viel "Score" die Feats des Spielers zusammen ergeben.
function calculateFeats(characterData, featsData) {
  let featsCounter = []
  for (let i = 0; i < characterData.features_traits_feats.length; i++) {
    let z = 0
    while (true) {
      try {
        let charaterFeatName = characterData.features_traits_feats[i];
        let databaseFeatName = featsData.feats[z].name;
        if (charaterFeatName == databaseFeatName) {
          featsCounter.push(featsData.feats[z].score)
          break;
        } else if (z == featsData.feats.length) {
          break;
        } else {
          z = z + 1;
        }
      } catch {
        // Wenn der Character mehr Feats hat als die Json Datenbank
        break;
      }
    }
  }
  featsCounter = featsCounter.reduce((acc, curr) => acc + curr, 0);
  return featsCounter;
}

// Die Funktion die das Monster mithilfe eines Budget, dem Score, generieren.
async function calculateMonster(score) {
  let speciesData = await loadDataSpecies();
  const diceJson = await loadDataDice();
  const weaponsJson = await loadDataWeapon();
  const spellsJson = await loadDataSpells();
  let speciesJsonLenght = speciesData.Monster.length - 1;
  const speciesNumber = Math.floor(Math.random() * speciesJsonLenght);
  const cr = getCR(score);

  let proficiencyBonus;

  if (cr <= 4) {
    proficiencyBonus = "+2";
  } else if (cr <= 8) {
    proficiencyBonus = "+3";
  } else if (cr <= 12) {
    proficiencyBonus = "+4";
  } else if (cr <= 16) {
    proficiencyBonus = "+5";
  } else if (cr <= 20) {
    proficiencyBonus = "+6";
  } else if (cr <= 24) {
    proficiencyBonus = "+7"
  } else if (cr <= 28) {
    proficiencyBonus = "+8"
  } else {
    proficiencyBonus = "+9"
  }

  const species = speciesData.Monster[speciesNumber].speciesname
  let monsterScore = score;
  let isNotSpellcaster = Math.random() < 0.8; // 20% Chance für Spell caster.
  if (isNotSpellcaster == true) {
    let multiAttack;
    if (cr < 1) {
      multiAttack = 0;
    } else if (cr == 1) {
      if (Math.random() < 0.25) {
        multiAttack = "2";
      } else {
        multiAttack = "1";
      }
    } else if (cr == 2) {
      if (Math.random() < 0.50) {
        multiAttack = "2";
      } else {
        multiAttack = "1";
      }
    } else if (cr == 3) {
      if (Math.random() < 0.75) {
        multiAttack = "2";
      } else {
        multiAttack = "1";
      }
    } else if (cr <= 4) {
      multiAttack = "2";
    } else if (cr < 10) {
      if (cr == 5) {
        if (Math.random() < 0.16) {
          multiAttack = "3";
        } else {
          multiAttack = "2";
        }
      } else if (cr == 6) {
        if (Math.random() < 0.33) {
          multiAttack = "3";
        } else {
          multiAttack = "2";
        }
      } else if (cr == 7) {
        if (Math.random() < 0.50) {
          multiAttack = "3";
        } else {
          multiAttack = "2";
        }
      } else if (cr == 8) {
        if (Math.random() < 0.66) {
          multiAttack = "3";
        } else {
          multiAttack = "2";
        }
      } else {
        if (Math.random() < 0.83) {
          multiAttack = "3";
        } else {
          multiAttack = "2";
        }
      }
    } else if (cr <= 10) {
      multiAttack = "3";
    } else if (cr <= 12) {
      if (Math.random() < 0.5) {
        multiAttack = "4";
      } else {
        multiAttack = "3";
      }
    } else if (cr <= 16) {
      if (Math.random() < 0.5) {
        multiAttack = "5";
      } else {
        multiAttack = "4";
      }
    } else if (cr <= 20) {
      if (Math.random() < 0.5) {
        multiAttack = "6";
      } else {
        multiAttack = "5";
      }
    } else if (cr <= 24) {
      if (Math.random() < 0.5) {
        multiAttack = "7";
      } else {
        multiAttack = "6";
      }
    } else if (cr <= 28) {
      if (Math.random() < 0.5) {
        multiAttack = "8";
      } else {
        multiAttack = "7";
      }
    } else {
      if (Math.random() < 0.5) {
        multiAttack = "9";
      } else {
        multiAttack = "8";
      }
    }

    if (multiAttack != 0) {
      multiAttack = "Multiattack. The " + species + " makes " + multiAttack + " attacks.\n"
    }
    let acScore = Math.random() * ((monsterScore / 100 * 25) - (monsterScore / 100 * 10) + 1) + (monsterScore / 100 * 10);
    monsterScore = monsterScore - acScore;
    const ac = 10 + Math.round((acScore / 3));

    let hpScore = Math.random() * ((monsterScore / 100 * 45) - (monsterScore / 100 * 15) + 1) + (monsterScore / 100 * 15);
    monsterScore = monsterScore - hpScore;
    const hp = Math.round((hpScore));



    let hitScore1 = Math.random() * ((monsterScore / 100 * 25) - (monsterScore / 100 * 15) + 1) + (monsterScore / 100 * 15);
    monsterScore = monsterScore - hitScore1;
    const hit1 = Math.round((hitScore1 / 2));



    let randomindex1 = Math.floor(Math.random() * weaponsJson.weapons.length);
    let dmgScore1 = Math.random() * ((monsterScore / 100 * 25) - (monsterScore / 100 * 15) + 1) + (monsterScore / 100 * 15);
    monsterScore = monsterScore - dmgScore1;
    dmgScore1 = Math.round(dmgScore1);
    const dmg1 = diceJson.dice[Math.round(dmgScore1 / 2)];


    let hitScore2 = Math.random() * ((monsterScore / 100 * 25) - (monsterScore / 100 * 15) + 1) + (monsterScore / 100 * 15);
    monsterScore = monsterScore - hitScore2;
    const hit2 = Math.round((hitScore2 / 2));

    let randomindex2 = Math.floor(Math.random() * weaponsJson.weapons.length);
    let dmgScore2 = Math.random() * ((monsterScore / 100 * 25) - (monsterScore / 100 * 15) + 1) + (monsterScore / 100 * 15);
    monsterScore = monsterScore - dmgScore2;
    dmgScore2 = Math.round(dmgScore2);
    const dmg2 = diceJson.dice[Math.round(dmgScore2 / 2)];



    let stats = [8, 8, 8, 8, 8, 8]
    let multiplyFactor = getArchetype(dmg1, ac, cr, hp, isNotSpellcaster);
    for (let i = 0; i < stats.length; i++) {
      stats[i] = 8 + cr * multiplyFactor[i]
    }
    stats = stats.map(n => Math.round(n))
    let firstWeapon;
    let secondWeapon;
    if (weaponsJson.weapons[randomindex1].attribute == "strength") {
      firstWeapon = weaponsJson.weapons[randomindex1].name + ". " + weaponsJson.weapons[randomindex1].attacktype + " +" + hit1 + " to Hit, " + weaponsJson.weapons[randomindex1].range + " " + weaponsJson.weapons[randomindex1].targets + " Hit: " + hit1 + " (" + dmg1 + "+" + Math.floor((stats[0] - 10) / 2) + ")" + " " + weaponsJson.weapons[randomindex1].range + " " + weaponsJson.weapons[randomindex1].damagetype + "\n";
    } else {
      firstWeapon = weaponsJson.weapons[randomindex1].name + ". " + weaponsJson.weapons[randomindex1].attacktype + " +" + hit1 + " to Hit, " + weaponsJson.weapons[randomindex1].range + " " + weaponsJson.weapons[randomindex1].targets + " Hit: " + hit1 + " (" + dmg1 + "+" + Math.floor((stats[1] - 10) / 2) + ")" + " " + weaponsJson.weapons[randomindex1].range + " " + weaponsJson.weapons[randomindex1].damagetype + "\n";
    }
    if (weaponsJson.weapons[randomindex2].attribute == "strength") {
      secondWeapon = weaponsJson.weapons[randomindex2].name + ". " + weaponsJson.weapons[randomindex2].attacktype + " +" + hit2 + " to Hit, " + weaponsJson.weapons[randomindex2].range + " " + weaponsJson.weapons[randomindex2].targets + " Hit: " + hit2 + " (" + dmg2 + "+" + Math.floor((stats[0] - 10) / 2) + ")" + " " + weaponsJson.weapons[randomindex2].range + " " + weaponsJson.weapons[randomindex2].damagetype;
    } else {
      secondWeapon = weaponsJson.weapons[randomindex2].name + ". " + weaponsJson.weapons[randomindex2].attacktype + " +" + hit2 + " to Hit, " + weaponsJson.weapons[randomindex2].range + " " + weaponsJson.weapons[randomindex2].targets + " Hit: " + hit2 + " (" + dmg2 + "+" + Math.floor((stats[1] - 10) / 2) + ")" + " " + weaponsJson.weapons[randomindex2].range + " " + weaponsJson.weapons[randomindex2].damagetype;
    }

    const monster = [species, ac, hp, speciesData.Monster[speciesNumber].speed, stats[0], Math.floor((stats[0] - 10) / 2), stats[1], Math.floor((stats[1] - 10) / 2), stats[2], Math.floor((stats[2] - 10) / 2), stats[3], Math.floor((stats[3] - 10) / 2), stats[4], Math.floor((stats[4] - 10) / 2), stats[5], Math.floor((stats[5] - 10) / 2), speciesData.Monster[speciesNumber].skills, speciesData.Monster[speciesNumber].Senses, speciesData.Monster[speciesNumber].Languages, cr, proficiencyBonus, multiAttack + firstWeapon + secondWeapon];
    return monster;
  } else {
    let spellScore = Math.random() * ((monsterScore / 100 * 80) - (monsterScore / 100 * 10) + 1) + (monsterScore / 100 * 10);
    let spellcasterlevel = Math.round((spellScore / monsterScore) * 10);
    spellcasterlevel = Math.round(spellcasterlevel + cr);

    let spellsMonster = [];

    for (let targetLevel = 0; targetLevel <= spellcasterlevel; targetLevel++) {
      let levelString = targetLevel;
      if (targetLevel === 0) {
        levelString = "Cantrip";
      } else {
        levelString = targetLevel.toString();
      }

      let filteredSpells = spellsJson.Spells.filter(spell => spell.Spelllevel === levelString);

      if (filteredSpells.length > 0) {
        let spellAmount = 3;
        if (targetLevel === spellcasterlevel) {
          spellAmount = 2;
        }

        for (let i = 0; i < spellAmount; i++) {
          if (filteredSpells.length > 0) {
            let randomSpellindex = Math.floor(Math.random() * filteredSpells.length);
            let selectedSpell = filteredSpells[randomSpellindex];

            spellsMonster.push(selectedSpell);

            filteredSpells.splice(randomSpellindex, 1);
          }
        }
      }
    }

    let spellStrings = [];

    for (let currentLevel = 0; currentLevel <= spellcasterlevel; currentLevel++) {
      let spellLevel = currentLevel.toString();
      if (currentLevel === 0) {
        spellLevel = "Cantrip";
      }

      let levelSpells = spellsMonster.filter(spell => spell.Spelllevel === spellLevel);

      if (levelSpells.length > 0) {
        let spellNames = [];
        for (let i = 0; i < levelSpells.length; i++) {
          spellNames.push(levelSpells[i].name);
        }
        let prefix = "3/day ";
        if (currentLevel === spellcasterlevel) {
          prefix = "2/day ";
        }

        spellStrings.push(prefix + spellNames.join(", "));
      }
    }

    let monsterSpells = spellStrings.join("\n");

    monsterScore = monsterScore - spellScore;

    let spellCasting = "Spellcasting. The " + species + " is a " + spellcasterlevel + " level spellcaster. Its spellcasting ability is Intelligece. The " + species + " has the following wizarad spells prerpared:\n" + monsterSpells + "\n\n";

    let aCScore = Math.random() * ((monsterScore / 100 * 25) - (monsterScore / 100 * 10) + 1) + (monsterScore / 100 * 10);
    monsterScore = monsterScore - aCScore;
    const ac = 10 + Math.round((aCScore / 3));

    let hpScore = Math.random() * ((monsterScore / 100 * 45) - (monsterScore / 100 * 15) + 1) + (monsterScore / 100 * 15);
    monsterScore = monsterScore - hpScore;
    const hp = Math.round((hpScore));


    let hitScore1 = Math.random() * ((monsterScore / 100 * 25) - (monsterScore / 100 * 15) + 1) + (monsterScore / 100 * 15);
    monsterScore = monsterScore - hitScore1;
    const hit1 = Math.round((hitScore1 / 2));


    let randomindex1 = Math.floor(Math.random() * weaponsJson.weapons.length);
    let dmgScore1 = Math.random() * ((monsterScore / 100 * 25) - (monsterScore / 100 * 15) + 1) + (monsterScore / 100 * 15);
    monsterScore = monsterScore - dmgScore1;
    dmgScore1 = Math.round(dmgScore1);
    const dmg1 = diceJson.dice[Math.round(dmgScore1 / 2)];

    let stats = [8, 8, 8, 8, 8, 8]
    let multiplyFactor = getArchetype(dmg1, ac, cr, hp, isNotSpellcaster);
    for (let i = 0; i < stats.length; i++) {
      stats[i] = 8 + cr * multiplyFactor[i]
    }
    stats = stats.map(n => Math.round(n))
    let firstWeapon;
    if (weaponsJson.weapons[randomindex1].attribute == "strength") {
      firstWeapon = weaponsJson.weapons[randomindex1].name + ". " + weaponsJson.weapons[randomindex1].attacktype + " +" + hit1 + " to Hit, " + weaponsJson.weapons[randomindex1].range + " " + weaponsJson.weapons[randomindex1].targets + " Hit: " + hit1 + " (" + dmg1 + "+" + Math.floor((stats[0] - 10) / 2) + ")" + " " + weaponsJson.weapons[randomindex1].range + " " + weaponsJson.weapons[randomindex1].damagetype + "\n";
    } else {
      firstWeapon = weaponsJson.weapons[randomindex1].name + ". " + weaponsJson.weapons[randomindex1].attacktype + " +" + hit1 + " to Hit, " + weaponsJson.weapons[randomindex1].range + " " + weaponsJson.weapons[randomindex1].targets + " Hit: " + hit1 + " (" + dmg1 + "+" + Math.floor((stats[1] - 10) / 2) + ")" + " " + weaponsJson.weapons[randomindex1].range + " " + weaponsJson.weapons[randomindex1].damagetype + "\n";
    }

    const monster = [species, ac, hp, speciesData.Monster[speciesNumber].speed, stats[0], Math.floor((stats[0] - 10) / 2), stats[1], Math.floor((stats[1] - 10) / 2), stats[2], Math.floor((stats[2] - 10) / 2), stats[3], Math.floor((stats[3] - 10) / 2), stats[4], Math.floor((stats[4] - 10) / 2), stats[5], Math.floor((stats[5] - 10) / 2), speciesData.Monster[speciesNumber].skills, speciesData.Monster[speciesNumber].Senses, speciesData.Monster[speciesNumber].Languages, cr, proficiencyBonus, spellCasting + firstWeapon];
    return monster;
  }
}

function getArchetype(dmg1, ac, cr, hp, isNotSpellcaster) {
  // Mage
  if (isNotSpellcaster == false) {
    return [0.5, 1, 0.5, 1.5, 1.5, 1.5]
  }
  // Tank
  else if (hp > (dmg1 + ac) * 2) {
    return [1.5, 0.5, 1.5, 0.5, 0.5, 0.5]
  }
  // Damage Dealer
  else if (ac > (cr + 12) && (dmg1 > cr * 2)) {
    return [1, 1.5, 1, 0.5, 1, 0.5]
  }
  // Glass Cannon
  else if (dmg1 > (hp / 2) && ac < (cr + 10)) {
    return [1, 1.5, 1, 0.5, 0.5, 0.5]
  }
  // Allrounder
  else {
    return [1, 5, 1.5, 1, 0.5, 1, 0.5]
  }
}

function getCR(score) {
  let cr = score / 2 / 100;
  return Math.round(cr * 4) / 4
}

// Die Funktion uploadPdf wurde mithilfe der Gemeni Ki generiert
// Die Funktion behandelt das umwandeln und hochladen des PDF zur Gemeni KI zur umwandlung zum JSON File
async function uploadPdf() {
  const fileInput = document.getElementById('pdfFile');
  const display = document.getElementById('display');

  if (fileInput.files.length === 0) return alert("Please select PDF");

  display.innerText = "Processing PDF (optimazing pages)...";

  try {
    const file = fileInput.files[0];

    // 1. Datei als ArrayBuffer laden (wichtig für pdf-lib)
    const arrayBuffer = await file.arrayBuffer();

    // 2. PDF laden und neues Dokument erstellen
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFLib.PDFDocument.create();

    // 3. Seiten auswählen (Index 0 = Seite 1, Index 1 = Seite 2, Index 3 = Seite 4)
    // Seite 3 (Index 2) wird hier automatisch ignoriert
    // Die Seite drei kann lange Texte enthalten und daher die KI überfordern. Deswegen wird diese entfernt.
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

    display.innerText = "Sending to Gemini API...\nThis can take up a few minutes.";

    // 6. Aufruf der Google Scripts URL, welches die Verbindung zur Gemeni API aufbaut.
    // 
    //  Wichtig: Aktuell können "20" PDFs pro Tag (5 pro Minute) von der API verarbeitet werden. 
    //
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyqjY5IcVOXAq-run4Vkp1KjgbXm9kNeO6N0WgSP127dEhzPTSnsSetg_nzBuob2Go-Aw/exec";

    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify({
        pdfBase64: base64String
      })
    });

    characterData = await response.json();
    display.innerText = "Data sucessfully loaded";
  } catch (error) {
    console.error(error);
    display.innerText = "Fehler: " + error.message;
  }
}

let difficultyAdjustment = 0;

function send() {
  const dialog = document.getElementById('dialog');
  const form = document.getElementById('form');
  const crInput = document.getElementById('d1').value;
  const frightLevel = document.getElementById('d2').value;
  const resourceUsage = document.getElementById('d3').value;
  const battleTime = document.getElementById('d4').value;

  oldFights(crInput, frightLevel, resourceUsage, battleTime);
  dialog.close();
}


function closing() {
  const dialog = document.getElementById('dialog');
  dialog.close();
}

function oldFights(cr, fright, resource, time) {
  difficultyAdjustment = (Number(fright) + Number(resource) + Number(time)) * cr;
}