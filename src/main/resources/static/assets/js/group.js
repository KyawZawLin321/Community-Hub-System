// // Char Char:3

// Assuming you have an input field with id "group-name" for the group name
var groupNameInput = $("#group-name");
// Assuming you have an input field with id "group-photo" for the group photo
var groupPhotoInput = $("#group-photo");
const createGroupButton = document.getElementById('createGroupButton');
createGroupButton.disabled = true;

// Disable the submit button initially
groupNameInput.on('input', validateForm);
groupPhotoInput.on('input', validateForm);

// Function to validate the form
function validateForm() {
    var groupNameValue = groupNameInput.val().trim();
    var groupPhotoValue = groupPhotoInput.val().trim();

    // Validate group name
    if (groupNameValue === "" || groupNameValue.length > 30) {
        groupNameInput.addClass("is-invalid");
        createGroupButton.disabled = true;
        return;
    } else {
        groupNameInput.removeClass("is-invalid");
    }

    // Validate group photo
    if (groupPhotoValue === "") {
        groupPhotoInput.addClass("is-invalid");
        createGroupButton.disabled = true;
        return;
    } else {
        groupPhotoInput.removeClass("is-invalid");
    }

    // If all validations pass, enable the submit button
    createGroupButton.disabled = false;
}

function closeModal() {
    document.getElementById('createGroupForm').reset();
        document.getElementById("selected-users").innerHTML = "<span>Selected Group Members -</span>";
        document.getElementById("selected-owner").innerHTML = "<span>Selected Group Admin -</span>";
    document.getElementById('image-preview').src = '';
    $('#groupModal').modal('hide');
}

const selectedUsers = new Set();
const selectedOwner = new Set();

function previewImage(event) {
    const preview = document.getElementById('image-preview');
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = function () {
        preview.src = reader.result;
    };
    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    fetchUserList();
});

// Can see all User List
function fetchUserList() {
    fetch('/user/getUsers')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched users:', data);
            const userList = document.getElementById('userList');
            userList.innerHTML = '';

            data.forEach(user => {
                const row = document.createElement('tr');
                if (selectedUsers.has(user.id.toString()) || selectedOwner.has(user.id.toString())) {
                    row.innerHTML = `
                        <td>${user.staffId}</td>
                        <td>${user.name}</td>
                        <td>${user.department}</td>
                        <td>${user.team}</td>
                        <td><img src="${user.photo}" alt="User Photo" style="width: 60px; height: 60px; object-fit: cover; border-radius: 50px;margin-right: 20px;" ></td>
                        <td>✔ Added</td>
                        <td><button class="add-button" type="button" onclick="selectOwner('${user.id}', '${user.name}', this)" disabled><i class="fas fa-plus-circle"></i> Admin</button></td>
                    `;
                } else {
                    row.innerHTML = `
                        <td>${user.staffId}</td>
                        <td>${user.name}</td>
                        <td>${user.department}</td>
                        <td>${user.team}</td>
                        <td><img src="${user.photo}" alt="User Photo" style="width: 60px; height: 60px; object-fit: cover; border-radius: 50px;margin-right: 20px;"></td>
                        <td><button class="add-button" type="button" onclick="addUser('${user.id}', '${user.name}', this)"><i class="fas fa-plus-circle"></i> Member</button></td>
                        <td><button class="add-button" type="button" onclick="selectOwner('${user.id}', '${user.name}', this)"><i class="fas fa-plus-circle"></i> Admin</button></td>
                    `;
                }
                userList.appendChild(row);
            });
            $(document).ready(function () {
                $('#myTable').DataTable();
            });
        })
        .catch(error => console.error('Error fetching user list:', error));
}

// Add User to group
function addUser(userId, userName, button) {
    console.log('Adding user:', userId, userName);
    selectedUsers.add(userId);
    const selectedUsersList = document.getElementById('selected-users');
    const listItem = document.createElement('li');
    listItem.className = 'selected-item';
    listItem.dataset.userId = userId;
    listItem.innerHTML = `
        <span>${userName}</span>
        <span class="remove-btn" onclick="removeUser(this)"> ❌</span>
    `;
    selectedUsersList.appendChild(listItem);
    updateHiddenInput();
    fetchUserList();
}

