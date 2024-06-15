//swm-comment//
const stompClient2 = Stomp.over(new SockJS('/ws'));

// Establish WebSocket connection
stompClient2.connect({}, function(frame) {
    console.log('Connected to the Comment WebSocket server');
});
// Function to subscribe to comment topic
const searchUserId=document.getElementById('id1').value;

let commentSubscription;
function subscribeToCommentTopic(contentId,postElement) {
    if (!commentSubscription) {
        commentSubscription = stompClient2.subscribe(`/user/public/${contentId}`, function (message) {
            const comment = JSON.parse(message.body);
            console.log('Received comment:', comment);
            fetch('/user/current-user')
                .then(response => response.json())
                .then(currentUser => {
                    console.log("received user data"+currentUser);
                    displayComment(comment, postElement, currentUser);
                })
                .catch(error => console.error('Error fetching current user:', error));

        });
    }
}
function unsubscribeFromCommentTopic() {
    if (commentSubscription) {
        commentSubscription.unsubscribe();
        commentSubscription = null;
    }
}
const loadExistingComments = (contentId,post) => {
    // Make a request to fetch existing comments
    fetch(`/api/comment/${contentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch existing comments');
            }
            return response.json();
        })
        .then(existingComments => {
            console.log('Existing comments:', existingComments);
            existingComments.forEach(comment =>
                fetch('/user/current-user')
                    .then(response => response.json())
                    .then(currentUser => {
                        // Now you have the current user information
                        // Call your displayComment function passing currentUser
                        console.log("received user data"+currentUser);
                        displayComment(comment, post, currentUser);
                    })
                    .catch(error => console.error('Error fetching current user:', error))

            )
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

function displayReply(reply, commentId,currentUser) {
    const isLiked = localStorage.getItem(`reply-${reply.id}-liked-reply-${currentUser.id}`);
    fetch(`/user/users/${reply.userId}`)
        .then(response => response.json())
        .then(user => {
            const commentElement = document.getElementById(`comment-${commentId}`);
            if (commentElement) {
                let replyContainer = commentElement.querySelector('.container-reply');
                if (!replyContainer) {
                    replyContainer = document.createElement('div');
                    replyContainer.classList.add('container-reply');
                    commentElement.appendChild(replyContainer);
                }

                // Create reply element
                const replyElement = document.createElement('div');
                replyElement.classList.add('reply');
                replyElement.id = `reply-${reply.id}`;
                // User Photo
                const photo = document.createElement('img');
                photo.src = user.photo;
                photo.alt = user.name;
                photo.classList.add('user-photo');
                replyElement.appendChild(photo);

                // User Name
                const userName = document.createElement('span');
                userName.textContent = user.name;
                userName.classList.add('user-name');
                replyElement.appendChild(userName);

                const likeIcon = document.createElement('i');
                likeIcon.classList.add('fas', 'fa-heart');
                likeIcon.id = `like-icon-reply-${reply.id}`;
                if (isLiked === 'true') {
                    likeIcon.classList.add('liked-reply');
                }

                const replyIcon = document.createElement('span');
                replyIcon.textContent = '↩️';
                replyIcon.classList.add('reply-icon');
                // Delete Icon
                const deleteIcon1 = document.createElement('span');
                deleteIcon1.textContent = '❌';
                deleteIcon1.classList.add('delete-icon');
                // Edit Icon
                const editIcon1 = document.createElement('span');
                editIcon1.textContent = '✏️';
                editIcon1.classList.add('edit-icon');

                const iconsContainer2 = document.createElement('div');
                iconsContainer2.classList.add('icons-container-reply');
                const isReplyOwner = (reply.userId === String(currentUser.id));

                iconsContainer2.appendChild(replyIcon);
                iconsContainer2.appendChild(likeIcon);
                if (isReplyOwner) {
                    console.log("User is the owner of reply. Icons should be displayed.");
                    iconsContainer2.appendChild(editIcon1);
                    iconsContainer2.appendChild(deleteIcon1);
                }
                replyElement.appendChild(iconsContainer2);

                const timeElement = document.createElement('span');
                timeElement.textContent = formatCommentTime(reply.time);
                timeElement.classList.add('reply-time');
                replyElement.appendChild(timeElement);
                // Reply Text
                const replyText = document.createElement('p');
                replyText.textContent = reply.reply ? reply.reply : 'No reply available';
                replyText.classList.add('comment-text');
                replyText.innerHTML = reply.reply.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
                    return `<span class="mention">${mention}</span>`;
                });
                replyElement.appendChild(replyText);
                // Add event listener to reply icon
                let isReplyOpen = false;

                // Add event listener to reply icon
                replyIcon.addEventListener('click', () => {
                    if (!isReplyOpen) {
                        const replyBoxContainer = document.createElement('div');
                        replyBoxContainer.classList.add('reply-box-container');
                        replyBoxContainer.style.display = 'flex';
                        replyBoxContainer.style.alignItems = 'center';

                        const messageBox = document.createElement('textarea');
                        messageBox.setAttribute('placeholder', 'Write your reply here...');
                        messageBox.classList.add('reply-message-box');
                        messageBox.style.flexGrow = '1';

                        const submitButton = document.createElement('button');
                        submitButton.classList.add('reply-submit-button');
                        const submitIcon = document.createElement('i');
                        submitIcon.classList.add('fas', 'fa-paper-plane');
                        submitButton.appendChild(submitIcon);

                        submitButton.addEventListener('click', () => {
                            const replyText = messageBox.value.trim();
                            if (replyText.length > 0) {
                                console.log('Reply submitted:', replyText);
                                sendReply(commentId, reply.contentId, reply.userId, replyText);
                                replyElement.removeChild(replyBoxContainer);
                                subscribeToReplyTopic(reply.contentId);
                                messageBox.value = '';
                            }
                        });

                        replyBoxContainer.appendChild(messageBox);
                        replyBoxContainer.appendChild(submitButton);
                        replyElement.appendChild(replyBoxContainer);

                        loadExistingReplies(reply.contentId, reply.id);
                        replyElement.classList.add('reply-open');
                        isReplyOpen = true;
                        const tribute = new Tribute({
                            values: (text, cb) => {
                                fetch(`/user/search?q=${text}`)
                                    .then(response => response.json())
                                    .then(users => {
                                        if (users.length === 0) {
                                            cb([]);
                                        } else {
                                            cb(users.map(user => ({
                                                key: user.key,
                                                value: user.value,
                                                userId: user.userId
                                            })));
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error fetching user data:', error);
                                        cb([]);
                                    });
                            },
                            selectTemplate: function(item) {
                                if (typeof item === 'undefined') return null;
                                return `@${item.original.value}`;
                            },
                            menuItemTemplate: function(item) {
                                return `<li data-user-id="${item.original.userId}">@${item.original.value}</li>`; // Include userId in the template
                            }
                        });

                        tribute.attach(messageBox);
                    } else {
                        const replyBoxContainer = replyElement.querySelector('.reply-box-container');
                        if (replyBoxContainer) replyBoxContainer.remove();
                        isReplyOpen = false;
                    }
                });

                const originalReplyText = document.createElement('span');
                originalReplyText.textContent = reply.reply;
                originalReplyText.style.display = 'none';
                replyElement.appendChild(originalReplyText);

                // Edit Comment Functionality
                let isEditing = false;

                editIcon1.addEventListener('click', () => {
                    const existingTextarea = replyElement.querySelector('.edit-textarea');
                    const existingSubmitButton = replyElement.querySelector('.submit-button');

                    if (existingTextarea && existingSubmitButton) {
                        // Remove existing textarea and submit button
                        existingTextarea.remove();
                        existingSubmitButton.remove();
                        replyText.style.display = 'block'; // Show original comment text
                        isEditing = false;
                    } else {
                        const textarea = document.createElement('textarea');
                        textarea.classList.add('edit-textarea');
                        textarea.value = originalReplyText.textContent;

                        const submitButton = document.createElement('button');
                        submitButton.textContent = 'Submit';
                        submitButton.classList.add('submit-button');

                        replyText.style.display = 'none';

                        replyElement.appendChild(textarea);
                        replyElement.appendChild(submitButton);

                        submitButton.addEventListener('click', () => {
                            const editedText = textarea.value;
                            if (editedText.trim() !== '') {
                                editReply(reply.id, editedText, replyElement);
                                const newReplyText = document.createElement('p');
                                newReplyText.textContent = editedText;
                                newReplyText.classList.add('reply-text');
                                newReplyText.innerHTML = editedText.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
                                    return `<span class="mention">${mention}</span>`;
                                });
                                textarea.replaceWith(newReplyText);
                                originalReplyText.textContent = editedText; // Update hidden original text
                                submitButton.remove();
                                isEditing = false;
                            } else {
                                alert('Please enter a valid text.');
                            }
                        });
                        isEditing = true;
                    }
                });
                deleteIcon1.addEventListener('click', () => {
                    const confirmDelete = confirm('Are you sure you want to delete this reply?');
                    if (confirmDelete) {
                        deleteReply(reply.id);

                    }
                });
                likeIcon.addEventListener('click', () => {
                    const localStorageKey = `reply-${reply.id}-liked-reply-${currentUser.id}`;
                    if (likeIcon.classList.contains('liked-reply')) {
                        unlikeReply(reply.id);
                        likeIcon.classList.remove('liked-reply');
                        localStorage.removeItem(localStorageKey);
                    } else {
                        likeReply(reply.id, currentUser.id);
                        likeIcon.classList.add('liked-reply');
                        localStorage.setItem(localStorageKey, 'true');
                    }
                });
                replyContainer.appendChild(replyElement);
            } else {
                console.error(`Comment element with ID 'comment-${commentId}' not found.`);
            }

        })
        .catch(error => console.error('Error fetching user data:', error));
}
function unlikeReply(replyId) {
    // Send a request to unlike the reply
    fetch(`/api/reply/${replyId}/unlike`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to unlike reply');
            }
            // Remove liked state from like icon
            const likeIcon = document.getElementById(`like-icon-reply-${replyId}`);
            if (likeIcon) {
                likeIcon.classList.remove('liked-reply');
            }
        })
        .catch(error => console.error('Error unliking reply:', error));
}
function likeReply(replyId, userId) {
    // Send a request to like the reply
    fetch(`/api/reply/${replyId}/like?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to like reply');
            }
            // Change like icon color and set liked state
            const likeIcon = document.getElementById(`like-icon-reply-${replyId}`);
            if (likeIcon) {
                likeIcon.classList.add('liked-reply');
            }
        })
        .catch(error => console.error('Error liking reply:', error));
}

function editReply(replyId, newReplyText,replyElement) {
    fetch(`/api/reply/${replyId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply: newReplyText }),
    })
        .then(response => {
            if (response.ok) {
                const replyText = replyElement.querySelector('.reply-text');
                replyText.textContent = newReplyText;
            } else {
                throw new Error('Failed to update reply');
            }
        })
        .catch(error => console.error('Error updating reply:', error));
}

function deleteReply(replyId) {
    // Send a request to delete the reply on the server-side
    fetch(`/api/reply/${replyId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                // Remove the reply element from the DOM
                const replyElement = document.getElementById(`reply-${replyId}`);
                if (replyElement) {
                    replyElement.remove();
                }
            } else {
                throw new Error('Failed to delete reply');
            }
        })
        .catch(error => console.error('Error deleting reply:', error));
}

