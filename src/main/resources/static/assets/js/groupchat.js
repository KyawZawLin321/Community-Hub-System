    document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.querySelector('#messageForm');
    const messageInput = document.querySelector('#message');
    const connectingElement = document.querySelector('.connecting');
    const chatArea = document.querySelector('#chat-messages');
        const fileInput = document.querySelector('#fileInput');
        const fileButton = document.querySelector('#fileButton');
    let stompClient = null;
    let id = null;
    let username=null;
    let selectedRoomId = null;
     const idInput = document.getElementById("id1");
        id = idInput.value;
        username=document.getElementById("name").value;
    const  connectWebSocket = () => {
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected, onError);
    }

    findAndDisplayConnectedUsers().then();
    const onConnected = () => {
        stompClient.subscribe(`/user/${selectedRoomId}/queue/messages`, onMessageReceived);
    }
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

    async function  findAndDisplayConnectedUsers() {
        const response = await fetch('/roomList');
        let connectedRooms = await response.json();
        console.log(connectedRooms)
        const connectedUsersList = document.getElementById('connectedUsers');
        connectedUsersList.innerHTML = '';
            connectedRooms = connectedRooms.filter(room => room.status != false);
            console.log("filter :"+connectedRooms)
        connectedRooms.forEach(room => {
            appendUserElement(room, connectedUsersList);
            if (connectedRooms.indexOf(room) < connectedRooms.length - 1) {
                const separator = document.createElement('li');
                separator.classList.add('separator');
                connectedUsersList.appendChild(separator);
            }
        });
    }
    function appendUserElement(room, connectedUsersList) {
        const listItem = document.createElement('li');
        listItem.classList.add('user-item');
        listItem.id = room.id;
        listItem.setAttribute('name', room.name);

        const userImage = document.createElement('img');
        userImage.src = room.photo;
        userImage.alt = room.name;

        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = room.name;

        const receivedMsgs = document.createElement('span');
        receivedMsgs.textContent = '0';
        receivedMsgs.classList.add('nbr-msg', 'hidden');
        listItem.appendChild(userImage);
        listItem.appendChild(usernameSpan);
        listItem.appendChild(receivedMsgs);
        listItem.addEventListener('click', userItemClick);
        connectedUsersList.appendChild(listItem);
    }

    function userItemClick(event) {
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('active');
        });

        const clickedUser = event.currentTarget;
        clickedUser.classList.add('active');

        selectedRoomId = clickedUser.getAttribute('id');
            fetch(`/group/${selectedRoomId}/selectedUsers`)
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
                                const h3Tag=document.createElement('h4');
                                h3Tag.innerHTML=`Group Member(${data.length})`;

                            h3Tag.style.fontFamily = 'Math'; // Example font family
                            h3Tag.style.marginBottom = '20px'; // Example margin bottom

                                const userDetailsContainer = document.getElementById('GroupUserList');
                                userDetailsContainer.innerHTML = ''; // Clear previous details
                                userDetailsContainer.appendChild(h3Tag);
                                data.forEach(user => {
                                    const userDiv = document.createElement('div');
                                    userDiv.classList.add('user-detail-item', 'd-flex', 'align-items-center', 'mb-3');
                                    const userImage = document.createElement('img');
                                    userImage.src = user.photo;
                                    userImage.style.width = '50px';
                                    userImage.style.height = '50px';
                                    userImage.style.borderRadius = '50%';
                                    userImage.style.marginRight = '10px';
                                    userDiv.appendChild(userImage);

                                    const userNameSpan = document.createElement('span');
                                    userNameSpan.textContent = user.name;
                                    userNameSpan.style.fontSize = '16px';
                                    userNameSpan.style.fontWeight = 'bold';
                                    userNameSpan.style.fontFamily = 'math';

                                    userDiv.appendChild(userNameSpan);
                                    userDetailsContainer.appendChild(userDiv);

                    })
                    })
        console.log(selectedRoomId);
        if(selectedRoomId){
            connectWebSocket();
        }
        chatArea.innerHTML = "";
        fetchAndDisplayUserChat().then();

        const nbrMsg = clickedUser.querySelector('.nbr-msg');
        nbrMsg.classList.add('hidden');
        nbrMsg.textContent = '0';

        if (!selectedRoomId) {
            messageForm.classList.add('hidden');
        } else {
            messageForm.classList.remove('hidden');
        }
    }

