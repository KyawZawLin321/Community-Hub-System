// kym poll create //
document.getElementById('submitBtnPoll').addEventListener('click', async () => {
    const question = document.getElementById('question').value;
    const isPublicPoll = document.getElementById('isPublicPoll').value;
    const endDate = document.getElementById('endDate').value;
    const groupId = document.getElementById('groupId4').value;


    // Gather option texts
    const optionInputs = document.querySelectorAll('.option-input');
    const optionTexts = Array.from(optionInputs).map(input => input.value);

    const requestData = {
        question: question,
        isPublic: isPublicPoll,
        endDate: endDate,
        optionTexts: optionTexts,
        groupId: groupId

    };

    const url = '/createPoll';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        if (response.ok) {
            const data = await response.json();
            setTimeout(() => {
                location.reload();
            }, 1000);
            // await listData(); // Uncomment if needed
            document.getElementById('btn').innerHTML = data.message;
        } else {
            console.error('Failed to create poll');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
// kym poll create end //

// kym poll update start //
$(document).ready(function() {
    // Update Share Form Modal
    $('#exampleModalPoll1').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const pollId = button.data('id');
        const question = button.data('question');
        const optionId = button.data('optionid');
        const endDate = button.data('enddate');
        const isPublic = button.data('ispublic');
        const groupId = button.data('groupid');

        let optionTexts = button.data('optiontexts');

        console.log("endDate:", endDate); // Log the value of endDate to check if it's correct

        // Set the poll ID
        $('#idOfPoll').val(pollId);

        // Set the question
        $('#question1').val(question);

        // Set the poll ID
        $('#idOfOptionList').val(optionId);

        // Set the end date
        $('#endDate1').val(formatDate(endDate)); // Ensure the date is in the correct format

        // Set the visibility
        $('#isPublicPoll1').val(isPublic);

        // Set the poll ID
        $('#groupId5').val(groupId);

        // Clear previous option inputs
        $('#optionsContainer1').empty();

        // Check if optionTexts is a comma-separated string
        if (typeof optionTexts === 'string') {
            // Split the string into an array of options
            optionTexts = optionTexts.split(',');

            // Populate option inputs
            optionTexts.forEach((optionText, index) => {
                const optionInput = `<div class="mb-3 option-item">
                                        <input type="text" class="form-control option-input" value="${optionText}" placeholder="Option ${index + 1}"  style="font-family: Math">
                                        <button type="button" class="btn btn-danger btn-remove-option" style="margin-top: -38px;margin-left: 522px"  aria-label="Remove option">&times;</button>
                                    </div>`;
                $('#optionsContainer1').append(optionInput);
            });
        } else {
            console.error("optionTexts is not a string:", optionTexts);
            // Handle the case where optionTexts is not a string
            // For example, you can log an error message or provide a default behavior
        }
    });
});

function formatDate(dateString) {
    // Split the comma-separated date string into an array of values
    const dateValues = dateString.split(',');

    // Extract year, month, day, hour, and minute from the array
    const year = parseInt(dateValues[0]);
    const month = parseInt(dateValues[1]) + 1; // JavaScript months are zero-based, so we add 1
    const day = parseInt(dateValues[2]);
    const hour = parseInt(dateValues[3]);
    const minute = parseInt(dateValues[4]);

    // Construct a new Date object
    const dateObject = new Date(year, month, day, hour, minute);

    // Format the date as a string compatible with datetime-local input
    const formattedDate = dateObject.toISOString().slice(0, 16);

    return formattedDate;
}

document.getElementById('submitBtnPoll1').addEventListener('click', async () => {
    const id = document.getElementById('idOfPoll').value;
    const question = document.getElementById('question1').value;
    const isPublicPoll = document.getElementById('isPublicPoll1').value;
    const endDate = document.getElementById('endDate1').value;
    const groupId = document.getElementById('groupId5').value;


    const optionInputs = document.querySelectorAll('.option-input');
    const optionTexts = Array.from(optionInputs).map(input => input.value);

    const requestData = {
        id: id,
        question: question,
        isPublic: isPublicPoll,
        endDate: endDate,
        optionTexts: optionTexts,
        groupId: groupId

    };

    console.log("optionTexts is ", optionTexts)

    const url = '/updatePoll'; // Assuming you have an endpoint to update the poll
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        const responseData = await response.text(); // Try parsing as text
        console.log('Response:', responseData); // Log response data
        if (response.ok) {
            setTimeout(() => {
                location.reload();
            }, 1000);
            // Optionally, you can perform other actions upon successful update
            console.log('Poll updated successfully');
        } else {
            console.error('Failed to update poll:', responseData); // Log error message from server
        }
    } catch (error) {
        console.error('Error:', error); // Log any caught errors
    }
});
/// kym poll update end //

