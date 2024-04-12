let ACTION_MODAL;

// Function to initialize the action modal
function initializeActionModal() {
    ACTION_MODAL = new bootstrap.Modal(document.getElementById('action-modal'));
}

// Function to open the action modal
// Function to open the action modal
function openActionModal(typeId, rowId) {
  console.log('Open Action Modal');

  // Get the form element and additional info container
  const form = document.getElementById('action-form');
  const additionalInfo = document.getElementById('additional-info');

  // Clear previous content
  form.innerHTML = '';
  additionalInfo.innerHTML = '';

  // Get the row corresponding to the button clicked
  const row = document.getElementById(`row-${rowId}`);

  // Determine action based on typeId
  if (typeId === 1) {
      // Buy stock action
      document.getElementById('modal-title').innerText = 'Buy Stock';

      // Populate additional info from row
      const stockSymbol = row.querySelector('.stock-symbol').innerText;
      const currentLiquidity = document.getElementById('currentLiquidity').innerText;
      const numSharesRow = row.querySelector('td:nth-child(3)').innerText;

      additionalInfo.innerHTML = `
          <div class="row">
              <div class="col">
                  <strong>Stock Symbol:</strong> ${stockSymbol}
              </div>
              <div class="col">
                  <strong>Current Liquidity:</strong> ${currentLiquidity}
              </div>
              <div class="col">
                  <strong>Current Number of Shares:</strong> ${numSharesRow}
              </div>
          </div>
      `;

      // Add form inputs for buying stock
      form.innerHTML = `
          <div class="mb-3">
              <label for="num-shares-buy" class="form-label">Number of Shares to Buy:</label>
              <input type="number" class="form-control" id="num-shares-buy" name="num-shares-buy" required>
          </div>
      `;
  } else if (typeId === 2) {
      // Sell stock action
      document.getElementById('modal-title').innerText = 'Sell Stock';

      // Populate additional info from row
      const stockSymbol = row.querySelector('.stock-symbol').innerText;
      const numSharesRow = row.querySelector('td:nth-child(3)').innerText;

      additionalInfo.innerHTML = `
          <div class="row">
              <div class="col">
                  <strong>Stock Symbol:</strong> ${stockSymbol}
              </div>
              <div class="col">
                  <strong>Current Number of Shares:</strong> ${numSharesRow}
              </div>
          </div>
      `;

      // Add form inputs for selling stock
      form.innerHTML = `
          <div class="mb-3">
              <label for="num-shares-sell" class="form-label">Number of Shares to Sell:</label>
              <input type="number" class="form-control" id="num-shares-sell" name="num-shares-sell" required>
          </div>
      `;
    } else if (typeId === 3) {
      // Search stock action
      document.getElementById('modal-title').innerText = 'Search Stock';

      // Add form inputs for searching stock
      form.innerHTML = `
          <div class="input-group mb-3">
              <input type="text" class="form-control" id="stock-symbol-search" name="stock-symbol-search" required>
              <button class="btn btn-primary" type="button" id="search-button">Search</button>
          </div>
          <div id="search-results"></div> <!-- Container for search results -->
      `;

      // Add event listener for searching stock when the search button is clicked
      document.getElementById('search-button').addEventListener('click', searchStock);
  }

  // Show the modal
  ACTION_MODAL.show();
}


// Function to close the action modal
function closeActionModal() {
    console.log('Close Action Modal');

    // Hide the modal
    ACTION_MODAL.hide();
}

// Function to handle search stock form submission
function searchStock(event) {
    event.preventDefault();
    
    // Get the search input value
    const stockSymbol = document.getElementById('stock-symbol-search').value;

    // Call an API to get the current market value of the stock
    // Replace the API call with your own implementation
    const currentMarketValue = getCurrentMarketValue(stockSymbol);

    // Display the current market value in the modal
    const additionalInfo = document.getElementById('additional-info');
    additionalInfo.innerHTML = `
        <div class="row">
            <div class="col">
                <strong>Current Market Value:</strong> $${currentMarketValue}
            </div>
        </div>
    `;

    // Add form inputs for buying stock
    const form = document.getElementById('action-form');
    form.innerHTML = `
        <div class="mb-3">
            <label for="num-shares-buy" class="form-label">Number of Shares to Buy:</label>
            <input type="number" class="form-control" id="num-shares-buy" name="num-shares-buy" required>
        </div>
    `;
}

// Dummy function to simulate getting current market value from an API
function getCurrentMarketValue(stockSymbol) {
    // Replace this with your actual API call to get the current market value of the stock
    // For demonstration purposes, let's just return a random value
    return (Math.random() * 1000).toFixed(2);
}


// Function to handle search stock form submission
function searchStock(event) {
  event.preventDefault();
  
  // Get the search input value
  const stockSymbol = document.getElementById('stock-symbol-search').value;

  // Call the API to search for stocks by symbol
  fetch(`/searchBySymbol?symbol=${stockSymbol}`)
      .then(response => response.json())
      .then(data => {
          // Display the search results
          displaySearchResults(data);
      })
      .catch(error => {
          console.error('Error searching for stocks:', error);
          // Display an error message to the user
          alert('An error occurred while searching for stocks. Please try again.');
      });
}

// Function to display search results
function displaySearchResults(results) {
  const searchResultsContainer = document.getElementById('search-results');
  searchResultsContainer.innerHTML = ''; // Clear previous results
  
  // Loop through the results and display each stock
  results.forEach(stock => {
      // Create a button for each stock
      const stockButton = document.createElement('button');
      stockButton.textContent = `${stock.symbol} - ${stock.name}`;
      stockButton.classList.add('btn', 'btn-primary', 'mb-2');
      stockButton.addEventListener('click', () => {
          // When a stock button is clicked, show its current market value
          showMarketValue(stock.symbol);
      });
      searchResultsContainer.appendChild(stockButton);
  });
}

// Function to fetch and display the current market value of a stock
function showMarketValue(symbol) {
  // Call an API to get the current market value of the stock
  fetch(`/getCurrentMarketValue?symbol=${symbol}`)
      .then(response => response.json())
      .then(data => {
          // Display the current market value in the modal
          const additionalInfo = document.getElementById('additional-info');
          additionalInfo.innerHTML = `
              <div class="row">
                  <div class="col">
                      <strong>Stock Symbol:</strong> ${symbol}
                  </div>
                  <div class="col">
                      <strong>Current Market Value:</strong> $${data.marketValue}
                  </div>
              </div>
          `;

          // Add form inputs for buying stock
          const form = document.getElementById('action-form');
          form.innerHTML = `
              <div class="mb-3">
                  <label for="num-shares-buy" class="form-label">Number of Shares to Buy:</label>
                  <input type="number" class="form-control" id="num-shares-buy" name="num-shares-buy" required>
              </div>
              <input type="hidden" id="stock-symbol" name="symbol" value="${symbol}">
          `;
      })
      .catch(error => {
          console.error('Error fetching market value:', error);
          // Display an error message to the user
          alert('An error occurred while fetching the market value. Please try again.');
      });
}








