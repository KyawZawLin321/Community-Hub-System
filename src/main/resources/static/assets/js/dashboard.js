            function openModalBox(button) {
                $('#deleteUserId').val(button.getAttribute("data-user-id"));
                $('#deleteConfirmationModal').modal('show');
                    }
                    document.addEventListener("DOMContentLoaded", () =>{



                        function fetchAndDisplayUsers() {
                     fetch('http://localhost:8080/user/getUsers', {
                            method: 'GET',
                            headers: {'Content-type' : 'application/json'}

                        }).then(response=>response.json())
                    .then(users=>{
                        console.log(users);
                        displayUser(users);
                    })
                    }
                   function displayUser(users) {

                var userList = document.getElementById('userList');
                userList.innerHTML = '';
                users.forEach(function(user) {
                    var row = document.createElement('tr');

                    row.innerHTML = '<td class="staff-id">' + user.staffId + '</td>' +
                        `<td><a href="/user/userprofile?staffId=${user.staffId}"><img src="${user.photo}" style="width: 60px;height: 60px; margin-right:20px;object-fit:cover;border-radius: 50%;"/></a> </td>` +
                        '<td>' + user.name + '</td>' +
                        '<td>' + user.department + '</td>' +
                        '<td>' + user.team + '</td>' +
                        '<td>' + user.createDate + '</td>' +

                        '<td>' +
                        '<select class="form-select user-role">' +
                        '<option value="Admin"' + (user.role === 'Admin' ? ' selected' : '') + '>Admin</option>' +
                        '<option value="User"' + (user.role === 'User' ? ' selected' : '') + '>User</option>' +
                        '</select>' +
                        '</td>' +

                        '<td>' + '<a href="/admin/report/' + user.id + '" type="button" class="btn btn-primary report-button" data-user-id="' + user.id + '" style="background-color: #fff; color:#369;    margin-right: 16px; font-weight: bold"><img src="/static/assets/images/yellowGreenblue.svg" style="height: 25px;width: 35px;"></a>    ' + '</td>'+
                        '<td>' +

                        '<button type="button" class="btn btn-danger delete-button"  data-user-id="' + user.staffId + '" onclick="openModalBox(this)" style="position:relative; margin-bottom: 13px;margin-right: 10px;"><i class="fa-solid fa-user-slash" style="color: white;"></i></button>' +
                        '</td>';
                    userList.appendChild(row);
                    $(document).ready(function () {
                        if (!$.fn.DataTable.isDataTable('#myTable')) {
                               var table = $('#myTable').DataTable({
                                   dom: 'Blfrtip',
                                   buttons: [
                                   ]
                               });
                           }
                    });

                    // Attach event listener to the select element
                    row.querySelector('.user-role').addEventListener('change', function() {
                        var selectedRole = this.value;
                        var staffId = this.closest('tr').querySelector('.staff-id').textContent;

                        if (selectedRole === 'User') {
                            // Show the reason modal
                            $('#roleChangeReasonModal').modal('show');

                            // Attach the staffId and role to the modal's submit button
                            var submitButton = document.getElementById('submitReason');
                            submitButton.setAttribute('data-staff-id', staffId);
                            submitButton.setAttribute('data-role', selectedRole);
                        } else {
                            // Directly send the role change request for other roles
                            updateUserRole(staffId, selectedRole, '');
                        }
                    });
                });
            }
                        document.getElementById('submitReason').addEventListener('click', function() {
                            var staffId = this.getAttribute('data-staff-id');
                            var role = this.getAttribute('data-role');
                            var reason = document.getElementById('reason').value;

                            // Send the AJAX request with the reason
                            updateUserRole(staffId, role, reason);

                            // Hide the modal
                            $('#roleChangeReasonModal').modal('hide');
                        });

                        function updateUserRole(staffId, role, reason) {
                            var xhr = new XMLHttpRequest();
                            xhr.open('POST', 'http://localhost:8080/user/updateUserRole');
                            xhr.setRequestHeader('Content-Type', 'application/json');
                            xhr.onload = function() {
                                if (xhr.status === 200) {
                                    console.log('User role updated successfully');
                                } else {
                                    console.error('Error updating user role');
                                }
                            };
                            xhr.onerror = function() {
                                console.error('Network error occurred');
                            };

                            var data = {
                                staffId: staffId,
                                role: role,
                                reason: reason
                            };

                            xhr.send(JSON.stringify(data));
                        }


            /*toast*/
                        // Function to display a toast
                       /* function showToast(message) {
                            Toastify({
                                text: message,
                                duration: 3000,
                                gravity: "top",
                                position: "center",
                                style: {
                                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                                    stopOnFocus: true
                                }
                            }).showToast();
                        }*/


                        function showToast(message) {
                            Toastify({
                                text: message,
                                duration: 3000,
                                gravity: "top",
                                position: "center",
                                style: {
                                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                                    width: "400px",  // Adjust the width as needed
                                    height: "100px",  // Adjust the height as needed
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    textAlign: "center"
                                },
                                className: "toastify-box"
                            }).showToast();
                        }



                        document.getElementById('confirmDeleteButton').addEventListener('click', function() {
                    // Get the user ID from the modal button's data attribute
                    var userId = document.getElementById('deleteUserId').value;

                    // Call the function to delete the user
                    deleteUser(userId);
                });

                // Function to delete the user
                function deleteUser(userId) {
                    // Make a fetch request to delete the user
                    fetch('http://localhost:8080/user/deleteUser/' + userId, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (response.ok) {
	        $('#deleteConfirmationModal').modal('hide');

                document.getElementById('userList').querySelector(`[data-user-id="${userId}"]`).closest('tr').remove();

               /* document.getElementById('success').textContent ='User deleted successfully';*/

                  /*show Toast*/
                            showToast("User deleted successfully");


                    setTimeout(function() {
                            document.getElementById('success').textContent = '';
                        }, 3000);

                            // You can update the UI or perform any other actions as needed
                        } else {
                            // Error handling
                            console.error('Failed to delete user');
                        }
                    })
                    .catch(error => {
                        // Network error
                        console.error('Error:', error);
                    });
                    }
                        fetchAndDisplayUsers();

                });