// kym poll delete start //
const deletePoll = async (id, optionId) => {
    const url = `/deletePoll/${id}/${optionId}`;
    try {
        const response = await fetch(url, {
            method: 'PUT'
        });
        if (response.ok) {
            console.log("Delete success");
            await fetchData(); // Assuming fetchData() is a function to refresh data
            setTimeout(() => {
                location.reload(); // Reload the page after deletion
            }, 1000);
        } else {
            console.error("Delete failed");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}



window.onload = async function () {
    try {
        const response = await fetch(`/searchPoll/${searchUserId}`);
        const polls = await response.json();

        console.log('Polls:', polls); // Log the polls array

        const pollListContainer = document.querySelector('.profile-section-main');
        polls.forEach(poll => {
            console.log('Processing poll:', poll); // Log each poll object
            const pollElement = createPollElement(poll);
            pollListContainer.appendChild(pollElement);
        });

    } catch (error) {
        console.error('Error fetching polls:', error);
    }
};

function createPollElement(poll) {
    const pollElement = document.createElement('div');
    pollElement.classList.add('poll');
    pollElement.innerHTML = `
        <h3 style="display: inline-block;font-family: math">${poll.question}</h3>
        <span style="float: right;">
            <div class="dropdown">
                <button class="btn btn-secondary" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton" style="z-index: 100">
                    <li>
                        <button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModalPoll1"
                            data-id="${poll.id}"
                            data-enddate="${poll.endDate}"
                            data-ispublic="${poll.isPublic}"
                            data-question="${poll.question}"
                            data-userid="${poll.userId}"
                            data-optionid="${poll.optionId}"
                            data-groupid="${poll.groupId}"
                            data-optiontexts="${poll.optionTexts}"
                        >
                            Update
                        </button>
                    </li>
                    <li>
                        <button class="dropdown-item" type="button" onclick="deletePoll(${poll.id}, ${poll.optionId})">Delete</button>

                    </li>
                </ul>
            </div>
        </span>

      <div class="answers" style="margin-top: 30px">
            ${Array.isArray(poll.optionTexts) && poll.optionTexts.length > 0 ?
        poll.optionTexts.map((optionText, index) => {
            const count = poll.optionCounts ? poll.optionCounts[index] : 0;
            const total = poll.totalVotes || 0;
            const percentage = calculatePercentage(count, total);
            return `
                        <div class="answer" style="margin-top: 10px">
                            <span>${optionText}</span>
                            <span class="percentage_value" style="right: 81px;">${percentage}%</span>
                            <button onclick="handleButtonClick(event, ${poll.optionId[index]}, '${optionText}', ${poll.id})"
                                data-answer-id="${poll.optionId[index]}"
                                data-pollid="${poll.id}"
                                data-optiontext="${poll.optionTexts[index]}"
                            >Click</button>
                        </div>`;
        }).join('') :
        '<p>No options available</p>'
    }
        </div>
    `;
    return pollElement;
}
function calculatePercentage(count, total) {
    if (total === 0) return 0;
    return ((count / total) * 100).toFixed(2);
}


function handleButtonClick(event, optionId, optionText, pollId) {
    console.log(`Option ${optionText} (${optionId}) in poll ${pollId} was clicked.`);
    const requestData = {
        optionId: optionId,
        pollId: pollId,
    };

    const url = '/createVote';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (response.ok) {
                console.log(`Vote created successfully for option ${optionText} (${optionId}) in poll ${pollId}`);
                // Perform any additional action if needed4
                setTimeout( () =>{
                    location.reload();
                },1000);
            } else {
                console.error('Failed to create vote');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // // Add animation class
    // event.target.classList.add('vote-animation');
    //
    // // Play the sound
    // const voteSound = document.getElementById('voteSound');
    // voteSound.play();

    // Add animation class to the clicked button
    event.target.classList.add('vote-animation');

    // Deselect previously selected button in the same poll
    const pollElement = event.target.closest('.poll');
    const lastSelectedButton = pollElement.querySelector('.answer button.selected');
    if (lastSelectedButton) {
        lastSelectedButton.classList.remove('selected');
    }

    // Add selected class to the clicked button
    event.target.classList.add('selected');

    // Play the sound
    const voteSound = document.getElementById('voteSound');
    voteSound.play();
    // location.reload();

}





