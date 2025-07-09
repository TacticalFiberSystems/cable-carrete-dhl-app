// Capacidad máxima por diámetro y carrete
const capacityData = {
  3.0: [628, 1320, 2009, 3125],
  4.5: [226, 487, 730, 1117, 1014],
  5.0: [157, 344, 548, 848, 1014],
  5.5: [137, 272, 435, 674],
  6.0: [115, 220, 365, 578],
  8.0: [83, 150, 260, 332, 384],
  9.0: [78, 140, 250, 320],
  10.0: [73, 132, 230, 300],
  12.0: [65, 110, 195, 265],
  14.0: [55, 95, 170, 225],
  17.0: [40, 65, 120, 150],
  24.0: [30, 40, 55, 70],
  29.9: [29, 40, 40, 25, 30]
};

const reels = ['310', '380', '385', '485', '4823'];
const reelWeight = { '310': 3.7, '380': 5.2, '385': 6.5, '485': 8.6, '4823': 0 };

// Peso por metro según diámetro (kg)
const weightPerMeter = {
  3.0: 0.0196, 4.5: 0.0262, 5.0: 0.0321,
  5.5: 0.0433, 6.0: 0.0577, 8.0: 0.089,
  9.2: 0.120
};

window.onload = () => {
  const diameterSel = document.getElementById('diameter');
  Object.keys(capacityData).forEach(d => {
    diameterSel.add(new Option(d + ' mm', d));
  });

  const countrySel = document.getElementById('country');
  Object.keys(countryZone).forEach(c => {
    countrySel.add(new Option(c, c));
  });

  document.getElementById('calcBtn').onclick = calculate;
};

function calculate() {
  const d = parseFloat(document.getElementById('diameter').value);
  const length = parseFloat(document.getElementById('length').value);
  const country = document.getElementById('country').value;
  const urgent = document.getElementById('urgent').checked;
  const insured = document.getElementById('insured').checked;
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  if (!d || !length || !country) {
    resultDiv.innerHTML = '<span style="color:red;">Por favor completa todos los campos.</span>';
    return;
  }

  const capacities = capacityData[d];
  const valid = capacities.map((cap, i) => cap >= length ? reels[i] : null).filter(Boolean);
  if (!valid.length) {
    resultDiv.innerHTML = '<strong>❌ Ningún carrete válido para esa longitud.</strong>';
    return;
  }

  const reel = valid[0]; // elegimos el primer válido
  const pesoCable = (weightPerMeter[d] || 0) * length;
  const pesoCarrete = reelWeight[reel] || 0;
  const pesoTotal = pesoCable + pesoCarrete;
  const volumenPeso = calculateVolumetricWeight(reel);
  const billPeso = Math.max(pesoTotal, volumenPeso);

  const zone = countryZone[country];
  const rate = getRate(zone, billPeso);
  if (rate === null) {
    resultDiv.innerHTML = '<strong>Zona/peso no cubierto.</strong>';
    return;
  }

  let price = rate;
  if (urgent) price *= 1.15;
  if (insured) price *= 1.05;
  price = price.toFixed(2);

  resultDiv.innerHTML = `
    <strong>Carrete:</strong> ${reel}<br>
    <strong>Peso cable:</strong> ${pesoCable.toFixed(2)} kg<br>
    <strong>Peso carrete:</strong> ${pesoCarrete.toFixed(2)} kg<br>
    <strong>Peso facturable:</strong> ${billPeso.toFixed(2)} kg<br>
    <strong>Zona DHL:</strong> ${zone}<br>
    <strong>Tarifa:</strong> €${price}
  `;
}

function calculateVolumetricWeight(reel) {
  const dims = { '310': [37,32,24], '380': [41,31,51], '385': [40,50,34], '485': [56,46,35], '4823': [0,0,0] };
  const [l,w,h] = dims[reel];
  return ((l*w*h)/5000);
}

function getRate(zone, weight) {
  const breaks = dhlRates[zone];
  if (!breaks) return null;
  const thresholds = [0.5,1,2,5,10,20,30,50,70];
  for (let i=0; i < thresholds.length; i++) {
    if (weight <= thresholds[i]) return breaks[i];
  }
  return null;
}
