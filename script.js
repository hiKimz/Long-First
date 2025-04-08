// The URL to the CSV file from the published Google Sheet
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT7zTCpGkp7Qdk_9rhQQ7B9IJu479JBdfSVmJAwGcZL3phhdVLhq9SnXDmx42xM0IDZPkxzarnL2hJp/pub?output=csv'; // Replace with your CSV URL

dataArray = []

cart = []

let netPrice = 0

const warningColor = '#ff2a2a'
const borderColor = '#8da2be'

// HELPER: Change to title case
function toTitleCase(str) {
    return str
        .toLowerCase()  // Convert all to lowercase first
        .split(' ')      // Split the string by spaces to get words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize the first letter of each word
        .join(' ');      // Join the words back into a single string
}

function formatBigNumber(x) {
    try{
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } catch (err) {
        
    }
}

// Function to fetch and display the data
async function fetchData() {
    try {
        // Fetch the CSV data
        const response = await fetch(sheetURL);
        const data = await response.text();

        // Parse the CSV data
        // rows (array) containing rows (array) which contains cells (array)
        dataArrayFull = data.split('\n').map(row => row.split(','));

        dataArrayFull.shift() // Remove first row (header)

        // console.log(dataArrayFull)

    } catch (error) {
        console.error('Error fetching or parsing the CSV data:', error);
    }

    dataArray = dataArrayFull.map(row => row.slice(0, 4));

    searchData('')
    addFuncToButtons()
}

const searchPage = document.getElementById('search-page')
const infoPage = document.getElementById('info-page')



function infoTab() {
    searchPage.style.display = 'None'
    infoPage.style.display = 'Inline'
}

function searchTab() {
    searchPage.style.display = 'Inline'
    infoPage.style.display = 'None'
}


function searchData(searchTerm){

        // Get the table body element
        const table = document.querySelector('#data-table');
        const tableBody = document.querySelector('#data-table tbody');  

        // Clear any existing rows
        tableBody.innerHTML = '';

        // Loop through the rows and add them to the table
        dataArray.forEach((row, index) => {

            searchTerm = toTitleCase(searchTerm)

            if (row[1].includes(searchTerm)) {
                
                const tr = document.createElement('tr');
                tr.id = 'item-row'

                if (index % 2 == 0) {
                    tr.classList.add('row-alt-color')
                }

                row.forEach(cell => {
                    const td = document.createElement('td');

                    // console.log(cell)
                    // console.log(row[0])
                    if (cell == row[0]) {
                        td.id = 'id-cell'
                    }

                    if (cell == row[1]) {
                        td.id = 'name-cell'
                    }

                    if (cell == row[3]) {
                        td.id = 'numeric-cell'
                    }

                    td.textContent = formatBigNumber(cell.trim()); // Trim to remove any leading/trailing spaces
                    tr.appendChild(td);
                });

                operationsCell = document.createElement('td')
                operationsCell.id = 'operation-cell'
                
                operationsAddButton = document.createElement('button')
                operationsAddButton.id = 'operation-add-button'
                operationsAddButton.textContent = '+'

                operationsCell.appendChild(operationsAddButton)
                tr.appendChild(operationsCell);
                
                tableBody.appendChild(tr);

            }
        });
}



const searchBox = document.getElementById('search-box');

searchBox.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent page refresh

        const searchTerm = searchBox.value; // Get the value from the input field
        searchBox.value = ''


        // console.log('Search term:', searchTerm);
        
        // Call the searchData function with the entered term
        searchData(searchTerm);
    }

});

// const operationsCustomField = document.getElementById('operation-custom-field');

// operationsCustomField.addEventListener('keydown', function(event) {
//     if (event.key === 'Enter') {
//         event.preventDefault(); // Prevent page refresh

//         const id = this.parentElement.parentElement.firstChild.textContent;
//         const value = operationsCustomField.value;

//         setItemQuantity(id, value)
//     }

// });

// searchData('mesh')

// document.addEventListener('keydown', function(event) {
//     if (event.key === '.') {
//         searchBox.focus()
//         searchBox.value = ''
//     }
// })

function clearSearchBox() {
    searchBox.value = ''
    searchData('')
}

function addFuncToButtons() {
    // First, remove any existing event listeners
    const addButton = document.querySelectorAll('#operation-add-button');
    
    // Remove previous event listeners before adding new ones (if necessary)
    addButton.forEach(button => {
        button.removeEventListener('click', handleAddButtonClick); // Remove the old event listener
    });

    // Then, add the event listeners
    addButton.forEach(button => {
        button.addEventListener('click', handleAddButtonClick);
    });

    const subtractButton = document.querySelectorAll('#operation-subtract-button');
    subtractButton.forEach(button => {
        button.removeEventListener('click', handleSubtractButtonClick); // Remove the old event listener
    });

    subtractButton.forEach(button => {
        button.addEventListener('click', handleSubtractButtonClick);
    });

    const operationsCustomFields = document.querySelectorAll('#operation-custom-field');

    operationsCustomFields.forEach(input => {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent page refresh

                const id = this.parentElement.parentElement.firstChild.textContent;
                const value = parseFloat(input.value);

                setItemQuantity(id, value)
            }
        })
    });
}

// Separate functions for the button click events
function handleAddButtonClick() {
    const id = this.parentElement.parentElement.firstChild.textContent;
    manageCart(id); // This is the function that adds the item to the cart
}

function handleSubtractButtonClick() {
    const id = this.parentElement.parentElement.firstChild.textContent;
    manageCart(id, 'subtract');
}


// const cashCheckBox = document.getElementById('cash-checkbox');
// const onlineCheckBox = document.getElementById('online-checkbox');

