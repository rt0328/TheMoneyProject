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

function initializePortfolio() {
  populateCurrentValue(20100.56);
  populateAssetTable();
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
    optionsCell.appendChild(manageStockButton);
    assetRow.appendChild(optionsCell);


    // Add row to table body
    assetTableBody.appendChild(assetRow);

  });

}