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

// Pill Identifier via OpenFDA API
function identifyPill() {
  const imprint = document.getElementById("pillImprint").value.trim().toUpperCase();
  const color = document.getElementById("pillColor").value.trim().toLowerCase();
  const shape = document.getElementById("pillShape").value.trim().toLowerCase();
  const resultBox = document.getElementById("pill-result");
  const button = document.querySelector("#pill-identifier button");
  const spinner = document.getElementById("pill-spinner");

  if (!imprint) {
    resultBox.innerHTML = "Please enter a valid imprint.";
    return;
  }

  // Show loading
  spinner.style.display = "block";
  button.disabled = true;
  button.textContent = "Searching...";

  fetch(`https://api.fda.gov/drug/label.json?search=openfda.imprint:"${imprint}"&limit=1`)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const pill = data.results[0];
        const name = pill.openfda.brand_name ? pill.openfda.brand_name.join(", ") : "Unknown brand";
        const warning = pill.warnings ? pill.warnings[0] : "No warning info available.";

        resultBox.innerHTML = `
          <p><strong>Pill Identified:</strong> ${name}</p>
          <p><strong>Imprint:</strong> ${imprint}</p>
          <p><strong>FDA Warning:</strong> ${warning}</p>
          <p><em>Note: Always verify with a veterinarian before taking action.</em></p>
        `;
        resultBox.style.color = "red";
      } else {
        resultBox.innerHTML = "❓ No results found in FDA database.";
        resultBox.style.color = "black";
      }
    })
    .catch(error => {
      resultBox.innerHTML = "⚠️ Error fetching pill data.";
      console.error("Pill lookup error:", error);
    })
    .finally(() => {
      spinner.style.display = "none";
      button.disabled = false;
      button.textContent = "Identify Pill";
    });
}

