/**
 * Lala's full menu — exact items and pricing from official menu.
 * Used when Firestore has no items or as fallback.
 */

export type StaticMenuItem = {
  id: string;
  name: string;
  price: number;
  categoryName: string;
  description?: string;
};

const PIZZA_SIZES = ["7\"", "10\"", "18\"", "22\""] as const;

function pizzaItems(): StaticMenuItem[] {
  const pizzas: { name: string; prices: [number, number, number, number] }[] = [
    { name: "Palermo Pizza", prices: [630, 1070, 1720, 2800] },
    { name: "Margarita Pizza", prices: [550, 980, 1820, 2900] },
    { name: "Firenze Pizza", prices: [680, 1010, 2020, 3000] },
    { name: "Chicken B.B.Q Pizza", prices: [700, 1110, 2070, 3300] },
    { name: "Chicken Pizza", prices: [700, 1110, 2070, 3250] },
    { name: "Milano Pizza", prices: [700, 1110, 2070, 3300] },
    { name: "Romano Pizza", prices: [680, 1060, 2020, 3200] },
    { name: "Supremo Pizza", prices: [680, 1110, 2020, 3200] },
    { name: "Lala's Special Pizza", prices: [700, 1110, 2070, 3300] },
    { name: "Royal Pizza", prices: [730, 1210, 2020, 3500] },
    { name: "Pepperoni Pizza", prices: [780, 1240, 2100, 3680] },
    { name: "Tandoori Chicken Pizza", prices: [680, 1110, 2020, 3300] },
    { name: "Cocku Pizza", prices: [710, 1110, 2020, 3200] },
    { name: "Calzone Pie", prices: [780, 1240, 2020, 3500] },
    { name: "Stuffed Crust Pizza", prices: [780, 1210, 1970, 3400] },
    { name: "Malai Boti Pizza", prices: [780, 1210, 1970, 3500] },
    { name: "Kabab Chaska Pizza", prices: [750, 1160, 1920, 3400] },
    { name: "Cream Tikka Pizza", prices: [720, 1160, 1920, 3400] },
    { name: "Rillgo Pizza", prices: [780, 1210, 1970, 0] }, // 22" not listed
    { name: "Ch. Kabab Cheese Pizza", prices: [730, 1210, 2020, 3400] },
  ];

  const items: StaticMenuItem[] = [];
  pizzas.forEach((p, idx) => {
    PIZZA_SIZES.forEach((size, i) => {
      const price = p.prices[i];
      if (price > 0) {
        items.push({
          id: `pizza-${idx}-${i}`,
          name: `${p.name} (${size})`,
          price,
          categoryName: "Pizza",
        });
      }
    });
  });
  return items;
}

const SPECIAL_DEALS: StaticMenuItem[] = [
  { id: "deal-01", name: "Deal 01: 02 Zinger Burger, French Fries, 02 Soft Can, 1.5 LTR Drink", price: 1820, categoryName: "Special Deals" },
  { id: "deal-02", name: "Deal 02: Crispy Burger, Qtr Broast, French Fries, 02 Soft Can", price: 2300, categoryName: "Special Deals" },
  { id: "deal-03", name: "Deal 03: 02 Beef Burger, French Fries, Pasta, 02 Soft Can", price: 2400, categoryName: "Special Deals" },
  { id: "deal-04", name: "Deal 04: 02 Chicken Cheese Burger with Garlic Mayo Fries, 02 Soft Can", price: 2820, categoryName: "Special Deals" },
  { id: "deal-05", name: "Deal 05: 02 Small Pizza, Half Pasta, Crispy Wings, 1.5 LTR Drink", price: 2720, categoryName: "Special Deals" },
  { id: "deal-06", name: "Deal 06: 02 Beef Burger, French Fries, Crispy Wings, 02 Soft Can", price: 2050, categoryName: "Special Deals" },
  { id: "deal-07", name: "Deal 07: 10\" Pizza, Chicken Chowmein, Goulgappy, 02 Soft Can", price: 3170, categoryName: "Special Deals" },
  { id: "deal-08", name: "Deal 08: 10\" Royal Pizza, Crispy Wings, Beef Pasta, 02 Soft Can", price: 2860, categoryName: "Special Deals" },
  { id: "deal-09", name: "Deal 09: 18\" Pizza, Cheese Fries, Half Pasta, Club Sandwich, 1.5 LTR Drink", price: 3550, categoryName: "Special Deals" },
  { id: "deal-10", name: "Deal 10: 18\" Pizza, 02 Beef Steak, Crispy Wings, 1.5 LTR Drink", price: 5350, categoryName: "Special Deals" },
];

