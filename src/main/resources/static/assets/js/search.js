function performSearch() {
    const searchResultsContainer = $('#searchResultsContainer');
    const searchInput = $('#searchInput');
    let query = searchInput.val().trim(); // Trim any leading or trailing whitespace

    // If the search input is empty and there's a voice input value
    if (!query && input.value.trim()) {
        // Use the voice input value as the search query
        query = input.value.trim();
    }

    // Check if the query is null or empty
    if (!query) {
        // Hide the search results container if the query is null or empty
        searchResultsContainer.css('display', 'none');
        return; // Exit the function if the query is null or empty
    }

    // Clear previous search results
    searchResultsContainer.empty();

    // Make an AJAX request to the backend
    $.ajax({
        url: 'http://localhost:8080/api/search',
        method: 'POST',
        data: {query},
        success: function (data) {
            displaySearchResults(data);
        },
        error: function (error) {
            console.error('Error performing search:', error);
        }
    });
}

function displaySearchResults(results) {
    const searchResultsContainer = $('#searchResultsContainer');
        searchResultsContainer.css('display', 'block');

    if (!results) {
            searchResultsContainer.append('<li>No results found</li>');
            return; // Exit the function early if results is null or undefined
        }
    if (!results && !results.users && !results.contents && !results.groups && !results.events) {
        searchResultsContainer.append('<li>No results found</li>');
    } else {
        if (results.users.length === 0 && results.contents.length === 0 && results.groups.length === 0 && results.events.length === 0) {
            searchResultsContainer.append('<li>No results found</li>');
        } else {
            displayResultsForType(results.users, 'Users');
            displayResultsForType(results.contents, 'Contents');
            displayResultsForType(results.groups, 'Groups');
            displayResultsForType(results.events, 'Events');
        }
    }
}


function displayResultsForType(results,type) {
    const searchResultsContainer = $('#searchResultsContainer');
				console.log('result1',results)
				console.log('type',type);
					console.log('users',results.users);





    if (results.length > 0) {
			console.log('result length',results.length);

		if(type ==='Users' ){
			 results.forEach(result => {
            searchResultsContainer.append(`<div style="display:flex;flex-direction:row;"><img src="${result.photo}" alt="" style="width:60px;height:60px;margin-bottom:10px;"/>
           <a href="/user/userprofile?staffId=${result.staffId}" style="text-decoration:none;margin-left: 15px;margin-top: 0px"><p style="font-size: 18px;font-family: Math">${result.name }</p></a></div>`);
        });
		}else if(type ==='Groups' ){
			 results.forEach(result => {

            searchResultsContainer.append(`<span style="font-size: 22px;font-family: Math">Groups</span><div style="display:flex;flex-direction:row;margin-top: 8px"><img src="${result.photo}" alt="" style="width:60px;height:60px;margin-bottom:10px;"/>
            <a href="/user/searchgroup?groupId=${result.id}" style="text-decoration:none;margin-left: 20px;margin-top: 0px"><p style="font-size: 18px;font-family: Math">${result.name}</p></a></div>`);
        });

		}else if(type ==='Contents'){
			results.forEach(result => {

            searchResultsContainer.append(`<span style="font-size: 22px;font-family: Math">Contents</span>
            <a href="/user/searchcontent?contentId=${result.id}" style="text-decoration:none;"><p style="font-size: 18px;font-family: Math">${result.text}</p></a>`);
		        });

       }else if(type ==='Events'){
        			results.forEach(result => {

                    searchResultsContainer.append(`<span style="font-size: 22px;font-family: Math">Events</span>
                    <a href="/user/searchevent?eventId=${result.id}" style="text-decoration:none;"><p style="font-size: 18px;font-family: Math">${result.content}</p></a>`);
        		        });

               }

    }



}