function formatTime(time) {
    // Create a new Date object from the time variable
    const date = new Date(time);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        console.error('Invalid time:', time);
        return ''; // Return an empty string or some default value
    }

    // Format the date and time
    return date.toLocaleString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
}

function displayMessage(senderId, content, time, name,type,messageId) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    const timeSpan = document.createElement('span');
    const senderName = document.createElement('span');
    const menuButton = document.createElement('button'); // Menu button
    const menu = document.createElement('div'); // Menu container

    timeSpan.classList.add('message-time');
    senderName.classList.add('message-name');

    if (senderId == id) {
        messageContainer.classList.add('sender');
        timeSpan.style.alignSelf = 'flex-end';
        senderName.style.alignSelf = 'flex-end';
    } else {
        messageContainer.classList.add('receiver');

        timeSpan.style.alignSelf = 'flex-start';
        senderName.style.alignSelf = 'flex-start';
    }
        const message = document.createElement('p');
    if(type=="delete"){
            message.textContent="This message was removed";
                    message.style.fontStyle = 'italic';
                    message.style.color = '#726969';
                    message.style.marginBottom='6px';

                        senderName.textContent = name;
                        timeSpan.textContent = formatTime(time);
                    messageContainer.style.display="flex";
                        // Add options to the menu
                        messageContainer.appendChild(message);
    }else if(type ==="edit"){
        message.id = messageId;
                senderName.textContent = name;
                timeSpan.textContent = formatTime(time);
                message.textContent = content+" (edited)";
            messageContainer.style.display="flex";
                // Add options to the menu


                messageContainer.appendChild(message);
    }else{
    message.id = messageId;
        senderName.textContent = name;
        timeSpan.textContent = formatTime(time);
        message.textContent = content;
    messageContainer.style.display="flex";
        // Add options to the menu


        messageContainer.appendChild(message);
    }


