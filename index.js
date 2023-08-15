const characterClasses = {
  warrior: "Warrior",
  rouge: "Rouge",
  mage: "Mage",
};

const capitalize = (userInput) => {
  const str = userInput.toLowerCase();
  const firstLetter = str.charAt(0).toUpperCase();
  const restOfString = str.slice(1);

  return firstLetter + restOfString;
};

const generateRandomNumberInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

async function getLastAddedCharacterId() {
  const response = await fetch(domain + "/characters", {
    method: "GET",
  });

  const characters = await response.json();

  const lastAddedCharacter = characters[characters.length - 1];

  return lastAddedCharacter.id;
}

const getClassStats = (characterClass) => {
  const stats = {
    strength: null,
    agility: null,
    intelligence: null,
  };
  switch (characterClass) {
    case "Warrior":
      stats.strength = generateRandomNumberInRange(5, 10);
      stats.agility = generateRandomNumberInRange(3, 7);
      stats.intelligence = generateRandomNumberInRange(0, 7);
      break;

    case "Rouge":
      stats.strength = generateRandomNumberInRange(3, 7);
      stats.agility = generateRandomNumberInRange(5, 10);
      stats.intelligence = generateRandomNumberInRange(0, 7);
      break;

    case "Mage":
      stats.strength = generateRandomNumberInRange(3, 7);
      stats.agility = generateRandomNumberInRange(0, 7);
      stats.intelligence = generateRandomNumberInRange(5, 10);
      break;

    default:
      alert("Wrong class");
  }
  return stats;
};

const getRandomHealthManaDamageDefensePoints = () => {
  const points = {
    healthPoints: null,
    manaPoints: null,
    damagePoints: null,
    defensePoints: null,
  };

  for (let point in points) {
    points[point] = generateRandomNumberInRange(50, 100);
  }
  return points;
};

const domain = "http://localhost:3000";

async function createNewCharacter(character) {
  const response = await fetch(domain + "/characters", {
    method: "POST",
    body: JSON.stringify({
      name: character.name,
      class: character.class,
      strength: character.strength,
      agility: character.agility,
      intelligence: character.intelligence,
      healthPoints: character.healthPoints,
      manaPoints: character.manaPoints,
      damagePoints: character.damagePoints,
      defensePoints: character.defensePoints,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const addedCharacter = await response.json();

  return addedCharacter;
}

const isCharacterSelected = async () => {
  const selectedCharacter = localStorage.getItem("id");

  const response = await fetch(domain + "/characters/" + selectedCharacter);

  return response.status === 200;
};

const getSelectedCharacterInfo = async () => {
  const selectedCharacter = localStorage.getItem("id");
  const response = await fetch(domain + "/characters/" + selectedCharacter);
  const characterData = await response.json();
  const nameAndClass = `${characterData.name}, class: ${characterData.class}`;

  return nameAndClass;
};

const checkLocalStorage = async () => {
  // need to be async function because of await in else if
  if (localStorage.getItem("id") === null) return false;
  else if (await isCharacterSelected()) {
    // used await to first check is character selected and then print message if it is
    alert("There is selected hero");
    return true;
  } else if ((await isCharacterSelected()) === false) {
    localStorage.removeItem("id");
    return false;
  }
};

const getAllUnusedItems = async () => {
  const response = await fetch(domain + "/items", { method: "GET" });

  const getAllItems = await response.json();
  const unusedItems = getAllItems.filter((e) => e.characterId === null);

  console.log(unusedItems);

  unusedItems.forEach((e) => {
    // for (let prop in e) {
    //   if (!Object.keys(prop).includes(null)) {
    //     console.log(`${prop}: ${Object.values(prop).includes(null)}`);
    //   }
    // }
    Object.keys(e).forEach((k) => {
      if (e[k] !== null) alert(`${k}:${e[k]}`);
    });
    console.log("\n");
  });

  return unusedItems;
};

getAllUnusedItems();

const getAllUsedItems = async (selectedCharacterId) => {
  const response = await fetch(domain + "/items", {
    method: "GET",
  });

  const allItems = await response.json();

  const usedItems = allItems.filter(
    (e) => e.characterId === selectedCharacterId
  );

  return usedItems;
};

// getAllUsedItems(14);

const printMainMenu = async () => {
  let choice = "";
  const result = await checkLocalStorage();

  if (!result) {
    do {
      choice = prompt(`1 - Create new character
0 - Exit`);
      switch (choice) {
        case "0":
          alert("Exiting..");
          break;
        case "1":
          const name = capitalize(prompt("Enter name of character:"));
          let userInputForCharacterClass = "";
          do {
            userInputForCharacterClass = capitalize(
              prompt("Enter class of character:")
            );
            if (
              !Object.values(characterClasses).includes(
                userInputForCharacterClass
              )
            )
              alert("Wrong input. Class to enter: 'warrior'/'rouge'/'mage'");
          } while (
            !Object.values(characterClasses).includes(
              userInputForCharacterClass
            )
          );

          const classStats = getClassStats(userInputForCharacterClass); // {strength: 7, agility: 3, intelligence: 10}
          const classPoints = getRandomHealthManaDamageDefensePoints(); // {healthPoints: 51, manaPoints: 50, damagePoints: 83, defensePoints: 88}

          const character = {
            name,
            class: userInputForCharacterClass,
            strength: classStats.strength,
            agility: classStats.agility,
            intelligence: classStats.intelligence,
            healthPoints: classPoints.healthPoints,
            manaPoints: classPoints.manaPoints,
            damagePoints: classPoints.damagePoints,
            defensePoints: classPoints.defensePoints,
          };

          const addedCharacter = await createNewCharacter(character);

          localStorage.setItem("id", addedCharacter.id); // set id to localstorage
          break;

        default:
          alert("Wrong input");
      }
    } while (choice !== "0" && choice !== "1");
    return;
  } else if (result) {
    const nameAndClass = await getSelectedCharacterInfo();
    let choice = "";

    do {
      choice = prompt(`Hello ${nameAndClass}
choose:
1 - Show all items
2 - Show equipped items
3 - Show character stats
4 - Create new character
5 - Change character
6 - Dungeon
7 - Exit`);
      switch (choice) {
        case "1":
          getAllUnusedItems();
          break;
        case "2":
          const selectedCharacterId = parseInt(localStorage.getItem("id"));
          const usedItems = await getAllUsedItems(selectedCharacterId);
          console.log(usedItems);
          usedItems.map((e) => console.log(`${e.name}: id-${e.id}`));
          break;
        case "7":
          alert("Returning to main menu..");
          break;
        default:
          alert("Wrong input");
      }
    } while (choice !== "1" && choice !== "7");
    // getSelectedCharacterInfo() // print name and new menu
  }
};

// printMainMenu();