const loadExistingReplies = (contentId,commentId) => {
    // Make a request to fetch existing comments
    fetch(`/api/reply/${contentId}/${commentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch existing replies');
            }
            return response.json();
        })
        .then(existingComments => {
            console.log('Existing replies:', existingComments);
            existingComments.forEach(reply =>
                fetch('/user/current-user')
                    .then(response => response.json())
                    .then(currentUser => {
                        displayReply(reply,commentId,currentUser);
                    })
                    .catch(error => console.error('Error fetching current user:', error)
                    )
            )
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

function sendReply(commentId,contentId, userId, reply) {
    const message = {
        commentId: commentId,
        contentId: contentId,
        userId: userId,
        reply: reply,
        time: new Date()
    };
    stompClient2.send('/app/send-reply', {}, JSON.stringify(message));
}

let replySubscription;
function subscribeToReplyTopic(contentId) {
    if (!replySubscription) {
        replySubscription = stompClient2.subscribe(`/user/reply/${contentId}`, function (message) {
            const reply = JSON.parse(message.body);
            console.log('Received reply:', reply);
            fetch('/user/current-user')
                .then(response => response.json())
                .then(currentUser => {
                    console.log("received user data"+currentUser.id);
                    displayReply(reply, reply.commentId,currentUser);
                })
                .catch(error => console.error('Error fetching current user:', error));


        })
    }

}
function unsubscribeFromReplyTopic() {
    if (replySubscription) {
        replySubscription.unsubscribe();
        replySubscription = null;
    }
}
function fetchCommentCount(contentId,commentCountElement) {
    fetch(`/api/comment/${contentId}/comment-count`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch comment count');
            }
            return response.json();
        })
        .then(commentCount => {
            commentCountElement.textContent = `${commentCount}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function displayComment(comment, postElement,currentUser) {
    const isLiked = localStorage.getItem(`comment-${comment.id}-liked-${currentUser.id}`);
    // Create the comments container if it doesn't already exist
    let commentsContainer = postElement.querySelector('.comments-container');
    if (!commentsContainer) {
        commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments-container');
        commentsContainer.style.maxHeight = '280px';
        commentsContainer.style.overflowY = 'auto';
        commentsContainer.style.marginTop = '20px';
        postElement.appendChild(commentsContainer);
    }
    const updateCommentCount = () => {
        const commentCountElement = postElement.querySelector('.comment-count');
        if (commentCountElement) {
            fetchCommentCount(comment.contentId, commentCountElement);
        }
    };

    fetch(`/user/users/${comment.userId}`)
        .then(response => response.json())
        .then(user => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment-element');
            // User Photo
            const userPhoto = document.createElement('img');
            userPhoto.src = user.photo;
            userPhoto.alt = user.name;
            userPhoto.classList.add('user-photo');
            commentElement.appendChild(userPhoto);
            // User Name
            const userName = document.createElement('span');
            userName.textContent = user.name;
            userName.classList.add('user-name');
            commentElement.appendChild(userName);
            //like Icon
            const likeIcon = document.createElement('i');
            likeIcon.classList.add('fas', 'fa-heart');
            likeIcon.id = `like-icon-${comment.id}`;
            if (isLiked === 'true') {
                likeIcon.classList.add('liked');
            }

            // Reply Icon with Count
            const replyContainer = document.createElement('div');
            replyContainer.classList.add('reply-container');

            const replyCount = document.createElement('span');
            replyCount.classList.add('reply-count');

            // Fetch and display the reply count
            fetch(`/api/reply/${comment.contentId}/${comment.id}/reply-count`)
                .then(response => response.json())
                .then(count => {
                    replyCount.textContent = count;
                })
                .catch(error => console.error('Error fetching reply count:', error));

            const replyIcon = document.createElement('span');
            replyIcon.textContent = '↩️';
            replyIcon.classList.add('reply-icon');

            replyContainer.appendChild(replyCount);
            replyContainer.appendChild(replyIcon);

            const deleteIcon = document.createElement('span');
            deleteIcon.textContent = '❌';
            deleteIcon.classList.add('delete-icon');

            const editIcon = document.createElement('span');
            editIcon.textContent = '✏️';
            editIcon.classList.add('edit-icon');

            const iconsContainer = document.createElement('div');
            iconsContainer.classList.add('icons-container');
            const isCommentOwner = (comment.userId === currentUser.id);
            console.log("comment user id"+comment.userId+"Logged in user"+currentUser.id);
            iconsContainer.appendChild(replyContainer);
            iconsContainer.appendChild(likeIcon);
            if (isCommentOwner) {
                iconsContainer.appendChild(editIcon);
                iconsContainer.appendChild(deleteIcon);
            }
            commentElement.append(iconsContainer);
            const timeElement = document.createElement('span');
            timeElement.textContent = formatCommentTime(comment.time);
            timeElement.classList.add('comment-time');
            commentElement.appendChild(timeElement);
            // Comment Text
            const commentText = document.createElement('p');
            commentText.textContent = comment.comment ? comment.comment : 'No comment available';
            commentText.classList.add('comment-text');
            commentText.innerHTML = comment.comment.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
                return `<span class="mention">${mention}</span>`;
            });
            commentElement.appendChild(commentText);
            commentElement.id = `comment-${comment.id}`;

            // Hidden element to store original comment text
            const originalCommentText = document.createElement('span');
            originalCommentText.textContent = comment.comment;
            originalCommentText.style.display = 'none';
            commentElement.appendChild(originalCommentText);
            // Edit Comment Functionality
            let isEditing = false;
            editIcon.addEventListener('click', () => {
                if (isEditing) {
                    const textarea = commentElement.querySelector('.edit-textarea');
                    const submitButton = commentElement.querySelector('.submit-button');
                    if (textarea) textarea.remove();
                    if (submitButton) submitButton.remove();
                    commentText.style.display = 'block'; // Show original comment text
                    isEditing = false;
                } else {
                    const textarea = document.createElement('textarea');
                    textarea.classList.add('edit-textarea');
                    textarea.value = originalCommentText.textContent;
                    const submitButton = document.createElement('button');
                    submitButton.textContent = 'Submit';
                    submitButton.classList.add('submit-button');
                    commentText.style.display = 'none'; // Hide original comment text
                    commentElement.appendChild(textarea);
                    commentElement.appendChild(submitButton);
                    isEditing = true;

                    submitButton.addEventListener('click', () => {
                        const editedText = textarea.value;
                        if (editedText.trim() !== '') {
                            editComment(comment.id, editedText, commentElement);
                            const newCommentText = document.createElement('p');
                            newCommentText.textContent = editedText;
                            newCommentText.classList.add('comment-text');
                            newCommentText.innerHTML = editedText.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
                                return `<span class="mention">${mention}</span>`;
                            });
                            textarea.replaceWith(newCommentText);
                            originalCommentText.textContent = editedText; // Update hidden original text
                            submitButton.remove();
                            isEditing = false;
                        } else {
                            alert('Please enter a valid text.');
                        }
                    });
                }
            });
            deleteIcon.addEventListener('click', () => {
                const confirmDelete = confirm('Are you sure you want to delete this comment?');
                if (confirmDelete) {
                    deleteComment(comment.id)
                        .then(() => {
                            updateCommentCount(); // Update comment count after successful deletion
                        })
                        .catch(error => console.error('Error deleting comment:', error));
                }
            });

            // Reply Functionality
            let isReplyOpen = false;
            replyIcon.addEventListener('click', () => {
                if (!isReplyOpen) {
                    const replyBoxContainer = document.createElement('div');
                    replyBoxContainer.classList.add('reply-box-container');
                    replyBoxContainer.style.display = 'flex';
                    replyBoxContainer.style.alignItems = 'center';

                    const messageBox = document.createElement('textarea');
                    messageBox.setAttribute('placeholder', 'Write your reply here...');
                    messageBox.classList.add('reply-message-box');
                    messageBox.style.flexGrow = '1';

                    const submitButton = document.createElement('button');
                    submitButton.classList.add('reply-submit-button');
                    const submitIcon = document.createElement('i');
                    submitIcon.classList.add('fas', 'fa-paper-plane');
                    submitButton.appendChild(submitIcon);

                    submitButton.addEventListener('click', () => {
                        const reply = messageBox.value.trim();
                        if (reply.length > 0) {
                            console.log('Reply submitted:', reply);
                            sendReply(comment.id, comment.contentId, comment.userId, reply);
                            commentElement.removeChild(replyBoxContainer);
                            subscribeToReplyTopic(comment.contentId);
                            messageBox.value = '';
                        }
                    });

                    replyBoxContainer.appendChild(messageBox);
                    replyBoxContainer.appendChild(submitButton);

                    commentElement.appendChild(replyBoxContainer);
                    loadExistingReplies(comment.contentId, comment.id);
                    commentElement.classList.add('reply-open');
                    isReplyOpen = true;

                    const tribute = new Tribute({
                        values: (text, cb) => {
                            fetch(`/user/search?q=${text}`)
                                .then(response => response.json())
                                .then(users => {
                                    if (users.length === 0) {
                                        cb([]);
                                    } else {
                                        cb(users.map(user => ({
                                            key: user.key,
                                            value: user.value,
                                            userId: user.userId
                                        })));
                                    }
                                })
                                .catch(error => {
                                    console.error('Error fetching user data:', error);
                                    cb([]);
                                });
                        },
                        selectTemplate: function(item) {
                            if (typeof item === 'undefined') return null;
                            return `@${item.original.value}`;
                        },
                        menuItemTemplate: function(item) {
                            return `<li data-user-id="${item.original.userId}">@${item.original.value}</li>`; // Include userId in the template
                        }
                    });

                    tribute.attach(messageBox);
                } else {
                    const replyBoxContainer = commentElement.querySelector('.reply-box-container');
                    const existingReplies = commentElement.querySelectorAll('.reply');
                    if (replyBoxContainer) replyBoxContainer.remove();
                    existingReplies.forEach(replies => replies.remove());
                    isReplyOpen = false;
                }
            });

            commentsContainer.appendChild(commentElement);
            // Update comment count after displaying the comment
            updateCommentCount();

            likeIcon.addEventListener('click', () => {
                const localStorageKey = `comment-${comment.id}-liked-${currentUser.id}`;
                if (likeIcon.classList.contains('liked')) {
                    unlikeComment(comment.id);
                    likeIcon.classList.remove('liked');
                    localStorage.removeItem(localStorageKey);
                } else {
                    likeComment(comment.id, currentUser.id);
                    likeIcon.classList.add('liked');
                    localStorage.setItem(localStorageKey, 'true');
                }
            });

        })
        .catch(error => console.error('Error fetching user data:', error));

}
function unlikeComment(commentId) {
    // Send a request to unlike the reply
    fetch(`/api/comment/${commentId}/unlike`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to unlike reply');
            }
            // Remove liked state from like icon
            const likeIcon = document.getElementById(`like-icon-${commentId}`);
            if (likeIcon) {
                likeIcon.classList.remove('liked');
            }
        })
        .catch(error => console.error('Error unliking reply:', error));
}
function likeComment(commentId, userId) {
    // Send a request to like the comment
    fetch(`/api/comment/${commentId}/like?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to like comment');
            }
            const likeIcon = document.getElementById(`like-icon-${commentId}`);
            if (likeIcon) {
                likeIcon.classList.add('liked');
            }
        })
        .catch(error => console.error('Error liking comment:', error));
}
function editComment(commentId, newCommentText,commentElement) {
    // Send a request to update the comment on the server-side
    fetch(`/api/comment/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
            comment: newCommentText
        }),
    }) .then(response => {
        if (response.ok) {
            const commentText = commentElement.querySelector(".comment-text");
            if(commentText){
                commentText.textContent = newCommentText;
            }else{
                console.log("commentText element not found");
            }
        } else {
            throw new Error('Failed to update comment');
        }
    }) .catch(error => console.error('Error updating comment:', error));
}
function deleteComment(commentId) {
    return fetch(`/api/comment/${commentId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                const commentElement = document.getElementById(`comment-${commentId}`);
                if (commentElement) {
                    commentElement.remove();
                }
            } else {
                throw new Error('Failed to delete comment');
            }
        });
}
function formatCommentTime(createdDate) {
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
        day: 86400, hr: 3600, min: 60
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
//swm-comment////

//swm-comment-for-share///
function subscribeToShareCommentTopic(shareId,postElement) {
    if (!commentSubscription) {
        commentSubscription = stompClient2.subscribe(`/user/sharedComment/${shareId}`, function (message) {
            const comment = JSON.parse(message.body);
            console.log('Received comment:', comment);
            fetch('/user/current-user')
                .then(response => response.json())
                .then(currentUser => {
                    console.log("received user data"+currentUser);
                    displayCommentForShare(comment, postElement, currentUser);
                })
                .catch(error => console.error('Error fetching current user:', error));

        });
    }
}

const loadExistingShareComments = (shareId,post) => {
    // Make a request to fetch existing comments
    fetch(`/api/comment/share/${shareId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch existing comments');
            }
            return response.json();
        })
        .then(existingComments => {
            console.log('Existing comments:', existingComments);
            existingComments.forEach(comment =>
                fetch('/user/current-user')
                    .then(response => response.json())
                    .then(currentUser => {
                        // Now you have the current user information
                        // Call your displayComment function passing currentUser
                        console.log("received user data"+currentUser);
                        displayCommentForShare(comment, post, currentUser);
                    })
                    .catch(error => console.error('Error fetching current user:', error))

            )
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

function displayReplyForShare(reply, commentId,currentUser) {
    const isLiked = localStorage.getItem(`reply-${reply.id}-liked-reply-${currentUser.id}`);
    fetch(`/user/users/${reply.userId}`)
        .then(response => response.json())
        .then(user => {
            const commentElement = document.getElementById(`comment-${commentId}`);
            if (commentElement) {
                let replyContainer = commentElement.querySelector('.container-reply');
                if (!replyContainer) {
                    replyContainer = document.createElement('div');
                    replyContainer.classList.add('container-reply');
                    commentElement.appendChild(replyContainer);
                }

                // Create reply element
                const replyElement = document.createElement('div');
                replyElement.classList.add('reply');
                replyElement.id = `reply-${reply.id}`;
                // User Photo
                const photo = document.createElement('img');
                photo.src = user.photo;
                photo.alt = user.name;
                photo.classList.add('user-photo');
                replyElement.appendChild(photo);

                // User Name
                const userName = document.createElement('span');
                userName.textContent = user.name;
                userName.classList.add('user-name');
                replyElement.appendChild(userName);

                const likeIcon = document.createElement('i');
                likeIcon.classList.add('fas', 'fa-heart');
                likeIcon.id = `like-icon-reply-${reply.id}`;
                if (isLiked === 'true') {
                    likeIcon.classList.add('liked-reply');
                }

                const replyIcon = document.createElement('span');
                replyIcon.textContent = '↩️';
                replyIcon.classList.add('reply-icon');
                // Delete Icon
                const deleteIcon1 = document.createElement('span');
                deleteIcon1.textContent = '❌';
                deleteIcon1.classList.add('delete-icon');
                // Edit Icon
                const editIcon1 = document.createElement('span');
                editIcon1.textContent = '✏️';
                editIcon1.classList.add('edit-icon');

                const iconsContainer2 = document.createElement('div');
                iconsContainer2.classList.add('icons-container-reply');
                const isReplyOwner = (reply.userId === String(currentUser.id));

                iconsContainer2.appendChild(replyIcon);
                iconsContainer2.appendChild(likeIcon);
                if (isReplyOwner) {
                    console.log("User is the owner of reply. Icons should be displayed.");
                    iconsContainer2.appendChild(editIcon1);
                    iconsContainer2.appendChild(deleteIcon1);
                }
                replyElement.appendChild(iconsContainer2);

                const timeElement = document.createElement('span');
                timeElement.textContent = formatCommentTime(reply.time);
                timeElement.classList.add('reply-time');
                replyElement.appendChild(timeElement);
                // Reply Text
                const replyText = document.createElement('p');
                replyText.textContent = reply.reply ? reply.reply : 'No reply available';
                replyText.classList.add('comment-text');
                replyText.innerHTML = reply.reply.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
                    return `<span class="mention">${mention}</span>`;
                });
                replyElement.appendChild(replyText);
                // Add event listener to reply icon
                let isReplyOpen = false;
                replyIcon.addEventListener('click', () => {
                    if (!isReplyOpen) {
                        const replyBoxContainer = document.createElement('div');
                        replyBoxContainer.classList.add('reply-box-container');
                        replyBoxContainer.style.display = 'flex';
                        replyBoxContainer.style.alignItems = 'center';

                        const messageBox = document.createElement('textarea');
                        messageBox.setAttribute('placeholder', 'Write your reply here...');
                        messageBox.classList.add('reply-message-box');
                        messageBox.style.flexGrow = '1';

                        const submitButton = document.createElement('button');
                        submitButton.classList.add('reply-submit-button');
                        const submitIcon = document.createElement('i');
                        submitIcon.classList.add('fas', 'fa-paper-plane');
                        submitButton.appendChild(submitIcon);
                        submitButton.addEventListener('click', () => {
                            const replyText = messageBox.value.trim();
                            if (replyText.length > 0) {
                                console.log('Reply submitted:', replyText);
                                sendReplyForShare(commentId, reply.shareId, reply.userId, replyText);
                                replyElement.removeChild(replyBoxContainer);
                                subscribeToShareReplyTopic(reply.shareId);
                                messageBox.value = '';
                            }
                        });
                        replyBoxContainer.appendChild(messageBox);
                        replyBoxContainer.appendChild(submitButton);
                        replyElement.appendChild(replyBoxContainer);
                        loadExistingShareReplies(reply.shareId, reply.id);
                        replyElement.classList.add('reply-open');
                        isReplyOpen = true;
                        const tribute = new Tribute({
                            values: (text, cb) => {
                                fetch(`/user/search?q=${text}`)
                                    .then(response => response.json())
                                    .then(users => {
                                        if (users.length === 0) {
                                            cb([]);
                                        } else {
                                            cb(users.map(user => ({
                                                key: user.key,
                                                value: user.value,
                                                userId: user.userId
                                            })));
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error fetching user data:', error);
                                        cb([]);
                                    });
                            },
                            selectTemplate: function(item) {
                                if (typeof item === 'undefined') return null;
                                return `@${item.original.value}`;
                            },
                            menuItemTemplate: function(item) {
                                return `<li data-user-id="${item.original.userId}">@${item.original.value}</li>`; // Include userId in the template
                            }
                        });

                        tribute.attach(messageBox);

                    } else {
                        const replyBoxContainer = replyElement.querySelector('.reply-box-container');
                        if (replyBoxContainer) replyBoxContainer.remove();
                        isReplyOpen = false;
                    }
                });

                const originalReplyText = document.createElement('span');
                originalReplyText.textContent = reply.reply;
                originalReplyText.style.display = 'none';
                replyElement.appendChild(originalReplyText);

                // Edit Comment Functionality
                let isEditing = false;

                editIcon1.addEventListener('click', () => {
                    const existingTextarea = replyElement.querySelector('.edit-textarea');
                    const existingSubmitButton = replyElement.querySelector('.submit-button');

                    if (existingTextarea && existingSubmitButton) {
                        // Remove existing textarea and submit button
                        existingTextarea.remove();
                        existingSubmitButton.remove();
                        replyText.style.display = 'block'; // Show original comment text
                        isEditing = false;
                    } else {
                        const textarea = document.createElement('textarea');
                        textarea.classList.add('edit-textarea');
                        textarea.value = originalReplyText.textContent;
                        const submitButton = document.createElement('button');
                        submitButton.textContent = 'Submit';
                        submitButton.classList.add('submit-button');
                        replyText.style.display = 'none';
                        replyElement.appendChild(textarea);
                        replyElement.appendChild(submitButton);
                        submitButton.addEventListener('click', () => {
                            const editedText = textarea.value; // Call the editComment or editReply function with the edited text
                            if (editedText.trim() !== '') {
                                editReply(reply.id, editedText,replyElement);
                                const newReplyText = document.createElement('p');
                                newReplyText.textContent = editedText;
                                newReplyText.classList.add('reply-text');
                                newReplyText.innerHTML = editedText.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
                                    return `<span class="mention">${mention}</span>`;
                                });
                                replyElement.replaceChild(newReplyText, textarea);
                                originalReplyText.textContent = editedText;
                                submitButton.remove();
                                isEditing = false;
                            } else {
                                alert('Please enter a valid text.');
                            }
                        });
                        isEditing = true;
                    }
                });
                deleteIcon1.addEventListener('click', () => {
                    const confirmDelete = confirm('Are you sure you want to delete this reply?');
                    if (confirmDelete) {
                        deleteReply(reply.id);
                    }
                });
                likeIcon.addEventListener('click', () => {
                    const localStorageKey = `reply-${reply.id}-liked-reply-${currentUser.id}`;
                    if (likeIcon.classList.contains('liked-reply')) {
                        unlikeReply(reply.id);
                        likeIcon.classList.remove('liked-reply');
                        localStorage.removeItem(localStorageKey);
                    } else {
                        likeReplyShare(reply.id, currentUser.id);
                        likeIcon.classList.add('liked-reply');
                        localStorage.setItem(localStorageKey, 'true');
                    }
                });
                replyContainer.appendChild(replyElement);
            } else {
                console.error(`Comment element with ID 'comment-${commentId}' not found.`);
            }

        })
        .catch(error => console.error('Error fetching user data:', error));
}
function likeReplyShare(replyId, userId) {
    // Send a request to like the reply
    fetch(`/api/reply/${replyId}/like-share-reply?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to like reply');
            }
            // Change like icon color and set liked state
            const likeIcon = document.getElementById(`like-icon-reply-${replyId}`);
            if (likeIcon) {
                likeIcon.classList.add('liked-reply');
            }
        })
        .catch(error => console.error('Error liking reply:', error));
}
const loadExistingShareReplies = (shareId,commentId) => {
    // Make a request to fetch existing comments
    fetch(`/api/reply/share/${shareId}/${commentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch existing replies');
            }
            return response.json();
        })
        .then(existingComments => {
            console.log('Existing replies:', existingComments);
            existingComments.forEach(reply =>
                fetch('/user/current-user')
                    .then(response => response.json())
                    .then(currentUser => {
                        displayReplyForShare(reply,commentId,currentUser);
                    })
                    .catch(error => console.error('Error fetching current user:', error)
                    )
            )
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

function sendReplyForShare(commentId,shareId, userId, reply) {
    const message = {
        commentId: commentId,
        shareId: shareId,
        userId: userId,
        reply: reply,
        time: new Date()
    };
    stompClient2.send('/app/send-reply-share', {}, JSON.stringify(message));
}
function subscribeToShareReplyTopic(shareId) {
    if (!replySubscription) {
        replySubscription = stompClient2.subscribe(`/user/sharedReply/${shareId}`, function (message) {
            const reply = JSON.parse(message.body);
            console.log('Received reply:', reply);
            fetch('/user/current-user')
                .then(response => response.json())
                .then(currentUser => {
                    console.log("received user data"+currentUser.id);
                    displayReplyForShare(reply, reply.commentId,currentUser);
                })
                .catch(error => console.error('Error fetching current user:', error));


        })
    }

}

function fetchCommentCountForShare(shareId,commentCountElement) {
    fetch(`/api/comment/${shareId}/comment-count-share`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch comment count');
            }
            return response.json();
        })
        .then(commentCount => {
            commentCountElement.textContent = `${commentCount}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function displayCommentForShare(comment, postElement,currentUser) {
    const isLiked = localStorage.getItem(`comment-${comment.id}-liked-${currentUser.id}`);
    // Create the comments container if it doesn't already exist
    let commentsContainer = postElement.querySelector('.comments-container');
    if (!commentsContainer) {
        commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments-container');
        commentsContainer.style.maxHeight = '280px';
        commentsContainer.style.overflowY = 'auto';
        commentsContainer.style.marginTop = '20px';
        postElement.appendChild(commentsContainer);
    }
    const updateCommentCountForShare = () => {
        const commentCountElement = postElement.querySelector('.comment-count');
        if (commentCountElement) {
            fetchCommentCountForShare(comment.shareId, commentCountElement);
        }
    };

    fetch(`/user/users/${comment.userId}`)
        .then(response => response.json())
        .then(user => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment-element');
            // User Photo
            const userPhoto = document.createElement('img');
            userPhoto.src = user.photo;
            userPhoto.alt = user.name;
            userPhoto.classList.add('user-photo');
            commentElement.appendChild(userPhoto);
            // User Name
            const userName = document.createElement('span');
            userName.textContent = user.name;
            userName.classList.add('user-name');
            commentElement.appendChild(userName);
            //like Icon
            const likeIcon = document.createElement('i');
            likeIcon.classList.add('fas', 'fa-heart');
            likeIcon.id = `like-icon-${comment.id}`;
            if (isLiked === 'true') {
                likeIcon.classList.add('liked');
            }
            // Reply Icon with Count
            const replyContainer = document.createElement('div');
            replyContainer.classList.add('reply-container');

            const replyCount = document.createElement('span');
            replyCount.classList.add('reply-count');
            replyCount.style.color = 'white';

            // Fetch and display the reply count
            fetch(`/api/reply/${comment.shareId}/${comment.id}/reply-count-share`)
                .then(response => response.json())
                .then(count => {
                    replyCount.textContent = count;
                })
                .catch(error => console.error('Error fetching reply count:', error));
            // Reply Icon
            const replyIcon = document.createElement('span');
            replyIcon.textContent = '↩️';
            replyIcon.classList.add('reply-icon');

            replyContainer.appendChild(replyCount);
            replyContainer.appendChild(replyIcon);

            const deleteIcon = document.createElement('span');
            deleteIcon.textContent = '❌';
            deleteIcon.classList.add('delete-icon');

            const editIcon = document.createElement('span');
            editIcon.textContent = '✏️';
            editIcon.classList.add('edit-icon');

            const iconsContainer = document.createElement('div');
            iconsContainer.classList.add('icons-container');
            const isCommentOwner = (comment.userId === currentUser.id);
            console.log("comment user id"+comment.userId+"Logged in user"+currentUser.id);
            iconsContainer.appendChild(replyContainer);
            iconsContainer.appendChild(likeIcon);
            if (isCommentOwner) {
                iconsContainer.appendChild(editIcon);
                iconsContainer.appendChild(deleteIcon);
            }
            commentElement.append(iconsContainer);
            const timeElement = document.createElement('span');
            timeElement.textContent = formatCommentTime(comment.time);
            timeElement.classList.add('comment-time');
            commentElement.appendChild(timeElement);
            // Comment Text
            const commentText = document.createElement('p');
            commentText.textContent = comment.comment ? comment.comment : 'No comment available';
            commentText.classList.add('comment-text');
            commentText.innerHTML = comment.comment.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
                return `<span class="mention">${mention}</span>`;
            });
            commentElement.appendChild(commentText);
            commentElement.id = `comment-${comment.id}`;
            // Hidden element to store original comment text
            const originalCommentText = document.createElement('span');
            originalCommentText.textContent = comment.comment;
            originalCommentText.style.display = 'none';
            commentElement.appendChild(originalCommentText);
            // Edit Comment Functionality
            let isEditing = false;
            editIcon.addEventListener('click', () => {
                if (isEditing) {
                    const textarea = commentElement.querySelector('.edit-textarea');
                    const submitButton = commentElement.querySelector('.submit-button');
                    if (textarea) textarea.remove();
                    if (submitButton) submitButton.remove();
                    commentText.style.display = 'block'; // Show original comment text
                    isEditing = false;
                } else {
                    const textarea = document.createElement('textarea');
                    textarea.classList.add('edit-textarea');
                    textarea.value = originalCommentText.textContent;
                    const submitButton = document.createElement('button');
                    submitButton.textContent = 'Submit';
                    submitButton.classList.add('submit-button');
                    commentText.style.display = 'none'; // Hide original comment text
                    commentElement.appendChild(textarea);
                    commentElement.appendChild(submitButton);
                    isEditing = true;

                    submitButton.addEventListener('click', () => {
                        const editedText = textarea.value;
                        if (editedText.trim() !== '') {
                            editComment(comment.id, editedText, commentElement);
                            const newCommentText = document.createElement('p');
                            newCommentText.textContent = editedText;
                            newCommentText.classList.add('comment-text');
                            newCommentText.innerHTML = editedText.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
                                return `<span class="mention">${mention}</span>`;
                            });
                            textarea.replaceWith(newCommentText);
                            originalCommentText.textContent = editedText; // Update hidden original text
                            submitButton.remove();
                            isEditing = false;
                        } else {
                            alert('Please enter a valid text.');
                        }
                    });
                }
            });
            deleteIcon.addEventListener('click', () => {
                const confirmDelete = confirm('Are you sure you want to delete this comment?');
                if (confirmDelete) {
                    deleteComment(comment.id)
                        .then(() => {
                            updateCommentCountForShare(); // Update comment count after successful deletion
                        })
                        .catch(error => console.error('Error deleting comment:', error));
                }
            });

            let isReplyOpen = false;
            replyIcon.addEventListener('click', () => {
                if (!isReplyOpen) {
                    const replyBoxContainer = document.createElement('div');
                    replyBoxContainer.classList.add('reply-box-container');
                    replyBoxContainer.style.display = 'flex';
                    replyBoxContainer.style.alignItems = 'center';

                    const messageBox = document.createElement('textarea');
                    messageBox.setAttribute('placeholder', 'Write your reply here...');
                    messageBox.classList.add('reply-message-box');
                    messageBox.style.flexGrow = '1';

                    const submitButton = document.createElement('button');
                    submitButton.classList.add('reply-submit-button');
                    const submitIcon = document.createElement('i');
                    submitIcon.classList.add('fas', 'fa-paper-plane');
                    submitButton.appendChild(submitIcon);
                    submitButton.addEventListener('click', () => {
                        const reply = messageBox.value.trim();
                        if (reply.length > 0) {
                            console.log('Reply submitted:', reply);
                            sendReplyForShare(comment.id, comment.shareId, comment.userId, reply);
                            commentElement.removeChild(replyBoxContainer);
                            subscribeToShareReplyTopic(comment.shareId);
                            messageBox.value = '';
                        }

                    });
                    replyBoxContainer.appendChild(messageBox);
                    replyBoxContainer.appendChild(submitButton);
                    commentElement.appendChild(replyBoxContainer);
                    loadExistingShareReplies(comment.shareId, comment.id);
                    commentElement.classList.add('reply-open');
                    isReplyOpen = true;
                    const tribute = new Tribute({
                        values: (text, cb) => {
                            fetch(`/user/search?q=${text}`)
                                .then(response => response.json())
                                .then(users => {
                                    if (users.length === 0) {
                                        cb([]);
                                    } else {
                                        cb(users.map(user => ({
                                            key: user.key,
                                            value: user.value,
                                            userId: user.userId
                                        })));
                                    }
                                })
                                .catch(error => {
                                    console.error('Error fetching user data:', error);
                                    cb([]);
                                });
                        },
                        selectTemplate: function(item) {
                            if (typeof item === 'undefined') return null;
                            return `@${item.original.value}`;
                        },
                        menuItemTemplate: function(item) {
                            return `<li data-user-id="${item.original.userId}">@${item.original.value}</li>`; // Include userId in the template
                        }
                    });

                    tribute.attach(messageBox);
                } else {
                    const replyBoxContainer = commentElement.querySelector('.reply-box-container');
                    const existingReplies = commentElement.querySelectorAll('.reply');
                    if (replyBoxContainer) replyBoxContainer.remove();
                    existingReplies.forEach(replies => replies.remove());
                    isReplyOpen = false;
                }

            });

            commentsContainer.appendChild(commentElement);
            // Update comment count after displaying the comment
            updateCommentCountForShare();

            likeIcon.addEventListener('click', () => {
                const localStorageKey = `comment-${comment.id}-liked-${currentUser.id}`;
                if (likeIcon.classList.contains('liked')) {
                    unlikeComment(comment.id);
                    likeIcon.classList.remove('liked');
                    localStorage.removeItem(localStorageKey);
                } else {
                    likeCommentShare(comment.id, currentUser.id);
                    likeIcon.classList.add('liked');
                    localStorage.setItem(localStorageKey, 'true');
                }
            });

        })
        .catch(error => console.error('Error fetching user data:', error));

}
function likeCommentShare(commentId, userId) {
    // Send a request to like the comment
    fetch(`/api/comment/${commentId}/like-share-comment?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to like comment');
            }
            const likeIcon = document.getElementById(`like-icon-${commentId}`);
            if (likeIcon) {
                likeIcon.classList.add('liked');
            }
        })
        .catch(error => console.error('Error liking comment:', error));
}

