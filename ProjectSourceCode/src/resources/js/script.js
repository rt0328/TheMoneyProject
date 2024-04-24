const LOOKUP_STOCKS = [
    { "symbol": "AAPL" },
    { "symbol": "MSFT" },
    { "symbol": "AMZN" },
    { "symbol": "GOOGL" },
    { "symbol": "META" },
    { "symbol": "TSLA" },
    { "symbol": "NVDA" },
    { "symbol": "JPM" },
    { "symbol": "JNJ" },
    { "symbol": "V" },
    { "symbol": "PG" },
    { "symbol": "HD" },
    { "symbol": "MA" },
    { "symbol": "DIS" },
    { "symbol": "PYPL" },
    { "symbol": "UNH" },
    { "symbol": "BAC" },
    { "symbol": "INTC" },
    { "symbol": "VZ" },
    { "symbol": "CMCSA" },
    { "symbol": "ADBE" },
    { "symbol": "CSCO" },
    { "symbol": "CRM" },
    { "symbol": "KO" },
    { "symbol": "NFLX" },
    { "symbol": "PEP" },
    { "symbol": "MRK" },
    { "symbol": "WMT" },
    { "symbol": "XOM" },
    { "symbol": "T" },
    { "symbol": "ABBV" },
    { "symbol": "MDT" },
    { "symbol": "ABT" },
    { "symbol": "NKE" },
    { "symbol": "BMY" },
    { "symbol": "HON" },
    { "symbol": "AVGO" },
    { "symbol": "LMT" },
    { "symbol": "NEE" },
    { "symbol": "PFE" },
    { "symbol": "QCOM" },
    { "symbol": "LLY" },
    { "symbol": "TXN" },
    { "symbol": "USB" },
    { "symbol": "MO" },
    { "symbol": "DHR" },
    { "symbol": "SBUX" },
    { "symbol": "NOW" },
    { "symbol": "SPG" },
    { "symbol": "LIN" }
];






let ACTION_MODAL;

// Function to initialize the action modal
function initializeActionModal() {
    console.log('Action Modal Initialized!')
    ACTION_MODAL = new bootstrap.Modal(document.getElementById('action-modal'));

    // Add event listener for keydown event on form inputs
    document.querySelectorAll('#action-form input').forEach(input => {
        input.addEventListener('keydown', event => {
            // Check if the Enter key is pressed
            if (event.key === 'Enter') {
                // Prevent the default form submission behavior
                event.preventDefault();
            }
        });
    });
}

