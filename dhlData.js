// Zonas DHL por país (ejemplos)
const countryZone = {
  "España": 1,
  "Francia": 2,
  "Reino Unido": 2,
  "Estados Unidos": 6,
  "Chile": 10,
  // añadir más países...
};

// Tarifas por zona y rango de peso (kg)
const dhlRates = {
  1: [0.5, 1, 2, 5, 10, 20, 30, 50, 70],
  2: [12, 20, 35, 70, 130, 260, 350, 550, 750],
  6: [30, 50, 90, 180, 340, 680, 920, 1400, 2000],
  10: [40, 65, 120, 250, 450, 900, 1300, 2000, 3000],
  // ...
};