//swm-comment////


// start
// debugger
const fetchData = async () => {
    const contentResponse = await fetch(`/profile/${searchUserId}`);
    const shareResponse = await fetch(`/searchShare/${searchUserId}`);

    if (!contentResponse.ok || !shareResponse.ok) {
        throw new Error('Failed to fetch data');
    }

    const contentList = await contentResponse.json();
    const shareList = await shareResponse.json();
    // Merge the lists
    // Merge the lists and calculate timestamp for each item
    const mergedList = [
        ...contentList.map(item => {
            if (Array.isArray(item.createdDate) && item.createdDate.length === 7) {
                const [year, month, day, hours, minutes, seconds, milliseconds] = item.createdDate;
                const formattedTimestamp = `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
                console.log("Content item - createdDate:", item.createdDate);
                console.log("Content item - formatted timestamp:", formattedTimestamp);
                return { ...item, formattedTimestamp };
            } else {
                console.error("Invalid createdDate format for content item:", item.createdDate);
                return item;
            }
        }),
        ...shareList.map(item => {
            const [year, month, day, hours, minutes, seconds, milliseconds] = item.time;
            const formattedTimestamp = `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
            console.log("Share item - time:", item.time);
            console.log("Share item - formatted timestamp:", formattedTimestamp);
            return { ...item, formattedTimestamp };
        })
    ];
// Function to pad numbers with leading zeros
    function pad(num, size = 2) {
        let str = String(num);
        while (str.length < size) {
            str = "0" + str;
        }
        return str;
    }

    // Sort the merged list based on timestamp
// Sort the merged list based on timestamp
    mergedList.sort((a, b) => {
        const dateA = new Date(a.formattedTimestamp);
        const dateB = new Date(b.formattedTimestamp);
        return dateB - dateA;
    });
    // Populate the UI with the sorted list
    await populateUI(mergedList);

    // Shuffle the merged list
    // const shuffledList = shuffleArray(mergedList);

    // Populate the UI with the shuffled list

};
fetchData();

// Function to populate the UI with the shuffled list
const populateUI = async (data) => {
    // Combine content and share lists

     for (const item of data) {
            if (item.hasOwnProperty('share')) {
                // It's a share post
                await populatedTable1(item);
            } else if (item.hasOwnProperty('question')){
                await createPollElement(item);

            }else{
                await populateCarousel(item);

            }
        }
};

const populateCarousel = async (rowData) => {
    // data.forEach((rowData) => {
    // data.forEach(async (rowData) => {

    const response = await fetch(`/user/users/${rowData.userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    const userData = await response.json();
    console.log(userData); // Log the user data
    // Proceed with populating the carousel with user data


    // Create a unique ID for the carousel
    const carouselId = `carousel-${Math.random().toString(36).substr(2, 9)}`;

//        addedPostIds.push(rowData.id);

    // Create a post element
    const post = document.createElement('div');
    post.classList.add('post');
    post.style.width = '500px';
    // post.style.marginLeft = '95px';
    post.style.backgroundColor = 'white';


    const info = document.createElement('div');
    info.classList.add('info');
    info.style.margin = '10px';

    const userIcon = document.createElement('i');
    const userIconImg = document.createElement('img'); // user data
    userIconImg.src = userData.photo;
    userIconImg.alt = rowData.userId;
    userIconImg.style.borderRadius = '200px';
    userIconImg.style.width = '60px';
    userIconImg.style.height = '60px';
    userIcon.appendChild(userIconImg);

    userIconImg.addEventListener('click', () => {
        viewUserProfile(userData.staffId); // Function to redirect to user profile view
    });


    // Function to redirect to user profile view
    function viewUserProfile(staffId) {
        window.location.href = `/user/userprofile?staffId=${staffId}`;
    }


    const usernameSpan = document.createElement('span');  // user data
    usernameSpan.textContent = userData.name;
    usernameSpan.style.marginLeft = '11px';
    usernameSpan.style.fontSize = '32px';
    usernameSpan.style.fontFamily = 'math';
    const loginUserId=document.getElementById('id2').value;
    const role=document.getElementById('role').value;
// Create the dropdown menu container
    console.log('role :'+role)
    const dropdownContainer = document.createElement('span');
    dropdownContainer.classList.add('dropdown');
    dropdownContainer.style.float = 'right'; // Align to the right end
    dropdownContainer.style.marginTop = '5px'; // Align to the right end
     const threeDotsButton = document.createElement('button');
        threeDotsButton.classList.add('btn', 'btn-secondary');
        threeDotsButton.setAttribute('type', 'button');
        threeDotsButton.setAttribute('id', 'dropdownMenuButton');
        threeDotsButton.setAttribute('data-bs-toggle', 'dropdown');
        threeDotsButton.setAttribute('aria-expanded', 'false');
        threeDotsButton.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
  if(loginUserId == rowData.userId ) {
                  const dropdownMenu = document.createElement('ul');
                          dropdownMenu.classList.add('dropdown-menu');
                          dropdownMenu.setAttribute('aria-labelledby', 'dropdownMenuButton');

                          // Proceed with creating the update item
                          const updateItem = document.createElement('li');
                          console.log("Image URLs:", rowData.imageUrls);
                          console.log("Video URLs:", rowData.videoUrls);

                          updateItem.innerHTML = `
                          <button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModal"
                          data-id="${rowData.id}"
                          data-groupid="${rowData.groupId}"
                          data-text="${rowData.text}"
                          data-ispublic="${rowData.isPublic}"
                          data-imageurls='${JSON.stringify(rowData.imageUrls)}'
                          data-videourls='${JSON.stringify(rowData.videoUrls)}'
                  >
                      Update

                  </button>`;

                  // Create the delete item in the dropdown menu
                          const deleteItem = document.createElement('li');
                          deleteItem.innerHTML = `<button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#deletePostModal" data-content-id=${rowData.id}>Trash</button>`;
                          console.log('delete user id :'+rowData.id);
                // Create the save item in the dropdown menu
                const saveItem = document.createElement('li');
                saveItem.innerHTML = `<button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#saveModal" data-content-id="${rowData.id}">Save</button>`;
// Append the update and delete items to the dropdown menu
                dropdownMenu.appendChild(updateItem);
                dropdownMenu.appendChild(deleteItem);
                dropdownMenu.appendChild(saveItem);
                // Append the three dots button and dropdown menu to the dropdown container
                          dropdownContainer.appendChild(threeDotsButton);
                          dropdownContainer.appendChild(dropdownMenu);

            }else if(role=="Admin"){
                const dropdownMenu = document.createElement('ul');
                dropdownMenu.classList.add('dropdown-menu');
                dropdownMenu.setAttribute('aria-labelledby', 'dropdownMenuButton');

                // Proceed with creating the update item


                // Create the delete item in the dropdown menu
                const deleteItem = document.createElement('li');
                deleteItem.innerHTML = `<button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#deletePostModal" data-content-id=${rowData.id}>Delete</button>`;
                console.log('delete user id :'+rowData.id);


                // Create the save item in the dropdown menu
                const saveItem = document.createElement('li');
                saveItem.innerHTML = `<button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#saveModal" data-content-id="${rowData.id}">Save</button>`;



                // Append the update and delete items to the dropdown menu
                dropdownMenu.appendChild(deleteItem);

                dropdownMenu.appendChild(saveItem);


                // Append the three dots button and dropdown menu to the dropdown container
                dropdownContainer.appendChild(threeDotsButton);
                dropdownContainer.appendChild(dropdownMenu);

            }else{
            const dropdownMenu = document.createElement('ul');
                            dropdownMenu.classList.add('dropdown-menu');
                            dropdownMenu.setAttribute('aria-labelledby', 'dropdownMenuButton');
                            // Create the save item in the dropdown menu
                            const saveItem = document.createElement('li');
                            saveItem.innerHTML = `<button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#saveModal" data-content-id="${rowData.id}">Save</button>`;
                            dropdownMenu.appendChild(saveItem);
                            // Append the three dots button and dropdown menu to the dropdown container
                            dropdownContainer.appendChild(threeDotsButton);
                            dropdownContainer.appendChild(dropdownMenu);
            }
//    if(loginUserId == userData.id  role =="Admin"){
//
//// Create the three dots icon button
//    const threeDotsButton = document.createElement('button');
//    threeDotsButton.classList.add('btn', 'btn-secondary');
//    threeDotsButton.setAttribute('type', 'button');
//    threeDotsButton.setAttribute('id', 'dropdownMenuButton');
//    threeDotsButton.setAttribute('data-bs-toggle', 'dropdown');
//    threeDotsButton.setAttribute('aria-expanded', 'false');
//    threeDotsButton.innerHTML = '<i class="fas fa-ellipsis-v"></i>'; // Using Font Awesome for three dots icon
//
//
//// Create the dropdown menu
//    const dropdownMenu = document.createElement('ul');
//    dropdownMenu.classList.add('dropdown-menu');
//    dropdownMenu.setAttribute('aria-labelledby', 'dropdownMenuButton');
//
//    // Proceed with creating the update photo item
//    const updateItem = document.createElement('li');
//    console.log("Image URLs:", rowData.imageUrls);
//    console.log("Video URLs:", rowData.videoUrls);
//
//    updateItem.innerHTML = `
//  <button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModal"
//    data-id="${rowData.id}"
//    data-text="${rowData.text}"
//    data-ispublic="${rowData.isPublic}"
//    data-groupid="${rowData.groupId}"
//
//    data-imageurls='${JSON.stringify(rowData.imageUrls)}'
//        data-videourls='${JSON.stringify(rowData.videoUrls)}'
//>
//    Update
//</button>`;
//
//
//// Create the delete item in the dropdown menu
//    const deleteItem = document.createElement('li');
//    deleteItem.innerHTML = '<button class="dropdown-item" type="button" >Delete</button>';
//    deleteItem.addEventListener('click', () => deleteUser(rowData.id));
//
//
//// Append the update and delete items to the dropdown menu
//    dropdownMenu.appendChild(updateItem);
//    dropdownMenu.appendChild(deleteItem);
//
//// Append the three dots button and dropdown menu to the dropdown container
//    dropdownContainer.appendChild(threeDotsButton);
//    dropdownContainer.appendChild(dropdownMenu);
//}

    const postInfoDiv = document.createElement('div');
    postInfoDiv.style.marginTop = '-20px';
    postInfoDiv.style.marginBottom = '20px';
    postInfoDiv.style.marginLeft = '14.4%';
    postInfoDiv.style.fontSize = '12px';

    const publicSpan = document.createElement('span');

    // Check the value of isPublic and set the appropriate icon class
    if (rowData.isPublic === 'public') {
        publicSpan.className = 'fa-solid fa-earth-americas '; // Font Awesome globe icon for public
    } else if (rowData.isPublic === 'private') {
        publicSpan.className = 'fa fa-lock'; // Font Awesome lock icon for private
    }
    publicSpan.style.marginLeft = '0.5%';

    // Append the span to the target element
    // const targetElement = document.getElementById('target');
    // targetElement.appendChild(publicSpan);

    const createDateSpan = document.createElement('span');
    createDateSpan.textContent = formatPostTime(rowData.createdDate); // Format the time
    createDateSpan.style.fontSize = 'small';
    // publicSpan.style.marginLeft='27px';


    postInfoDiv.appendChild(createDateSpan);
    postInfoDiv.appendChild(publicSpan);


    info.appendChild(userIcon);
    info.appendChild(usernameSpan);
    info.appendChild(dropdownContainer);
    info.appendChild(postInfoDiv);


    const postBody = document.createElement('div');
    postBody.classList.add('post-body');
    postBody.style.width = '590px'; // Adjust the width of the post body
    postBody.style.overflow = 'hidden'; // Hide any overflowing content
    postBody.style.wordWrap = 'break-word'; // Allow text to wrap to the next line
    postBody.style.whiteSpace = 'normal'; // Allow normal whitespace behavior

    const seeMoreButton = document.createElement('button');
    const postText = document.createElement('p');
    postText.textContent = rowData.text;
    postText.innerHTML = rowData.text.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
        return `<span class="mention">${mention}</span>`;
    });
    if (rowData.text.length > 130) {
        postText.textContent = rowData.text.substring(0, 130) + '...';
        seeMoreButton.textContent = 'See More';

        seeMoreButton.addEventListener('click', function () {
            if (seeMoreButton.textContent === 'See More') {
                postText.textContent = rowData.text;
                seeMoreButton.textContent = 'See Less';
            } else {
                postText.textContent = rowData.text.substring(0, 130) + '...';
                seeMoreButton.textContent = 'See More';
            }
        });
        seeMoreButton.style.color = 'blue';
        seeMoreButton.style.border = 'none';
        seeMoreButton.style.fontSize = '17px'; // Added font size styling

        seeMoreButton.style.padding = '5px 10px';
        seeMoreButton.style.cursor = 'pointer';
        seeMoreButton.style.marginLeft = '10px';
        seeMoreButton.style.borderRadius = '3px';

        postText.style.marginTop = '20px';
        postText.appendChild(seeMoreButton);
        postBody.appendChild(postText);
    } else {
        postText.style.marginTop = '20px';
        postBody.appendChild(postText);

    }


    // Create the carousel structure
    // const carousel = document.createElement('div');
    // carousel.classList.add('carousel', 'slide');
    // carousel.setAttribute('id', carouselId); // Set the ID attribute
    // // carousel.setAttribute('data-bs-ride', 'carousel');
    // carousel.setAttribute('data-bs-interval', 'false'); // Disable auto sliding
    // const carouselInner = document.createElement('div');
    // carouselInner.classList.add('carousel-inner');
    //
    //
    // // Populate carousel with images
    // rowData.imageUrls.forEach((imageUrl, imgIndex) => {
    //     const carouselItem = document.createElement('div');
    //     carouselItem.classList.add('carousel-item');
    //     if (imgIndex === 0) {
    //         carouselItem.classList.add('active');
    //     }
    //     const image = document.createElement('img');
    //     image.src = imageUrl;
    //     image.classList.add('d-block', 'w-100');
    //     image.style.height = '300px'; // Set a fixed height for videos
    //     image.alt = `Slide ${imgIndex + 1}`;
    //     carouselItem.appendChild(image);
    //     carouselInner.appendChild(carouselItem);
    // });
    //
    // // Populate carousel with videos
    // if (rowData.videoUrls && rowData.videoUrls.length > 0) {
    //     rowData.videoUrls.forEach((videoUrl, videoIndex) => {
    //         const carouselItem = document.createElement('div');
    //         carouselItem.classList.add('carousel-item');
    //         if (videoIndex === 0 && rowData.imageUrls.length === 0) {
    //             carouselItem.classList.add('active');
    //         }
    //         const video = document.createElement('video');
    //         video.src = videoUrl;
    //         video.controls = true;
    //         video.classList.add('d-block', 'w-100');
    //         video.style.height = '300px'; // Set a fixed height for videos
    //         video.alt = `Slide ${videoIndex + 1}`;
    //         carouselItem.appendChild(video);
    //         carouselInner.appendChild(carouselItem);
    //     });
    // }
    //
    // carousel.appendChild(carouselInner);

    const carousel = document.createElement('div');
    carousel.classList.add('carousel', 'slide');
    carousel.setAttribute('id', carouselId); // Set the ID attribute
    carousel.setAttribute('data-bs-interval', 'false'); // Disable auto sliding

    const carouselInner = document.createElement('div');
    carouselInner.classList.add('carousel-inner');

