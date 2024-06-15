 <!--User Update Info-->
//char
 function previewImageProfile(event) {
     const preview = document.getElementById('image-preview-profile');
     const file = event.target.files[0];
     const reader = new FileReader();
     reader.onloadend = function () {
         preview.src = reader.result;
     };
     if (file) {
         reader.onloadend = function () {
             preview.src = reader.result;
             preview.removeAttribute('hidden');
         };
         reader.readAsDataURL(file);
     } else {
         preview.src = '';
         preview.setAttribute('hidden', '');
     }
 }



 function previewImageCover(event) {
     const preview = document.getElementById('image-preview-cover');
     const file = event.target.files[0];
     const reader = new FileReader();
     reader.onloadend = function () {
         preview.src = reader.result;
     };
     if (file) {
         reader.onloadend = function () {
             preview.src = reader.result;
             preview.removeAttribute('hidden');
         };
         reader.readAsDataURL(file);
     } else {
         preview.src = '';
         preview.setAttribute('hidden', '');
     }
 }
 // Char
        getUserInfo();
    function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding leading zeros if necessary
    const day = String(date.getDate()).padStart(2, '0'); // Adding leading zeros if necessary
    return `${year}-${month}-${day}`;
}
    //     function openUploadImageModal(button) {
    //     // Show the upload image modal box
    //     $('#updateImageStaffId').val(button.getAttribute("data-user-id"));
    //     $('#updateUserImageModel').modal('show');
    // }
 function openUploadImageModal(button) {
     $('#updateImageStaffId').val(button.getAttribute("data-user-id"));
     const originalPhotoUrl = $('.user-profile-avatar').attr('src');
     console.log("Original Photo URL:", originalPhotoUrl);
     $('#image-preview-profile').attr('src', originalPhotoUrl);
     $('#updateUserImageModel').modal('show');
 }


 function openCoverModel(button){
     $('#updateUserCoverModel').modal('show');
     const originalCoverUrl = $('.coverphoto').attr('src');
     $('#image-preview-cover').attr('src', originalCoverUrl);
 }

 function openUpdateUserInfoModal(name,dob,interest,skill,bio){
        $('#updateName').val(name);
        const updateInterestSelect = $('#updateInterest');
        if (interest == "null") {
               // If interest is not null, set its value
             updateInterestSelect.find('option[value="Web Development"]').prop('selected', true);

           } else {
               // If interest is null, manually select "Web Development"
               updateInterestSelect.val(interest);
           }
        if (skill == "null") {
                // If interest is not null, set its value
            $('#updateSkill').val('---');
                 } else {
                          // If interest is null, manually select "Web Development"
           $('#updateSkill').val(skill);
                          }
             if (bio == "null") {
                                             // If interest is not null, set its value
                $('#updateBio').val('---');
                             } else {
                                             // If interest is null, manually select "Web Development"
                $('#updateBio').val(bio);
              }
        const dobDate = new Date(dob); // Convert dob to a Date object
        $('#updateDob').val(formatDate(dobDate));
        $('#updateUserinfo').modal('show');
        }
           function updateUserInfo(user) {
        // Update DOM elements with new user data
       document.getElementById('name').textContent = user.name ? user.name : '---';
       document.getElementById('interest').textContent = user.interest ? user.interest : '---';
       // document.getElementById('skill').textContent = user.skill ? user.skill : '---';
       document.getElementById('biography').textContent = user.biography ? user.biography : '---';
       document.getElementById('dob').textContent = user.dob ? user.dob : '---';
       document.getElementById('coverPhoto').src = user.coverPhoto ? user.coverPhoto : 'default-cover.jpg'; // Provide a default cover photo source
       document.getElementById('photo').src = user.photo ? user.photo : 'default-photo.jpg'; // Provide a default photo source
       document.getElementById('department').textContent = user.department ? user.department : '---';
       document.getElementById('team').textContent = user.team ? user.team : '---';
       document.getElementById('email').textContent = user.email ? user.email : '---';


               $('#optionsContainer12').empty();

               if (user.skillOption && user.skillOption.length > 0) {
                   user.skillOption.forEach(skill => {
                       const optionItem = $('<div class="mb-3 option-item"></div>');
                       const input = $('<input type="text" class="form-control option-input">').val(skill);
                       const button = $('<button type="button" class="btn btn-danger btn-remove-option" aria-label="Remove option">&times;</button>');
                       optionItem.append(input).append(button);
                       $('#optionsContainer12').append(optionItem);
                   });
               } else {
                   // If no skill options are provided, show a default input field
                   const optionItem = $('<div class="mb-3 option-item"></div>');
                   const input = $('<input type="text" class="form-control option-input" placeholder="Option 1">');
                   const button = $('<button type="button" class="btn btn-danger btn-remove-option" aria-label="Remove option">&times;</button>');
                   optionItem.append(input).append(button);
                   $('#optionsContainer12').append(optionItem);
               }



               if (user.skillOption && user.skillOption.length > 0) {
                   user.skillOption.forEach(skill => {
                       const skillOptionElement = document.createElement('li');
                       skillOptionElement.textContent = skill;
                       skillOptionsContainer.appendChild(skillOptionElement);
                   });
               } else {
                   const noSkillOptionElement = document.createElement('li');
                   noSkillOptionElement.textContent = 'No skill options provided';
                   skillOptionsContainer.appendChild(noSkillOptionElement);
               }
// kym //


               if (!document.getElementById('updateUserInfoButton')) {
        const userInfoBtn = `<div><button type="button" id="updateUserInfoButton" class="custom-btn btn-11 mt-3"
                            onclick="openUpdateUserInfoModal('${user.name}', '${user.dob}', '${user.interest}', '${user.skillOption}', '${user.biography}')">
                        <i class="fa-solid fa-pen-to-square" style="margin-left: -6px;"></i>
                    </button></div>`;
        document.querySelector(".UserInfo").insertAdjacentHTML("beforeend", userInfoBtn);
    }else {
    // If the button already exists, update its onclick function to pass the updated user information
    document.getElementById('updateUserInfoButton').setAttribute('onclick', `openUpdateUserInfoModal('${user.name}', '${user.dob}', '${user.interest}', '${user.skill}', '${user.biography}')`);
}
        // Add similar updates for other elements if needed
    }
    async function getUserInfo() {
    try {
        const response = await fetch('http://localhost:8080/user/get-user-info', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user information');
        }

        const userData = await response.json();

        // Update the user information in the UI
        updateUserInfo(userData);
    } catch (error) {
        console.error('Error fetching user information:', error.message);
    }
}


        document.getElementById('btn-image').addEventListener('click', async (e) => {
                        e.preventDefault();

                        // Get the selected file
                        let fileInput = document.getElementById('file');
                        let file = fileInput.files[0];
                         // Check if file is selected
                            if (!file) {
                                document.getElementById('fileError').textContent = "Please select a file.";
                                return;
                            }

                            // Check file size
                            if (file.size / 1024 / 1024 > 100) {
                                document.getElementById('fileError').textContent = "File size is too large (maximum allowed size is 100MB).";
                                return;
                            }

                        // Create a FormData object
                        let formData = new FormData();

                        // Append the file to FormData object
                        formData.append('file', file);
                        const response = await fetch('http://localhost:8080/user/upload-user-profile', {
                            method: 'POST',
                            body: formData
                        });
                        if (response.ok) {
                            $('#updateUserImageModel').modal('hide');

                            const res = await response.text();
                            $('.user-profile-avatar').attr('src', res);
                            document.getElementById('success').textContent = "Uploaded Profile Photo Success!";

                            fileInput.value = ''; // Clear the file input
                            console.log(res);
                        setTimeout(function() {
                               document.getElementById('success').textContent = '';
                            }, 3000);
                        } else {
                            console.error("Upload failed:", response.status);
                        }
                    });

        document.getElementById('btn-cover').addEventListener('click', async (e) => {
                        e.preventDefault();

                        // Get the selected file
                        let fileInput = document.getElementById('cover');
                        let file = fileInput.files[0];
                         if (!file) {
                                    document.getElementById("coverError").textContent = "Please select a file.";
                                    return;
                                }

                                // Check file size
                                if (file.size / 1024 / 1024 > 100) {
                                    document.getElementById("coverError").textContent = "File size is too large (maximum allowed size is 100MB).";
                                    return;
                                }
                        // Create a FormData object
                        let formData = new FormData();

                        // Append the file to FormData object
                        formData.append('file', file);
                        const response = await fetch('http://localhost:8080/user/upload-cover-profile', {
                            method: 'POST',
                            body: formData
                        });
                        if (response.ok) {
                            $('#updateUserCoverModel').modal('hide');

                            const res = await response.text();

                            $('.coverphoto').attr('src', res);

                            fileInput.value = ''; // Clear the file input
                            document.getElementById('success').textContent = "Uploaded Cover Photo Success!";

                            console.log(res);
                         setTimeout(function() {
                               document.getElementById('success').textContent = '';
                          }, 3000);
                        } else {
                            console.error("Upload failed:", response.status);
                        }
                    });



 document.getElementById('user-info').addEventListener('click', async (e) => {
     e.preventDefault();

     // Gather user data from the form
     const userInfoForm = document.getElementById('userInfo');
     const userFromData = new FormData(userInfoForm);
     let user = Object.fromEntries(userFromData.entries());

     // Gather skill options separately
     const skillOptions = Array.from(document.querySelectorAll('.option-input'))
         .map(input => input.value.trim())
         .filter(value => value !== ''); // Remove empty skill options

     // Include skill options in the user data
     user.skillOption = skillOptions;

     // Send user data including skill options to the backend
     const response = await fetch('http://localhost:8080/user/update-user-info', {
         method: 'POST',
         headers: { 'Content-type': 'application/json' },
         body: JSON.stringify(user)
     });
     if (response.ok) {
        /* setTimeout(() => {
             location.reload();
         }, 1000);*/
         const res = await response.json();
         $('#updateUserinfo').modal('hide');
         updateUserInfo(res); // Function to update user info on the page
         console.log(res);

         // Show success message using SweetAlert
         swal({
             title: "Success!",
             text: "User information updated successfully.",
             icon: "success"
         }).then(() => {
             // Reload the page when the user clicks anywhere on the screen
             location.reload();
         });
     } else {
         console.error("Update failed:", response.status);
     }
 });
// kym //