const cashBox = document.getElementById('cash-box');
const onlineBox = document.getElementById('online-box');

let cashValue = 0
let onlineValue = 0


cashBox.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        updatePayment()
    }
});

onlineBox.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        updatePayment()
    }
});

function copyToCash() {
    cashBox.value = netPrice
    updatePayment()
}

function copyToOnline() {
    onlineBox.value = netPrice
    updatePayment()
}

function updatePayment() {
    cashValue = parseFloat(cashBox.value)
    onlineValue = parseFloat(onlineBox.value)
    if (cashValue + onlineValue > netPrice) {
        cashBox.style.border = '1px solid ' + warningColor
        cashBox.style.borderRadius = '0.2em'
        onlineBox.style.border = '1px solid ' + warningColor
        onlineBox.style.borderRadius = '0.2em'
    } else {
        cashBox.style.border = '1px solid ' + borderColor
        cashBox.style.borderRadius = '0.2em'
        onlineBox.style.border = '1px solid ' + borderColor
        onlineBox.style.borderRadius = '0.2em'
    }
}


function manageCart(id, mode = 'add') {

    let hasItem = false
    console.log(cart)
    cart.forEach((row, index) => {
        if (row[0] == id && row[4] <= 1 && mode=='subtract') {
            hasItem = true
            deleteItemFromCart(id)
        } else if (row[0] == id && mode=='add') {
            hasItem = true
            amendItemInCart(id)
        }
        })
    if (!hasItem && mode == 'subtract') {
        subtractItemFromCart(id)
    } else if (!hasItem) {
        addItemToCart(id)
    }

}


function amendItemInCart(id, change = 1) {
    console.log('amend');
    cart.forEach((row, index) => {
        if (row[0] == id) {
            row[4] += change; // Increment the quantity by 1
            row[5] = row[2] * row[4]; // Recalculate the price based on the new quantity
        }
    });
    resetCart(cart);
}

function setItemQuantity(id, value) {
    console.log('set');
    cart.forEach((row, index) => {
        if (row[0] == id) {
            row[4] = value
            row[5] = row[2] * row[4]; // Recalculate the price based on the new quantity
        }
    });
    resetCart(cart);
}


function subtractItemFromCart(id) {
    console.log('subtract');
    cart.forEach((row, index) => {
        if (row[0] == id) {
            console.log(row[4])
            row[4] -= 1; // Increment the quantity by 1
            row[5] = row[2] * row[4]; // Recalculate the price based on the new quantity
        }
    });
    resetCart(cart)
}

function deleteItemFromCart(id) {
    console.log('delete');
    
    cart.forEach((row, index) => {
        if (row[0] == id && cart.length > 1) {
            delete cart[index] // Removes 1 item at the given index
        } else if (row[0] == id) {
            cart.length = 0
        }
    });
    
    resetCart(cart); // Update the cart display after removal
}

function addItemToCart(id) {
    console.log('add');
    dataArray.forEach((row, index) => {
        if (id == row[0]) {
            itemInfo = [row[0], row[1], row[3], row[2], 1, 1 * parseFloat(row[3])]
        }
    })
    cart.push(itemInfo)
    resetCart(cart)
}


function resetCart(cart){

    // Get the table body element
    const tableBody = document.querySelector('#cart-table tbody');
    netPrice = 0

    // Clear any existing rows
    tableBody.innerHTML = '';

    // Loop through the rows and add them to the table
    cart.forEach((row, index) => {

        const tr = document.createElement('tr');
        tr.id = 'cart-row'

        var isFormatted = false

        netPrice += row[5]

        if (parseInt(index) % 2 == 0) {
            tr.classList.add('row-alt-color')
        }

        row.forEach(cell => {

            const td = document.createElement('td');

            td.textContent = formatBigNumber(cell)

            if (cell == row[2] && isFormatted == false) {
                td.textContent = row[2] + ' / ' + row[3]
                isFormatted = true
            }


            if (cell != row[3]){
                tr.appendChild(td);
            }
        })

        operationsCell = document.createElement('td')
        operationsCell.id = 'operation-cell'
        
        operationsAddButton = document.createElement('button')
        operationsAddButton.id = 'operation-add-button'
        operationsAddButton.textContent = '+'
        operationsCell.appendChild(operationsAddButton)
        tr.appendChild(operationsCell);
                
        operationsSubtractButton = document.createElement('button')
        operationsSubtractButton.id = 'operation-subtract-button'
        operationsSubtractButton.textContent = '-'
        operationsCell.appendChild(operationsSubtractButton)
        tr.appendChild(operationsCell);

        operationsCustomField = document.createElement('input')
        operationsCustomField.type = 'text'
        operationsCustomField.id = 'operation-custom-field'
        operationsCustomField.placeholder = row[4]
        operationsCell.appendChild(operationsCustomField)
        tr.appendChild(operationsCell);
            
        tableBody.appendChild(tr);

        addFuncToButtons()

    });

    const finalRow = document.createElement('tr')
    finalRow.id = 'final-row'

    const cell = document.createElement('td')
    cell.colSpan = 3
    finalRow.append(cell)

    const totalCell = document.createElement('td')
    totalCell.textContent = 'Total:'
    finalRow.append(totalCell)

    const priceCell = document.createElement('td')
    priceCell.textContent = formatBigNumber(netPrice)
    finalRow.appendChild(priceCell)

    const finalCell = document.createElement('td')
    finalRow.append(finalCell)

    tableBody.appendChild(finalRow)
}

// Call the fetchData function when the page loads
window.onload = fetchData;