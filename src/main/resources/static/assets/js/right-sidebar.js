/*STRM*/

/*Not show expired event code and descending*/
$(document).ready(function () {
    // Function to display events
    function displayEvent(events) {
        const currentDate = new Date();

        // Reverse events array to show the latest created event at the top
        events.reverse();

        let eventCounter = 0;  // Counter to track displayed events

        events.forEach(function (event, index) {
            const startDate = new Date(event.startDate[0], event.startDate[1] - 1, event.startDate[2], event.startDate[3], event.startDate[4]);
            const endDate = new Date(event.endDate[0], event.endDate[1] - 1, event.endDate[2], event.endDate[3], event.endDate[4]);

            // Skip expired events
            if (endDate < currentDate) {
                return;
            }

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.error(`Invalid date format for event: ${JSON.stringify(event)}`);
                return; // Skip processing this event
            }

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const day = startDate.getDate();
            const month = monthNames[startDate.getMonth()];

            // Create event card HTML
            const eventCards = `
                <div class="events" style="display: ${eventCounter < 3 ? '' : 'none'};">
                    <div class="left-events">
                        <h3 style="background-color: white; height: 45px">${day}</h3>
                        <span>${month}</span>
                    </div>
                    <div class="right-events" style="margin-top: 15px">
                        <h4 style="color: black; font-family: Math">${event.content}</h4>
                        <span style="color: #0d6efd; cursor: pointer" data-bs-toggle="modal" data-bs-target="#viewEventModal" data-event-id="${event.id}">More Info</span>
                    </div>
                </div>`;

            // Append event card to the right sidebar
            $(".right-sidebar-events").append(eventCards);

            // Increment counter for displayed events
            eventCounter++;
        });

        // Show "See More" button if there are more than 3 events
        if ($(".events").length > 3) {
            $(".see-more").show();
        } else {
            $(".see-more").hide();
        }
    }

    // Fetch data from the server
    fetch('http://localhost:8080/view', {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Check if data is not empty
            if (data.length > 0) {
                displayEvent(data);
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            // Handle error
        });

    // Event listener for the "See More" button
    $(".see-more").click(function () {
        $(".events:hidden").slice(0, 3).slideDown();
        if ($(".events:hidden").length === 0) {
            $(".see-more").hide();
        }
    });

    $('#viewEventModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var eventId = button.data('event-id'); // Extract info from data-* attributes

        // Fetch the event data from the server using the eventId
        fetch(`/detail/${eventId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch event data');
                }
                return response.json();
            })
            .then(eventData => {
                // Convert startDate string to a Date object
                const startDate = new Date(eventData.startDate[0], eventData.startDate[1] - 1, eventData.startDate[2], eventData.startDate[3], eventData.startDate[4]);
                const endDate = new Date(eventData.endDate[0], eventData.endDate[1] - 1, eventData.endDate[2], eventData.endDate[3], eventData.endDate[4]);
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    console.error(`Invalid date format for event: ${JSON.stringify(eventData)}`);
                    return; // Skip processing this event
                }

                // Define month names array
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                // Extract day, month, year, hour, and minute from the startDate
                const startDay = startDate.getDate();
                const startMonth = monthNames[startDate.getMonth()];
                const startYear = startDate.getFullYear();
                let startHour = startDate.getHours();
                const startMinute = startDate.getMinutes();
                let startAMPM = 'AM';

                // Convert hour to 12-hour format and determine AM or PM
                if (startHour >= 12) {
                    startHour -= 12;
                    startAMPM = 'PM';
                }
                if (startHour === 0) {
                    startHour = 12; // Convert 0 to 12 for 12-hour format
                }

                // Extract day, month, and year from the endDate
                const endDay = endDate.getDate();
                const endMonth = monthNames[endDate.getMonth()];
                const endYear = endDate.getFullYear();
                let endHour = endDate.getHours();
                const endMinute = endDate.getMinutes();
                let endAMPM = 'AM';

                // Convert hour to 12-hour format and determine AM or PM
                if (endHour >= 12) {
                    endHour -= 12;
                    endAMPM = 'PM';
                }
                if (endHour === 0) {
                    endHour = 12; // Convert 0 to 12 for 12-hour format
                }

                // Update the modal fields with the event data
                $('#image').attr('src', eventData.photoFile);
                $('#viewContent').text(eventData.content);
                $('#viewStartDate').text(`${startDay} ${startMonth} ${startYear} ${startHour}:${startMinute} ${startAMPM}`);
                $('#viewEndDate').text(`${endDay} ${endMonth} ${endYear} ${endHour}:${endMinute} ${endAMPM}`);

                // Insert line breaks in "Event Details" field
                const maxCharactersPerLine = 25;
                const eventDetails = eventData.eventDetails;
                let formattedEventDetails = '';
                for (let i = 0; i < eventDetails.length; i += maxCharactersPerLine) {
                    formattedEventDetails += eventDetails.substring(i, i + maxCharactersPerLine) + '\n';
                }
                $('#viewEventDetails').text(formattedEventDetails);
            })
            .catch(error => {
                console.error('Error fetching event data:', error);
            });
    });
});


/*STRM*/