// Check if there are any images or videos
    const hasImages = rowData.imageUrls && rowData.imageUrls.length > 0;
    const hasVideos = rowData.videoUrls && rowData.videoUrls.length > 0;

    if (hasImages || hasVideos) {
        // Create the slide indicator
        const slideIndicator = document.createElement('div');
        slideIndicator.classList.add('slide-indicator');
        slideIndicator.style.position = 'absolute';
        slideIndicator.style.top = '10px';
        slideIndicator.style.right = '10px';
        slideIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        slideIndicator.style.color = 'white';
        slideIndicator.style.padding = '5px 10px';
        slideIndicator.style.borderRadius = '5px';
        slideIndicator.style.zIndex = '10';
        carousel.appendChild(slideIndicator);

        const totalSlides = (hasImages ? rowData.imageUrls.length : 0) + (hasVideos ? rowData.videoUrls.length : 0);
        let currentSlide = 1;

        const updateSlideIndicator = () => {
            slideIndicator.innerText = `${currentSlide}/${totalSlides}`;
        };

        updateSlideIndicator();

        rowData.imageUrls.forEach((imageUrl, imgIndex) => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            if (imgIndex === 0) {
                carouselItem.classList.add('active');
            }
            const image = document.createElement('img');
            image.src = imageUrl;
            image.classList.add('d-block', 'w-100');
            image.style.height = '300px'; // Set a fixed height for images
            image.alt = `Slide ${imgIndex + 1}`;

            image.addEventListener('click', () => {
                $('#fullSizeImageModal').modal('show');
                const modalImage = document.getElementById('fullSizeImage');
                modalImage.src = imageUrl; // Set the src attribute of the modal image
            });

            carouselItem.appendChild(image);
            carouselInner.appendChild(carouselItem);
        });

        rowData.videoUrls.forEach((videoUrl, videoIndex) => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            if (videoIndex === 0 && rowData.imageUrls.length === 0) {
                carouselItem.classList.add('active');
            }
            const video = document.createElement('video');
            video.src = videoUrl;
            video.controls = true;
            video.classList.add('d-block', 'w-100');
            video.style.height = '300px'; // Set a fixed height for videos
            video.alt = `Slide ${videoIndex + 1}`;
            carouselItem.appendChild(video);
            carouselInner.appendChild(carouselItem);
        });

        carousel.addEventListener('slide.bs.carousel', (e) => {
            currentSlide = e.to + 1;
            updateSlideIndicator();
        });
    }

    carousel.appendChild(carouselInner);