function selectOwner(userId, userName, button) {
    console.log('Adding user as owner:', userId, userName);
    const ownerIdInput = document.getElementById('ownerId');
    if (ownerIdInput.value == '') {
        selectedOwner.add(userId);
        const selectedOwnerList = document.getElementById('selected-owner');
        const listItem = document.createElement('li');
        listItem.className = 'selected-item';
        listItem.dataset.userId = userId;
        listItem.innerHTML = `
            <span>${userName}</span>
            <span class="remove-btn" onclick="removeOwner(this)"> ❌</span>
        `;
        selectedOwnerList.appendChild(listItem);
        updateHiddenOwnerInput();
        updateHiddenInput();
        fetchUserList();
    } else {
        alert('Only one owner can be selected.');
    }
}

function removeOwner(element) {
    const ownerId = element.parentNode.dataset.userId;
    selectedOwner.delete(ownerId);
    const userName = element.previousElementSibling.textContent;
    const listItem = element.parentNode;
    listItem.remove();
    updateHiddenOwnerInput();
    updateHiddenInput(); // Update the hidden input after removing the owner
    fetchUserList(); // Fetch the user list again after removing a user
}

// Cancel User
function removeUser(element) {
    console.log('Removing user:', element);
    const userId = element.parentNode.dataset.userId;
    console.log('User ID:', userId);
    selectedUsers.delete(userId);
    const userName = element.previousElementSibling.textContent;
    console.log('User name:', userName);
    const listItem = element.parentNode;
    listItem.remove();
    updateHiddenInput();
    fetchUserList(); // Fetch the user list again after removing a user
}

function updateHiddenInput() {
    const userIdsInput = document.getElementById('userIds');
    userIdsInput.value = Array.from(selectedUsers).concat(Array.from(selectedOwner)).join(',');
}

function updateHiddenOwnerInput() {
    const ownerIdInput = document.getElementById('ownerId');
    const ownerIdValue = Array.from(selectedOwner).join(',');
    ownerIdInput.value = ownerIdValue;
}

function createGroup(event) {
    event.preventDefault();

    if (selectedUsers.size === 0) {
        alert('Please select at least one user.');
        return;
    }

    const formData = new FormData(document.getElementById('createGroupForm'));

    document.getElementById("loading-spinner").style.display = "flex";
    $('#groupModal').modal('hide');


    fetch('/group/create', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create group');
            }

            document.getElementById("loading-spinner").style.display = "none";


            swal({
                title: "Success!",
                text: "Group created successfully.",
                icon: "success"
            });

            $(document).one('click', refreshPageOnClick);
        })
        .catch(error => {
            console.error('Error creating group:', error);
            document.getElementById("loading-spinner").style.display = "none";
        });
}

function refreshPageOnClick() {
    location.reload();
}