// Function to open the action modal
async function openActionModal(typeId, stockSymbol) {
    console.log('Open Action Modal');
    console.log(stockSymbol)
  
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
    const row = document.getElementById(`row-${stockSymbol}`);

    console.log(row)
  
    if (typeId === 1) {
        // Buy stock action
        document.getElementById('modal-title').innerText = 'Buy Stock';

        // Call showQuantityInput function for buying
        await showQuantityInput(stockSymbol,'buy');
    } else if (typeId === 2) {
        // Sell stock action
        document.getElementById('modal-title').innerText = 'Sell Stock';

    
        // Call showQuantityInput function for selling
        await showQuantityInput(stockSymbol, 'sell');

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

        // Hide the submit button
        document.getElementById('submit_button').style.display = 'none';
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
  
    // Call the API to search for stocks by symbol
    const results = LOOKUP_STOCKS.filter(stock => stock.symbol.includes(stockSymbol.toUpperCase()));
    
    // Display the search results
    displaySearchResults(results);
  }
  
// Function to display search results
async function displaySearchResults(results) {
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.innerHTML = ''; // Clear previous results

    try {
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
            for (const stock of results) {
                // Fetch the current market value for the stock symbol
                const currValue = await fetchSymbolPrice(stock.symbol);

                // Create a div for each stock
                const stockDiv = document.createElement('div');
                stockDiv.classList.add('mb-2');

                // Create a hyperlink for the stock symbol
                const stockLink = document.createElement('a');
                stockLink.textContent = `${stock.symbol}`;
                stockLink.href = "#"; // You can set the href to any appropriate value or leave it empty

                // Create a span for the current value
                const valueSpan = document.createElement('span');
                valueSpan.textContent = ` - $${currValue.toFixed(2)}`;

                // Append hyperlink and value span to the stock div
                stockDiv.appendChild(stockLink);
                stockDiv.appendChild(valueSpan);

                // Add event listener to the hyperlink to show quantity input
                stockLink.addEventListener('click', () => {
                    showQuantityInput(stock.symbol,'buy');
                });

                // Append stock div to the search results container
                searchResultsContainer.appendChild(stockDiv);
            }
        }
    } catch (error) {
        // Handle any errors that occur during fetching current prices
        console.error('Error displaying search results:', error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "An error occurred while fetching search results.";
        searchResultsContainer.appendChild(errorMessage);
    }
}

// Function to fetch the current market value for a stock symbol
async function fetchSymbolPrice(symbol) {
    try {
        // Make an HTTP GET request to fetch the current market value for the symbol
        const response = await fetch(`/getSymbolPrice/${symbol}`);
        
        // Parse the JSON response
        const data = await response.json();
        
        // Return the current market value
        return data.currentPrice;
    } catch (error) {
        // Log any errors that occur during the HTTP request
        console.error('Error fetching symbol price:', error);
        throw error; // Rethrow the error to propagate it to the caller
    }
}


  
async function showQuantityInput(symbol, actionType) {
    console.log('Symbol:', symbol); // Log the symbol to check if it's correctly received

    // Get the current liquidity
    const currentLiquidity = document.getElementById('currentLiquidity').innerText;

    // Find the stock information in the LOOKUP_STOCKS array
    const stock = LOOKUP_STOCKS.find(item => item.symbol === symbol);
    const currValue = await fetchSymbolPrice(stock.symbol);

    // Display the current liquidity and market value in the modal
    const additionalInfo = document.getElementById('additional-info');

    // Create a div for stock information
    const stockInfoDiv = document.createElement('div');
    stockInfoDiv.classList.add('row');

    // Add stock symbol information
    const stockSymbolDiv = document.createElement('div');
    stockSymbolDiv.classList.add('col');
    stockSymbolDiv.innerHTML = `<strong>Stock Symbol:</strong> ${symbol}`;
    stockInfoDiv.appendChild(stockSymbolDiv);

    // Add current liquidity information
    const currentLiquidityDiv = document.createElement('div');
    currentLiquidityDiv.classList.add('col');
    currentLiquidityDiv.innerHTML = `<strong>Current Liquidity:</strong> ${currentLiquidity}`;
    stockInfoDiv.appendChild(currentLiquidityDiv);

    // Add current market value information
    const currValueDiv = document.createElement('div');
    currValueDiv.classList.add('col');
    currValueDiv.innerHTML = `<strong>Current Market Value:</strong> $${currValue.toFixed(2)}`;
    stockInfoDiv.appendChild(currValueDiv);

    // Append stock information to additionalInfo
    additionalInfo.innerHTML = '';
    additionalInfo.appendChild(stockInfoDiv);

    // Add form inputs for action (buy/sell)
    const form = document.getElementById('action-form');
    form.innerHTML = '';

    const numSharesInput = document.createElement('input');
    numSharesInput.type = 'number';
    numSharesInput.classList.add('form-control');
    numSharesInput.id = `num-shares-${actionType}`;
    numSharesInput.name = `num-shares-${actionType}`;
    numSharesInput.required = true;

    const numSharesInputLabel = document.createElement('label');
    numSharesInputLabel.setAttribute('for', `num-shares-${actionType}`);
    numSharesInputLabel.classList.add('form-label');
    numSharesInputLabel.textContent = `Number of Shares to ${actionType}:`;

    const numSharesInputGroup = document.createElement('div');
    numSharesInputGroup.classList.add('mb-3');
    numSharesInputGroup.appendChild(numSharesInputLabel);
    numSharesInputGroup.appendChild(numSharesInput);
    form.appendChild(numSharesInputGroup);

    // Add hidden input for stock symbol
    const stockSymbolInput = document.createElement('input');
    stockSymbolInput.type = 'hidden';
    stockSymbolInput.id = 'stock-symbol';
    stockSymbolInput.name = 'symbol';
    stockSymbolInput.value = symbol;
    form.appendChild(stockSymbolInput);

    // Add event listener to the submit button for action (buy/sell)
    const submitButton = document.getElementById('submit_button');
    submitButton.style.display = 'block';
    submitButton.addEventListener('click', actionType === 'buy' ? handleBuyStockFormSubmission : handleSellStockFormSubmission);

    // Add a section for updating checkout amount with a shopping icon
    const checkoutSection = document.createElement('div');
    checkoutSection.classList.add('checkout-section', 'mt-4');
    checkoutSection.innerHTML = `
        <hr>
        <div class="row align-items-center">
            <div class="col">
                <span class="checkout-label">Checkout Amount:</span>
            </div>
            <div class="col-auto">
                <span id="checkout-amount">$0.00</span>
                <i class="bi bi-cart3"></i>
            </div>
        </div>
    `;
    form.appendChild(checkoutSection);

    // Update the checkout amount based on the input value
    numSharesInput.addEventListener('input', () => {
        updateCheckoutAmount(currValue, parseFloat(numSharesInput.value));
    });
}



// Function to update the checkout amount
function updateCheckoutAmount(pricePerShare, numShares) {
    const checkoutAmount = pricePerShare * numShares;
    const checkoutAmountSpan = document.getElementById('checkout-amount');
    checkoutAmountSpan.textContent = `$${checkoutAmount.toFixed(2)}`;
}



function handleBuyStockFormSubmission(event) {
    event.preventDefault();

    console.log('Called handle buy stock!')
    // Extract portfolioId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const portfolioId = parseInt(urlParams.get('portfolioId'), 10);

    // Get the form data
    const formData = new FormData(document.getElementById('action-form'));

    // Get numStocks and stockSymbol from the form data
    const numStocks = parseFloat(formData.get('num-shares-buy'), 10);
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
    const numStocks = parseFloat(formData.get('num-shares-sell'), 10);
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


function copyToClipboard(text) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Join code copied to clipboard!');
  }
  
