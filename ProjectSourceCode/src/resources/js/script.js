function getAssetById(id) {
  for (let i = 0; i < ASSETS.length; i++) {
    if (ASSETS[i].id === id) {
      return ASSETS[i];
    }
  }
  // If no asset is found with the given ID, return null or handle accordingly
  return null;
}

// Formats integer into USD format - e.g. 1122230.23 => 1,122,230.23
function formatDollarAmount(amount) {
  // Convert amount to string and split it into whole and decimal parts
  let [wholePart, decimalPart] = String(amount).split('.');

  // Add commas every three digits from the right in the whole part
  wholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // If decimalPart exists, concatenate with '.'; otherwise, set it as '00'
  decimalPart = decimalPart ? '.' + decimalPart : '.00';

  // Return formatted amount
  return wholePart + decimalPart;
}


function initializePortfolio(userStocks) {
  console.log(userStocks)
  //populateAssetTable();
  initializeActionModal();
}

function populateCurrentValue(currValue) {
  var portfolioCurrValue = document.getElementById('portfolioCurrValue');
  portfolioCurrValue.innerHTML = `$${formatDollarAmount(currValue)}`;
}


// function populateAssetTable(userStocks) {
//   var assetTableBody = document.getElementById('assetTableBody');

//   var numRows = 0;

//   // For each asset, add row into asset table
//   userStocks.forEach((asset, index) => {

//     // Create new row in table
//     var assetRow = document.createElement('tr');

//     // Add numbering to table row
//     var rowNumber = document.createElement('th');
//     rowNumber.innerHTML = index + 1;
//     assetRow.appendChild(rowNumber);
//     numRows++;

//     // Asset name
//     var assetName = document.createElement('td');
//     assetName.innerHTML = asset.name;
//     assetRow.appendChild(assetName);

//     // Number of shares
//     var assetNumShares = document.createElement('td');
//     assetNumShares.innerHTML = asset.numShares ? asset.numShares : '-';
//     assetRow.appendChild(assetNumShares);

//     // Value in US Dollars
//     var assetValueInUSD = document.createElement('td');
//     assetValueInUSD.innerHTML = `$${formatDollarAmount(asset.valueInUSD)}`;
//     assetRow.appendChild(assetValueInUSD);

//     // Growth
//     var assetGrowth = document.createElement('td');
//     assetGrowth.innerHTML = '-';
//     assetRow.appendChild(assetGrowth);

//     // Manage Stock Button
//     var optionsCell = document.createElement('td');
//     var manageStockButton = document.createElement('button');
//     manageStockButton.innerHTML = "Manage";
//     manageStockButton.className = "btn btn-secondary";
//     manageStockButton.setAttribute('onclick', `openActionModal(${asset.id})`);
//     optionsCell.appendChild(manageStockButton);
//     assetRow.appendChild(optionsCell);

//     // Add row to table body
//     assetTableBody.appendChild(assetRow);
//   });
// }






let ACTION_MODAL;

function initializeActionModal() {
  ACTION_MODAL = new bootstrap.Modal(document.getElementById('action-modal'));
}


function openActionModal(id) {
  console.log('Open Action Modal');

  const submit_button = document.querySelector("#submit_button");
  const modal_title = document.querySelector(".modal-title");

  let asset = getAssetById(id);

  console.log(asset)
  console.log(id)

  if (!asset) {
    asset = {
      name: "",
      numShares: 0,
      valueInUSD: 0,
    };

    // Update the innerHTML for modalTitle and submitButton
    // Replace <> with the correct attribute
    modal_title.innerHTML = "Purchase Stock";
    submit_button.innerHTML = "Purchase Stock";
    // Allocate a new event id. Note that nothing is inserted into the CALENDAR_EVENTS yet.
    // Set the id to be the length of the CALENDAR_EVENTS because we are adding a new element
    id = ASSETS.length;

  } else {
    // We will default to "Update Event" as the text for the title and the submit button
    modal_title.innerHTML = "Manage Asset";
    submit_button.innerHTML = "Submit Changes";
  }

  // Populate all fields with corresponding information
  document.querySelector("#asset_full_name").innerHTML = asset.name;
  document.querySelector("#asset_market_value").innerHTML = `$${formatDollarAmount(180.00)}`;
  document.querySelector("#asset_name").innerHTML = asset.name;
  document.querySelector("#num_shares").innerHTML = asset.numShares;
  document.querySelector("#value_in_usd").innerHTML = `$${formatDollarAmount(asset.valueInUSD)}`;

  var buyButton = document.querySelector("#buy-btn");
  var sellButton = document.querySelector("#sell-btn");

  if(!asset){
    sellButton.setAttribute("hidden","");
  }else{
    sellButton.removeAttribute("hidden");
  }

  // const form = document.querySelector("#action-modal form");
  // form.setAttribute("action", `javascript:updateEventFromModal(${id})`);


  ACTION_MODAL.show();
}

function closeActionModal() {
  console.log('Close Action Modal');
  ACTION_MODAL.hide();
}