const CHICKEN_ATTRACTION: StaticMenuItem[] = [
  { id: "ch-beef-manch", name: "Beef Manchurian", price: 1150, categoryName: "Chicken Attraction" },
  { id: "ch-chicken-manch", name: "Chicken Manchurian", price: 970, categoryName: "Chicken Attraction" },
  { id: "ch-garlic", name: "Garlic Chicken", price: 1020, categoryName: "Chicken Attraction" },
  { id: "ch-chilli-dry", name: "Chicken Chilli (Dry)", price: 1170, categoryName: "Chicken Attraction" },
  { id: "ch-chilli-gravy", name: "Chicken Chilli (Gravy)", price: 1000, categoryName: "Chicken Attraction" },
  { id: "ch-tempura", name: "Chicken Tempura", price: 990, categoryName: "Chicken Attraction" },
  { id: "ch-sweet-sour", name: "Sweet & Sour Chicken", price: 990, categoryName: "Chicken Attraction" },
  { id: "ch-onion-chilli", name: "Chicken Onion Chilli", price: 970, categoryName: "Chicken Attraction" },
  { id: "ch-shanghai", name: "Shanghai Chicken Steak", price: 1040, categoryName: "Chicken Attraction" },
  { id: "ch-veg-chilli", name: "Chicken Vegetable Chilli", price: 970, categoryName: "Chicken Attraction" },
  { id: "ch-spicy-garlic", name: "Spicy Garlic Chicken", price: 1240, categoryName: "Chicken Attraction" },
];

const PASTAS: StaticMenuItem[] = [
  { id: "pasta-beef-lasagne", name: "Beef / Chicken Lasagne", price: 1040, categoryName: "Pastas" },
  { id: "pasta-bon-bon", name: "Chicken Bon Bon (With Rice)", price: 990, categoryName: "Pastas" },
  { id: "pasta-beef-spag", name: "Beef Spaghetti", price: 990, categoryName: "Pastas" },
  { id: "pasta-ala-king", name: "Chicken Ala King (With Rice)", price: 920, categoryName: "Pastas" },
  { id: "pasta-alfredo", name: "Al-Fredo Pasta", price: 970, categoryName: "Pastas" },
  { id: "pasta-veg-lasagne", name: "Lasagne (Vegetarian)", price: 890, categoryName: "Pastas" },
  { id: "pasta-chilli-milli", name: "Pasta Chilli Milli", price: 1000, categoryName: "Pastas" },
  { id: "pasta-depolo", name: "Lasagne De-Polo Chicken", price: 970, categoryName: "Pastas" },
  { id: "pasta-taragon", name: "Taragon Chicken", price: 960, categoryName: "Pastas" },
  { id: "pasta-bbq", name: "Bar B.Q. Pasta", price: 1050, categoryName: "Pastas" },
  { id: "pasta-special", name: "Lala's Special Cheese P.", price: 1030, categoryName: "Pastas" },
];

const STEAK: StaticMenuItem[] = [
  { id: "steak-chicken-sizzling", name: "Chicken Steak Sizzling With Rice", price: 1570, categoryName: "Steak" },
  { id: "steak-fish-tempura", name: "Fish Tempura", price: 1570, categoryName: "Steak" },
  { id: "steak-shanghai-fish", name: "Shanghai Fish With Rice", price: 1320, categoryName: "Steak" },
  { id: "steak-italian", name: "Italian Chicken", price: 1420, categoryName: "Steak" },
  { id: "steak-beef", name: "Beef Steak", price: 1570, categoryName: "Steak" },
  { id: "steak-pepper-sizzling", name: "Pepper Sizzling", price: 1670, categoryName: "Steak" },
  { id: "steak-beef-pepper", name: "Beef Pepper Steak", price: 1670, categoryName: "Steak" },
  { id: "steak-chicken-sesmin", name: "Chicken Sesmin", price: 1170, categoryName: "Steak" },
];

const FRIES: StaticMenuItem[] = [
  { id: "fries-plain", name: "Plain Fries", price: 390, categoryName: "Fries" },
  { id: "fries-mayo", name: "Mayo Fries", price: 440, categoryName: "Fries" },
  { id: "fries-cheese", name: "Cheese Fries", price: 490, categoryName: "Fries" },
  { id: "fries-masala", name: "Masala Fries", price: 390, categoryName: "Fries" },
  { id: "fries-pizza", name: "Pizza Fries", price: 590, categoryName: "Fries" },
  { id: "fries-fish", name: "Fish Fries", price: 1310, categoryName: "Fries" },
];

