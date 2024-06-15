'use strict';
document.addEventListener("DOMContentLoaded", options=> {
    document.getElementById('closeBtn').addEventListener('click', function () {
        document.querySelector('.main-container').classList.remove('active');
        document.querySelector('.main-container').classList.add('hidden');
    });
    const notificationToggle = document.getElementById('notification-toggle');
    const usernamePage = document.querySelector('#username-page');
    const messageForm = document.querySelector('#messageForm');
    const messageInput = document.querySelector('#message');
    const chatArea = document.querySelector('#chat-messages');

    const logout = document.querySelector('#logout');
    let notificationCount = 0;
    let stompClient = null;
    let id = null;
    let fullname = null;
    let selectedUserId = null;
    const idInput = document.getElementById("id1");
    id = idInput.value;
    const nameInput = document.getElementById("name");

    fullname = nameInput.value;



    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);


//swm

    let notificationsEnabled = true;
    notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    notificationToggle.checked = notificationsEnabled;

    notificationToggle.addEventListener('change', function () {
        notificationsEnabled = notificationToggle.checked;
        localStorage.setItem('notificationsEnabled', notificationsEnabled);
        const userId = document.getElementById('id1').value;
        fetch(`/user/notification-preference/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notificationsEnabled })
        }).catch(error => console.error('Error updating notification preference:', error));
        // Reload the page to reflect the changes
        location.reload();
    });

    async function fetchAllNotifications(userId) {
        if (!notificationsEnabled) {
            displayNotificationOffMessage()
            return;
        }
            $.ajax({
            url: `/notification/${userId}`,
            type: 'GET',
            success: function (notifications) {
                const notificationList = $('#notification-list');
                notificationList.empty();
                if (notifications.length === 0) {
                    displayNoNotificationMessage();
                } else {
                    notifications.forEach(displayNotification);
                }
                if (notifications.some(noti => !noti.read)) {
                    playNotificationSound();
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching notifications:', error);
            }
        });
    }

    function fetchNotificationCount(userId) {
        if (!notificationsEnabled) return;
        $.ajax({
            url: `/api/notifications/count/${userId}`,
            type: 'GET',
            success: function (count) {
                notificationCount = count;
                updateNotificationCount(0);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching notification count:', error);
            }
        });
    }

    function displayNoNotificationMessage() {
        var noNotificationMessage = $('<li class="dropdown-item no-notification"></li>');
        var messageText = $('<span>').addClass('no-notification-message').text('No notifications');
        noNotificationMessage.append(messageText);
        var notificationList = $('#notification-list');
        notificationList.append(noNotificationMessage);
    }
    function displayNotificationOffMessage() {
        var noNotificationMessage = $('<li class="dropdown-item no-notification"></li>');
        var messageText = $('<span>').addClass('no-notification-message').text('Notification Off');
        noNotificationMessage.append(messageText);
        var notificationList = $('#notification-list');
        notificationList.append(noNotificationMessage);
    }

    function removeNoNotificationMessage() {
        $('#notification-list .no-notification').remove();
    }
    function displayNotification(notification) {
        if (!notificationsEnabled) return;

        removeNoNotificationMessage();

        var notificationItem = $('<li class="dropdown-item"></li>');
        var userPhoto = $('<img>').attr('src', notification.photo).addClass('user-photo');
        var messageText = $('<span>').addClass('notification-message').text(notification.message);
        var timeText = $('<span>').addClass('notification-time').text(formatNotiTime(notification.time));
        var deleteButton = $('<i>').addClass('delete-button fas fa-trash-alt');
        var notificationContent = $('<div>').addClass('notification-content').append(messageText, timeText);
        var notificationWrapper = $('<div>').addClass('notification-wrapper').append(userPhoto, notificationContent, deleteButton);

        notificationItem.append(notificationWrapper);
        notificationItem.attr('id', `notification-item-${notification.id}`);
        notificationItem.click(function (event) {
            if ($(event.target).closest(deleteButton).length === 0) {
                if (notification.type == 'event') {
                    var eventId = notification.eventId;
                    window.location.href = `/user/searchevent?eventId=${eventId}`;
                }  else if(notification.type == 'group'){
                    var groupId = notification.groupId;
                    window.location.href = `/user/searchgroup?groupId=${groupId}`;
                } else if (notification.type == 'birthday') {
                    showBirthdayEffect();
                } else {
                    var contentId = notification.contentId;
                    window.location.href = `/user/searchcontent?contentId=${contentId}`;
                }
            }
        });
        deleteButton.click(function (event) {
            event.stopPropagation();
            deleteNoti(notification.id);
        });

        var notificationList = $('#notification-list');

        // Check if the notification is read or unread
        if (notification.read) {
            // Prepend to "Old Notifications" section
            var oldNotificationsSection = $('#old-notifications-section');
            if (oldNotificationsSection.length === 0) {
                // If "Old Notifications" section does not exist, create it
                oldNotificationsSection = $('<ul id="old-notifications-section"></ul>').addClass('notification-section');
                var oldNotificationsTitle = $('<h4>Old Notifications</h4>');
                notificationList.append(oldNotificationsTitle);
                notificationList.append(oldNotificationsSection);
            }
            oldNotificationsSection.prepend(notificationItem); // Prepend old items to the top
        } else {
            // Prepend to "New Notifications" section
            var newNotificationsSection = $('#new-notifications-section');
            if (newNotificationsSection.length === 0) {
                // If "New Notifications" section does not exist, create it
                newNotificationsSection = $('<ul id="new-notifications-section"></ul>').addClass('notification-section');
                var newNotificationsTitle = $('<h4>New Notifications</h4>');
                notificationList.prepend(newNotificationsSection);
                newNotificationsSection.before(newNotificationsTitle); // Ensure the title is above the section
            }
            newNotificationsSection.prepend(notificationItem);  // Prepend new items to the top
        }

        var notificationListContainer = $('#notification-list-container');
        notificationListContainer.addClass('notification-list-container');

        $('#notification-icon').addClass('show');
    }

    function showBirthdayEffect() {
        // Simple confetti effect using confetti.js library
        if (typeof confetti === 'undefined') {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.4.0/dist/confetti.browser.min.js';
            document.head.appendChild(script);
            script.onload = function() {
                confetti();
            };
        } else {
            confetti();
        }
    }


    function deleteNoti(notificationId) {
        const notificationItem = $(`#notification-item-${notificationId}`);
        notificationItem.addClass('slide-up');

        setTimeout(() => {
            fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        notificationItem.remove();
                        checkAndDisplayNoNotificationMessage();
                        updateNotificationCount(-1);
                    } else {
                        throw new Error('Failed to delete notification');
                    }
                })
                .catch(error => {
                    console.error('Error deleting notification:', error);
                });
        }, 500);
    }

    function checkAndDisplayNoNotificationMessage() {
        var newNotificationsSection = $('#new-notifications-section');
        var oldNotificationsSection = $('#old-notifications-section');

        if (newNotificationsSection.children().length === 0) {
            newNotificationsSection.remove(); // Remove the entire "New Notifications" section
        }
        if (oldNotificationsSection.children().length === 0) {
            oldNotificationsSection.remove(); // Remove the entire "Old Notifications" section
        }

        if ($('#notification-list').children().length === 0) {
            displayNoNotificationMessage();
        }
    }

    function formatNotiTime(createdDate) {
        var postDate = new Date(
            createdDate[0],
            createdDate[1] - 1,
            createdDate[2],
            createdDate[3],
            createdDate[4],
            createdDate[5]
        );
        var currentDate = new Date();
        var timeDifference = currentDate - postDate;
        var secondsDifference = timeDifference / 1000;
        var intervals = {
            yr: 31536000,
            mth: 2592000,
            day: 86400,
            hr: 3600,
            min: 60
        };
        for (var key in intervals) {
            var interval = intervals[key];
            if (secondsDifference >= interval) {
                var value = Math.floor(secondsDifference / interval);
                return value + ' ' + key + (value === 1 ? '' : 's') + ' ago';
            }
        }
        return 'just now';
    }

    function updateNotificationCount(change) {
        notificationCount += change;
        if (notificationCount > 0) {
            $('#notification-count').text(notificationCount).show();
        } else {
            $('#notification-count').hide();
        }
    }

    //swm
    function onConnected() {
        if (notificationsEnabled) {
            stompClient.subscribe(`/user/${id}/queue/messages`, onMessageReceived);
            stompClient.subscribe(`/user/${id}/private-message`, function (message) {
                try {
                    const parsedMessage = JSON.parse(message.body);
                    if (parsedMessage) {
                        updateNotificationCount(1);
                        displayNotification(parsedMessage);
                        playNotificationSound();
                    } else {
                        console.error('Invalid message structure. Missing message content.');
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });
        }
    }
    function playNotificationSound() {
        var notificationSound = document.getElementById('notification-sound');
        notificationSound.play().catch(error => {
            console.error('Error playing notification sound:', error);
        });
    }
    $(document).ready(function () {
        $('#notification-count').hide();
        const userId = document.getElementById('id1').value;
        fetchAllNotifications(userId);
        fetchNotificationCount(userId);
    });

    $('#notification-icon').click(function () {
        notificationCount = 0;
        $('#notification-count').hide();
        // Reset the notification count on the server
        const userId = document.getElementById('id1').value;
        $.ajax({
            url: `/api/notifications/resetcount/${userId}`,
            type: 'POST',
            success: function () {
                console.log('Notification count reset successfully');
            },
            error: function (xhr, status, error) {
                console.error('Error resetting notification count:', error);
            }
        });
    });
    //swm
    // register the connected user
    // document.querySelector('#connected-user-fullname').textContent = fullname;
    findAndDisplayConnectedUsers().then();


      const emojiSelectorIcon = document.getElementById('emojiSelectorIcon');
            const emojiSelector = document.getElementById('emojiSelector');
            const emojiList=document.getElementById('emojiList');
            const emojiSearch=document.getElementById('emojiSearch');
            emojiSelectorIcon.addEventListener('click', () => {
                emojiSelector.classList.toggle('active');
                   fetch('https://emoji-api.com/emojis?access_key=e40cfdf86d4bada254a679a06cf4ef2bfb9efda9')
                            .then(res => res.json())
                            .then(data => loadEmoji(data))

                            function loadEmoji(data) {
                            console.log(data);
                                data.forEach(emoji => {
                                    let li = document.createElement('li');
                                    li.classList.add('emoji-photo')
                                    li.setAttribute('emoji-name',emoji.slug);
                                    li.textContent=emoji.character;

                                    emojiList.appendChild(li);
                                    li.addEventListener('click', () => {
                        messageInput.value += emoji.character;
                                                                      });
                                });
                            }
            });

            emojiSearch.addEventListener('keyup',e=>{
                let value=e.target.value;
                let emojis=document.querySelectorAll('#emojiList li');
                emojis.forEach(emoji =>{
                    if(emoji.getAttribute('emoji-name').toLowerCase().includes(value)){
                        emoji.style.display='flex';
                    }else{
                        emoji.style.display='none';
                    }
                })
            })
    //swm
    async function findAndDisplayConnectedUsers() {
        const connectedUsersResponse = await fetch('/users');
        let connectedUsers = await connectedUsersResponse.json();
        console.log(connectedUsers);
        connectedUsers = connectedUsers.filter(user => user.id != id);
        const connectedUsersList = document.getElementById('connectedUsers');
        connectedUsersList.innerHTML = '';
        connectedUsers.forEach(user => {
            appendUserElement(user, connectedUsersList);
            if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
                const separator = document.createElement('li');
                separator.classList.add('separator');
                connectedUsersList.appendChild(separator);
            }
        });
    }

    function appendUserElement(user, connectedUsersList) {
        const listItem = document.createElement('div');
        listItem.classList.add('online-list');
        listItem.id = user.id;
        const divItem = document.createElement('div');
        divItem.classList.add('online');
        const userImage = document.createElement('img');

        userImage.src = user.photo;
        userImage.style.objectFit='cover';
        userImage.style.height='60px';
        userImage.style.width='60px';
        userImage.style.marginTop='10px';


        userImage.alt = user.name;

        const usernameSpan = document.createElement('p');
        usernameSpan.textContent = user.name;
        usernameSpan.style.marginTop='23px'
        usernameSpan.style.fontFamily='math'
        usernameSpan.style.marginLeft='17px'


        const receivedMsgs = document.createElement('span');
        receivedMsgs.textContent = '0';
        receivedMsgs.classList.add('nbr-msg', 'hidden');
        divItem.appendChild(userImage);
        listItem.appendChild(divItem);
        listItem.appendChild(usernameSpan);
        listItem.appendChild(receivedMsgs);

        listItem.addEventListener('click', userItemClick);
        connectedUsersList.appendChild(listItem)

    }

    function userItemClick(event) {
        document.querySelectorAll('.online-list').forEach(item => {
            document.querySelector('.main-container').classList.remove('hidden');

        });
        const clickedUser = event.currentTarget;
        const userName = clickedUser.querySelector('p').textContent;
        const userImageSrc = clickedUser.querySelector('img').src;
        const chatUserHeading = document.querySelector('.chat-user');
        chatUserHeading.textContent = userName;

        const chatUserImage = document.querySelector('.chat-user-image');
        chatUserImage.src = userImageSrc;

        clickedUser.classList.add('active');

        selectedUserId = clickedUser.getAttribute('id');
        fetchAndDisplayUserChat().then();

        const nbrMsg = clickedUser.querySelector('.nbr-msg');
        nbrMsg.classList.add('hidden');
        nbrMsg.textContent = '0';

    }

    function displayMessage(senderId, content) {
        const messageContainer = document.createElement('div');
        console.log("senderId :" + senderId);
        console.log("id :" + id);
        if (senderId == id) {
            // If the senderId matches the id, it's the sender
            messageContainer.classList.add('received');
        } else {
            // Otherwise, it's the receiver
            messageContainer.classList.add('sent');
        }

        const message = document.createElement('p');
        message.classList.add(senderId == id ? 'received-bubble' : 'sent-bubble');
        // Adding the appropriate class based on the sender

        message.textContent = content;

        // Append the message to the message container
        messageContainer.appendChild(message);

        // Append the message container to the chat area
        chatArea.appendChild(messageContainer);
    }

    async function fetchAndDisplayUserChat() {
        const userChatResponse = await fetch(`/messages/${id}/${selectedUserId}`);
        const userChat = await userChatResponse.json();
        console.log("chatuserChat :" + JSON.stringify(userChat));

        chatArea.innerHTML = '';
        userChat.forEach(chat => {
            console.log("chat sender id :" + chat.senderId)
            console.log("chat content :" + chat.content)
             if (chat.type === 'voice') {
                        displayVoiceMessage(chat.senderId, chat.content,true);
            }else if(chat.type === 'image' || chat.type === 'video'){
            displayPhotoMessage(chat.senderId,chat.content,chat.type);
            }else{
                        displayMessage(chat.senderId, chat.content);
            }
        });
        chatArea.scrollTop = chatArea.scrollHeight;
    }


    function onError() {
        connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
        connectingElement.style.color = 'red';
    }


    function sendMessage(event) {
        const messageContent = messageInput.value.trim();
        console.log(messageContent)
        if (messageContent && stompClient) {
            const chatMessage = {
                senderId: id,
                recipientId: selectedUserId,
                content: messageInput.value.trim(),
                time: new Date(),
                type:'text'
            };
            stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
            displayMessage(id, messageInput.value.trim());
            messageInput.value = '';
        }
        chatArea.scrollTop = chatArea.scrollHeight;
        event.preventDefault();
    }
  const recordButton = document.getElementById('recordButton');
        let mediaRecorder;
        let audioChunks = [];
recordButton.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        // recordButton.textContent = '🎤';
        recordButton.innerHTML = '';

        // Create an img element for the SVG icon
        const img = document.createElement("img");
        img.src = "/static/assets/images/Voice.svg";
        img.alt = "icon";
        img.style.width = "35px";
        img.style.height = "35px";
        img.style.marginRight = "5px";

        // Append the img to the recordButton
        recordButton.appendChild(img);
    } else {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                recordButton.textContent = 'Stop Recording';

                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });

                               mediaRecorder.addEventListener('stop', () => {
                                   const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                                   audioChunks = [];
                                  const localAudioUrl = URL.createObjectURL(audioBlob);
                                    displayVoiceMessage(id, localAudioUrl, true);
                                   sendVoiceMessage(audioBlob);
                               });

            });
    }
});

