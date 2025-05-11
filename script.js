let toxinData = {};

// Load toxins.json
fetch("./data/toxins.json")
  .then(response => response.json())
  .then(data => {
    toxinData = data;
    populateToxins("dog"); // Default selection
  });

// Elements
const speciesSelect = document.getElementById("species");
const toxinSelect = document.getElementById("toxin");
const form = document.getElementById("toxinForm");
const result = document.getElementById("result");

// Update toxin dropdown when species changes
speciesSelect.addEventListener("change", () => {
  populateToxins(speciesSelect.value);
});

function populateToxins(species) {
  toxinSelect.innerHTML = "";
  if (!toxinData[species]) return;
  toxinData[species].forEach(toxin => {
    const option = document.createElement("option");
    option.value = toxin.name;
    option.textContent = toxin.name;
    toxinSelect.appendChild(option);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const species = speciesSelect.value;
  const toxinName = toxinSelect.value;
  const weight = parseFloat(document.getElementById("weight").value);
  const amount = parseFloat(document.getElementById("amount").value);

  if (!species || !toxinName || isNaN(weight) || isNaN(amount)) {
    result.textContent = "⚠️ Please fill in all fields correctly.";
    return;
  }

  const toxin = toxinData[species].find(t => t.name === toxinName);
  if (!toxin) {
    result.textContent = "Toxin data not found.";
    return;
  }

  const dangerousDose = weight * toxin.threshold_mg_per_kg;
  const risk = amount >= dangerousDose;

  result.innerHTML = `
    <p><strong>Toxin:</strong> ${toxin.name}</p>
    <p><strong>Urgency:</strong> ${toxin.urgency}</p>
    <p><strong>Symptoms:</strong> ${toxin.symptoms.join(", ")}</p>
    <p><strong>Estimated Threshold Dose:</strong> ${dangerousDose.toFixed(2)} mg</p>
    <p><strong>Your Pet Ingested:</strong> ${amount.toFixed(2)} mg</p>
    <p style="color: ${risk ? 'red' : 'green'}">
      ${risk ? '🚨 Potentially toxic! Contact your vet immediately.' : '✅ Likely below toxic dose. Monitor your pet.'}
    </p>
  `;
});