const CHOWMEIN: StaticMenuItem[] = [
  { id: "chow-chicken", name: "Chicken Chowmein", price: 810, categoryName: "Chowmein" },
  { id: "chow-special", name: "Special Chowmein", price: 860, categoryName: "Chowmein" },
  { id: "chow-veg", name: "Vegetable Chowmein", price: 660, categoryName: "Chowmein" },
  { id: "chow-beef", name: "Beef Chowmein", price: 1040, categoryName: "Chowmein" },
  { id: "chow-mix", name: "Mix Chowmein", price: 1060, categoryName: "Chowmein" },
];

const WINGS_FISH: StaticMenuItem[] = [
  { id: "wf-bbq", name: "Bar.B.Que Wings", price: 600, categoryName: "Wings & Fish" },
  { id: "wf-sweet-sour", name: "Sweet N Sour Wings", price: 560, categoryName: "Wings & Fish" },
  { id: "wf-dry-rub", name: "Dry Rub Wings (Spicy)", price: 570, categoryName: "Wings & Fish" },
  { id: "wf-crispy", name: "Crispy Wings", price: 620, categoryName: "Wings & Fish" },
  { id: "wf-broast-half", name: "Broast (Half)", price: 1030, categoryName: "Wings & Fish" },
  { id: "wf-broast-qtr", name: "Broast (Quarter)", price: 550, categoryName: "Wings & Fish" },
  { id: "wf-garlic", name: "Garlic Wings (06 Pcs)", price: 600, categoryName: "Wings & Fish" },
  { id: "wf-dhaka", name: "Dhaka Fish", price: 970, categoryName: "Wings & Fish" },
  { id: "wf-fish-sweet", name: "Sweet & Sour Fish", price: 1070, categoryName: "Wings & Fish" },
];

const ROLL: StaticMenuItem[] = [
  { id: "roll-pizza", name: "Pizza Roll", price: 580, categoryName: "Roll" },
  { id: "roll-zinger", name: "Zinger Roll", price: 330, categoryName: "Roll" },
  { id: "roll-garlic-mayo", name: "Garlic Mayo Roll", price: 330, categoryName: "Roll" },
];

const RICE: StaticMenuItem[] = [
  { id: "rice-mix", name: "Mix Fried Rice", price: 590, categoryName: "Rice" },
  { id: "rice-chicken", name: "Chicken Fried Rice", price: 710, categoryName: "Rice" },
  { id: "rice-veg", name: "Vegetable Fried Rice", price: 540, categoryName: "Rice" },
  { id: "rice-beef", name: "Beef Fried Rice", price: 990, categoryName: "Rice" },
  { id: "rice-garlic", name: "Garlic Fried Rice", price: 840, categoryName: "Rice" },
];

const BEEF_TENDERLOIN: StaticMenuItem[] = [
  { id: "bt-oyster", name: "Beef Oyster Sauce", price: 1150, categoryName: "Beef Tenderloin" },
  { id: "bt-chilli-dry", name: "Beef Chilli (Dry)", price: 1150, categoryName: "Beef Tenderloin" },
  { id: "bt-classic-dry", name: "Classic Chilli Beef (Dry)", price: 1050, categoryName: "Beef Tenderloin" },
  { id: "bt-classic-gravy", name: "Classic Chilli Beef (Gravy)", price: 1070, categoryName: "Beef Tenderloin" },
  { id: "bt-oyster-in", name: "Beef In Oyster Sauce", price: 1010, categoryName: "Beef Tenderloin" },
];

export const STATIC_MENU_CATEGORIES = [
  "Special Deals",
  "Pizza",
  "Chicken Attraction",
  "Pastas",
  "Steak",
  "Fries",
  "Chowmein",
  "Wings & Fish",
  "Roll",
  "Rice",
  "Beef Tenderloin",
] as const;

export function getStaticMenuItems(): StaticMenuItem[] {
  return [
    ...SPECIAL_DEALS,
    ...pizzaItems(),
    ...CHICKEN_ATTRACTION,
    ...PASTAS,
    ...STEAK,
    ...FRIES,
    ...CHOWMEIN,
    ...WINGS_FISH,
    ...ROLL,
    ...RICE,
    ...BEEF_TENDERLOIN,
  ];
}

export function getStaticMenuByCategory(category: string): StaticMenuItem[] {
  const all = getStaticMenuItems();
  if (!category || category === "Sab" || category === "All") return all;
  return all.filter((i) => i.categoryName === category);
}
