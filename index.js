const RECIPEPUPPY_SEARCH_URL = 'http://proxy-server.herokuapp.com/http://www.recipepuppy.com/api';

function requestResponse(searchTerm, callback) {
	//send search request and accept response (JSON HERE)
	const query = {
	  i: searchTerm,
	};
	$.getJSON(RECIPEPUPPY_SEARCH_URL, query, callback);
}

function submitRequest() {
	//accept and handle the search request params entered by the user
  $('.search-form').submit(function(event) {
    event.preventDefault();
    const userInput = $(event.currentTarget).find('.input'); 
    const query = userInput.val();
    sessionStorage['searchIng'] = query; 
    requestResponse(query, showRecipes);
  });
}

function renderRecipes(recipe) {
	//HTML for recipes with links and lists of on hand and additional ing (sep lists descoped)
	const recIng = recipe.ingredients.split(',');
	const listLis = dedupeIng(recIng).map(item => `<li class="ingItem">${ item }</li>`).join('');
	const recipeDiv = $(`<div>
		<a class="title" href="${recipe.href}">${recipe.title}</a></br>
		<img class="thumbnail" src="${recipe.thumbnail}" width=100 alt="${recipe.title}"</>
		<ul>${ listLis }</ul></div`);
	return recipeDiv;	
}

function showRecipes(data) {
	//display results from search as well as "unhide" list
	const items = data.results.map((result, index) => renderRecipes(result));
		if (!data.results.length) {
			$('.no-results').removeClass('hidden');
		} else {
			$('.no-results').addClass('hidden');
		}
	$('.search-results').html(items);
	$('.shopping-list').removeClass('hidden');
}

function dedupeIng(originalArray) {
	// trim, sort and remove duplicates from original array from api
	const sortedArray = originalArray.map(string => string.trim()).sort();
	const newArray = sortedArray.filter(function(elem, index, self) {
		return index == self.indexOf(elem);
	});
	return newArray
}

function retrieveSearchTerm() {
	//get the search terms on reload
	const searchInput = document.getElementById('search-term');
	const userSearchInput = sessionStorage['searchIng'];
	if (userSearchInput == null) {
		searchInput.value = "";
	}
	else {
		searchInput.value = userSearchInput;
	}
	if (searchInput.value.length > 0) {
		requestResponse(userSearchInput, showRecipes);
	}
}

let shoppingList = [];

function handleClick() {
	//set up listener for click event on ingItem, format li for list
	$('.search-results').on('click', '.ingItem', function(event) {
		const newIng = $(this).html(); 
		shoppingList = addToList(shoppingList, newIng);
		renderList(shoppingList);
		sessionStorage['listContent'] = JSON.stringify(shoppingList);
	});
}

function renderList(list) {
	//render list into HTML
	const shoppingLis = list.map(item => `<li><span>${ item }</span>  <button class="x-button">&#9747;</button></li>`).join('');
	const listDiv = $(`<div><ul> ${ shoppingLis } </ul></div>`);
	$('.list-body').html(listDiv);	
}

function addToList(list, item) {
	//add clicked item to list only if it's not already on the list, else alert
	if (!list.includes(item)) {
		list.push(item);
	} else {
		window.alert('This item is already on your list.');
	};
	return list; 
}

function retrieveShoppingList() {
	//retrieve list from sessionStorage and render, update global array
 	const retrievedList = sessionStorage['listContent'];
 	console.log('retrievedList:', retrievedList);
 	shoppingList = JSON.parse(retrievedList);
 	renderList(shoppingList);
}

function deleteIngredient() {
	//delete ing from list with "x" 
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
		const subject = "My Shopping List";
		const emailBody = "Shop for these items: " + shoppingList.join(', '); 
		document.location = "mailto:"+email+"?subject="+subject+"&body="+emailBody;
	});
}

function copyList() {
	//copy list text to clipboard - NOT WORKING YET
	$('.copy-list').on('click', function(event) {
		copyToClipboard(shoppingList.join(', '));
		window.alert("Your list has been copied to the clipboard.");
		});
}

function copyToClipboard(text) {
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