//When you click See More you'll see this
function showUserList(button) {
    const groupId = button.getAttribute('data-group-id');
    const ownerId = button.getAttribute('data-group-owner');
    console.log('Group ID:', groupId);

    fetch(`/group/${groupId}/selectedUsers`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            console.log(data);
            const modalBody = document.querySelector(`#groupModal-${groupId} .modal-body`);
            modalBody.innerHTML = '';

            const userList = document.createElement('ul');
            userList.classList.add('list-group');
            data.forEach(user => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');

                const userDiv = document.createElement('div');
                userDiv.classList.add('d-flex', 'justify-content-between', 'align-items-center');

                const userImage = document.createElement('img');
                userImage.src = user.photo;
                userImage.style.width = '50px';
                userImage.style.height = '50px';
                userDiv.appendChild(userImage);

                const userNameSpan = document.createElement('span');
                if(user.id==ownerId){
                userNameSpan.textContent = user.name +' (Owner)';
                }else if(user.role=='Admin'){
                userNameSpan.textContent = user.name +' (Admin)';
                }else{
                userNameSpan.textContent = user.name +' (Member)';
                }
                userNameSpan.style.marginLeft = '10px';
                userDiv.appendChild(userNameSpan);
            const role3 = document.getElementById('role3').value;
            const loginUserId=document.getElementById('id1').value;

               if(role3 == "Admin" || loginUserId==ownerId){
               const removeButton = document.createElement('button');

                               removeButton.classList.add('btn', 'btn-danger', 'btn-sm');
                               removeButton.textContent = 'Remove';
                               removeButton.onclick = function () {
                                   removeUserFromGroup(user.id, groupId,ownerId);
                               };
                               if(user.id != ownerId){
                               console.log("user :"+user.id);
                               console.log("owner :"+ownerId)
                               const changeOwner = document.createElement('button');
                                               changeOwner.classList.add('btn', 'btn-primary', 'btn-sm');
                                               changeOwner.textContent = 'Group Owner';
                                               changeOwner.onclick = function () {
                                                   changeOwnerFromGroup(user.id, groupId);

                                               };
                                            userDiv.appendChild(changeOwner);

                                               };

                               userDiv.appendChild(removeButton);
               }
 const inviteBtn = document.querySelector(`#groupModal-${groupId} #inviteBtn`);
            if (role3 == "Admin" || loginUserId==ownerId) {
                inviteBtn.style.display = "block";
            } else {
                inviteBtn.style.display = "none";
            }
                listItem.appendChild(userDiv);
                userList.appendChild(listItem);
            });

            modalBody.appendChild(userList);
            const modal = new bootstrap.Modal(document.querySelector(`#groupModal-${groupId}`));
            modal.show();


        })
        .catch(error => {
            console.error('Error fetching selected users in group:', error);
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('alert', 'alert-danger');
            errorMessage.textContent = 'Error fetching selected users. Please try again later.';
            const modalBody = document.querySelector(`#groupModal-${groupId} .modal-body`);
            modalBody.innerHTML = '';
            modalBody.appendChild(errorMessage);
        });

}
//Remove User From Group
function removeUserFromGroup(userId, groupId,ownerId) {
    $.ajax({
        url: `/group/${groupId}/removeUser/${userId}`,
        type: 'DELETE',
        success: function (response) {
            console.log('User removed from group successfully');
            $(`#userListInGroup-${groupId} li[data-user-id='${userId}']`).remove();
             fetch(`/group/${groupId}/selectedUsers`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch users');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (!Array.isArray(data)) {
                            throw new Error('Invalid data format');
                        }
                        console.log(data);
                        const modalBody = document.querySelector(`#groupModal-${groupId} .modal-body`);
                        modalBody.innerHTML = '';

                        const userList = document.createElement('ul');
                        userList.classList.add('list-group');
                        data.forEach(user => {
                            const listItem = document.createElement('li');
                            listItem.classList.add('list-group-item');

                            const userDiv = document.createElement('div');
                            userDiv.classList.add('d-flex', 'justify-content-between', 'align-items-center');

                            const userImage = document.createElement('img');
                            userImage.src = user.photo;
                            userImage.style.width = '50px';
                            userImage.style.height = '50px';
                            userDiv.appendChild(userImage);

                            const userNameSpan = document.createElement('span');
                if(user.id==ownerId){
                userNameSpan.textContent = user.name +' (Owner)';
                }else if(user.role=='Admin'){
                userNameSpan.textContent = user.name +' (Admin)';
                }else{
                userNameSpan.textContent = user.name +' (Member)';
                }
                                            userNameSpan.style.marginLeft = '10px';
                            userDiv.appendChild(userNameSpan);

                            const removeButton = document.createElement('button');
                            removeButton.classList.add('btn', 'btn-danger', 'btn-sm');
                            removeButton.textContent = 'Remove';

                            removeButton.onclick = function () {
                                removeUserFromGroup(user.id, groupId,ownerId);
                            };
                            if(user.id != ownerId){
                                                           console.log("user :"+user.id);
                                                           console.log("owner :"+ownerId)
                                                           const changeOwner = document.createElement('button');
                                                                           changeOwner.classList.add('btn', 'btn-primary', 'btn-sm');
                                                                           changeOwner.textContent = 'Group Owner';
                                                                           changeOwner.onclick = function () {
                                                                               changeOwnerFromGroup(user.id, groupId);

                                                                           };
                                                                        userDiv.appendChild(changeOwner);

                                                                           };

                            userDiv.appendChild(removeButton);

                            listItem.appendChild(userDiv);

                            userList.appendChild(listItem);
                        });

                        modalBody.appendChild(userList);


                    })

        },
        error: function (xhr, status, error) {
            console.error('Error removing user from group:', error);
        }
    });
}
function deleteUser(userId) {
    selectedUsers.delete(userId);
    updateHiddenInput();
    fetchUserList();
}
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('hidden.bs.modal', function () {
            const form = this.querySelector('form');
            if (form) {
                form.reset();
            }
            const imagePreview = this.querySelector('#image-preview');
            if (imagePreview) {
                imagePreview.src = '';
            }
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
                modalBackdrop.remove();
            }
        });
    });
});
//To Delete Group
function deleteGroup(groupId) {
    if (isNaN(groupId)) {
        console.error('Invalid groupId:', groupId);
        return;
    }
    fetch(`/group/delete/${groupId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Group deleted:', data);
            const groupCard = document.querySelector(`[data-group-id="${groupId}"]`);
            if (groupCard) {
                refreshPageOnClick();
                groupCard.remove();

            }
        })
        .catch(error => {
            console.error('Error deleting group:', error);
        });
}
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.btn-delete-group').forEach(button => {
        button.addEventListener('click', function () {
            const groupId = this.dataset.groupId;
            const deleteButtonInModal = document.querySelector(`#deleteGroupModal-${groupId} .btn-danger`);
            deleteButtonInModal.addEventListener('click', function () {
                deleteGroup(groupId);
                location.reload();
            });
        });
    });
});
//To invite User
function fetchNonGroupUsersAndShowModal(groupId) {
    fetch(`/group/${groupId}/nonGroupUsers`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch non-group users');
            }
            return response.json();
        })
        .then(nonGroupUsers => {
            const modalBody = document.querySelector(`#inviteMembersModal .modal-body`);
            modalBody.innerHTML = '';
                        // Create search input element
                        const searchInput = document.createElement('input');
                        searchInput.type = 'text';
                        searchInput.id = 'searchUserInput';
                        searchInput.classList.add('form-control', 'mb-3');
                        searchInput.placeholder = 'Search users...';
            modalBody.appendChild(searchInput);

            const userList = document.createElement('ul');
            userList.classList.add('list-group');
            nonGroupUsers.forEach(user => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');

                const userDiv = document.createElement('div');
                userDiv.classList.add('d-flex', 'justify-content-between', 'align-items-center');

                const userImage = document.createElement('img');
                userImage.src = user.photo;
                userImage.style.width = '50px';
                userImage.style.height = '50px';
                userDiv.appendChild(userImage);

                const userNameSpan = document.createElement('span');
                userNameSpan.textContent = user.name;
                userNameSpan.style.marginLeft = '10px';
                userDiv.appendChild(userNameSpan);

                const inviteButton = document.createElement('button');
                inviteButton.classList.add('btn', 'btn-primary', 'btn-sm', 'btn-invite');
                inviteButton.textContent = 'Invite';
                inviteButton.onclick = function () {
                    inviteUser(user.id, groupId);
                };
                userDiv.appendChild(inviteButton);

                listItem.appendChild(userDiv);
                userList.appendChild(listItem);
            });

            modalBody.appendChild(userList);
            $('#inviteMembersModal').modal('show');
                        searchInput.addEventListener('keyup', function () {
                            const filter = searchInput.value.toLowerCase();
                            const users = Array.from(userList.getElementsByTagName('li'));
                            users.forEach(user => {
                                const userName = user.querySelector('span').textContent.toLowerCase();
                                if (userName.includes(filter)) {
                                    user.style.display = '';
                                } else {
                                    user.style.display = 'none';
                                }
                            });
                        });
        })
        .catch(error => {
            console.error('Error fetching non-group users:', error);
            alert('Error fetching non-group users. Please try again later.');
        });
}
function closeAndShowModal(groupId) {
    const currentModal = document.querySelector(`#groupModal-${groupId}`);
    const bootstrapModal = bootstrap.Modal.getInstance(currentModal);
    bootstrapModal.hide();

    fetchNonGroupUsersAndShowModal(groupId);
}

