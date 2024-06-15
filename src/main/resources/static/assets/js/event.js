
/*STRM*/


/*Event Create*/
const modal = document.getElementById('myModal');
const bootstrapModal = new bootstrap.Modal(modal, {
    backdrop: true // Display and fade the backdrop when the modal is open
});

const postForm = document.getElementById('post-form');

function closeModal() {
    bootstrapModal.hide();
    postForm.reset();
    document.getElementById('image-preview').src = '';
    document.getElementById('image-preview').setAttribute('hidden', ''); // Hide the preview image
    document.getElementById("modalOverlay").style.display = "none";

}
function openModal() {
    // Show the modal
    bootstrapModal.show();
    // Show the overlay
    document.getElementById("modalOverlay").style.display = "block";
    // Optionally, fade in the modal body
    $(".form-body").fadeIn();

    //  disable
    setMinDate();
}

// Add event listener for when the modal is hidden
modal.addEventListener('hidden.bs.modal', function () {
    document.getElementById("modalOverlay").style.display = "none";
});


function previewImage(event) {
    const preview = document.getElementById('image-preview');
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
        reader.onloadend = function () {
            preview.src = reader.result;
            preview.removeAttribute('hidden'); // Show the preview image
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = ''; // Clear the preview if no file is selected
        preview.setAttribute('hidden', ''); // Hide the preview image
    }
}




// Add an event listener to the cancel button
document.getElementById('cancelButton1').addEventListener('click', function() {
    // Hide all error messages
    hideAllErrorMessages();
    // Close the modal
    closeModal();
});

document.getElementById('cancelButton2').addEventListener('click', function() {
    // Hide all error messages
    hideAllErrorMessages();
    // Close the modal
    closeModal();
});

// Function to hide all error messages
function hideAllErrorMessages() {
    var errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(function(errorMessage) {
        errorMessage.style.display = 'none';
    });
}

/*<![CDATA[*/
document.getElementById('post-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('content', document.getElementById('content').value);
    formData.append('startDate', document.getElementById('startDate').value);
    formData.append('endDate', document.getElementById('endDate').value);
    formData.append('eventDetails', document.getElementById('eventDetails').value);
    formData.append('file', file);
    // document.getElementById('image-preview').src = '';   //for image close error

    createPost(formData);
});


function createPost(formData) {
    // Show spinner
    document.getElementById("loading-spinner").style.display = "flex";

    // Close the modal
    closeModal();

    fetch('http://localhost:8080/admin/createEvent', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(newEventData => {
            // Add the new event directly to the event list
            displayEvent([newEventData]);

            // Hide spinner
            document.getElementById("loading-spinner").style.display = "none";

            // Display success message using SweetAlert
            swal({
                title: "Success!",
                text: "Event created successfully.",
                icon: "success"
            }).then(() => {
                // Reset form fields
                document.getElementById('content').value = '';
                document.getElementById('startDate').value = '';
                document.getElementById('endDate').value = '';
                document.getElementById('eventDetails').value = '';
                document.getElementById('file').value = '';
            });
        })
        .catch(error => {
            console.error('Error creating post:', error);
            // Handle error
        });
}

//for disabled date
function setMinDate() {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);
    document.getElementById('startDate').min = formattedDate;
    document.getElementById('endDate').min = formattedDate;
}

/*Create Validation*/
document.addEventListener('DOMContentLoaded', function() {
    // Select all input fields
    var inputFields = document.querySelectorAll('input[type="text"], input[type="datetime-local"], input[type="file"], textarea');

    // Loop through each input field
    inputFields.forEach(function(field) {
        // Add focus event listener
        field.addEventListener('focus', function() {
            // Hide error message when field is focused
            var errorMessage = document.getElementById(field.id + 'Error');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        });
    });
});


