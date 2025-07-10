const capacityData = {
  4.0: [300, 600, 950, 1400],
  4.5: [226,487,730,1117,1014],
  5.0: [157,344,548,848,1014],
  5.5: [137,272,435,674],
  6.0: [115,220,365,578],
  8.0: [83,150,260,332,384],
  9.2: [60,120,200,280],
};

const reels = ['310','380','385','485','4823'];
const reelWeight = {'310':3.7,'380':5.2,'385':6.5,'485':8.6,'4823':0};
const weightPerMeter = {4.0:0.0196,4.5:0.0262,5.0:0.0321,5.5:0.0433,6.0:0.0577,8.0:0.089,9.2:0.120};

const cableTypes = {
  "4.0": "2 Fiber",
  "4.5": "4 Fiber",
  "5.0": "8 Fiber",
  "5.5": "12 Fiber",
  "6.0": "12 Fiber MPO / 24 Fiber MPO",
  "8.0": "Hybrid",
  "9.2": "SMPTE"
};

window.onload = () => {
  const diameterSel = document.getElementById('diameter');
  const mode2Diameter = document.getElementById('mode2-diameter');

  Object.keys(capacityData).forEach(d => {
    const label = cableTypes[d] ? `${cableTypes[d]}, ${d} mm` : `${d} mm`;
    diameterSel.add(new Option(label, d));
    mode2Diameter.add(new Option(label, d));
  });

  const countrySel = document.getElementById('country');
  Object.keys(countryZone).forEach(c => countrySel.add(new Option(c, c)));

  document.getElementById('calcBtn').onclick = calculate;
  document.getElementById('checkCapacityBtn').onclick = calculateCapacity;
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
  const valid = capacities.map((c,i)=>c>=length?reels[i]:null).filter(Boolean);
  if (!valid.length) {
    resultDiv.innerHTML = '<strong>❌ Ningún carrete válido para esa longitud.</strong>';
    return;
  }

  const reel = valid[0];
  const pesoCable = (weightPerMeter[d]||0)*length;
  const pesoCarrete = reelWeight[reel]||0;
  const pesoTotal = pesoCable + pesoCarrete;
  const volumenPeso = calculateVolumetricWeight(reel);
  const billPeso = Math.max(pesoTotal, volumenPeso);
  const zone = countryZone[country];
  const rate = getRate(zone, billPeso);
  if (rate===null) {
    resultDiv.innerHTML = '<strong>Zona/peso no cubierto.</strong>';
    return;
  }
  let price = rate * (urgent?1.15:1) * (insured?1.05:1);
  resultDiv.innerHTML = `
    <strong>Carrete:</strong> ${reel}<br>
    <strong>Peso cable:</strong> ${pesoCable.toFixed(2)} kg<br>
    <strong>Peso carrete:</strong> ${pesoCarrete.toFixed(2)} kg<br>
    <strong>Peso facturable:</strong> ${billPeso.toFixed(2)} kg<br>
    <strong>Zona DHL:</strong> ${zone}<br>
    <strong>Tarifa:</strong> €${price.toFixed(2)}
  `;
}

function calculateCapacity() {
  const d = parseFloat(document.getElementById('mode2-diameter').value);
  const reel = document.getElementById('mode2-reel').value;
  const capList = capacityData[d];
  const idx = reels.indexOf(reel);
  const cap = capList && idx>=0 ? capList[idx] : null;
  const resultBox = document.getElementById('capacityResult');
  resultBox.innerHTML = cap
    ? `<strong>📏 En el carrete ${reel} caben hasta ${cap} metros del cable de ${d} mm.</strong>`
    : `<strong style="color:red;">⚠️ No hay datos disponibles para esa combinación.</strong>`;
}

function calculateVolumetricWeight(reel) {
  const dims = {'310':[37,32,24],'380':[41,31,51],'385':[40,50,34],'485':[56,46,35],'4823':[0,0,0]};
  const [l,w,h] = dims[reel];
  return (l*w*h)/5000;
}

function getRate(zone, weight) {
  const breaks = dhlRates[zone];
  const thresholds = [0.5,1,2,5,10,20,30,50,70];
  for (let i = 0; i < thresholds.length; i++) {
    if (weight <= thresholds[i]) return breaks[i];
  }
  return null;
}