function inviteUser(userId, groupId) {
    if (!userId || !groupId) {
        console.error('Invalid userId or groupId:', userId, groupId);
        return;
    }
    $.ajax({
        url: `/group/${groupId}/inviteUser/${userId}`,
        type: 'POST',
        success: function(response) {
            console.log('User invited successfully:', response);
            fetchNonGroupUsersAndShowModal(groupId)
        },
        error: function(xhr, status, error) {
            console.error('Error inviting user:', error);
        }
    });
}


var originalPhoto = '';
$(document).ready(function () {
    var groupId;
    $('.btn-see-more').click(function () {
        groupId = parseInt($(this).data('group-id'));
        console.log('Group ID:', groupId);
        var groupName = $(this).closest('.card-body').find('.card-title').text();
        var groupPhotoUrl = $(this).closest('.card').find('.card-img-top').attr('src');
        $('#updateGroupName').val(groupName);
        $('#updateGroupPhotoPreview').attr('src', groupPhotoUrl);
        $('#updateGroupId').val(groupId);

        originalPhoto = groupPhotoUrl;

        $('#groupNameError').text('');
        $('#groupPhotoError').text('');
        $('#updateGroupModal').modal('show');
    });

    $('#updateGroupForm').submit(function (event) {
        event.preventDefault();
        if (validateUpdateForm()) {
            var formData = new FormData(this);
            console.log('Form Data:', formData);

            fetch(`/group/update/${groupId}`, {
                method: 'POST',
                body: formData,
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update group');
                    }
                    console.log('Group updated successfully');
                    $('#updateGroupModal').modal('hide');
                    swal({
                        title: "Success!",
                        text: "Group updated successfully.",
                        icon: "success"
                    });
                    $(document).one('click', refreshPageOnClick);

                    // window.location.reload();
                })
                .catch(error => {
                    console.error('Error updating group:', error);
                });
        }
    });

    $('#updateGroupPhoto').change(function () {
        var file = this.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#updateGroupPhotoPreview').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    $('#updateGroupName').on('input', function () {
        validateGroupName();
    });

    $('#updateGroupPhoto').on('change', function () {
        validateGroupPhoto();
    });
});

