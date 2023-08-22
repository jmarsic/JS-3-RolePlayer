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

const getRandomHealthManaDamageDefense = () => {
  const points = {
    healthPoints: null,
    manaPoints: null,
    damage: null,
    defense: null,
  };

  for (let point in points) {
    points[point] = generateRandomNumberInRange(50, 100);
  }
  return points;
};

const domain = "http://localhost:3000";

const newCharacterForm = async () => {
  let name = "";
  let userInputForCharacterClass = "";

  do {
    name = capitalize(prompt("Enter name of character:"));
    if (name === "") alert("Name can't be empty!");
  } while (name === "");

  do {
    userInputForCharacterClass = capitalize(
      prompt("Enter class of character:")
    );
    if (!Object.values(characterClasses).includes(userInputForCharacterClass))
      alert("Wrong input. Class to enter: 'warrior'/'rouge'/'mage'");
  } while (
    !Object.values(characterClasses).includes(userInputForCharacterClass)
  );

  const classStats = getClassStats(userInputForCharacterClass); // {strength: 7, agility: 3, intelligence: 10}
  const classPoints = getRandomHealthManaDamageDefense(); // {healthPoints: 51, manaPoints: 50, damage: 83, defense: 88}

  const character = {
    name,
    class: userInputForCharacterClass,
    strength: classStats.strength,
    agility: classStats.agility,
    intelligence: classStats.intelligence,
    healthPoints: classPoints.healthPoints,
    manaPoints: classPoints.manaPoints,
    damage: classPoints.damage,
    defense: classPoints.defense,
  };

  return character;
};

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
      damage: character.damage,
      defense: character.defense,
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
  if (localStorage.getItem("id") === null) return false;
  else if (await isCharacterSelected()) {
    alert("There is selected hero");
    return true;
  } else if ((await isCharacterSelected()) === false) {
    localStorage.removeItem("id");
    return false;
  }
};

const printAndGetAllUnusedItems = async () => {
  const response = await fetch(domain + "/items", { method: "GET" });

  const getAllItems = await response.json();
  const unusedItems = getAllItems.filter((e) => e.characterId === null);

  let message = `Unused items:
`;

  unusedItems.forEach((e) => {
    Object.keys(e).forEach((k) => {
      if (e[k] !== null) message += `${k}: ${e[k]}\n`;
    });
    message += "\n";
  });
  alert(message);

  return unusedItems;
};

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