function validateForm() {
    var content = document.getElementById('content').value.trim();
    var startDateInput = document.getElementById('startDate').value.trim(); // Get the datetime-local value as string
    var endDateInput = document.getElementById('endDate').value.trim();     // Get the datetime-local value as string
    var eventDetails = document.getElementById('eventDetails').value.trim();
    var file = document.getElementById('file').value.trim();
    var currentDate = new Date();

    var isValid = true;

    // Check if content is empty
    if (content === '' || content.length > 30) {
        document.getElementById('contentError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('contentError').style.display = 'none';
    }

    // Convert start date input string to Date object
    var startDate = new Date(startDateInput);

    // Check if start date is empty or invalid
    if (!startDate || isNaN(startDate)) {
        document.getElementById('startDateError').style.display = 'block';
        isValid = false;
    } else {
        // Check if start date is greater than or equal to the current date
        if (startDate <= currentDate) {
            document.getElementById('startDateError').textContent = 'Start Date must be greater than or equal to the current date.';
            document.getElementById('startDateError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('startDateError').style.display = 'none';
        }
    }

    // Convert end date input string to Date object
    var endDate = new Date(endDateInput);

    // Check if end date is empty or invalid
    if (!endDate || isNaN(endDate)) {
        document.getElementById('endDateError').style.display = 'block';
        isValid = false;
    } else {
        // Check if end date is greater than start date
        if (endDate <= startDate) {
            document.getElementById('endDateError').textContent = 'End Date must be greater than Start Date.';
            document.getElementById('endDateError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('endDateError').style.display = 'none';
        }
    }

    // Check if event details is empty
    if (eventDetails === '') {
        document.getElementById('eventDetailsError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('eventDetailsError').style.display = 'none';
    }

    // Check if file is empty
    if (file === '') {
        document.getElementById('fileError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('fileError').style.display = 'none';
    }

    return isValid;
}






/*Event View*/

fetch('http://localhost:8080/view', {
    method: "GET",
})
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Sort events by createdDate in descending order to display the latest first
        data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));//new
        // Pass all events to the displayEvent function
        displayEvent(data);
    })
    .catch(error => {
        console.error('Error fetching events:', error);
        // Handle error
    });
// fetch();


//view with sorting
function displayEvent(events) {
    const currentDate = new Date(); // Get the current date and time
    const container = document.querySelector('.cards'); // Select the container once
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



    events.forEach(function (event) {
        // Convert startDate and endDate strings to Date objects
        const startDate = new Date(event.startDate[0], event.startDate[1] - 1, event.startDate[2], event.startDate[3], event.startDate[4]);
        const endDate = new Date(event.endDate[0], event.endDate[1] - 1, event.endDate[2], event.endDate[3], event.endDate[4]);

        // Check if the current date and time is greater than the end date and time to determine expiration
        let expiredMessage = '';
        if (currentDate > endDate) {
            expiredMessage = `<p style="color: red; font-weight: bold; background-color: #ffe6e6; padding: 1px; border-radius: 10px;text-align: center">This event has expired !!!</p>`;
        }

        // Extract day, month, and year from the startDate
        const day = startDate.getDate();
        const month = monthNames[startDate.getMonth()];
        const year = startDate.getFullYear();

        // Check if the current date is greater than the start date to decide whether to show the edit button
        let editButton = '';
        if (currentDate <= startDate) {
            // If current date is not greater, display the edit button
            editButton = `<button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#viewEventModal1" data-event-id="${event.id}" style="width:100%;font-family: Math">Edit</button>`;
        }

        // Format the date for display
        const formattedDate = `${day} ${month} ${year}`;
        const role = document.getElementById('role').value;

        // Generate the event card HTML based on the role and expiration status
        let eventCard = '';
        if (role == "[User]") {
            eventCard = `<div class="card">
                            <img src="${event.photoFile}" alt="User Profile UI Preview" class="ui-preview">
                            <div class="ui-details">
                                ${expiredMessage} <!-- Display expired message here -->
                                <h4 style="text-align: center;font-size: 22px">${event.content}</h4>
                                <h5 style="color: white; font-size: 15px; margin-top: 12px; text-align: center;">${formattedDate}</h5>
                            </div>
                            <button type="button" class="btn btn-view" data-bs-toggle="modal" data-bs-target="#viewEventModal" data-event-id="${event.id}" style="font-family: Math">View</button>
                        </div>`;
            const qqq = document.getElementsByClassName('dropdown-img');
            for (let i = 0; i < qqq.length; i++) {
                qqq[i].style.display = "none";
            }
        } else {
            eventCard = `<div class="card">
                            <div class="dropdown-img">
                                <button class="dropbtn" onclick="toggleDropdown(this)">
                                    <i class="fa fa-ellipsis-v"></i>
                                </button>
                                <div class="dropdown-content" id="myDropdown">
                                    ${editButton} <!-- Edit button here -->
                                    <button type="button" class="btn btn-danger delete-btn" data-bs-toggle="modal" data-bs-target="#deleteModal" data-event-id="${event.id}" style="width:100%;font-family: Math">Delete</button>
                                </div>
                            </div>
                            <img src="${event.photoFile}" alt="User Profile UI Preview" class="ui-preview">
                            <div class="ui-details">
                                ${expiredMessage} <!-- Display expired message here -->
                                <h4 style="text-align: center">${event.content}</h4>
                                <h5 style="color: white; font-size: 12px; margin-top: 5px; text-align: center;">${formattedDate}</h5>
                            </div>
                            <button type="button" class="btn btn-view" data-bs-toggle="modal" data-bs-target="#viewEventModal" data-event-id="${event.id}" style="font-family: Math">View</button>
                        </div>`;
        }

        // Prepend the new event card to the container
        container.insertAdjacentHTML('afterbegin', eventCard);
    });
}

// Modify the code that handles the view modal to conditionally show/hide the edit button
$('#viewEventModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget);
    const eventId = button.data('event-id');
    const currentDate = new Date(); // Get the current date and time

    fetch(`/detail/${eventId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch event data');
            }
            return response.json();
        })
        .then(eventData => {
            const endDate = new Date(eventData.endDate[0], eventData.endDate[1] - 1, eventData.endDate[2], eventData.endDate[3], eventData.endDate[4]);

            // Check if the current date and time is greater than the end date and time
            if (currentDate > endDate) {
                // If current date is greater, hide the edit button
                $('#editButton').hide();
            } else {
                // Otherwise, show the edit button
                $('#editButton').show();
            }

            // Rest of the code remains the same
        })
        .catch(error => {
            console.error('Error fetching event data:', error);
        });
});



/*View for Event Detail*/

function previewImage1(event) {
    const preview = document.getElementById('image-preview1');
    const file = event.target.files[0];
    if (!file) {
        preview.src = ''; // Clear the preview if no file is selected
        return;
    }
    const reader = new FileReader();
    reader.onloadend = function () {
        if (reader.error) {
            console.error('Error reading the file:', reader.error);
            return;
        }
        preview.src = reader.result;
    };
    reader.readAsDataURL(file);
}



// Function to toggle the dropdown when the icon is clicked
function toggleDropdown(button) {
    const dropdownContent = button.nextElementSibling;
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
}

document.addEventListener('click', function(event) {
    const dropdownContents = document.querySelectorAll('.dropdown-content');
    dropdownContents.forEach(function(content) {
        // Check if the clicked element is not inside the dropdown or the dropdown button
        const dropdownButton = content.previousElementSibling;
        if (!content.contains(event.target) && !dropdownButton.contains(event.target)) {
            // Check if the dropdown is currently open
            if (content.style.display === "block") {
                content.style.display = "none"; // Close the dropdown
            }
        }
    });
});



/* Update Event */

$(document).ready(function () {
    let eventId;


    // Function to set minimum date for start and end date inputs
    function setMinDate() {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 16);
        document.getElementById('viewStartDate1').min = formattedDate;
        document.getElementById('viewEndDate1').min = formattedDate;
    }


    $('#viewEventModal1').on('show.bs.modal', function (event) {


        // Call the setMinDate function when modal is shown
        setMinDate();

        /!*STRM*!/
        // Show the overlay
        document.getElementById("modalOverlay").style.display = "block";
        // Optionally, fade in the modal body
        $(".form-body").fadeIn();


        const button = $(event.relatedTarget);
        eventId = button.data('event-id');
        $('#eventId').val(eventId); // Set the event ID in the hidden input field

        // Fetch the event data from the server using the eventId
        fetch(`/admin/event/${eventId}`)
            .then(response => {

                if (!response.ok) {
                    throw new Error('Failed to fetch event data');
                }
                return response.json();
            })
            .then(eventData => {
                var [year, month, day, hour, minute] = eventData.startDate;

                // Formatting date and time components
                var formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                var formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                // Combining date and time components
                var formattedStartDateTime = `${formattedDate}T${formattedTime}`;
                var [year, month, day, hour, minute] = eventData.endDate;

                // Formatting date and time components
                var formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                var formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                // Combining date and time components
                var formattedEndDateTime = `${formattedDate}T${formattedTime}`;
                $('#viewContent1').val(eventData.content);
                $('#viewStartDate1').val(formattedStartDateTime);
                $('#viewEndDate1').val(formattedEndDateTime);
                $('#viewEventDetails1').val(eventData.eventDetails);
                $('#image-preview1').attr('src', eventData.photoFile);

                // Clear error messages
                $('.error-message').hide();

            })
            .catch(error => {
                console.error('Error fetching event data:', error);
            });
    });

    // Handle form submission when the user updates the data
    $('#updateEventForm').on('submit', function(event) {
        event.preventDefault(); // Prevent default form submission behavior

        var content = $('#viewContent1').val().trim();
        var startDate = new Date($('#viewStartDate1').val().trim());
        var endDate = new Date($('#viewEndDate1').val().trim());
        var eventDetails = $('#viewEventDetails1').val().trim();

        var currentDate = new Date();

        var isValid = true;

        // Check if content is empty
        if (content === '') {
            $('#contentError1').show();
            isValid = false;
        } else {
            $('#contentError1').hide();
        }

        // Check if startDate is greater than current date (including time)
        if (startDate.getTime() <= currentDate.getTime()) {
            $('#startDateError1').show();
            isValid = false;
        } else {
            $('#startDateError1').hide();
        }

        // Check if endDate is less than startDate (including time)
        if (endDate.getTime() < startDate.getTime()) {
            $('#endDateError1').show();
            isValid = false;
        } else {
            $('#endDateError1').hide();
        }

        // Check if eventDetails is empty
        if (eventDetails === '') {
            $('#eventDetailsError1').show();
            isValid = false;
        } else {
            $('#eventDetailsError1').hide();
        }

        // If isValid is true, proceed with form submission (update)
        if (isValid) {
            var formData = new FormData($('#updateEventForm')[0]);
            var eventId = $('#eventId').val();

            // Show loader
          //  $('#loader1').show();
            $('#loader1').show();

            fetch(`/admin/updateEvent/${eventId}`, {
                method: 'POST', // Specify POST method
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update event data');
                    }

                    $('#viewEventModal1').modal('hide');
                    console.log('Event updated successfully'); // Log success message

                    // Show SweetAlert for success
                    swal({
                        title: "Success!",
                        text: "Event updated successfully.",
                        icon: "success"
                    });

                    // Add event listener to refresh the page upon clicking anywhere on the screen
                    $(document).one('click', refreshPageOnClick);

                })
                .catch(error => {
                    console.error('Error updating event data:', error);

                });
        }
    });

    // Function to refresh the page upon clicking anywhere on the screen
    function refreshPageOnClick() {
        updatePage();
    }

    // Show loader after modal is closed
    $('#viewEventModal1').on('hidden.bs.modal', function () {
        modalOverlay.style.display = "none";
        // $('#loader1').hide();
    });


    // Event listeners to hide error messages on focus
    $('#viewContent1').on('focus', function() {
        $('#contentError1').hide();
    });

    $('#viewStartDate1').on('focus', function() {
        $('#startDateError1').hide();
    });

    $('#viewEndDate1').on('focus', function() {
        $('#endDateError1').hide();
    });

    $('#viewEventDetails1').on('focus', function() {
        $('#eventDetailsError1').hide();
    });
});





/*Delete Event*/

document.addEventListener("DOMContentLoaded", function() {
    const deleteForm = document.getElementById('deleteForm');
    const eventIdToDeleteInput = document.getElementById('eventIdToDelete');
    const modalOverlay = document.getElementById("modalOverlay");
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    // Event delegation to handle click events on delete buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn')) {
            const eventIdToDelete = event.target.getAttribute('data-event-id');
            eventIdToDeleteInput.value = eventIdToDelete; // Set the value of the hidden input field

            // Show the delete modal
            deleteModal.show();

            // Show the overlay
            modalOverlay.style.display = "block";
            // Optionally, fade in the modal body
            $(".form-body").fadeIn();

            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
                modalBackdrop.remove();
            }
        }
    });

    // Add event listener to the cancel button to close the modal
    document.getElementById('cancelButton').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Close the modal
        deleteModal.hide();
    });

    // Add event listener for when the modal is hidden
    document.getElementById('deleteModal').addEventListener('hidden.bs.modal', function () {
        // Hide the overlay
        modalOverlay.style.display = "none";
    });


    // Add event listener to the delete form submission
    deleteForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        const id = eventIdToDeleteInput.value;

        // Send a DELETE request to soft delete the event
        fetch(`/admin/deleteEvent/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // If the soft delete operation was successful, close the modal, show success message, and update the page
                deleteModal.hide();
                swal({
                    title: "Success!",
                    text: "Event deleted successfully.",
                    icon: "success"
                });
                // Update the page after successful deletion
                updatePage();
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error cases, such as displaying an error message
                alert('Error: ' + error.message);
            });
    });



});
function updatePage() {
    fetch('http://localhost:8080/view', {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => {
            // Sort events by createdDate in descending order to display the latest first
            data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            // Clear the existing event cards
            const container = document.querySelector('.cards');
            container.innerHTML = '';
            // Pass all events to the displayEvent function to re-render the event cards
            displayEvent(data);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            // Handle error
        });
}


/*STRM*/


























/*original code not sorting in view*/
/*
// Modify the function to display event cards and conditionally hide the edit button
function displayEvent(events) {
    const currentDate = new Date(); // Get the current date and time
    events.forEach(function (event) {
        // Convert startDate and endDate strings to Date objects
        const startDate = new Date(event.startDate[0], event.startDate[1] - 1, event.startDate[2], event.startDate[3], event.startDate[4]);
        const endDate = new Date(event.endDate[0], event.endDate[1] - 1, event.endDate[2], event.endDate[3], event.endDate[4]);

        // Check if the current date and time is greater than the end date and time to determine expiration
        let expiredMessage = '';
        if (currentDate > endDate) {
            expiredMessage = `<p style="color: red; font-weight: bold; background-color: #ffe6e6; padding: 1px; border-radius: 10px;text-align: center">This event has expired !!!</p>`;
        }

        // Define month names array
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Extract day, month, and year from the startDate
        const day = startDate.getDate();
        const month = monthNames[startDate.getMonth()];
        const year = startDate.getFullYear();

        // Check if the current date is greater than the start date to decide whether to show the edit button
        let editButton = '';
        if (currentDate <= startDate) {
            // If current date is not greater, display the edit button
            editButton = `<button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#viewEventModal1" data-event-id="${event.id}" style="width:100%;font-family: Math">Edit</button>`;
        }

        // Format the date for display
        const formattedDate = `${day} ${month} ${year}`;
        const role=document.getElementById('role').value;
        // Rest of the code remains the same
        if(role == "[User]"){
            let eventCard = `<div class="card">
                            <img src="${event.photoFile}" alt="User Profile UI Preview" class="ui-preview">
                            <div class="ui-details">
                                 ${expiredMessage} <!-- Display expired message here -->
                                <h4 style="text-align: center;font-size: 22px">${event.content}</h4>
                                <h5 style="color: white; font-size: 15px; margin-top: 12px; text-align: center;">${formattedDate}</h5>

                            </div>
                            <button type="button" class="btn btn-view" data-bs-toggle="modal" data-bs-target="#viewEventModal" data-event-id="${event.id}" style="font-family: Math">View</button>
                        </div>`;
            const qqq=document.getElementsByClassName('dropdown-img');
            for (let i = 0; i < qqq.length; i++) {
                qqq[i].style.display = "none";
            }
            const container = document.querySelector('.cards');
            container.insertAdjacentHTML('beforeend', eventCard);

        }else{
            let eventCard = `<div class="card">
                         <div  class="dropdown-img">
                                        <button class="dropbtn" onclick="toggleDropdown(this)" >
                                            <i class="fa fa-ellipsis-v"></i>
                                        </button>
                                        <div class="dropdown-content" id="myDropdown">
                                            ${editButton} <!-- Edit button here -->
                                            <button type="button" class="btn btn-danger delete-btn" data-bs-toggle="modal" data-bs-target="#deleteModal" data-event-id="${event.id}" style="width:100%;font-family: Math">Delete</button>
                                        </div>
                                    </div>



                            <img src="${event.photoFile}" alt="User Profile UI Preview" class="ui-preview">
                            <div class="ui-details">
                                 ${expiredMessage} <!-- Display expired message here -->
                                <h4 style="text-align: center">${event.content}</h4>
                                <h5 style="color: white; font-size: 12px; margin-top: 5px; text-align: center;">${formattedDate}</h5>

                            </div>
                            <button type="button" class="btn btn-view" data-bs-toggle="modal" data-bs-target="#viewEventModal" data-event-id="${event.id}" style="font-family: Math">View</button>
                        </div>`;

            const container = document.querySelector('.cards');
            container.insertAdjacentHTML('beforeend', eventCard);
        }


    });
}
*/