// Append the carousel to the document body or a specific container
    document.body.appendChild(carousel);

    // Create the post bottom section
    const postBottom = document.createElement('div');
    postBottom.classList.add('post-bottom');
    const heartIcon = document.createElement('i');
    heartIcon.classList.add('fas', 'fa-heart');


    // swn like start
    const likeCountSpan = document.createElement('span');
    likeCountSpan.textContent = rowData.likeCount;
    //swm
    const commentIcon = document.createElement('i');
    commentIcon.classList.add('fas', 'fa-comment');
    const commentCount = document.createElement('span');
    commentCount.classList.add('comment-count');
    //swm-comment
    fetchCommentCount(rowData.id, commentCount);
    let commentSectionVisible = false;
    commentIcon.addEventListener('click', () => {
        if (!commentSectionVisible) {
            showCommentTemplate(rowData.id, post);
            loadExistingComments(rowData.id, post);
            // loadExistingReplies(rowData.id, post);
            fetchCommentCount(rowData.id, commentCount);
            commentSectionVisible = true;
        } else {
            // If the comment section is already visible, hide it
            fetchCommentCount(rowData.id, commentCount);
            hideCommentTemplate(post);
            commentSectionVisible = false;
        }
    });

    function hideCommentTemplate(postElement) {
        unsubscribeFromCommentTopic();
        unsubscribeFromReplyTopic();
        const commentSection = postElement.querySelector('.comment-box-container');
        if (commentSection) {
            postElement.removeChild(commentSection);
        }
        const existingComments = postElement.querySelectorAll('.comment-element');
        existingComments.forEach(comment => {
            comment.remove();
            // Remove any existing replies for each comment
            const existingReplies = comment.querySelectorAll('.reply');
            existingReplies.forEach(reply => {
                reply.remove();
            });
        });
    }

    function showCommentTemplate(contentId, postElement) {

        hideCommentTemplate(postElement);
        // Create the comment section template
        const commentBoxContainer = document.createElement('div');
        commentBoxContainer.classList.add('comment-box-container');
        commentBoxContainer.style.display = 'flex';
        commentBoxContainer.style.alignItems = 'center';

        const messageBox = document.createElement('textarea');
        messageBox.setAttribute('placeholder', 'Write your comment here...');
        messageBox.classList.add('reply-message-box');
        messageBox.style.flexGrow = '1';

        const submitButton = document.createElement('button');
        submitButton.classList.add('reply-submit-button');
        const submitIcon = document.createElement('i');
        submitIcon.classList.add('fas', 'fa-paper-plane');
        submitButton.appendChild(submitIcon);

        submitButton.addEventListener('click', () => {
            //const contentId = rowData.id;
            const userId = document.getElementById('id2').value;
            const comment = messageBox.value.trim();
            if (comment.length > 0) {
                sendComment(contentId, userId, comment);
                subscribeToCommentTopic(contentId, post);
                messageBox.value = '';
            }
        });

        commentBoxContainer.appendChild(messageBox);
        commentBoxContainer.appendChild(submitButton);
        postElement.appendChild(commentBoxContainer);
        // Initialize Tribute.js
        const tribute = new Tribute({
            values: (text, cb) => {
                fetch(`/user/search?q=${text}`)
                    .then(response => response.json())
                    .then(users => {
                        if (users.length === 0) {
                            cb([]);
                        } else {
                            cb(users.map(user => ({
                                key: user.key,
                                value: user.value,
                                userId: user.userId
                            })));
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching user data:', error);
                        cb([]);
                    });
            },
            selectTemplate: function (item) {
                if (typeof item === 'undefined') return null;
                return `@${item.original.value}`;
            },
            menuItemTemplate: function (item) {
                return `<li data-user-id="${item.original.userId}">@${item.original.value}</li>`;
            }
        });

        tribute.attach(messageBox);
    }

    function sendComment(contentId, userId, comment) {
        const message = {
            contentId: contentId,
            userId: userId,
            comment: comment,
            time: new Date()
        };
        stompClient2.send('/app/send-comment', {}, JSON.stringify(message));
    }

    //swm-comment-end
    //swm-like--start//

    const contentId = rowData.id;
    const userId = document.getElementById('id2').value;

    async function getLikeCount(contentId) {
        const response = await fetch(`/api/content/${contentId}/like-count`);
        if (response.ok) {
            return response.json();
        }
        throw new Error('Failed to fetch like count');
    }

    async function getLikeStatus(contentId) {
        const response = await fetch(`/api/content/${contentId}/like/status`);
        if (response.ok) {
            const data = await response.json();
            return data.liked;
        }
        throw new Error('Failed to fetch like status');
    }

    async function updateLikeStatus() {
        likeCountSpan.textContent = await getLikeCount(contentId);
        const liked = await getLikeStatus(contentId);
        if (liked) {
            heartIcon.classList.add('liked');
        } else {
            heartIcon.classList.remove('liked');
        }
    }

    heartIcon.addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/content/${contentId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const {liked} = await response.json();
                likeCountSpan.textContent = await getLikeCount(contentId);

                if (liked) {
                    heartIcon.classList.add('liked');
                } else {
                    heartIcon.classList.remove('liked');
                }

                sendLikeNotification(liked);
            } else {
                throw new Error('Failed to like post');
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    });

    function sendLikeNotification(isLiked) {
        if (isLiked) {
            const ownerId = rowData.userId; // Replace with actual owner ID
            const notification = {

                ownerId: ownerId,
                message: `Your post has been liked by ${userId}`
            };

            // Send notification via WebSocket
            stompClient2.send(`/app/private-message`, {}, JSON.stringify(notification));
            console.log('Like notification sent to user:', ownerId);
        }
    }

    await updateLikeStatus();
    //swm-like-end


    postBottom.appendChild(heartIcon);
    postBottom.appendChild(likeCountSpan);
    postBottom.appendChild(commentIcon);
    postBottom.appendChild(commentCount);



    if (rowData.isPublic !== 'private') {

        // Function to fetch the share count from the server
        const fetchShareCount = async (contentId) => {
            try {
                const response = await fetch(`/shareCount/${contentId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch share count');
                }
                const data = await response.json();
                return data.count;
            } catch (error) {
                console.error('Error fetching share count:', error);
                return 0; // Return 0 if there's an error
            }
        };
// Function to update the DOM with the share count
        const updateShareCount = async (contentId) => {
            try {
                const count = await fetchShareCount(contentId);
                const shareCountElement = $(`#shareCount-${contentId}`);
                if (shareCountElement.length) {
                    shareCountElement.text(`${count}`);
                } else if (count != 0) {
                    const newShareCountElement = $(`<span id="shareCount-${contentId}"> ${count}</span>`);
                    $(shareIcon).before().append(newShareCountElement); // Append to share icon's parent
                }
            } catch (error) {
                console.error('Error updating share count:', error);
            }
        };
        updateShareCount(rowData.id); // Wait for the share count to be updated

// Share icon click event listener
        const shareIcon = document.createElement('i');
        shareIcon.classList.add('fas', 'fa-share');

// Define updateGroupDropdown function before using it
        const updateGroupDropdown = async () => {
            const isPublicSelect = document.getElementById("isPublic2");
            const groupIdDropdown = document.getElementById('groupId2');

            groupIdDropdown.innerHTML = ''; // Clear previous options

            if (isPublicSelect.value === 'private') {
                // Add "Profile" option for private content if it doesn't exist
                if (!groupIdDropdown.querySelector('option[value="0"]')) {
                    const profileOption = document.createElement('option');
                    profileOption.value = "0";
                    profileOption.textContent = "Profile";
                    groupIdDropdown.appendChild(profileOption);
                }
            } else {
                // Fetch group data for public content
                const responseGroup = await fetch(`/group/gp`);
                if (!responseGroup.ok) {
                    throw new Error('Failed to fetch group data');
                }
                const groupData = await responseGroup.json();
                console.log("group data:", groupData); // This line helps to debug

                // Add "New Feed" option if it doesn't exist
                if (!groupIdDropdown.querySelector('option[value="0"]')) {
                    const newFeedOption = document.createElement('option');
                    newFeedOption.value = "0";
                    newFeedOption.textContent = "New Feed";
                    groupIdDropdown.appendChild(newFeedOption);
                }

                // Append group options if they don't already exist
                groupData.forEach(group => {
                    if (!groupIdDropdown.querySelector(`option[value="${group.id}"]`)) {
                        const option = document.createElement('option');
                        option.value = group.id;
                        option.textContent = group.name;
                        if (group.photo) {
                            option.setAttribute('data-thumbnail', group.photo);
                        }
                        groupIdDropdown.appendChild(option);
                    }
                });
            }
        };

// Attach change event listener to the isPublic select box once
        const isPublicSelect = document.getElementById("isPublic2");
        isPublicSelect.removeEventListener('change', updateGroupDropdown); // Remove existing listener
        isPublicSelect.addEventListener('change', updateGroupDropdown);

        shareIcon.addEventListener('click', async () => {
            const contentId = rowData.id;
            const userId = userData.id;

            $('#contentId').val(contentId);
            $('#userId').val(userId);

            // Call the function initially to set the correct options based on the initial value
            await updateGroupDropdown();

            $('#exampleModal1').modal('show');

            const captionTextarea = document.getElementById("caption");
            const isPublicSelect = document.getElementById("isPublic2");

            captionTextarea.value = "";
            document.getElementById("error-share").style.display = "none";

            await updateShareCount(contentId); // Wait for the share count to be updated
        });

// Event listener to clear data when modal is closed
        $('#exampleModal1').on('hidden.bs.modal', function () {
            const captionTextarea = document.getElementById("caption");
            const isPublicSelect = document.getElementById("isPublic2");
            const groupIdDropdown = document.getElementById('groupId2');

            captionTextarea.value = "";
            isPublicSelect.value = "public"; // Reset to default value if needed
            groupIdDropdown.innerHTML = ''; // Clear previous options
        });

        postBottom.appendChild(shareIcon);
    }



// i change place swm


    // Create next and previous buttons
    if (rowData.imageUrls.length > 1 || (rowData.videoUrls && rowData.videoUrls.length > 1)) {

        const nextButton = document.createElement('button');
        nextButton.classList.add('carousel-control-next');
        nextButton.setAttribute('type', 'button');
        nextButton.setAttribute('data-bs-target', `#${carouselId}`); // Use the carouselId here
        nextButton.setAttribute('data-bs-slide', 'next');
        nextButton.innerHTML = '<span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>';
        nextButton.style.height = '50%'; // Set a fixed height for videos
        nextButton.style.marginTop = '15%'; // Set a fixed height for videos
        const prevButton = document.createElement('button');
        prevButton.classList.add('carousel-control-prev');
        prevButton.setAttribute('type', 'button');
        prevButton.setAttribute('data-bs-target', `#${carouselId}`); // Use the carouselId here
        prevButton.setAttribute('data-bs-slide', 'prev');
        prevButton.innerHTML = '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>';
        prevButton.style.height = '50%'; // Set a fixed height for videos
        prevButton.style.marginTop = '15%'; // Set a fixed height for videos
        // Add event listeners for next and previous buttons
        nextButton.addEventListener('click', () => {
            const carouselElement = document.getElementById(carouselId); // Use the carouselId here
            const carouselInstance = new bootstrap.Carousel(carouselElement);
            carouselInstance.next();
        });

        prevButton.addEventListener('click', () => {
            const carouselElement = document.getElementById(carouselId); // Use the carouselId here
            const carouselInstance = new bootstrap.Carousel(carouselElement);
            carouselInstance.prev();
        });

        // Append next and previous buttons to carousel
        carousel.appendChild(nextButton);
        carousel.appendChild(prevButton);
    }

    // Append all sections to the post element

    post.appendChild(info);
    //   post.appendChild(editButton);
    post.appendChild(postBody);
    post.appendChild(carousel); // Append carousel to post
    post.appendChild(postBottom);

    // Append the post element to the container
    const postDiv = document.querySelector('.profile-section-main');
    postDiv.appendChild(post);




    //  });
};

// content list //

