
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
        document.getElementById("loading-spinner").style.display = "flex";
                    $('#exampleModalPoll').modal('hide');


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
                    clearPreviousPosts()

            await fetchData();
                document.getElementById("loading-spinner").style.display = "none";

//            setTimeout(() => {
//                location.reload();
//            }, 1000);
            // await listData(); // Uncomment if needed
       //     document.getElementById('btn').innerHTML = data.message;
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
                                        <input type="text" class="form-control option-input1" value="${optionText}" placeholder="Option ${index + 1}" style="font-family: Math">
                                        <button type="button" class="btn btn-danger btn-remove-option" style="margin-top: -63px;margin-left: 522px" aria-label="Remove option">&times;</button>
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


    const optionInputs = document.querySelectorAll('.option-input1');
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

    const url = '/updatePoll'; // Assuming you have an endpoint to update the
                $('#exampleModalPoll1').modal('hide');

        document.getElementById("loading-spinner").style.display = "flex";

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
//            setTimeout(() => {
//                location.reload();
//            }, 1000);
            clearPreviousPosts();
            await fetchData();
                document.getElementById("loading-spinner").style.display = "none";

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
                            $('#deletePollModal').modal('hide');

        document.getElementById("loading-spinner").style.display = "flex";

    try {
        const response = await fetch(url, {
            method: 'PUT'
        });
        if (response.ok) {
            console.log("Delete success");

            clearPreviousPosts();

            await fetchData();

                document.getElementById("loading-spinner").style.display = "none";

            // Assuming fetchData() is a function to refresh data
//            setTimeout(() => {
//                location.reload(); // Reload the page after deletion
//            }, 1000);
        } else {
            console.error("Delete failed");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


async function createPollElement(poll ,index) {
    try {
        const response = await fetch(`/user/users/${poll.userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();

        const pollElement = document.createElement('div');
        pollElement.classList.add('poll');
        const loginUserId = document.getElementById('id1').value;
        let dropdownMenu = '';

        if (loginUserId == poll.userId) {
            dropdownMenu = `
                <div class="dropdown">
                    <button class="btn btn-secondary" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton" style="z-index: 100;">
                        <li>
                            <button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModalPoll1"
                                data-id="${poll.id}"
                                data-enddate="${poll.endDate}"
                                data-ispublic="${poll.isPublic}"
                                data-question="${poll.question}"
                                data-userid="${poll.userId}"
                                data-optionid="${poll.optionId}"
                                data-groupid="${poll.groupId}"
                                data-optiontexts="${poll.optionTexts}">
                                Update
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#deletePollModal" data-poll-id=${poll.id} data-poll-option=${poll.optionId}>Delete</button>
                        </li>
                    </ul>
                </div>`;
        }

        // Add profile photo, name, date, and public logo
        const profilePhoto = userData.photo;
        const userName = userData.name || 'Unknown';
        const createdDate = formatPostTime(poll.createdDate);
        const isPublic = poll.isPublic === 'public' ? 'Public' : 'Private';
        const iconClass = poll.isPublic === 'public' ? 'fa-solid fa-earth-americas' : 'fa-solid fa-lock ';

        pollElement.innerHTML = `
    <span style="float: right;">${dropdownMenu}</span>
    <div class="info" id="share-user-info">
        <img src="${profilePhoto}" alt="User" id="share-user-photo-${poll.userId}" style="border-radius: 200px; width: 60px; height: 60px; cursor: pointer;">
        <div class="poll-info" style="margin-top: -97px;">
            <h4 style="margin-top: 47px; margin-left: 69px; font-family: Math;">${userName}</h4>
            <div style="margin-top: -14px;margin-left: 13%;margin-bottom: 22px;font-size: small">
                <span>${createdDate}</span>
                <i class="${iconClass}" ></i>
            </div>
        </div>
    </div>
    <h3 style="display: inline-block; font-family: Math; margin-top: 12px; margin-bottom: -10px;">${poll.question}</h3>
    <div class="answers" style="margin-top: 30px;"  id="answer" >
        ${Array.isArray(poll.optionTexts) && poll.optionTexts.length > 0 && poll.optionId ?
            poll.optionTexts.map((optionText, index) => {
                const count = poll.optionCounts ? poll.optionCounts[index] : 0;
                const total = poll.totalVotes || 0;
                const percentage = calculatePercentage(count, total);
                const barWidth = percentage > 0 ? `${percentage}%` : '0%';
                let barColor = '';
                if (percentage >= 100) {
                    barColor = 'rgba(0,255,44,0.36)';
                } else if (percentage <= 10) {
                    barColor = 'rgba(255,1,16,0.36)';
                } else if (percentage <= 33.33) {
                    barColor = 'rgba(255,104,0,0.36)';
                } else if (percentage >= 60) {
                    barColor = 'rgba(157,255,0,0.36)';
                } else {
                    barColor = 'rgba(255,165,0,0.36)'; // Default color
                }
                return `



            <div class="answer" style="margin-top: 10px; position: relative;" id="answer-${poll.optionId[index]}-${poll.id}">
                <span>${optionText}</span> <!-- Include optionId here -->
               <!-- <span>${optionText} (ID: ${poll.optionId[index]})</span>  Include optionId here -->

                <span class="percentage_value" style="right: 81px;">${percentage}%</span>
                <div class="percentage_bar" style="position: absolute; top: 0; left: 0; width: ${barWidth}; background-color: ${barColor}; height: 50px;"></div>
                <button onclick="handleButtonClick(event, ${poll.optionId[index]}, '${optionText}', ${poll.id}, ${percentage})"
                    data-answer-id="${poll.optionId[index]}"
                    data-pollid="${poll.id}"
                    data-optiontext="${poll.optionTexts[index]}"
                    data-percentage="${percentage}">
                    Click
                </button>
            </div>`;
            }).join('') :
            '<p>No options available</p>'
        }
    </div>
`;
     // Add event listeners to each answer div to show modal box
             const answerElements = pollElement.querySelectorAll('.answer');
             answerElements.forEach(answer => {
                 answer.addEventListener('click', async (event) => {
                     // Prevent modal from showing if button is clicked
                     if (event.target.tagName.toLowerCase() === 'button') {
                         return;
                     }

                     const optionId = event.currentTarget.id.split('-')[1]; // Extract optionId from the answer div id
                     try {
                         const response = await fetch(`/voters/${optionId}`);
                         if (!response.ok) {
                             throw new Error('Failed to fetch voters data');
                         }
                         const responseText = await response.text();
                         console.log("Raw response text:", responseText);

                         let votersData;
                         try {
                             votersData = JSON.parse(responseText);
                         } catch (jsonError) {
                             console.error("Error parsing JSON:", jsonError);
                             return;
                         }

                         console.log("votersData", votersData);

                         // Populate modal body with voter information
                         const modalBody = document.getElementById('votersModalBody');
                         modalBody.innerHTML = '';
                         votersData.forEach((voter, index) => {
                             console.log("votersData", voter.name);

                             const voterContainer = document.createElement('div'); // Container for each voter
                             voterContainer.style.display = 'flex';
                             voterContainer.style.alignItems = 'center';
                             voterContainer.style.marginBottom = '10px';

                             const voterNumber = document.createElement('span'); // Voter number
                             voterNumber.textContent = `${index + 1}.`;
                             voterNumber.style.marginRight = '10px';

                             const userIconImg = document.createElement('img'); // User image
                             userIconImg.src = voter.photo || 'http://res.cloudinary.com/dqwpkvot9/image/upload/v1717258642/d5834614-fc78-4f43-87ec-337cad7a31b3.jpg'; // Default image URL
                             userIconImg.alt = voter.id;
                             userIconImg.style.borderRadius = '50%';
                             userIconImg.style.width = '50px';
                             userIconImg.style.height = '50px';
                             userIconImg.style.marginRight = '10px';
                             userIconImg.style.cursor = 'pointer';

                             userIconImg.addEventListener('click', (event) => {
                                 event.stopPropagation(); // Prevent the modal from showing when clicking on the user icon
                                 viewUserProfile(voter.staffId); // Function to redirect to user profile view
                             });

                             // Function to redirect to user profile view
                             function viewUserProfile(staffId) {
                                 window.location.href = `/user/userprofile?staffId=${staffId}`;
                             }

                             const voterName = document.createElement('span'); // Voter name
                             voterName.textContent = voter.name;

                             voterContainer.appendChild(voterNumber);
                             voterContainer.appendChild(userIconImg);
                             voterContainer.appendChild(voterName);

                             modalBody.appendChild(voterContainer);
                         });

                         // Show the modal box
                         const votersModal = new bootstrap.Modal(document.getElementById('votersModal'));
                         votersModal.show();
                     } catch (error) {
                         console.error(error);
                     }
                 });
             });

             // Query and select the span elements
             const optionTextSpans = pollElement.querySelectorAll('.answer span');
             optionTextSpans.forEach(span => {
                 console.log(span.textContent);
             });

        // Add event listener to profile photo
        const userIconImg = pollElement.querySelector(`#share-user-photo-${poll.userId}`);
        userIconImg.addEventListener('click', () => {
            viewUserProfile(userData.staffId); // Function to redirect to user profile view
        });
                const pollListContainer = document.querySelector('.appendContent');

                    pollListContainer.appendChild(pollElement);
    } catch (error) {
        console.error('Error creating poll element:', error);
    }
}


// Function to redirect to user profile view
function viewUserProfile(staffId) {
    window.location.href = `/user/userprofile?staffId=${staffId}`;
}

// FORMAT TIME //
function formatPostTime(createdDate) {
    // Construct a date string in the format "YYYY-MM-DDTHH:mm:ss"
    var dateString = createdDate[0] + '-' + // year
        ('0' + createdDate[1]).slice(-2) + '-' + // month (zero-padded)
        ('0' + createdDate[2]).slice(-2) + 'T' + // day (zero-padded)
        ('0' + createdDate[3]).slice(-2) + ':' + // hour (zero-padded)
        ('0' + createdDate[4]).slice(-2) + ':' + // minute (zero-padded)
        ('0' + createdDate[5]).slice(-2); // second (zero-padded)

    // Convert the dateString to a JavaScript Date object
    var postDate = new Date(dateString);

    // Get the current time
    var currentDate = new Date();

    // Calculate the difference in milliseconds between the current time and the post's creation time
    var timeDifference = currentDate - postDate;

    // Convert the time difference to seconds
    var secondsDifference = timeDifference / 1000;

    // Define time intervals in seconds
    var intervals = {
        yr: 31536000,
        mth: 2592000,
        day: 86400,
        hr: 3600,
        min: 60
    };

    // Iterate through intervals to find the largest interval that fits the time difference
    for (var key in intervals) {
        var interval = intervals[key];
        if (secondsDifference >= interval) {
            var value = Math.floor(secondsDifference / interval);
            return value + ' ' + key + (value === 1 ? '' : 's') + ' ago ';
        }
    }
    // If the time difference is less than a minute, show "just now"
    return 'just now';
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
             clearPreviousPosts();
             fetchData();
            } else {
                console.error('Failed to create vote');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });


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

    // event.target.style.backgroundImage = `linear-gradient(to right, rgb(255, 165, 0) 0%, rgb(255, 165, 0) ${percentage}%, transparent ${percentage}%, transparent 100%)`;


    // Play the sound
    const voteSound = document.getElementById('voteSound');
    voteSound.play();
    // location.reload();

}