const unequipItem = async (userInputForItem) => {
  const response = await fetch(domain + "/items/" + userInputForItem, {
    method: "PATCH",
    body: JSON.stringify({
      characterId: null,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  return data;
};

const equipItem = async (equipItemId, selectedCharacterId) => {
  const response = await fetch(domain + "/items/" + equipItemId, {
    method: "PATCH",
    body: JSON.stringify({
      characterId: selectedCharacterId,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  return data;
};

const getCharacterStats = async () => {
  const selectedCharacter = localStorage.getItem("id");

  const response = await fetch(domain + "/characters/" + selectedCharacter);
  const selectedCharacterData = await response.json();

  const itemsRes = await fetch(
    domain + "/items/?characterId=" + selectedCharacter
  );
  const items = await itemsRes.json();

  const stats = {};

  Object.keys(selectedCharacterData).forEach((key) => {
    if (key !== "class" && key !== "id" && key !== "name") {
      const baseStatValue = selectedCharacterData[key];
      const itemsStatValue = items.reduce((acc, curr) => {
        acc += curr[key];

        return acc;
      }, 0);
      const totalValue = baseStatValue + itemsStatValue;

      stats[
        key
      ] = `${totalValue} (${baseStatValue} + ${itemsStatValue} from items)`;
    }
  });

  let selectedCharacterStats = `Stats for ${selectedCharacterData.name}:
`;

  Object.entries(stats).forEach(([key, value]) => {
    selectedCharacterStats += `- ${key}: ${value}
`;
  });

  alert(selectedCharacterStats);

  return selectedCharacterData;
};

const withoutNullValues = (item) => {
  return Object.fromEntries(
    Object.entries(item).filter(
      ([key, value]) =>
        !key.includes("id") && !key.includes("Id") && value !== null
    )
  );
};

const getCharacterNames = async () => {
  const response = await fetch(domain + "/characters/");

  const allCharacters = await response.json();

  return allCharacters.map((character) => character.name);
};

const getAllCharacters = async () => {
  const response = await fetch(domain + "/characters/");

  const allCharactersData = await response.json();

  let message = `All characters:
`;

  allCharactersData.forEach((character) => {
    Object.keys(character).forEach((prop) => {
      if (character[prop] !== null) message += `${prop}: ${character[prop]}\n`;
    });
    message += "\n";
  });

  console.log(message); // just because message does not fit in alert box
  alert(message);
};

const getRandomItemSlot = () => {
  const avaliableSlots = ["weapon", "helmet", "armor", "boots", "gloves"];
  const randomIndex = Math.floor(Math.random() * avaliableSlots.length);
  const randomSlot = avaliableSlots[randomIndex];

  return randomSlot;
};

const getRandomModifiersAndItemStats = (itemSlot) => {
  const modifiers = [
    "strength",
    "agility",
    "intelligence",
    "healthPoints",
    "manaPoints",
    "damage",
    "defense",
  ];
  const mainStats = ["strength", "agility", "intelligence"];

  const firstModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
  let secondModifier = "";

  do {
    secondModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
  } while (firstModifier === secondModifier);

  const newItem = {};

  modifiers.forEach((modifier) => {
    if (
      (modifier === firstModifier || modifier === secondModifier) &&
      (mainStats.includes(firstModifier) || mainStats.includes(secondModifier))
    ) {
      newItem[modifier] = generateRandomNumberInRange(1, 5);
    } else if (
      (modifier === firstModifier || modifier === secondModifier) &&
      (!mainStats.includes(firstModifier) ||
        !mainStats.includes(secondModifier))
    ) {
      newItem[modifier] = generateRandomNumberInRange(1, 25);
    } else {
      newItem[modifier] = null;
    }
  });

  let newItemStats = `New item:

slot: ${itemSlot}
`;

  Object.entries(newItem).forEach(([key, value]) => {
    if (value !== null) newItemStats += `${key}: ${value}\n`;
  });

  alert(newItemStats);

  return newItem;
};

const getLastAddedItemId = async () => {
  const response = await fetch(domain + "/items");

  const allItemsData = await response.json();

  return allItemsData[allItemsData.length - 1].id;
};

const createNewItem = async (itemName, randomSlot, itemStats) => {
  const response = await fetch(domain + "/items/", {
    method: "POST",
    body: JSON.stringify({
      name: itemName,
      slot: randomSlot,
      strength: itemStats.strength,
      agility: itemStats.agility,
      intelligence: itemStats.intelligence,
      healthPoints: itemStats.healthPoints,
      manaPoints: itemStats.manaPoints,
      damage: itemStats.damage,
      defense: itemStats.defense,
      characterId: null,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const newItem = await response.json();
  return newItem;
};

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
          const character = await newCharacterForm();

          const addedCharacter = await createNewCharacter(character);

          localStorage.setItem("id", addedCharacter.id);

          break;

        default:
          alert("Wrong input");
      }
    } while (choice !== "0" && choice !== "1");
    return;
  } else if (result) {
    let choice = "";

    do {
      const nameAndClass = await getSelectedCharacterInfo();
      choice = prompt(`Hello ${nameAndClass}
choose:
1 - Show unused items
2 - Show equipped items
3 - Show character stats
4 - Create new character
5 - Change character
6 - Dungeon
7 - Exit`);
      switch (choice) {
        case "1":
          await printAndGetAllUnusedItems();
          break;

        case "2":
          let message = `${await getSelectedCharacterInfo()}
Enter:
Id of item (to unequipp)
Id (of other unequipped item) for swap 
`;
          const selectedCharacterId = parseInt(localStorage.getItem("id"));
          const usedItems = await getAllUsedItems(selectedCharacterId);
          const unusedItems = await printAndGetAllUnusedItems();
          message += `
Equiped:
`;
          usedItems.map(
            (e) => (message += ` - ${e.name}, slot: ${e.slot} (id: ${e.id})\n`)
          );

          let userInputForItem;
          do {
            userInputForItem = parseInt(prompt(message)); // CANNOT BE EMPTY
            if (!userInputForItem) alert("Response must not be empty!");
          } while (!userInputForItem);

          if (usedItems.find((item) => item.id === userInputForItem)) {
            const match = usedItems.find(
              (item) => item.id === userInputForItem
            );
            alert(`Unequiped item ${match.name}`);
            unequipItem(userInputForItem);
          } else {
            const unusedItem = unusedItems.find(
              (item) => item.id === userInputForItem
            );
            const sameSlotCurrentItem = usedItems.find(
              (item) => item.slot === unusedItem.slot
            );
            if (sameSlotCurrentItem === undefined) {
              alert("Didnt find item with same slot. Exiting...");
            } else if (sameSlotCurrentItem.slot === unusedItem.slot) {
              const resultCurrentItem = withoutNullValues(sameSlotCurrentItem);
              const resultUnusedItem = withoutNullValues(unusedItem);

              let userInputForSwapItem = `Want to swap
`;

              Object.entries(resultCurrentItem).forEach(([key, value]) => {
                userInputForSwapItem += `${key}: ${value}\n`;
              });

              userInputForSwapItem += `with
`;
              Object.entries(resultUnusedItem).forEach(([key, value]) => {
                userInputForSwapItem += `${key}: ${value}\n`;
              });

              userInputForSwapItem += `
Enter 'yes' or 'no:
`;
              let swap = "";
              do {
                swap = prompt(userInputForSwapItem).toLowerCase();
                if (!swap) alert("Response must not be empty!");
              } while (swap !== "yes" && swap !== "no");

              if (swap === "yes") {
                const equipItemId = unusedItem.id;

                await unequipItem(sameSlotCurrentItem.id);
                await equipItem(equipItemId, selectedCharacterId);

                alert(
                  `Unequiped ${sameSlotCurrentItem.name} and equiped ${unusedItem.name}.`
                );
              } else {
                alert("Did not swap items. Exiting...");
              }
            }
          }
          break;

        case "3":
          await getCharacterStats();
          break;

        case "4":
          const names = await getCharacterNames();
          const character = await newCharacterForm();
          if (names.includes(character.name)) {
            alert(
              "Can not create character with name that already exists. Exiting.."
            );
          } else {
            const addedCharacter = await createNewCharacter(character);
            localStorage.setItem("id", addedCharacter.id);
            alert(`New character ${character.name} created.`);
          }
          break;

        case "5":
          await getAllCharacters();
          const characterNames = await getCharacterNames();

          const userInputForCharacterName = capitalize(
            prompt("Switch character (enter characters name):")
          );

          if (characterNames.includes(userInputForCharacterName)) {
            const index = characterNames.indexOf(userInputForCharacterName);
            const characterToChangeId = index + 1;

            localStorage.setItem("id", characterToChangeId);
            alert(`Switched to character ${characterNames[index]}.`);
          } else {
            alert(
              "Can't find character with that name. Returning to main menu..."
            );
          }
          break;

        case "6":
          const randomSlot = getRandomItemSlot();
          const itemStats = getRandomModifiersAndItemStats(randomSlot);
          const itemName = capitalize(prompt("Enter item name:"));
          createNewItem(itemName, randomSlot, itemStats);
          alert(`Created ${itemName}, slot: ${randomSlot}`);
          break;

        case "7":
          alert("Exiting console application..");
          break;

        default:
          alert("Wrong input");
      }
    } while (choice !== "7");
  }
};

printMainMenu();
