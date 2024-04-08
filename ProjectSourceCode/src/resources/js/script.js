const ASSETS = [
  {
    id : 123456789,
    name : 'TSLA',
    numShares : 1.0,
    valueInUSD : 125.00,
  },
  {
    id : 111111111,
    name : 'Liquidity',
    numShares : null,
    valueInUSD : 275.00,
  },
]

function getAssetById(id) {
  for (let i = 0; i < ASSETS.length; i++) {
    if (ASSETS[i].id === id) {
      return ASSETS[i];
    }
  }
  // If no asset is found with the given ID, return null or handle accordingly
  return null;
}


function initializePortfolio() {
  populateCurrentValue(20100.56);
  populateAssetTable();
  initializeActionModal();
}

function populateCurrentValue(currValue) {
  var portfolioCurrValue = document.getElementById('portfolioCurrValue');
  portfolioCurrValue.innerHTML = `$${currValue}`;
}


function populateAssetTable() {
  var assetTableBody = document.getElementById('assetTableBody');

  var numRows = 0;

  // For each asset, add row into asset table
  ASSETS.forEach(asset => {

    // Create new row in table
    var assetRow = document.createElement('tr');

    // Add numbering to table row
    var rowNumber = document.createElement('th');
    rowNumber.innerHTML = numRows + 1;
    assetRow.appendChild(rowNumber);
    numRows++;

    // Stock code / asset name 
    var assetName = document.createElement('td');
    assetName.innerHTML = asset.name;
    assetRow.appendChild(assetName);

    // Number of shares
    var assetNumShares = document.createElement('td');
    if(asset.numShares){
      assetNumShares.innerHTML = asset.numShares;
    }else{
      assetNumShares.innerHTML = '-';
    }
    assetRow.appendChild(assetNumShares);

    // Value in US Dollars
    var assetValueInUSD = document.createElement('td');
    assetValueInUSD.innerHTML = asset.valueInUSD;
    assetRow.appendChild(assetValueInUSD);

    // Growth
    var assetGrowth = document.createElement('td');
    assetGrowth.innerHTML = '-';
    assetRow.appendChild(assetGrowth);

    // Manage Stock Button
    var optionsCell = document.createElement('td');
    var manageStockButton = document.createElement('button');
    manageStockButton.innerHTML = "Manage";
    manageStockButton.className = "btn btn-secondary";
    manageStockButton.setAttribute('onclick', `openActionModal(${asset.id})`);
    optionsCell.appendChild(manageStockButton);
    assetRow.appendChild(optionsCell);


    // Add row to table body
    assetTableBody.appendChild(assetRow);

  });

}





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
    submit_button.innerHTML = "Update";
  }


  ACTION_MODAL.show();
}

function closeActionModal() {
  console.log('Close Action Modal');
  ACTION_MODAL.hide();
}