// to show data in update modal update post //
$(document).ready(function() {
    // Function to delete uploaded photo or video
    function deleteItem(item) {
        item.remove(); // Remove the item from the DOM
    }

    $('#exampleModal').on('show.bs.modal', function (event) {
        // Clear uploaded photos and file input field
        $(".uploaded-photos").empty();
        $('#multipartFile1').val('');
        allFiles1 = []; // Clear the allFiles array


        const button = $(event.relatedTarget);
        const postId = button.data('id');
        const text = button.data('text');
        const isPublic = button.data('ispublic');
        const groupId = button.data('groupid');

        // Extract data from data-* attributes
        const imageUrlsString = button.data('imageurls');
        const videoUrlsString = button.data('videourls');

        $('#id').val(postId);
        $('#text1').val(text);
        $('#isPublic1').val(isPublic);
        $('#groupId1').val(groupId);


        console.log("imageUrlsString:", imageUrlsString);
        console.log("videoUrlsString:", videoUrlsString);

        try {
            // Parse JSON strings to arrays or set default values
            const imageUrlsArray = imageUrlsString ? imageUrlsString : [];
            const videoUrlsArray = videoUrlsString ? videoUrlsString : [];

            // Clear any existing content in the modal body
            $('#photo6').empty();
            $('#video').empty();

            // Display images
            imageUrlsArray.forEach(imageUrl => {
                const imgContainer = $('<div>').addClass('uploaded-item-container');
                const img = $('<img>').addClass('uploaded-item');

                // Create delete icon for the image
                const deleteIcon = $('<i>').addClass('fas fa-times-circle delete-icon');
                deleteIcon.on('click', function() {
                    deleteItem(imgContainer);
                });

                img.on('load', function() {
                    imgContainer.append(img);
                    imgContainer.append(deleteIcon); // Append the delete icon to the container
                    $('#photo6').append(imgContainer);
                }).on('error', function() {
                    console.error("Error loading image:", imageUrl);
                });

                img.attr('src', imageUrl);
            });

            // Display videos
            videoUrlsArray.forEach(videoUrl => {
                const videoContainer = $('<div>').addClass('uploaded-item-container');
                const video = $('<video controls>').addClass('uploaded-item');

                // Create delete icon for the video
                const deleteIcon = $('<i>').addClass('fas fa-times-circle delete-icon');
                deleteIcon.on('click', function() {
                    deleteItem(videoContainer);
                });

                video.attr('src', videoUrl);
                videoContainer.append(video);
                videoContainer.append(deleteIcon); // Append the delete icon to the container
                $('#video').append(videoContainer);
            });
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
});


// kym share list //

// listData1();

const populatedTable1 = async (share) => {
    try{
        const carouselId = `carousel-${share.userId}-${share.contentId}-${Math.random().toString(36).substr(2, 9)}`;

        // Fetch user data
        const response = await fetch(`/user/users/${share.userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();

        // Fetch user data
        const response11 = await fetch(`/user/share-user/${share.shareUserId}`);
        if (!response11.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData1 = await response11.json();

        // Fetch content data
        const response1 = await fetch(`/content/${share.contentId}`);
        let contentData;
        if (response1.status === 404) {
            contentData = { text: "Content is not found" };
        } else {
            contentData = await response1.json();
        }


        // Create post elements
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        postDiv.style.width = '500px';
        postDiv.style.marginRight = '198px';
        postDiv.style.backgroundColor='white';

        // First User Info Div (Shared User)
        const shareUserInfo = document.createElement('div');
        shareUserInfo.classList.add('info');
        shareUserInfo.id = 'share-user-info';
        const userIcon = document.createElement('i');
        const userPhoto = document.createElement('img');
        userPhoto.src = userData1?.photo || 'default_photo_url';
        userPhoto.alt = 'User';
        userPhoto.id = 'share-user-photo';
        userPhoto.style.borderRadius = '200px';
        userPhoto.style.width = '60px';
        userPhoto.style.height = '60px';

        userPhoto.addEventListener('click', () => {
            viewUserProfile(userData1.staffId); // Function to redirect to user profile view
        });


        // Function to redirect to user profile view
        function viewUserProfile(staffId) {
            window.location.href = `/user/userprofile?staffId=${staffId}`;
        }


        const userName = document.createElement('span');
        userName.style.marginLeft = '10px';
        userName.id = 'share-user-name';
        userName.textContent = userData1?.name || 'Unknown User';
        userName.style.marginLeft = '11px';
        userName.style.fontSize='24px';
        userName.style.fontFamily='math';

        const postInfoDiv1 = document.createElement('div');
        // postInfoDiv1.style.marginTop = '10px';
        // postInfoDiv1.style.marginBottom = '20px';
        postInfoDiv1.style.marginTop = '-24px';
        postInfoDiv1.style.marginBottom = '20px';
        postInfoDiv1.style.marginLeft = '53px';
        // const isPublicSpan1 = document.createElement('span');
        // isPublicSpan1.id = 'isPublic33';
        // isPublicSpan1.textContent = share.isPublic;

        const isPublicSpan1 = document.createElement('span');
        // Check the value of isPublic and set the appropriate icon class
        if (share.isPublic === 'public') {
            isPublicSpan1.className = 'fa-solid fa-earth-americas '; // Font Awesome globe icon for public
        } else if (share.isPublic === 'private') {
            isPublicSpan1.className = 'fa fa-lock '; // Font Awesome lock icon for private
        }
        isPublicSpan1.style.marginLeft='0.5%';

        const createdDateSpan1 = document.createElement('span');
        createdDateSpan1.id = 'createdDate33';
        createdDateSpan1.textContent = share.time ? formatPostTime(share.time) : '';
        createdDateSpan1.style.fontSize='small';
        createdDateSpan1.style.marginLeft='21px';

        postInfoDiv1.appendChild(createdDateSpan1);
        postInfoDiv1.appendChild(isPublicSpan1);
        const captionDiv = document.createElement('div');
        captionDiv.style.marginTop = '35px';
        captionDiv.style.marginBottom = '20px';
        captionDiv.style.borderBottom = '1px solid gray';
        const captionP = document.createElement('p');
        captionP.id = 'caption3';
        captionP.textContent = share.caption;
        captionP.innerHTML = share.caption.replace(/@([\w\s]+?)(?=\s|$|[^@\w\s])/g, mention => {
            return `<span class="mention">${mention}</span>`;
        });
        captionDiv.appendChild(captionP);
        shareUserInfo.appendChild(userIcon);
        shareUserInfo.appendChild(userPhoto);
        shareUserInfo.appendChild(userName);
        shareUserInfo.appendChild(postInfoDiv1);
        shareUserInfo.appendChild(captionDiv);

        // Create the dropdown menu container
        const dropdownContainer = document.createElement('span');
        dropdownContainer.classList.add('dropdown');
        dropdownContainer.style.float = 'right'; // Align to the right end
        dropdownContainer.style.marginTop = '5px'; // Align to the right end
        const loginUserId=document.getElementById('id2').value;
        const role=document.getElementById('role').value;

        if(loginUserId == userData1.id && role == "Admin"){
            // Create the three dots icon button
            const threeDotsButton = document.createElement('button');
            threeDotsButton.classList.add('btn', 'btn-secondary');
            threeDotsButton.setAttribute('type', 'button');
            threeDotsButton.setAttribute('id', 'dropdownMenuButton');
            threeDotsButton.setAttribute('data-bs-toggle', 'dropdown');
            threeDotsButton.setAttribute('aria-expanded', 'false');
            threeDotsButton.innerHTML = '<i class="fas fa-ellipsis-v"></i>'; // Using Font Awesome for three dots icon

            // Create the dropdown menu
            const dropdownMenu = document.createElement('ul');
            dropdownMenu.classList.add('dropdown-menu');
            dropdownMenu.setAttribute('aria-labelledby', 'dropdownMenuButton');

            // Proceed with creating the update item
            const updateItem = document.createElement('li');
            updateItem.innerHTML = `
            <button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModal3"
                data-id="${share.id}"
                data-content-id="${share.contentId}"
                data-caption="${share.caption}"
                data-share-user-id="${share.shareUserId}"
                data-user-id="${share.userId}"
                data-ispublic="${share.isPublic}"
                data-groupid="${share.groupId}"
            >
                Update
            </button>`;

            // Create the delete item in the dropdown menu
            const deleteItem = document.createElement('li');
            deleteItem.innerHTML = '<button class="dropdown-item" type="button">Delete</button>';
            deleteItem.addEventListener('click', () => deleteShare(share.id));

            // Append the update and delete items to the dropdown menu
            dropdownMenu.appendChild(updateItem);
            dropdownMenu.appendChild(deleteItem);

            // Append the three dots button and dropdown menu to the dropdown container
            dropdownContainer.appendChild(threeDotsButton);
            dropdownContainer.appendChild(dropdownMenu);
        }
        postDiv.appendChild(dropdownContainer);
        postDiv.appendChild(shareUserInfo);

        // Second User Info Div (Content Owner)
        const contentOwnerInfo = document.createElement('div');
        contentOwnerInfo.classList.add('info');
        contentOwnerInfo.id = 'content-owner-info';
        const ownerIcon = document.createElement('i');
        const ownerPhoto = document.createElement('img');
        ownerPhoto.src = userData?.photo || 'default_photo_url';
        ownerPhoto.alt = 'User';
        ownerPhoto.id = 'post-owner-photo';
        ownerPhoto.style.borderRadius = '200px';
        ownerPhoto.style.width = '60px';
        ownerPhoto.style.height = '60px';


        ownerPhoto.addEventListener('click', () => {
            viewUserProfile(userData.staffId); // Function to redirect to user profile view
        });


        // Function to redirect to user profile view
        function viewUserProfile(staffId) {
            window.location.href = `/user/userprofile?staffId=${staffId}`;
        }

        const ownerName = document.createElement('span');
        ownerName.style.marginLeft = '10px';
        ownerName.id = 'post-owner-name';
        ownerName.textContent = userData?.name || 'Unknown User';
        ownerName.style.marginLeft = '11px';
        ownerName.style.fontSize='24px';
        ownerName.style.fontFamily='math';

        const postInfoDiv2 = document.createElement('div');
        // postInfoDiv2.style.marginTop = '10px';
        // postInfoDiv2.style.marginBottom = '20px';
        postInfoDiv2.style.marginTop = '-24px';
        postInfoDiv2.style.marginBottom = '20px';
        postInfoDiv2.style.marginLeft = '53px';

        // const isPublicSpan2 = document.createElement('span');
        // isPublicSpan2.id = 'isPublic3';
        // isPublicSpan2.textContent = contentData.isPublic;

        const isPublicSpan2 = document.createElement('span');
        // Check the value of isPublic and set the appropriate icon class
        if (contentData.isPublic === 'public') {
            isPublicSpan2.className = 'fa-solid fa-earth-americas '; // Font Awesome globe icon for public
        } else if (contentData.isPublic === 'private') {
            isPublicSpan2.className = 'fas fa-lock fa-lg'; // Font Awesome lock icon for private
        }
        isPublicSpan2.style.marginLeft='0.5%';


        const createdDateSpan2 = document.createElement('span');
        createdDateSpan2.id = 'createdDate3';
        createdDateSpan2.style.fontSize='small';
        createdDateSpan2.style.marginLeft='21px';

        createdDateSpan2.textContent = contentData.createdDate ? formatPostTime(contentData.createdDate) : '';

        postInfoDiv2.appendChild(createdDateSpan2);
        postInfoDiv2.appendChild(isPublicSpan2);
        contentOwnerInfo.appendChild(ownerIcon);
        contentOwnerInfo.appendChild(ownerPhoto);
        contentOwnerInfo.appendChild(ownerName);
        contentOwnerInfo.appendChild(postInfoDiv2);
        postDiv.appendChild(contentOwnerInfo);

        // Post Body
        const postBody = document.createElement('div');
        postBody.classList.add('post-body');
        postBody.style.width = '500px';
        postBody.style.overflow = 'hidden';
        postBody.style.wordWrap = 'break-word';
        postBody.style.whiteSpace = 'normal';
        postBody.style.marginLeft = '-13px';



// Function to create a unique ID
        const createUniqueId = (prefix) => {
            return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
        };

// Check if content data is available
        if (contentData) {
            // Text
            const textP = document.createElement('p');
            textP.id = 'text3';
            textP.style.marginBottom = '40px';
            textP.style.marginTop = '25px';
            textP.textContent = contentData.text;
            postBody.appendChild(textP);

            // Carousel
            const carouselDiv = document.createElement('div');
            carouselDiv.classList.add('carousel', 'slide');
            const carouselId = createUniqueId('carouselExample');
            carouselDiv.setAttribute('id', carouselId);
            carouselDiv.setAttribute('data-bs-interval', 'false'); // Disable auto sliding

            // Carousel Inner
            const carouselInnerDiv = document.createElement('div');
            carouselInnerDiv.classList.add('carousel-inner');

            // Check if there are any images or videos
            const hasImages = contentData.imageUrls && contentData.imageUrls.length > 0;
            const hasVideos = contentData.videoUrls && contentData.videoUrls.length > 0;

            if (hasImages || hasVideos) {
                // Create the slide indicator
                const slideIndicator = document.createElement('div');
                slideIndicator.classList.add('slide-indicator');
                slideIndicator.style.position = 'absolute';
                slideIndicator.style.top = '10px';
                slideIndicator.style.right = '10px';
                slideIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                slideIndicator.style.color = 'white';
                slideIndicator.style.padding = '5px 10px';
                slideIndicator.style.borderRadius = '5px';
                slideIndicator.style.zIndex = '10';
                carouselDiv.appendChild(slideIndicator);

                const totalSlides = (hasImages ? contentData.imageUrls.length : 0) + (hasVideos ? contentData.videoUrls.length : 0);
                let currentSlide = 1;

                const updateSlideIndicator = () => {
                    slideIndicator.innerText = `${currentSlide}/${totalSlides}`;
                };

                updateSlideIndicator();

                // Populate carousel with images
                contentData.imageUrls?.forEach((imageUrl, imgIndex) => {
                    const carouselItem = document.createElement('div');
                    carouselItem.classList.add('carousel-item');
                    if (imgIndex === 0) {
                        carouselItem.classList.add('active');
                    }
                    const image = document.createElement('img');
                    image.src = imageUrl;
                    image.classList.add('d-block', 'w-100');
                    image.style.height = '300px'; // Set a fixed height for img
                    image.alt = `Slide ${imgIndex + 1}`;

                    image.addEventListener('click', () => {
                        $('#fullSizeImageModal').modal('show');
                        const modalImage = document.getElementById('fullSizeImage');
                        modalImage.src = imageUrl; // Set the src attribute of the modal image
                    });

                    carouselItem.appendChild(image);
                    carouselInnerDiv.appendChild(carouselItem);
                });

                // Populate carousel with videos
                contentData.videoUrls?.forEach((videoUrl, videoIndex) => {
                    const carouselItem = document.createElement('div');
                    carouselItem.classList.add('carousel-item');
                    if (videoIndex === 0 && (!contentData.imageUrls || contentData.imageUrls.length === 0)) {
                        carouselItem.classList.add('active');
                    }
                    const video = document.createElement('video');
                    video.src = videoUrl;
                    video.controls = true;
                    video.classList.add('d-block', 'w-100');
                    video.style.height = '300px'; // Set a fixed height for videos
                    video.alt = `Slide ${videoIndex + 1}`;
                    carouselItem.appendChild(video);
                    carouselInnerDiv.appendChild(carouselItem);
                });

                carouselDiv.addEventListener('slide.bs.carousel', (e) => {
                    currentSlide = e.to + 1;
                    updateSlideIndicator();
                });

                // Create next and previous buttons
                const nextButton = document.createElement('button');
                nextButton.classList.add('carousel-control-next');
                nextButton.setAttribute('type', 'button');
                nextButton.setAttribute('data-bs-target', `#${carouselId}`);
                nextButton.setAttribute('data-bs-slide', 'next');
                nextButton.innerHTML = '<span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>';
                nextButton.style.height = '50%'; // Set a fixed height for videos
                nextButton.style.marginTop = '15%'; // Set a fixed height for videos

                const prevButton = document.createElement('button');
                prevButton.classList.add('carousel-control-prev');
                prevButton.setAttribute('type', 'button');
                prevButton.setAttribute('data-bs-target', `#${carouselId}`);
                prevButton.setAttribute('data-bs-slide', 'prev');
                prevButton.innerHTML = '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>';
                prevButton.style.height = '50%'; // Set a fixed height for videos
                prevButton.style.marginTop = '15%'; // Set a fixed height for videos

                // Append next and previous buttons to carousel
                carouselDiv.appendChild(nextButton);
                carouselDiv.appendChild(prevButton);
            }

            carouselDiv.appendChild(carouselInnerDiv);
            postBody.appendChild(carouselDiv);
        } else {
            // Content is not found
            const notFoundText = document.createElement('p');
            notFoundText.textContent = 'Content is not found';
            postBody.appendChild(notFoundText);
        }

        postDiv.appendChild(postBody);

        // Post Bottom

        const postBottomDiv = document.createElement('div');
        postBottomDiv.classList.add('post-bottom');
        const heartIcon = document.createElement('i');
        heartIcon.classList.add('fas', 'fa-heart');
        const commentIcon = document.createElement('i');
        commentIcon.classList.add('fas', 'fa-comment');
        //swm//
        const likeCountSpan = document.createElement('span');
        likeCountSpan.textContent = share.likeCount;
        //swm

        const commentCount = document.createElement('span');
        commentCount.classList.add('comment-count');
        //swm-comment
        fetchCommentCountForShare(share.id,commentCount);
        let commentSectionVisible = false;
        commentIcon.addEventListener('click', () => {
            if (!commentSectionVisible) {
                showCommentTemplate(share.id, postDiv);
                loadExistingShareComments(share.id, postDiv);
                fetchCommentCountForShare(share.id,commentCount);
                commentSectionVisible = true;
            } else {
                // If the comment section is already visible, hide it
                fetchCommentCountForShare(share.id,commentCount);
                hideCommentTemplate(postDiv);
                commentSectionVisible = false;
            }
        });
        function hideCommentTemplate(postElement) {
            unsubscribeFromCommentTopic();
            unsubscribeFromReplyTopic();
            const commentSection = postElement.querySelector('.comment-box-container');
            if (commentSection) {
                postElement.removeChild(commentSection);
            }
            const existingComments = postElement.querySelectorAll('.comment-element');
            existingComments.forEach(comment => {
                comment.remove();
                // Remove any existing replies for each comment
                const existingReplies = comment.querySelectorAll('.reply');
                existingReplies.forEach(reply => {
                    reply.remove();
                });
            });
        }
        function showCommentTemplate(shareId, postElement) {

            hideCommentTemplate(postElement);
            // Create the comment section template
            const commentBoxContainer = document.createElement('div');
            commentBoxContainer.classList.add('comment-box-container');
            commentBoxContainer.style.display = 'flex';
            commentBoxContainer.style.alignItems = 'center';

            const messageBox = document.createElement('textarea');
            messageBox.setAttribute('placeholder', 'Write your comment here...');
            messageBox.classList.add('reply-message-box');
            messageBox.style.flexGrow = '1';

            const submitButton = document.createElement('button');
            submitButton.classList.add('reply-submit-button');
            const submitIcon = document.createElement('i');
            submitIcon.classList.add('fas', 'fa-paper-plane');
            submitButton.appendChild(submitIcon);
            // Add event listener to submit the comment when the button is clicked
            submitButton.addEventListener('click', () => {

                const userId = document.getElementById('id1').value;
                const comment = messageBox.value.trim();
                if (comment.length > 0) {
                    sendCommentForShare(shareId, userId, comment);
                    subscribeToShareCommentTopic(shareId,postElement);
                    messageBox.value = '';
                }
            });

            commentBoxContainer.appendChild(messageBox);
            commentBoxContainer.appendChild(submitButton);
            postElement.appendChild(commentBoxContainer);

            // Initialize Tribute.js
            const tribute = new Tribute({
                values: (text, cb) => {
                    fetch(`/user/search?q=${text}`)
                        .then(response => response.json())
                        .then(users => {
                            if (users.length === 0) {
                                cb([]);
                            } else {
                                cb(users.map(user => ({
                                    key: user.key,
                                    value: user.value,
                                    userId: user.userId
                                })));
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching user data:', error);
                            cb([]);
                        });
                },
                selectTemplate: function(item) {
                    if (typeof item === 'undefined') return null;
                    return `@${item.original.value}`;
                },
                menuItemTemplate: function(item) {
                    return `<li data-user-id="${item.original.userId}">@${item.original.value}</li>`; // Include userId in the template
                }
            });

            tribute.attach(messageBox);
        }
        function sendCommentForShare(shareId, userId, comment) {
            const message = {
                shareId: shareId,
                userId: userId,
                comment: comment,
                time: new Date()
            };
            stompClient2.send('/app/send-comment-share', {}, JSON.stringify(message));
        }

        const shareId = share.id;
        heartIcon.addEventListener('click', async () => {
            let currentLikeCount = await getShareLikeCount(shareId);

            try {
                const response = await fetch(`/api/share/${shareId}/like-share`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Liked or disliked successfully, update UI
                    isLiked = !isLiked;
                    currentLikeCount = await getShareLikeCount(shareId);
                    likeCountSpan.textContent = currentLikeCount;
                    if (isLiked) {
                        heartIcon.classList.add('likedShare');
                    } else {
                        heartIcon.classList.remove('likedShare');
                    }
                    sendLikeNotification(share.shareUserId, isLiked, currentLikeCount);
                } else {
                    const errorMessage = await response.text();
                    console.error('Failed to like post:', response.status, errorMessage);
                    throw new Error('Failed to like post: ' + errorMessage);
                }
            } catch (error) {
                console.error('Error liking post:', error);
            }
        });
        let isLiked = await getLikeStatus(shareId);

        // Update the like icon based on the current like status
        if (isLiked) {
            heartIcon.classList.add('likedShare');
        } else {
            heartIcon.classList.remove('likedShare');
        }


        // Function to send like notification
        function sendLikeNotification(ownerId, isLiked, currentLikeCount) {
            const userId = document.getElementById('id2').value;
            if (isLiked) {
                const notification = {
                    ownerId: ownerId,
                    message: 'Your post has been liked by ' + userId
                };
                // Send notification via WebSocket
                stompClient2.send(`/app/private-message`, {}, JSON.stringify(notification));
                console.log('Like notification sent to user:', ownerId);
            }
        }

        // Function to get like count
        async function getShareLikeCount(shareId) {
            const response = await fetch(`/api/share/${shareId}/like-count-share`);
            const data = await response.json();
            return data.likeCountShare;
        }

        // Function to get like status
        async function getLikeStatus(shareId) {
            const response = await fetch(`/api/share/${shareId}/like-status`);
            const data = await response.json();
            return data.likedShare;
        }


// Share icon click event listener
        const shareIcon = document.createElement('i');
        shareIcon.classList.add('fas', 'fa-share');

        // Define updateGroupDropdown function before using it
        const updateGroupDropdown = async () => {
            const isPublicSelect = document.getElementById("isPublic2");
            const groupIdDropdown = document.getElementById('groupId2');

            groupIdDropdown.innerHTML = ''; // Clear previous options

            if (isPublicSelect.value === 'private') {
                // Add "Profile" option for private content if it doesn't exist
                if (!groupIdDropdown.querySelector('option[value="0"]')) {
                    const profileOption = document.createElement('option');
                    profileOption.value = "0";
                    profileOption.textContent = "Profile";
                    groupIdDropdown.appendChild(profileOption);
                }
            } else {
                // Fetch group data for public content
                const responseGroup = await fetch(`/group/gp`);
                if (!responseGroup.ok) {
                    throw new Error('Failed to fetch group data');
                }
                const groupData = await responseGroup.json();
                console.log("group data:", groupData); // This line helps to debug

                // Add "New Feed" option if it doesn't exist
                if (!groupIdDropdown.querySelector('option[value="0"]')) {
                    const newFeedOption = document.createElement('option');
                    newFeedOption.value = "0";
                    newFeedOption.textContent = "New Feed";
                    groupIdDropdown.appendChild(newFeedOption);
                }

                // Append group options if they don't already exist
                groupData.forEach(group => {
                    if (!groupIdDropdown.querySelector(`option[value="${group.id}"]`)) {
                        const option = document.createElement('option');
                        option.value = group.id;
                        option.textContent = group.name;
                        if (group.photo) {
                            option.setAttribute('data-thumbnail', group.photo);
                        }
                        groupIdDropdown.appendChild(option);
                    }
                });
            }
        };

// Attach change event listener to the isPublic select box once
        const isPublicSelect = document.getElementById("isPublic2");
        isPublicSelect.removeEventListener('change', updateGroupDropdown); // Remove existing listener
        isPublicSelect.addEventListener('change', updateGroupDropdown);

        shareIcon.addEventListener('click', async () => {
            const contentId = contentData.id;
            const userId = userData.id;

            $('#contentId').val(contentId);
            $('#userId').val(userId);

            // Call the function initially to set the correct options based on the initial value
            await updateGroupDropdown();

            $('#exampleModal1').modal('show');

            const captionTextarea = document.getElementById("caption");
            const isPublicSelect = document.getElementById("isPublic2");

            captionTextarea.value = "";
            document.getElementById("error-share").style.display = "none";



        });

// Event listener to clear data when modal is closed
        $('#exampleModal1').on('hidden.bs.modal', function () {
            const captionTextarea = document.getElementById("caption");
            const isPublicSelect = document.getElementById("isPublic2");
            const groupIdDropdown = document.getElementById('groupId2');

            captionTextarea.value = "";
            isPublicSelect.value = "public"; // Reset to default value if needed
            groupIdDropdown.innerHTML = ''; // Clear previous options
        });


        postBottomDiv.appendChild(heartIcon);
        postBottomDiv.appendChild(likeCountSpan)
        postBottomDiv.appendChild(commentIcon);
        postBottomDiv.appendChild(commentCount);
        postBottomDiv.appendChild(shareIcon);
        postDiv.appendChild(postBottomDiv);

        const formPost = document.querySelector('.profile-section-main');
        formPost.appendChild(postDiv);

    } catch (error) {
        console.error('An error occurred:', error.message);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = `Error: ${error.message}`;
        const formPost = document.querySelector('.profile-section-main');
        formPost.appendChild(errorMessage);
    }
}

//kym share list end //


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


//  share update box add data from buttom //
$(document).ready(function() {
    // Update Share Form Modal
    $('#exampleModal3').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const id = button.data('id');
        const contentId = button.data('content-id');
        const caption = button.data('caption');
        const shareUserId = button.data('share-user-id');
        const userId = button.data('user-id');
        const isPublic = button.data('ispublic');
        const groupId = button.data('groupid');

        console.log(button.data());
        console.log(button.data('content-id')); // Use lowercase "i"

        $('#id3').val(id);
        $('#caption4').val(caption);
        $('#contentId3').val(contentId);
        $('#isPublic44').val(isPublic);
        $('#shareUserId3').val(shareUserId);
        $('#userId3').val(userId);
        $('#groupId3').val(groupId);

        console.log("contentId",contentId);
        console.log("userId",userId);
        console.log("shareUserId",shareUserId);
        console.log("isPublic",isPublic);
        console.log("groupId",groupId);

    });
});


// kym post create //
document.getElementById('submitButton').addEventListener('click', async () => {
    const formData = new FormData(document.getElementById('userForm'));
    const text = document.getElementById('text').value;
    const isPublic = document.getElementById('isPublic').value;
    const groupId = document.getElementById('groupId').value;

    formData.append('text', text);
    formData.append('isPublic', isPublic);
    formData.append('groupId', groupId);

    // Append each file in allFiles to the formData
    allFiles.forEach(file => {
        formData.append('multipartFile', file);
    });

    const url = '/create';

    // Show spinner
    document.getElementById("loading-spinner").style.display = "flex";
    // Close modal
    document.querySelector(".comment").style.display = "none";

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();

            // Wait for a moment before reloading
            setTimeout(() => {
                location.reload();
            }, 1000);

            // Optionally, update the UI or fetch new data if needed
            await fetchData();

            // Display success message
            document.getElementById('btn').innerHTML = data.message;
        } else {
            console.error('Failed to create content');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
// kym post create end //

//kym  post update //
$(document).ready(function() {
    $('#submitBtn').on('click', async () => {

        try {
            // Create a new FormData object to collect form data
            const formData = new FormData();

            // Get values from text inputs

            // Get values from text inputs
            const id = $('#id').val();
            const text = $('#text1').val();
            const isPublic = $('#isPublic1').val();
            const groupId = $('#groupId1').val();
            console.log("update Id :" +typeof id);
            console.log("update groupId :" + typeof groupId);

            // Append text input values to FormData
            formData.append('id', id);
            formData.append('text', text);
            formData.append('isPublic', isPublic);
            formData.append('groupId', groupId);


            // // Get the file input element
            // const fileInput = document.getElementById('multipartFile1');

            // // Log file input element
            // console.log("File input element:", fileInput);
            //
            // // Check if files are selected
            // if (fileInput.files.length > 0) {
            //     console.log("Number of files selected:", fileInput.files.length);
            //     // Append each file individually
            //     for (let i = 0; i < fileInput.files.length; i++) {
            //         console.log("File", i + 1, ":", fileInput.files[i]);
            //         formData.append(`file`, fileInput.files[i]); // Use 'file' with index as the key
            //     }
            // } else {
            //     console.error('No files selected');
            // }

            // Append files from allFiles1 array
            if (allFiles1.length > 0) {
                console.log("Number of files in allFiles1:", allFiles1.length);
                allFiles1.forEach((file, index) => {
                    console.log("Appending file:", file.name);
                    formData.append('file', file);
                });
            } else {
                console.error('No files in allFiles1');
            }

            // Log FormData object
            console.log("FormData:", formData);

            // Get the image URLs from the #photo container
            const imageUrls = [];
            $('#photo img').each(function() {
                imageUrls.push($(this).attr('src'));
            });
            // Append image URLs to FormData
            imageUrls.forEach((url, index) => {
                formData.append(`imageUrl`, url);
            });

            // Get the video URLs from the #video container
            const videoUrls = [];
            $('#video video').each(function() {
                videoUrls.push($(this).attr('src'));
            });
            // Append video URLs to FormData
            videoUrls.forEach((url, index) => {
                formData.append(`videoUrl` , url);
            });

            // Send the FormData object to the server
            const url = '/update';
            const response = await fetch(url, {
                method: 'PUT',
                body: formData
            });
            if (response.ok) {
                console.log('Update successful');
                await fetchData();
                $('#exampleModal').modal('hide');
            } else {
                console.error('Failed to update content');
            }
            setTimeout( () =>{
                location.reload();
            },1000);
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
// kym post update end //


//kym post delete start //
const deleteUser = async (id) => {
    const url = `/delete/${id}`;
    const deletedUser = await fetch(url,{
        method:'PUT',
    });
    if(deletedUser.ok){
        console.log("delete success");
        await fetchData();
    }
    setTimeout( () =>{
        location.reload();
    },1000);
}
//kym post delete end //


// kym share create start //
document.getElementById('submitBtn2').addEventListener('click', async () => {
    const formData = new FormData();

    // Get values from text inputs
    const caption = $('#caption').val(); // Assuming the caption input has the id 'caption'
    const share = $('#share').val(); // Assuming the share input has the id 'share'
    const isPublic = $('#isPublic2').val(); // Get isPublic2
    const contentId = $('#contentId').val(); // Get contentId
    const userId = $('#userId').val(); // Get userId
    const groupId = $('#groupId2').val(); // Get userId

    // Append text input values to FormData
    formData.append('caption', caption);
    formData.append('share', share);
    formData.append('isPublic', isPublic);
    formData.append('contentId', contentId); // Append contentId
    formData.append('userId', userId); // Append userId
    formData.append('groupId', groupId); // Append userId


    const url = '/createShare';
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            console.log('create successful');
            $('#exampleModal1').modal('hide');
        } else {
            console.error('Failed to create share');
        }
        setTimeout( () =>{
            location.reload();
        },1000);
    } catch (error) {
        console.error('Error:', error);
    }
});
// kym share create is end //


// kym share update is start //
$(document).ready(function() {
    $('#submitBtn3').on('click', async () => {
        try {
            // Create a new FormData object to collect form data
            const formData = new FormData();

            // Get values from text inputs
            const id = $('#id3').val();
            const contentId = $('#contentId3').val();
            const userId = $('#userId3').val();
            const shareUserId = $('#shareUserId3').val();
            const caption = $('#caption4').val();
            const isPublic1 = $('#isPublic44').val();
            const groupId = $('#groupId3').val();


            // Append text input values to FormData
            formData.append('id', id);
            formData.append('contentId', contentId);
            formData.append('userId', userId);
            formData.append('shareUserId', shareUserId);
            formData.append('caption', caption);
            formData.append('isPublic1', isPublic1);
            formData.append('groupId', groupId);

            // Send the FormData object to the server
            const url = '/updateShare';
            const response = await fetch(url, {
                method: 'PUT',
                body: formData
            });
            if (response.ok) {
                console.log('Update successful');
                await fetchData();
                $('#exampleModal3').modal('hide');
            } else {
                console.error('Failed to update content');
            }
            setTimeout( () =>{
                location.reload();
            },1000);
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
// kym share update is end //


// kym share delete start //
const deleteShare = async (id) => {
    const url = `/deleteShare/${id}`;
    const deletedUser = await fetch(url,{
        method:'PUT',
    });
    if(deletedUser.ok){
        console.log("delete success");
        await fetchData();
    }
    setTimeout( () =>{
        location.reload();
    },1000);
}
// kym share delete end //





// post modal open //
//
// // Function to clear modal contents
// function clearModalContents() {
//     $(".comment-body textarea").val(""); // Clear textarea
//     $(".uploaded-photos").empty(); // Clear uploaded photos container
//     $(".button-send").css({ // Reset button styles
//         background: "#e7e7e7",
//         cursor: "none"
//     });
//     $(".submitButton").css({ // Reset button styles
//         background: "#e7e7e7",
//         cursor: "none"
//     });
//     $('#multipartFile').val('');
// }
//
// function handlePostCreationSuccess() {
//     clearModalContents(); // Clear modal contents
//     $(".comment").removeClass("block"); // Close modal
// }
//




// haha //

// Function to clear modal contents
function clearModalContents() {
    allFiles = []; // Clear the allFiles array
    $(".comment-body textarea").val(""); // Clear textarea
    $(".uploaded-photos").empty(); // Clear uploaded photos container
    $(".button-send").css({ // Reset button styles
        background: "#e7e7e7",
        cursor: "none"
    });
    $(".submitButton").css({ // Reset button styles
        background: "#e7e7e7",
        cursor: "none"
    });
    $('#multipartFile').val('');
}


$(".form-submit").click(function () {
    document.getElementById("error-message").style.display = "none";

    console.log("New Post");
    clearModalContents(); // Clear modal contents when opening
    $(".comment").addClass("block");
    $(".overlay").show(); // Show overlay
    $(".fa-times").click(function () {
        $(".comment").removeClass("block");
        $(".overlay").hide(); // Hide overlay
    });
});


let allFiles = [];
// Debounced function to handle file input change
const handleFileInputChange = debounce(function(event) {
    console.log("File input changed");

    const files = Array.from(event.target.files);
    const uploadedPhotosContainer = $('.uploaded-photos');

    // Add new files to the allFiles array and avoid duplicates
    files.forEach(file => {
        if (!allFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
            console.log("Adding file:", file.name);
            allFiles.push(file);
        }
    });

    // Clear the file input to handle re-uploads of the same file
    event.target.value = '';

    // Render files
    renderFiles();
}, 300);

// Attach change event handler
$('#multipartFile').change(handleFileInputChange);

// Function to render files
function renderFiles() {
    const uploadedPhotosContainer = $('.uploaded-photos');
    uploadedPhotosContainer.empty();

    allFiles.forEach((file, index) => {
        console.log("Rendering file:", file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContainer = $('<div>').addClass('file-container').attr('data-index', index);
            const closeButton = $('<span>').addClass('close-button').text('×').click(function() {
                const fileIndex = $(this).parent().data('index');
                allFiles.splice(fileIndex, 1); // Remove the file from allFiles array
                renderFiles();
            });
            fileContainer.append(closeButton);
            if (file.type.startsWith('image')) {
                const image = $('<img>').addClass('uploaded-photo').attr('src', e.target.result).click(function() {
                    showFullSizeImage(e.target.result);
                });
                fileContainer.append(image);
            } else if (file.type.startsWith('video')) {
                const video = $('<video controls>').addClass('uploaded-photo').attr('src', e.target.result);
                fileContainer.append(video);
            } else {
                console.log('Unsupported file type: ' + file.type);
            }
            uploadedPhotosContainer.append(fileContainer);
        };
        reader.readAsDataURL(file);
    });
}

// Function to show full-size image
function showFullSizeImage(src) {
    const modal = $('#image-modal');
    const fullImage = $('#full-image');
    fullImage.attr('src', src);
    modal.css('opacity', '1'); // Set opacity to 1

    modal.show();
}

// Function to hide full-size image
function hideFullSizeImage() {
    const modal = $('#image-modal');
    modal.css('opacity', '0'); // Set opacity to 0 for fade-out effect
    setTimeout(() => {
        modal.hide(); // Hide the modal after the fade-out transition
    }, 300); // Duration of the fade transition (matches the CSS transition duration)
}
$('#image-modal').hide();



// Event handler for closing the modal
$('.close-modal').click(hideFullSizeImage);

// Optional: Close the modal when clicking outside the image
$('#image-modal').click((e) => {
    if (e.target.id === 'image-modal') {
        hideFullSizeImage();
    }
});

// Debounce function to limit the rate of function execution
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}


let allFiles1 = [];
// Debounced function to handle file input change for #multipartFile1
const handleFileInputChange1 = debounce1(function(event) {
    console.log("File input changed for multipartFile1");

    const files = Array.from(event.target.files);
    const uploadedPhotosContainer = $('#exampleModal .uploaded-photos');

    // Add new files to the allFiles1 array and avoid duplicates
    files.forEach(file => {
        if (!allFiles1.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
            console.log("Adding file:", file.name);
            allFiles1.push(file);
        }
    });

    // Clear the file input to handle re-uploads of the same file
    event.target.value = '';

    // Render files
    renderFiles1();
}, 300);

// Attach change event handler to #multipartFile1
$('#multipartFile1').change(handleFileInputChange1);

// Function to render files for #multipartFile1
function renderFiles1() {
    const uploadedPhotosContainer = $('#exampleModal .uploaded-photos');
    uploadedPhotosContainer.empty();

    allFiles1.forEach((file, index) => {
        console.log("Rendering file:", file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContainer = $('<div>').addClass('file-container').attr('data-index', index);
            const closeButton = $('<span>').addClass('close-button').text('×').click(function() {
                const fileIndex = $(this).parent().data('index');
                allFiles1.splice(fileIndex, 1); // Remove the file from allFiles1 array
                renderFiles1();
            });
            fileContainer.append(closeButton);
            if (file.type.startsWith('image')) {
                const image = $('<img>').addClass('uploaded-photo').attr('src', e.target.result).click(function() {
                    showFullSizeImage1(e.target.result);
                });
                fileContainer.append(image);
            } else if (file.type.startsWith('video')) {
                const video = $('<video controls>').addClass('uploaded-photo').attr('src', e.target.result);
                fileContainer.append(video);
            } else {
                console.log('Unsupported file type: ' + file.type);
            }
            uploadedPhotosContainer.append(fileContainer);
        };
        reader.readAsDataURL(file);
    });
}

// Function to show full-size image
function showFullSizeImage1(src) {
    const modal = $('#image-modal1');
    const fullImage = $('#full-image1');
    fullImage.attr('src', src);
    modal.css('opacity', '1'); // Set opacity to 1

    modal.show();
}

// Function to hide full-size image
function hideFullSizeImage1() {
    const modal = $('#image-modal1');
    modal.css('opacity', '0'); // Set opacity to 0 for fade-out effect
    setTimeout(() => {
        modal.hide(); // Hide the modal after the fade-out transition
    }, 300); // Duration of the fade transition (matches the CSS transition duration)
}
$('#image-modal1').hide();

// Event handler for closing the modal
$('.close-modal').click(hideFullSizeImage1);

// Optional: Close the modal when clicking outside the image
$('#image-modal1').click((e) => {
    if (e.target.id === 'image-modal1') {
        hideFullSizeImage1();
    }
});

// Debounce function to limit the rate of function execution
function debounce1(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}



// for button //
var textarea = $(".comment-body textarea");
var input = $("#multipartFile");
const submitButton = document.getElementById('submitButton');

// Disable the submit button initially
submitButton.disabled = true;
console.log(textarea.val().trim())
// Add event listeners to the textarea and file input
textarea.on('input', validateForm);
input.on('change', validateForm);

// Function to validate the form
function validateForm() {
    var textareaValue = textarea.val().trim(); // Get the trimmed value of the textarea
    if (textarea.val().trim() === '' && input.get(0).files.length === 0) {
        submitButton.disabled = true; // Disable the button if both textarea and file input are empty
    } else if (input.files) {
        if( input.get(0).files[0].size > 100 * 1024 * 1024){
            document.getElementById("error-message").textContent = "File size is too large (maximum allowed size is 100MB).";
            document.getElementById("error-message").style.display="block";
            submitButton.disabled = true;

            return;
        }
        // Show modal message
    } else if(textareaValue.length > 255){
        document.getElementById("error-message").textContent = "You can type a maximum of 255 characters.";
        document.getElementById("error-message").style.display="block";
        submitButton.disabled = true;
        return;
    }else{
        document.getElementById("error-message").style.display="none";

        submitButton.disabled = false; // Enable the button if either textarea or file input is not empty

    }
}


$(textarea).add(input).on("keyup change", function () {
    var textareaContent = $.trim($(textarea).val());
    var fileSelected = $(input).get(0).files.length > 0;

    if (textareaContent.length < 1 && !fileSelected) {
        console.log("Empty");
        $(".button-send").css({
            background: "#e7e7e7",
            cursor: "none"
        }).prop('disabled', true); // Disable the button
        $(".submitButton").css({
            background: "#e7e7e7",
            cursor: "none"
        }).prop('disabled', true); // Disable the button
    } else {
        console.log("Input detected",input);
        $(".button-send").css({
            background: "rgb(53 179 208)",
            color: "black",
            cursor: "pointer"
        }).prop('disabled', false); // Enable the button
        $(".submitButton").css({
            background: "rgb(53 179 208)",
            color: "black",
            cursor: "pointer"
        }).prop('disabled', false); // Enable the button
    }
});
function saveUser(contentId) {
    // Make an AJAX request to save the content
    fetch(`/saveContent/${contentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            // setTimeout( () =>{
            //     location.reload();
            // },1000);
            $('#saveModal').modal('hide');
            $('#successModal').modal('show'); // Show the success modal

            // Hide the success modal after 2 seconds
            setTimeout(() => {
                $('#successModal').modal('hide');
            }, 2000);


            console.log('Content saved successfully');
        } else {
            console.error('Failed to save content');
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}



//
// $(".form-submit").click(function () {
//     console.log("New Post");
//     clearModalContents(); // Clear modal contents when opening
//     $(".comment").addClass("block");
//     $(".fa-times").click(function () {
//         $(".comment").removeClass("block");
//     });
// });
//
// // for post create //
// $('#multipartFile').change(function() {
//     var files = this.files;
//     var uploadedPhotosContainer = $('.uploaded-photos');
//     // Clear previously uploaded photos
//     uploadedPhotosContainer.empty();
//     // Loop through each selected file
//     for (var i = 0; i < files.length; i++) {
//         var reader = new FileReader();
//         var file = files[i];
//
//         // Check if the file is an image or video
//         if (file.type.startsWith('image')) {
//             reader.onload = (function(file) {
//                 return function(e) {
//                     // Create image element
//                     var image = $('<img>').addClass('uploaded-photo').attr('src', e.target.result);
//                     // Append image to container
//                     uploadedPhotosContainer.append(image);
//                 };
//             })(file);
//         } else if (file.type.startsWith('video')) {
//             reader.onload = (function(file) {
//                 return function(e) {
//                     // Create video element
//                     var video = $('<video controls>').addClass('uploaded-photo').attr('src', e.target.result);
//                     // Append video to container
//                     uploadedPhotosContainer.append(video);
//                 };
//             })(file);
//         } else {
//             console.log('Unsupported file type: ' + file.type);
//             continue; // Skip this file
//         }
//
//         // Read the selected file as Data URL
//         reader.readAsDataURL(file);
//     }
// });
// // for post update //
// $('#multipartFile1').change(function() {
//     var files = this.files;
//     var uploadedPhotosContainer = $('.uploaded-photos');
//     // Clear previously uploaded photos
//     uploadedPhotosContainer.empty();
//     // Loop through each selected file
//     for (var i = 0; i < files.length; i++) {
//         var reader = new FileReader();
//         var file = files[i];
//
//         // Check if the file is an image or video
//         if (file.type.startsWith('image')) {
//             reader.onload = (function(file) {
//                 return function(e) {
//                     // Create image element
//                     var image = $('<img>').addClass('uploaded-photo').attr('src', e.target.result);
//                     // Append image to container
//                     uploadedPhotosContainer.append(image);
//                 };
//             })(file);
//         } else if (file.type.startsWith('video')) {
//             reader.onload = (function(file) {
//                 return function(e) {
//                     // Create video element
//                     var video = $('<video controls>').addClass('uploaded-photo').attr('src', e.target.result);
//                     // Append video to container
//                     uploadedPhotosContainer.append(video);
//                 };
//             })(file);
//         } else {
//             console.log('Unsupported file type: ' + file.type);
//             continue; // Skip this file
//         }
//
//         // Read the selected file as Data URL
//         reader.readAsDataURL(file);
//     }
// });
//
// // for button //
// var textarea = $(".comment-body textarea");
// var input = $("#multipartFile");
//
// $(textarea).add(input).on("keyup change", function () {
//     var textareaContent = $.trim($(textarea).val());
//     var fileSelected = $(input).get(0).files.length > 0;
//
//     if (textareaContent.length < 1 && !fileSelected) {
//         console.log("Empty");
//         $(".button-send").css({
//             background: "#e7e7e7",
//             cursor: "none"
//         }).prop('disabled', true); // Disable the button
//         $(".submitButton").css({
//             background: "#e7e7e7",
//             cursor: "none"
//         }).prop('disabled', true); // Disable the button
//     } else {
//         console.log("Input detected",input);
//         $(".button-send").css({
//             background: "rgb(53 179 208)",
//             color: "#fff",
//             cursor: "pointer"
//         }).prop('disabled', false); // Enable the button
//         $(".submitButton").css({
//             background: "rgb(53 179 208)",
//             color: "black",
//             cursor: "pointer"
//         }).prop('disabled', false); // Enable the button
//     }
// });
//
// kym //