if(senderId==id && type !=="delete"){
    menuButton.classList.add('menu-button');
    menu.classList.add('menu');
    menuButton.style.marginBottom="13px";
    // menuButton.textContent = '⋮'; // Three dots
    // Create an img element
    const img = document.createElement("img");
    img.src = "/static/assets/images/dot.svg";
    img.alt = "icon";
    img.style.width = "20px";
    img.style.height = "20px";
    img.style.marginRight = "5px";
    img.style.backgroundColor="#b9b9b9";
    img.style.borderRadius="5px";
    img.style.height="32px";

    // Append the img to the menu button
    menuButton.appendChild(img);

const deleteOption = document.createElement('div');
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas', 'fa-trash-alt');
    deleteIcon.style.color = 'red'; // Set the color directly
    deleteIcon.style.height= '20px';
    deleteIcon.style.width= '20px';
    deleteOption.appendChild(deleteIcon);

    deleteOption.addEventListener('click', () => {
    menuButton.style.display="none";
    menu.style.display="none";
    deleteMessage(messageId);
    })

    const editOption = document.createElement('div');
            const editIcon = document.createElement('i');
            editIcon.classList.add('fas', 'fa-edit');
    editIcon.style.color = '#369';
    editIcon.style.height= '20px';
    editIcon.style.width= '20px';

    editOption.appendChild(editIcon);

    editOption.addEventListener('click', () => {
    menuButton.style.display="none";
        menu.style.display="none";
    editMessage(messageId, content,type);
    })

    menu.appendChild(deleteOption);
    menu.appendChild(editOption);

    menuButton.addEventListener('click', () => {
        menu.classList.toggle('visible');
    });
     messageContainer.appendChild(menuButton);
        messageContainer.appendChild(menu);
}
    chatArea.appendChild(messageContainer);
    chatArea.appendChild(senderName);
    chatArea.appendChild(timeSpan);
    chatArea.scrollTop = chatArea.scrollHeight;
}
function deleteMessage(messageId) {
    if (stompClient && selectedRoomId) {
        const chatMessage = {
            roomId: selectedRoomId,
            id: messageId,
            type: 'delete'
        };
        stompClient.send("/app/message-delete", {}, JSON.stringify(chatMessage));
    }
}
function editMessage(messageId, oldContent,type) {
    const messageElement = document.getElementById(messageId);
    if (!messageElement) return;

    // Create an input field pre-filled with the old message content
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = oldContent;
    inputField.classList.add('edit-input');

    // Create a save button
    const saveButton = document.createElement('button');
        const saveIcon = document.createElement('i');
        saveIcon.classList.add('fas', 'fa-check');
        saveButton.appendChild(saveIcon);
    saveButton.classList.add('save-button');
    saveButton.addEventListener('click', () => {
        const newContent = inputField.value.trim();
        if (newContent && newContent !== oldContent) {
            if (stompClient && selectedRoomId) {
                const chatMessage = {
                    roomId: selectedRoomId,
                    id: messageId,
                    content: newContent,
                    type: 'edit'
                };
                stompClient.send("/app/chat-editMessage", {}, JSON.stringify(chatMessage));
//                updateMessageInUI(messageId, newContent);
            }
        } else {
            // If the content hasn't changed, just revert to the original message view
            revertToMessageView(messageId, oldContent,type);
        }
    });

    // Create a cancel button
    const cancelButton = document.createElement('button');
        const cancelIcon = document.createElement('i');
        cancelIcon.classList.add('fas', 'fa-times');
        cancelButton.appendChild(cancelIcon);

    cancelButton.classList.add('cancel-button');
    cancelButton.addEventListener('click', () => {
        revertToMessageView(messageId, oldContent,type);
    });

    // Clear the existing content and append the input field, save button, and cancel button
    messageElement.innerHTML = '';
    messageElement.appendChild(inputField);
    messageElement.appendChild(saveButton);
    messageElement.appendChild(cancelButton);
}

    function revertToMessageView(messageId, oldContent,type) {
        const messageElement = document.getElementById(messageId);
                if (messageElement) {
                    if (type === 'text' ) {
                        messageElement.innerHTML = oldContent;
                    }else if(type ==='edit'){
                        messageElement.innerHTML=oldContent +" (edited)";
                    }
                     else if (type === 'image' || type === 'video') {
                        const mediaElement = document.createElement(type === 'image' ? 'img' : 'video');
                        mediaElement.src = oldContent;
                        if (type === 'video') mediaElement.controls = true;
                        mediaElement.style.maxWidth = '200px';
                        mediaElement.style.maxHeight = '200px';
                        messageElement.innerHTML = '';
                        messageElement.appendChild(mediaElement);
                    }

                    // Re-add the edit and delete options
                    const menuButton = document.createElement('button');
                    const menu = document.createElement('div');

                    menuButton.classList.add('menu-button');
                    menu.classList.add('menu');
                    menuButton.style.marginBottom = "13px";
                    // menuButton.textContent = '⋮'; // Three dots
                    const img = document.createElement("img");
                    img.src = "/static/assets/images/dot.svg";
                    img.alt = "icon";
                    img.style.width = "20px";
                    img.style.height = "20px";
                    img.style.marginRight = "5px";
                    img.style.backgroundColor="#b9b9b9";
                    img.style.borderRadius="5px";
                    img.style.height="32px";

                    // Append the img to the menu button
                    menuButton.appendChild(img);


                    const deleteOption = document.createElement('div');
const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas', 'fa-trash-alt');
        deleteIcon.style.color='red';
        deleteOption.appendChild(deleteIcon);
                    deleteOption.addEventListener('click', () => {
                        menuButton.style.display = "none";
                        menu.style.display = "none";
                        deleteMessage(messageId);
                    });

                    const editOption = document.createElement('div');
  const editIcon = document.createElement('i');
            editIcon.classList.add('fas', 'fa-edit');
            editIcon.style.color='#369';
            editOption.appendChild(editIcon);
                    editOption.addEventListener('click', () => {
                        menuButton.style.display = "none";
                        menu.style.display = "none";
                        editMessage(messageId, oldContent, type);
                    });

                    menu.appendChild(deleteOption);
                    menu.appendChild(editOption);

                    menuButton.addEventListener('click', () => {
                        menu.classList.toggle('visible');
                    });

                    messageElement.appendChild(menuButton);
                    messageElement.appendChild(menu);
                }
            }
    async function fetchAndDisplayUserChat() {
        const userChatResponse = await fetch(`/messages/${selectedRoomId}`);
        const userChat = await userChatResponse.json();
        chatArea.innerHTML = '';
        userChat.forEach(chat => {
        if (chat.type === 'voice') {
            displayVoiceMessage(chat.senderId, chat.content, chat.time, chat.name,chat.type,chat.id);
        } else if(chat.type ==='image' || chat.type === 'video' || chat.type ==='editimage' || chat.type === 'editvideo'){
            displayPhotoMessage(chat.senderId, chat.content, chat.time, chat.name,chat.type,chat.id)

        }
        else {
            displayMessage(chat.senderId, chat.content, chat.time, chat.name,chat.type,chat.id);
        }
    });

        chatArea.scrollTop = chatArea.scrollHeight;
    }
    function onError() {
        connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
        connectingElement.style.color = 'red';
    }
        const recordButton = document.getElementById('recordButton');
        let mediaRecorder;
        let audioChunks = [];
