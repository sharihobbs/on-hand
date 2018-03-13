const RECIPEPUPPY_SEARCH_URL = 'https://cors-anywhere.herokuapp.com/http://www.recipepuppy.com/api';

function requestResponse(searchTerm, callback) {
	//send search request and accept response
	const query = {
	  i: searchTerm,
	};
	const xyz = $.getJSON(RECIPEPUPPY_SEARCH_URL, query, callback);
	xyz.fail(function() { $('.error').removeClass('hidden'); }) 
	xyz.always(function() { $('.sk-circle').addClass('hidden'); });
}

function submitRequest() {
	//accept and handle the search request params entered by the user, set up sessionStorage for search terms
  $('.search-form').submit(function(event) {
    event.preventDefault();
    $('.sk-circle').removeClass('hidden');
    const query = $(event.currentTarget).find('.input').val(); 
    //const query = userInput.val();
    sessionStorage['searchIng'] = query; 
    requestResponse(query, showRecipes);
    $('.search-button').prop('disabled', true);
  });
}

function renderRecipes(recipe) {
	//HTML for recipes with links and lists of ingredients, clickable for shopping list
	const recIng = recipe.ingredients.split(',');
	const listLis = dedupeIng(recIng).map((item, index) => {
		return `<li class="ingItem"><span>${ item }</span></li>`
	}).join('');
	const recipeDiv = $(`
		<div class="recipes">
			<a class="title" target="_blank" href="${recipe.href}">${recipe.title}</a></br>
			<img class="thumbnail" src="${recipe.thumbnail}" width=100 alt="${recipe.title}"</>
			<p class="ing-header">Ingredients:</p>
			<ul>${ listLis }</ul>	
		</div>`);
	return recipeDiv;	
}

function showRecipes(data) {
	//display results from search as well as "unhide" list
	const originalArray = data.results; 
		if (originalArray.length == 10) {
			originalArray.pop(); 
		}
		console.log('originalArray:', originalArray);
	const items = originalArray.map((result, index) => {
	const openRow = $(`<div class="row">`);
	const closeRow = $(`</div>`);
		if ((index % 3) == 0) {
			return $(renderRecipes(result)).prepend(openRow);
		} else if ((index % 3) == 2) {
			return $(renderRecipes(result)).append(closeRow);
		} else {
			return renderRecipes(result);	
		}
	});
	if (!data.results.length) {
		$('.oops').removeClass('hidden');
		$('.messages').removeClass('hidden');
		$('.search-button').prop('disabled', false);
		$('.search-results').html('');
	} else {
		$('.search-results').html(items);
		$('.list-note').removeClass('hidden');
		$('.click-ing').removeClass('hidden');
		$('.shopping-list').removeClass('hidden');
		$('.search-button').prop('disabled', false);
		$('.messages').addClass('hidden');

	}
}

function dedupeIng(originalArray) {
	// trim, sort and remove duplicates from original array from api
	const sortedArray = originalArray.map(string => string.trim()).sort();
	const newArray = sortedArray.filter(function(elem, index, self) {
		return index == self.indexOf(elem);
	});
	return newArray
}

let requestToggle = false;

function retrieveSearchTerm() {
	// get the search terms on reload
	const searchInput = document.getElementById('search-term');
	const userSearchInput = sessionStorage['searchIng'];
	searchInput.value = ""
	if (userSearchInput != null) {
		searchInput.value = userSearchInput;
	}
	if (searchInput.value.length > 0) {
		requestResponse(userSearchInput, showRecipes);
		requestToggle = true; 
	}
}

let shoppingList = [];

function handleClick() {
	// set up listener for click event on span inside of ingItem, format li for list
	$('.search-results').on('click', '.ingItem span', function(event) {
		const newIng = $(this).html(); 
		shoppingList = addToList(shoppingList, newIng);
		renderList(shoppingList);
		sessionStorage['listContent'] = JSON.stringify(shoppingList);
	});
}

function renderList(list) {
	//render list into HTML
	const shoppingLis = list.map(item => `<li role="Listitem"><span>${ item }</span>  <button class="x-button">&#9747;</button></li>`).join('');
	const listDiv = $(`<div><ul> ${ shoppingLis } </ul></div>`);
	$('.list-body').html(listDiv);	
}

function addToList(list, item) {
	//add clicked item to list only if it's not already on the list, else alert
	if (!list.includes(item)) {
		list.push(item);
	} else {
		swal("Hey now! This item is already on your list.");
	};
	return list; 
}

function retrieveShoppingList() {
	//retrieve list from sessionStorage and render, update global array
 	const retrievedList = sessionStorage['listContent'];
	if (retrievedList !== undefined) {
		shoppingList = JSON.parse(retrievedList);
	} else {
		shoppingList = [];
	}
 	renderList(shoppingList);
}

function deleteIngredient() {
	//delete ing from list on click of "x" button
	$('.list-body').on('click', '.x-button', function(event) {
		const deletedItem = $(this).parent().children('span').text(); 
		shoppingList.splice(shoppingList.indexOf(deletedItem), 1); 
		sessionStorage['listContent'] = JSON.stringify(shoppingList);
		renderList(shoppingList);
	});
}

function clearAll() {
	//clear shopping list of all items with button click 
	$('.clear-all').click(function(event) {
		shoppingList = [];
		sessionStorage['listContent'] = JSON.stringify(shoppingList);
		renderList(shoppingList);
	});
}

function emailList() {
	//allow user to email list 
	$('.email-list').click(function(event) {
		const email = "";
		const subject = "Your OnHand Shopping List";
		const emailBody = "Please shop for these items: " + shoppingList.join(', ') + "."; 
		document.location = "mailto:"+email+"?subject="+subject+"&body="+emailBody;
	});
}

function copyList() {
	//copy list text to clipboard 
	$('.copy-list').on('click', function(event) {
		const copyText = shoppingList.join(', ');
		copyToClipboard("Please shop for these items: " + copyText + "."); 
		swal("Your list has been copied to the clipboard. Paste away!");
		});
}

function copyToClipboard(text) {
	//copies text to clipboard for copyList function
	var $temp = $("<input>");
	$("body").append($temp);
	$temp.val(text).select();
	document.execCommand("copy");
	$temp.remove();
} 

$(submitRequest);
$(retrieveSearchTerm);
$(handleClick);
$(retrieveShoppingList);
$(clearAll);
$(copyList);
$(emailList);
$(deleteIngredient);