function validateUpdateForm() {
    var isValidName = validateGroupName();
    var isValidPhoto = validateGroupPhoto();
    return isValidName && isValidPhoto;
}

function validateGroupName() {
    var groupName = $('#updateGroupName').val().trim();
    var isValid = true;

    // Reset error message
    $('#groupNameError').text('');

    // Validate group name
    if (groupName === '') {
        $('#groupNameError').text('Name must not be empty.');
        isValid = false;
    } else if (groupName.length > 30) {
        $('#groupNameError').text('Name must not exceed 30 characters.');
        isValid = false;
    }

    return isValid;
}

function validateGroupPhoto() {
    var groupPhoto = $('#updateGroupPhoto').val();
    var isValid = true;

    $('#groupPhotoError').text('');

    if (groupPhoto !== '' || originalPhoto === '') {
        if (!groupPhoto) {
            $('#groupPhotoError').text('Please select a group photo.');
            isValid = false;
        }
    }

    return isValid;
}






// For modal Group Photo
const avatarFileUpload = document.getElementById('AvatarFileUpload')
const imageViewer = avatarFileUpload.querySelector('.selected-image-holder>img')
const imageSelector = avatarFileUpload.querySelector('.avatar-selector-btn')
const imageInput = avatarFileUpload.querySelector('input[name="photoFile"]')

imageSelector.addEventListener('click', e => {
    e.preventDefault()
    imageInput.click()
})

imageInput.addEventListener('change', e => {
    var reader = new FileReader();
    reader.onload = function(){
        imageViewer.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
})
// Char Char :3



function resetModal() {
    document.getElementById("createGroupForm").reset();

    document.getElementById("selected-users").innerHTML = "<span>Selected Group Members -</span>";
    document.getElementById("selected-owner").innerHTML = "<span>Selected Group Admin -</span>";
    document.getElementById("userList").innerHTML = "";

    var groupPhotoInput = document.getElementById("group-photo");
    groupPhotoInput.value = "";
    var avatarImage = document.querySelector("#AvatarFileUpload .selected-image-holder img");
    avatarImage.src = "/static/assets/images/Group.jpeg";
}

document.getElementById("groupModal").addEventListener("hidden.bs.modal", function () {

        document.getElementById("selected-users").innerHTML = "<span>Selected Group Members -</span>";
        document.getElementById("selected-owner").innerHTML = "<span>Selected Group Admin -</span>";
});

    function restoreGroup(groupId) {
        fetch(`/group/${groupId}/restore`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Group restored successfully');
                // Optionally, refresh the page or update the UI to reflect the change
                location.reload(); // This will reload the page
            } else {
                return response.text().then(text => { throw new Error(text); });
            }
        })
        .catch(error => {
            alert('Failed to restore group: ' + error.message);
        });
    }
      function changeOwnerFromGroup(userId, groupId) {
      const group={
        ownerId:userId,
           id:groupId
      }
          fetch(`/group/${groupId}/changeOwner`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(group)
          })
          .then(response => {
              if (response.ok) {
                  return response.json();
              } else {
                  throw new Error(`Failed to change owner: ${response.status} ${response.statusText}`);
              }
          })
          .then(result => {
              console.log(`Owner changed successfully: `, result);
              // Update UI or notify user of success
              $(`#groupModal-${groupId}`).modal('hide');
              alert("Owner Changed Success");
              location.reload();
          })
          .catch(error => {
              console.error(`Error changing owner: `, error);
              // Handle network errors or other errors
          });
      }