function sendVoiceMessage(audioBlob) {
    if (stompClient && id) {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64AudioMessage = reader.result.split(',')[1];

            const chatMessage = {
            senderId: id,
            recipientId: selectedUserId,
            content: base64AudioMessage,
            time: new Date(),
            type:'voice'
            };

            stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
        };
    }
}

function displayVoiceMessage(senderId, audioUrl,isLocal) {
    const messageContainer = document.createElement('div');
         if (senderId == id) {
                // If the senderId matches the id, it's the sender
                messageContainer.classList.add('received');
            } else {
                // Otherwise, it's the receiver
                messageContainer.classList.add('sent');
            }

    // Create audio element
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = isLocal ? audioUrl : `data:audio/wav;base64,${audioUrl}`;
    audioElement.classList.add(senderId == id ? 'received-bubble' : 'sent-bubble');

            messageContainer.appendChild(audioElement);

            chatArea.appendChild(messageContainer);
    chatArea.scrollTop = chatArea.scrollHeight;
}
 fileButton.addEventListener('click', () => {
        fileInput1.click();
    });

    fileInput1.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            sendPhoto(event, file);
        }
    });

    async function sendPhoto(event, file = null) {
        event.preventDefault();
        const messageContent = messageInput.value.trim();
        if ((messageContent || file) && stompClient) {
            const chatMessage = {
               senderId: id,
               recipientId: selectedUserId,
               content: messageContent,
               time: new Date(),
               type: file.type.startsWith('image') ? 'image' : 'video'
                                     };

                                     const reader = new FileReader();
                                     reader.onloadend = () => {
                                         chatMessage.content = reader.result.split(',')[1];
                                         stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));

                displayPhotoMessage(id, reader.result,chatMessage.type);
            }
            reader.readAsDataURL(file);

            messageInput.value = '';
        }
    }
    function displayPhotoMessage(senderId, imageUrl,fileType) {
        const messageContainer = document.createElement('div');


         if (senderId == id) {
                       // If the senderId matches the id, it's the sender
                       messageContainer.classList.add('received');
                   } else {
                       // Otherwise, it's the receiver
                       messageContainer.classList.add('sent');
                   }
                    if (fileType === 'image') {
                                      const imageElement = document.createElement('img');
                                      imageElement.src = imageUrl;
                                      imageElement.style.maxWidth = '200px';
                                      imageElement.style.maxHeight = '200px';
                                              imageElement.classList.add(senderId == id ? 'received-bubble' : 'sent-bubble');

                                      messageContainer.appendChild(imageElement);
                                  } else if (fileType === 'video') {
                                      const videoElement = document.createElement('video');
                                      videoElement.src = imageUrl;
                                      videoElement.controls = true;
                                      videoElement.style.maxWidth = '200px';
                                      videoElement.style.maxHeight = '200px';
                                              videoElement.classList.add(senderId == id ? 'received-bubble' : 'sent-bubble');

                                      messageContainer.appendChild(videoElement);
                                  }
        chatArea.appendChild(messageContainer);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    async function onMessageReceived(payload) {
        await findAndDisplayConnectedUsers(); // Wait for the function to complete
        const message = JSON.parse(payload.body);
        let id = message.senderId;
        console.log('Message received', message);
        console.log('Message', message.senderId);

        console.log("selectId :" + selectedUserId)
        if (selectedUserId && selectedUserId == message.senderId) {
          if (message.type === 'voice') {
                                        displayVoiceMessage(message.senderId, message.content,true);
                                    } else if (message.type === 'image' || message.type === 'video' ) {
                                        const fileType = message.type;
                                        displayPhotoMessage(message.senderId,message.content,fileType);

                                                 }else{
                                                   displayMessage(message.senderId, message.content);
                                                    chatArea.scrollTop = chatArea.scrollHeight;
                                                 }

        }

        if (selectedUserId) {
            document.getElementById(`${selectedUserId}`).classList.add('active');
        } else {
            messageForm.classList.add('hidden');
        }
        const notifiedUser = document.getElementById(`${id}`);
        console.log('notifiedUser :' + JSON.stringify(notifiedUser))

        if (notifiedUser && !notifiedUser.classList.contains('active')) {
            const nbrMsg = notifiedUser.querySelector('.nbr-msg');
            nbrMsg.classList.remove('hidden');
            nbrMsg.textContent = '';
        }
    }


    messageForm.addEventListener('submit', sendMessage, true);

})
