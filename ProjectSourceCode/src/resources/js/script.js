const LOOKUP_STOCKS = [
    {
        "symbol" : "GOOGL",
        "currValue" : 2800.75,
    },
    {
        "symbol" : "APPL",
        "currValue" : 150.25,
    },
    {
        "symbol" : "AMZN",
        "currValue" : 3200.50
    },
    {
        "symbol" : "MSFT",
        "currValue" : 280.90
    }
];






let ACTION_MODAL;

// Function to initialize the action modal
function initializeActionModal() {
    ACTION_MODAL = new bootstrap.Modal(document.getElementById('action-modal'));
}

// Function to open the action modal
function openActionModal(typeId, rowId) {
    console.log('Open Action Modal');
  
    // Get the form element and additional info container
    const form = document.getElementById('action-form');
    const additionalInfo = document.getElementById('additional-info');
  
    // Clear previous content
    form.innerHTML = '';
    additionalInfo.innerHTML = '';
  
    // Remove existing event listener for the submit button
    document.getElementById('submit_button').removeEventListener('click', handleBuyStockFormSubmission);
    document.getElementById('submit_button').removeEventListener('click', handleSellStockFormSubmission);
  
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
                <input type="hidden" id="stock-symbol" name="symbol" value="${stockSymbol}">
            </div>
        `;
  
        // Add event listener to the submit button for buying stock
        document.getElementById('submit_button').addEventListener('click', handleBuyStockFormSubmission);
  
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
                <input type="hidden" id="stock-symbol" name="symbol" value="${stockSymbol}">
            </div>
        `;
  
        // Add event listener to the submit button for selling stock
        document.getElementById('submit_button').addEventListener('click', handleSellStockFormSubmission);
      } else if (typeId === 3) {
        // Search stock action
        document.getElementById('modal-title').innerText = 'Purchase New Stock';
  
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
    window.location.reload();
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

    // Add event listener to the submit button for buying stock
    document.getElementById('submit_button').addEventListener('click', handleBuyStockFormSubmission);
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
    const results = LOOKUP_STOCKS.filter(stock => stock.symbol.includes(stockSymbol.toUpperCase()));
    
    // Display the search results
    displaySearchResults(results);
  }
  
// Function to display search results
function displaySearchResults(results) {
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.innerHTML = ''; // Clear previous results
    
  
    // Check if there are any results
    if (results.length === 0) {
      // If there are no results, display a message
      const noResultsMessage = document.createElement('p');
      noResultsMessage.textContent = "No results found.";
      searchResultsContainer.appendChild(noResultsMessage);
    } else {
        // Create a header for the results
        const resultsHeader = document.createElement('h5');
        resultsHeader.textContent = "Results";
        searchResultsContainer.appendChild(resultsHeader);
      // Loop through the results and display each stock
      results.forEach(stock => {
          // Create a div for each stock
          const stockDiv = document.createElement('div');
          stockDiv.classList.add('mb-2');
          
          // Create a hyperlink for the stock symbol
          const stockLink = document.createElement('a');
          stockLink.textContent = `${stock.symbol}`;
          stockLink.href = "#"; // You can set the href to any appropriate value or leave it empty
          
          // Create a span for the current value
          const valueSpan = document.createElement('span');
          valueSpan.textContent = ` - $${stock.currValue.toFixed(2)}`;
          
          // Append hyperlink and value span to the stock div
          stockDiv.appendChild(stockLink);
          stockDiv.appendChild(valueSpan);
          
          // Add event listener to the hyperlink to show quantity input
          stockLink.addEventListener('click', () => {
              showQuantityInput(stock.symbol);
          });
          
          // Append stock div to the search results container
          searchResultsContainer.appendChild(stockDiv);
      });
    }
  }
  
  
  
// Function to show input field for quantity
function showQuantityInput(symbol) {
    console.log('Symbol:', symbol); // Log the symbol to check if it's correctly received

    // Get the current liquidity
    const currentLiquidity = document.getElementById('currentLiquidity').innerText;

    // Find the stock information in the LOOKUP_STOCKS array
    const stock = LOOKUP_STOCKS.find(item => item.symbol === symbol);

    // Display the current liquidity and market value in the modal
    const additionalInfo = document.getElementById('additional-info');
    additionalInfo.innerHTML = `
        <div class="row">
            <div class="col">
                <strong>Stock Symbol:</strong> ${symbol}
            </div>
            <div class="col">
                <strong>Current Liquidity:</strong> ${currentLiquidity}
            </div>
            <div class="col">
                <strong>Current Market Value:</strong> $${stock.currValue.toFixed(2)}
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
}


function handleBuyStockFormSubmission(event) {
    event.preventDefault();

    // Extract portfolioId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const portfolioId = parseInt(urlParams.get('portfolioId'), 10);

    // Get the form data
    const formData = new FormData(document.getElementById('action-form'));

    // Get numStocks and stockSymbol from the form data
    const numStocks = parseInt(formData.get('num-shares-buy'), 10);
    const stockSymbol = formData.get('symbol'); // Correct ID used here

    // Construct the JSON data object
    const jsonData = {
        portfolioId: portfolioId,
        numStocks: numStocks,
        stockSymbol: stockSymbol
    };

    console.log(jsonData);

    // Make an AJAX request to the server
    fetch('/buyStock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to purchase stock');
        }
        closeActionModal();
        return response.json();
    })
    .then(data => {
        // Handle successful purchase
        console.log('Stock purchased successfully:', data);
    })
    .catch(error => {
        // Handle errors
        console.error('Error purchasing stock:', error.message);
        // You can display an error message to the user or perform other actions here
    });
}


// Function to handle selling stock form submission
function handleSellStockFormSubmission(event) {
    event.preventDefault();

    // Extract portfolioId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const portfolioId = parseInt(urlParams.get('portfolioId'), 10);

    // Get the form data
    const formData = new FormData(document.getElementById('action-form'));

    // Get numStocks and stockSymbol from the form data
    const numStocks = parseInt(formData.get('num-shares-sell'), 10);
    const stockSymbol = formData.get('symbol'); // Correct ID used here

    // Construct the JSON data object
    const jsonData = {
        portfolioId: portfolioId,
        numStocks: numStocks,
        stockSymbol: stockSymbol
    };

    console.log(jsonData);

    // Make an AJAX request to the server
    fetch('/sellStock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to sell stock');
        }
        closeActionModal();
        return response.json();
    })
    .then(data => {
        // Handle successful sale
        console.log('Stock sold successfully:', data);
    })
    .catch(error => {
        // Handle errors
        console.error('Error selling stock:', error.message);
        // You can display an error message to the user or perform other actions here
    });
}