recordButton.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordButton.textContent = '🎤 Record';
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
                                    //displayVoiceMessage(id, localAudioUrl, new Date(), username, true);

                                   sendVoiceMessage(audioBlob);
                               });

            });
    }
});

function sendVoiceMessage(audioBlob) {
    if (stompClient && selectedRoomId) {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64AudioMessage = reader.result.split(',')[1];

            const chatMessage = {
                roomId: selectedRoomId,
                senderId: id,
                name: username,
                content: base64AudioMessage,
                time: new Date(),
                type: 'voice'
            };

            stompClient.send("/app/group-chat", {}, JSON.stringify(chatMessage));
        };
    }
}

function displayVoiceMessage(senderId, audioUrl, time,name,type,messageId) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    const timeSpan = document.createElement('span');
    const senderName = document.createElement('span');
    timeSpan.classList.add('message-time');
    senderName.classList.add('message-name');
      const menuButton = document.createElement('button'); // Menu button
        const menu = document.createElement('div');

    if (senderId == id) {
        messageContainer.classList.add('sender');
        messageContainer.style.fontFamily = 'math';

        timeSpan.style.alignSelf = 'flex-end';
        senderName.style.alignSelf = 'flex-end';
    } else {
        messageContainer.classList.add('receiver');
        messageContainer.style.fontFamily = 'math';
        timeSpan.style.alignSelf = 'flex-start';
        senderName.style.alignSelf = 'flex-start';
    }
            const message = document.createElement('p');

     if(type=="delete"){
                message.textContent="This message was removed";
                        message.style.fontStyle = 'italic';
                        message.style.color = 'gray';
                            senderName.textContent = name;
                            timeSpan.textContent = formatTime(time);
                        messageContainer.style.display="flex";
                            // Add options to the menu
                            messageContainer.appendChild(message);
        }else{
          const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src =audioUrl;
            audioElement.id=messageId;
            senderName.textContent = name;
            senderName.style.fontFamily='math';
            timeSpan.textContent = formatTime(time);
            timeSpan.style.fontFamily = 'math'; // Assuming formatTime is a function to format the time

            // Append audio player to the message container
            messageContainer.appendChild(audioElement);

        }
    if(senderId==id && type !=="delete"){
        menuButton.classList.add('menu-button');
        menu.classList.add('menu');
        menuButton.style.marginBottom="13px";
        // menuButton.textContent = '⋮'; // Three dots
        const img = document.createElement("img");
        img.src = "/static/assets/images/dot.svg";
        img.alt = "icon";
        img.style.width = "20px";
        img.style.height = "20px";
        img.style.marginRight = "5px";
        img.style.backgroundColor="#b9b9b9";
        img.style.borderRadius="5px";
        img.style.height="32px";

        // Append the img to the menu button
        menuButton.appendChild(img);

        menu.style.width="65px";
        menu.style.marginLeft="240px";
    const deleteOption = document.createElement('div');
        const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('fas', 'fa-trash-alt');
                deleteIcon.style.color='red';
        deleteOption.appendChild(deleteIcon);
        deleteOption.addEventListener('click', () => {
        menuButton.style.display="none";
        menu.style.display="none";
        deleteMessage(messageId);
        })

        menu.appendChild(deleteOption);
        menuButton.addEventListener('click', () => {
            menu.classList.toggle('visible');
        });
         messageContainer.appendChild(menuButton);
            messageContainer.appendChild(menu);
    }
    // Create audio element

    chatArea.appendChild(messageContainer);
    chatArea.appendChild(senderName);
     chatArea.appendChild(timeSpan);
    chatArea.scrollTop = chatArea.scrollHeight;
}


    fileButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
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
                            roomId: selectedRoomId,
                            senderId: id,
                            name: username,
                            content: '',
                            time: new Date(),
                            type: file.type.startsWith('image') ? 'image' : 'video'
                        };

                        const reader = new FileReader();
                        reader.onloadend = () => {
                            chatMessage.content = reader.result.split(',')[1];
                            stompClient.send("/app/group-chat", {}, JSON.stringify(chatMessage));
                            //displayPhotoMessage(id, reader.result, new Date(), username, chatMessage.type);
                        };
                        reader.readAsDataURL(file);

                        messageInput.value = '';
                    }
                }

    function displayPhotoMessage(senderId, imageUrl, time, name,fileType,messageId) {
               const messageContainer = document.createElement('div');
               messageContainer.classList.add('message');
               const timeSpan = document.createElement('span');
               const senderName = document.createElement('span');
               timeSpan.classList.add('message-time');
               senderName.classList.add('message-name');

               if (senderId == id) {
                   messageContainer.classList.add('sender');
                   timeSpan.style.alignSelf = 'flex-end';
                   senderName.style.alignSelf = 'flex-end';
               } else {
                   messageContainer.classList.add('receiver');
                   timeSpan.style.alignSelf = 'flex-start';
                   senderName.style.alignSelf = 'flex-start';
               }

               if (fileType === 'image') {
                   const imageElement = document.createElement('img');
                   imageElement.src = imageUrl;
                   imageElement.id = messageId;

                   imageElement.style.maxWidth = '200px';
                   imageElement.style.maxHeight = '200px';
                   messageContainer.appendChild(imageElement);
               } else if (fileType === 'video') {
                   const videoElement = document.createElement('video');
                   videoElement.src = imageUrl;
                   videoElement.controls = true;
                   videoElement.id = messageId;

                   videoElement.style.maxWidth = '200px';
                   videoElement.style.maxHeight = '200px';
                   messageContainer.appendChild(videoElement);
               }
               if (fileType === 'editimage') {
                                  const imageElement = document.createElement('img');
                                  imageElement.src = imageUrl;
                                  imageElement.id = messageId;

                                  imageElement.style.maxWidth = '200px';
                                  imageElement.style.maxHeight = '200px';
                                  messageContainer.appendChild(imageElement);
                              } else if (fileType === 'editvideo') {
                                  const videoElement = document.createElement('video');
                                  videoElement.src = imageUrl;
                                  videoElement.controls = true;
                                  videoElement.id = messageId;

                                  videoElement.style.maxWidth = '200px';
                                  videoElement.style.maxHeight = '200px';
                                  messageContainer.appendChild(videoElement);
                              }

               senderName.textContent = name;
               timeSpan.textContent = formatTime(time);
                       if (senderId == id && fileType !== "delete") {
                           const menuButton = document.createElement('button');
                           menuButton.classList.add('menu-button');
                           const menu = document.createElement('div');
                           menu.classList.add('menu');
                           menuButton.style.marginBottom = "13px";
                           // menuButton.textContent = '⋮'; // Three dots
                           const img = document.createElement("img");
                           img.src = "/static/assets/images/dot.svg";
                           img.alt = "icon";
                           img.style.width = "20px";
                           img.style.height = "20px";
                           img.style.marginRight = "5px";
                           img.style.backgroundColor="#b9b9b9";
                           img.style.borderRadius="5px";
                           img.style.height="32px";

                           // Append the img to the menu button
                           menuButton.appendChild(img);
                           menu.style.width="65px";
                           menu.style.marginLeft="149px";
                           const deleteOption = document.createElement('div');
                           const deleteIcon = document.createElement('i');
                                   deleteIcon.classList.add('fas', 'fa-trash-alt');
                           deleteIcon.style.color='red';

                           deleteOption.appendChild(deleteIcon);
                           deleteOption.addEventListener('click', () => {
                             //  menuButton.style.display = "none";
                            //   menu.style.display = "none";
                               deleteMessage(messageId);
                           });

                           const editOption = document.createElement('div');
                            const editIcon = document.createElement('i');
                                       editIcon.classList.add('fas', 'fa-edit');
                           editIcon.style.color = '#369';

                           editOption.appendChild(editIcon);
                           editOption.addEventListener('click', () => {
                           //    menuButton.style.display = "none";
                            //   menu.style.display = "none";
                               triggerFileInput(messageId, imageUrl, fileType);
                           });

                           menu.appendChild(deleteOption);
                           menu.appendChild(editOption);

                           menuButton.addEventListener('click', () => {
                               menu.classList.toggle('visible');
                           });

                           messageContainer.appendChild(menuButton);
                           messageContainer.appendChild(menu);
                       }

               chatArea.appendChild(messageContainer);
               chatArea.appendChild(senderName);
               chatArea.appendChild(timeSpan);
               chatArea.scrollTop = chatArea.scrollHeight;
           }
        function triggerFileInput(messageId, oldContent, fileType) {
            const fileInput = document.getElementById('editFileInput');
            fileInput.value = ''; // Reset file input
            fileInput.style.display = 'block';
            const messageElement=document.getElementById(messageId);
            fileInput.onchange = () => {
                const file = fileInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const newContent = reader.result.split(',')[1];
                        const newFileType = file.type.startsWith('image/') ? 'image' : 'video';
                        sendEditMessage(messageId, newContent, newFileType);
                        fileInput.style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('cancel-button');
        cancelButton.addEventListener('click', () => {
            revertToMessageView(messageId, oldContent, fileType);
           // fileInput.style.display = 'none';
        });

        messageElement.innerHTML = 'Select a new file to upload:';
        messageElement.appendChild(fileInput);
        messageElement.appendChild(cancelButton);
        fileInput.click(); // Open file input dialog
    }

    // Function to send the edited message to the server
    function sendEditMessage(messageId, newContent, type) {
        if (stompClient && selectedRoomId) {
            const chatMessage = {
                roomId: selectedRoomId,
                id: messageId,
                content: newContent,
                type:'edit'+type,
            };
            stompClient.send("/app/chat-editMessage", {}, JSON.stringify(chatMessage));
        }
    }


    function sendMessage(event) {
        const messageContent = messageInput.value.trim();
                console.log("Emoji :"+messageContent)

        if (messageContent && stompClient) {

            const chatMessage = {
                roomId: selectedRoomId,
                senderId:id,
                name:username,
                content: messageContent,
                time: new Date(),
                type:'text'
            };
            const message=stompClient.send("/app/group-chat", {}, JSON.stringify(chatMessage));
            console.log(JSON.stringify("message :" +message));
          //  displayMessage(id, messageInput.value.trim(),new Date(),username);
            messageInput.value = '';
        }
        chatArea.scrollTop = chatArea.scrollHeight;
        event.preventDefault();
    }

    let unreadMessages = {};

    async function onMessageReceived(payload) {
           // await fetchAndDisplayUserChat();
            console.log('Message received', payload);
            const message = JSON.parse(payload.body);
          //  if(message.senderId != id) {
          if(message.type =="delete"){
            removeMessageFromUI(message.id);
            }else if (message.type === 'edit' || message.type==='editvideo' || message.type==='editimage' ) {
                     updateMessageInUI(message.id, message.content,message.type,message.senderId);
            }

            else{
                            if (message.type === 'voice') {
                                displayVoiceMessage(message.senderId, message.content, message.time, message.name,message.type,message.id);
                            } else if (message.type === 'image' || message.type === 'video') {
                                const fileType = message.type;
                                displayPhotoMessage(message.senderId,message.content, message.time, message.name, fileType,message.id);
                            } else {
                                displayMessage(message.senderId, message.content, message.time, message.name,message.type,message.id);
                            }

         //   }
        const notifiedUser = document.getElementById(`${message.roomId}`);
        console.log('notifiedUser :'+JSON.stringify(notifiedUser))
        if (notifiedUser &&  message.senderId != id) {
            const nbrMsg = notifiedUser.querySelector('.nbr-msg');
            nbrMsg.classList.remove('hidden');
            nbrMsg.textContent = '';
            await fetchAndDisplayUserChat();
        }
    }
}

    messageForm.addEventListener('submit', sendMessage, true);


function removeMessageFromUI(messageId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        const messageContainer = messageElement.closest('.message');
        if (messageContainer) {
            messageContainer.innerHTML = `
                <p style="font-style: italic; color: gray;">This message was removed</p>
            `;
        }
    }
}
function updateMessageInUI(messageId, newContent, fileType,senderId) {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {


        if (fileType === 'editimage' || fileType === 'editvideo') {
            // Create a new media element based on the fileType
            const newMediaElement = document.createElement(fileType === 'editimage' ? 'img' : 'video');
            newMediaElement.src = newContent;
            newMediaElement.controls = true;
            newMediaElement.style.maxWidth = '200px';
            newMediaElement.style.maxHeight = '200px';
            newMediaElement.id = messageId; // Set the id attribute

            // Replace the existing message element with the new media element
            messageElement.parentNode.replaceChild(newMediaElement, messageElement);
        } else {
            // Update text content for other types of messages
            messageElement.textContent = newContent + ' (edited)';
        }
        if(senderId ==id){
                    const editButton = messageElement.querySelector('.menu-button');
                        const menuButton = document.createElement('button');
                        menuButton.classList.add('menu-button');
                        // menuButton.textContent = '⋮'; // Three dots
            const img = document.createElement("img");
            img.src = "/static/assets/images/dot.svg";
            img.alt = "icon";
            img.style.width = "20px";
            img.style.height = "20px";
            img.style.marginRight = "5px";
            img.style.backgroundColor="#b9b9b9";
            img.style.borderRadius="5px";
            img.style.height="32px";

            // Append the img to the menu button
            menuButton.appendChild(img);

                         menuButton.style.marginBottom="13px";

                        const editOption = document.createElement('div');
                         const editIcon = document.createElement('i');
                                    editIcon.classList.add('fas', 'fa-edit');
                                    editOption.appendChild(editIcon);
                        editOption.addEventListener('click', () => {
                            menuButton.style.display = "none";
                            menu.style.display = "none";
                            editMessage(messageId, newContent, fileType);

                        });
                         const deleteOption = document.createElement('div');
                            const deleteIcon = document.createElement('i');
                                    deleteIcon.classList.add('fas', 'fa-trash-alt');
                                     deleteIcon.style.color='red';

            deleteOption.appendChild(deleteIcon);
                                    deleteOption.addEventListener('click', () => {
                                    menuButton.style.display="none";
                                    menu.style.display="none";
                                    deleteMessage(messageId);
                                    })

                        const menu = document.createElement('div');
                        menu.classList.add('menu');
                        menu.appendChild(editOption);
                        menu.appendChild(deleteOption);

                        menuButton.addEventListener('click', () => {
                            menu.classList.toggle('visible');
                        });
                        messageElement.appendChild(menuButton);
                        messageElement.appendChild(menu);
        }

        // Re-add the edit and delete options
        // Add your existing code to append options menu here
    }
}

});