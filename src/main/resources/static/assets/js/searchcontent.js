//swm-comment//
const stompClient3 = Stomp.over(new SockJS('/ws'));

// Establish WebSocket connection
stompClient3.connect({}, function(frame) {
    console.log('Connected to the Comment WebSocket server');
});
// Function to subscribe to comment topic
let commentSubscription;
function subscribeToCommentTopic(contentId,postElement) {
    if (!commentSubscription) {
        commentSubscription = stompClient3.subscribe(`/user/public/${contentId}`, function (message) {
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
    stompClient3.send('/app/send-reply', {}, JSON.stringify(message));
}

let replySubscription;
function subscribeToReplyTopic(contentId) {
    if (!replySubscription) {
        replySubscription = stompClient3.subscribe(`/user/reply/${contentId}`, function (message) {
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
        commentSubscription = stompClient3.subscribe(`/user/sharedComment/${shareId}`, function (message) {
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
                let commentContainer = commentElement.querySelector('.comment-container');
                if (!commentContainer) {
                    commentContainer = document.createElement('div');
                    commentContainer.classList.add('comment-container');
                    commentElement.appendChild(commentContainer);
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
                replyElement.appendChild(replyText);
                // Add event listener to reply icon
                replyIcon.addEventListener('click', () => {
                    const messageBox = document.createElement('textarea');
                    messageBox.setAttribute('placeholder', 'Write your reply here...');
                    messageBox.classList.add('reply-message-box');
                    const submitButton = document.createElement('button');
                    submitButton.textContent = 'Submit';
                    submitButton.classList.add('reply-submit-button');
                    submitButton.addEventListener('click', () => {
                        const replyText = messageBox.value.trim();
                        if (replyText.length > 0) {
                            console.log('Reply submitted:', replyText);
                            sendReplyForShare(commentId, reply.shareId, reply.userId, replyText);
                            replyElement.removeChild(messageBox);
                            replyElement.removeChild(submitButton);
                            subscribeToShareReplyTopic(reply.shareId);
                            messageBox.value = '';
                        }
                    });
                    replyElement.appendChild(messageBox);
                    replyElement.appendChild(submitButton);
                    loadExistingShareReplies(reply.shareId, reply.id);
                    replyElement.classList.add('reply-open');
                });

                editIcon1.addEventListener('click', () => {
                    //const commentText = commentElement.querySelector('.comment-text'); // Create a textarea with the existing comment/reply text
                    const textarea = document.createElement('textarea');
                    textarea.classList.add('edit-textarea');
                    textarea.value = replyText.textContent; // Create a submit button
                    const submitButton = document.createElement('button');
                    submitButton.textContent = 'Submit';
                    submitButton.classList.add('submit-button'); // Replace the comment/reply text with the textarea
                    replyText.replaceWith(textarea);
                    replyElement.appendChild(submitButton); // Update the comment/reply text upon submission
                    submitButton.addEventListener('click', () => {
                        const editedText = textarea.value; // Call the editComment or editReply function with the edited text
                        if (editedText.trim() !== '') {
                            // Call editComment or editReply function based on comment or reply
                            // For comments: editComment(comment.id, editedText);
                            // For replies: editReply(reply.id, editedText);
                            // Update the displayed text with the edited text
                            editReply(reply.id, editedText,replyElement);
                            const newReplyText = document.createElement('p');
                            newReplyText.textContent = editedText;
                            newReplyText.classList.add('reply-text');
                            replyElement.replaceChild(newReplyText, textarea);
                            submitButton.remove();
                            replyElement.classList.remove('show');
                            // Hide the dropdown menu
                        } else {
                            alert('Please enter a valid text.');
                        }
                    });
                });
                // dropdownMenu.querySelector('.update-option').addEventListener('click', () => {
                //     const newCommentText = prompt('Enter the new comment text:');
                //     editComment(comment.id, newCommentText);
                // });
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
                commentContainer.appendChild(replyElement);
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
    stompClient3.send('/app/send-reply-share', {}, JSON.stringify(message));
}
function subscribeToShareReplyTopic(shareId) {
    if (!replySubscription) {
        replySubscription = stompClient3.subscribe(`/user/sharedReply/${shareId}`, function (message) {
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
    const commentsContainer = document.createElement('div');
    commentsContainer.classList.add('comments-container');
    const updateCommentCountForShare = () => {
        const commentCountElement = postElement.querySelector('.comment-count');
        if (commentCountElement) {
            fetchCommentCountForShare(comment.shareId, commentCountElement);
        }
    };

    fetch(`/user/users/${comment.userId}`)
        .then(response => response.json())
        .then(user => {
            // const commentsContainer = postElement.querySelector('.comments-container');
            // if (!commentsContainer) {
            //     const commentsContainer = document.createElement('div');
            //     commentsContainer.classList.add('comments-container');
            //     postElement.appendChild(commentsContainer);
            // }
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

            // Reply Icon
            const replyIcon = document.createElement('span');
            replyIcon.textContent = '↩️';
            replyIcon.classList.add('reply-icon');

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
            iconsContainer.appendChild(replyIcon);
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
            commentElement.appendChild(commentText);
            commentElement.id = `comment-${comment.id}`;
            editIcon.addEventListener('click', () => {
                const textarea = document.createElement('textarea');
                textarea.classList.add('edit-textarea');
                textarea.value = commentText.textContent;
                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit';
                submitButton.classList.add('submit-button');
                commentText.replaceWith(textarea);
                commentElement.appendChild(submitButton);
                submitButton.addEventListener('click', () => {
                    const editedText = textarea.value;
                    if (editedText.trim() !== '') {
                        editComment(comment.id, editedText,commentElement);
                        const newCommentText = document.createElement('p');
                        newCommentText.textContent = editedText;
                        newCommentText.classList.add('comment-text');
                        commentElement.replaceChild(newCommentText, textarea);
                        submitButton.remove();
                        commentElement.classList.remove('show');
                    } else {
                        alert('Please enter a valid text.');
                    }
                });
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

            let isReplyOpen = false;
            replyIcon.addEventListener('click', () => {
                if (!isReplyOpen) {
                    const messageBox = document.createElement('textarea');
                    messageBox.setAttribute('placeholder', 'Write your reply here...');
                    messageBox.classList.add('reply-message-box');
                    const submitButton = document.createElement('button');
                    submitButton.textContent = 'Submit';
                    submitButton.classList.add('reply-submit-button');
                    submitButton.addEventListener('click', () => {
                        const reply = messageBox.value.trim();
                        if (reply.length > 0) {
                            console.log('Reply submitted:', reply);
                            sendReplyForShare(comment.id, comment.shareId, comment.userId, reply);
                            commentElement.removeChild(messageBox);
                            commentElement.removeChild(submitButton);
                            subscribeToShareReplyTopic(comment.shareId);
                            messageBox.value = '';
                        }

                    });
                    commentElement.appendChild(messageBox);
                    commentElement.appendChild(submitButton);
                    loadExistingShareReplies(comment.shareId, comment.id);
                    commentElement.classList.add('reply-open');
                    isReplyOpen = true;
                } else {
                    const messageBox = commentElement.querySelector('.reply-message-box');
                    const submitButton = commentElement.querySelector('.reply-submit-button');
                    const existingReplies = commentElement.querySelectorAll('.reply');
                    if (messageBox) messageBox.remove();
                    if (submitButton) submitButton.remove();
                    existingReplies.forEach(replies => replies.remove());
                    isReplyOpen = false;
                }

            });

            commentsContainer.appendChild(commentElement);
            const scrollable = commentsContainer.scrollHeight > commentsContainer.clientHeight;
            if (scrollable) {
                commentsContainer.style.overflowY = 'auto';
            }
            postElement.appendChild(commentsContainer);


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


let addedPostIds = [];

const listData = async () => {
    try {
        const response = await fetch('/user/search/content');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const contentList = await response.json();
        console.log(contentList.userId)
        await populateCarousel(contentList);
    } catch (error) {
        console.error('Error:', error);
    }
};

 listData();

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
    post.style.width = '590px';
    // post.style.marginLeft = '95px';
    post.style.backgroundColor='white';


    const info = document.createElement('div');
    info.classList.add('info');
    info.style.margin = '10px';

    const userIcon = document.createElement('i');
    const userIconImg = document.createElement('img'); // user data
    userIconImg.src = userData.photo;
    userIconImg.alt = rowData.userId;
    userIconImg.style.borderRadius='200px';
    userIconImg.style.width='60px';
    userIconImg.style.height='60px';
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
    usernameSpan.style.fontSize='32px';
    usernameSpan.style.fontFamily='math';



// Create the dropdown menu container
    const dropdownContainer = document.createElement('span');
    dropdownContainer.classList.add('dropdown');
    dropdownContainer.style.float = 'right'; // Align to the right end
    dropdownContainer.style.marginTop = '5px'; // Align to the right end


// Create the three dots icon button
    const threeDotsButton = document.createElement('button');
    threeDotsButton.classList.add('btn', 'btn-secondary');
    threeDotsButton.setAttribute('type', 'button');
    threeDotsButton.setAttribute('id', 'dropdownMenuButton');
    threeDotsButton.setAttribute('data-bs-toggle', 'dropdown');
    threeDotsButton.setAttribute('aria-expanded', 'false');
    threeDotsButton.innerHTML = '<i class="fas fa-ellipsis-v"></i>'; // Using Font Awesome for three dots icon

            const loginUserId=document.getElementById('id1').value;
                const role=document.getElementById('role').value;

       if(loginUserId == rowData.userId ) {
                         const dropdownMenu = document.createElement('ul');
                                 dropdownMenu.classList.add('dropdown-menu');
                                 dropdownMenu.setAttribute('aria-labelledby', 'dropdownMenuButton');

                                 // Proceed with creating the update item
                         //         const updateItem = document.createElement('li');
                         //         console.log("Image URLs:", rowData.imageUrls);
                         //         console.log("Video URLs:", rowData.videoUrls);
                         //
                         //         updateItem.innerHTML = `
                         //         <button type="button" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModal"
                         //         data-id="${rowData.id}"
                         //         data-groupid="${rowData.groupId}"
                         //         data-text="${rowData.text}"
                         //         data-ispublic="${rowData.isPublic}"
                         //         data-imageurls='${JSON.stringify(rowData.imageUrls)}'
                         //         data-videourls='${JSON.stringify(rowData.videoUrls)}'
                         // >
                         //     Update
                         //
                         // </button>`;

                         // Create the delete item in the dropdown menu
                                 const deleteItem = document.createElement('li');
                                 deleteItem.innerHTML = `<button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#deletePostModal" data-content-id=${rowData.id}>Trash</button>`;
                                 console.log('delete user id :'+rowData.id);
                       // Create the save item in the dropdown menu
                       const saveItem = document.createElement('li');
                       saveItem.innerHTML = `<button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#saveModal" data-content-id="${rowData.id}">Save</button>`;
       // Append the update and delete items to the dropdown menu
                     //  dropdownMenu.appendChild(updateItem);
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
        publicSpan.className = 'fas fa-lock fa-lg'; // Font Awesome lock icon for private
    }
    publicSpan.style.marginLeft='0.5%';

    // Append the span to the target element
    // const targetElement = document.getElementById('target');
    // targetElement.appendChild(publicSpan);

    const createDateSpan = document.createElement('span');
    createDateSpan.textContent = formatPostTime(rowData.createdDate); // Format the time
    createDateSpan.style.fontSize='small';
    // publicSpan.style.marginLeft='27px';


    postInfoDiv.appendChild(createDateSpan);
    postInfoDiv.appendChild(publicSpan);


    info.appendChild(userIcon);
    info.appendChild(usernameSpan);
    info.appendChild(dropdownContainer);
    info.appendChild(postInfoDiv);


    const postBody = document.createElement('div');
    postBody.classList.add('post-body');
    postBody.style.width = '500px'; // Adjust the width of the post body
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

                    seeMoreButton.addEventListener('click', function() {
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
            }else{
                    postText.style.marginTop = '20px';
                    postBody.appendChild(postText);

            }



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

    // Create the post bottom section
    const postBottom = document.createElement('div');
    postBottom.classList.add('post-bottom');
    const heartIcon = document.createElement('i');
    heartIcon.classList.add('fas', 'fa-heart');




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
            } else if(count != 0){
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
    shareIcon.addEventListener('click', async () => {
        const contentId = rowData.id;
        const userId = userData.id;


        $('#contentId').val(contentId);
        $('#userId').val(userId);
        $('#exampleModal1').modal('show');


        // Check if the content is private
        if (rowData.isPublic === 'private') {
            // Show the share modal form
            $('#exampleModal1').modal('show');

            // Populate the dropdown menu with only the "New Feed" option
            const groupIdDropdown = document.getElementById('groupId2');
            groupIdDropdown.innerHTML = ''; // Clear previous options

            // Add "New Feed" option
            const newFeedOption = document.createElement('option');
            newFeedOption.value = "0";
            newFeedOption.textContent = "New Feed";
            groupIdDropdown.appendChild(newFeedOption);

            // Set the value of isPublic2 to "private" and disable other options
            $('#isPublic2').val('private');
            $('#isPublic2 option[value="public"]').prop('disabled', true);
        } else {
            // Show the share modal form
            $('#exampleModal1').modal('show');

            // Enable all options in the isPublic2 select box
            $('#isPublic2 option').prop('disabled', false);
        }



        // Check if the content is private
        if (rowData.isPublic === 'private') {
            // Populate the dropdown menu with only the "New Feed" option
            const groupIdDropdown = document.getElementById('groupId2');
            groupIdDropdown.innerHTML = ''; // Clear previous options

            // Add "New Feed" option
            const newFeedOption = document.createElement('option');
            newFeedOption.value = "0";
            newFeedOption.textContent = "New Feed";
            groupIdDropdown.appendChild(newFeedOption);
        } else {
            // Fetch group data
            const responseGroup = await fetch(`/group/gp`);
            if (!responseGroup.ok) {
                throw new Error('Failed to fetch group data');
            }
            const groupData = await responseGroup.json();
            console.log("group data:", groupData); // This line helps to debug

            // Populate the dropdown menu with group data
            const groupIdDropdown = document.getElementById('groupId2');
            groupIdDropdown.innerHTML = ''; // Clear previous options

            // Add "New Feed" option
            const newFeedOption = document.createElement('option');
            newFeedOption.value = "0";
            newFeedOption.textContent = "New Feed";
            groupIdDropdown.appendChild(newFeedOption);

            // Append group options
            groupData.forEach(group => {
                // Create an option element
                const option = document.createElement('option');
                option.value = group.id; // Set the value to the group ID
                option.textContent = group.name; // Set the text content to the group name

                // Optionally, set a thumbnail image as background
                if (group.photo) {
                    option.setAttribute('data-thumbnail', group.photo); // Set data-thumbnail attribute
                }
                // Append the option to the dropdown menu
                groupIdDropdown.appendChild(option);
            });
        }

        await updateShareCount(contentId); // Wait for the share count to be updated
    });


    //swm-like-start
    const likeCountSpan = document.createElement('span');
    likeCountSpan.textContent = rowData.likeCount;
    //swm
    const commentIcon = document.createElement('i');
    commentIcon.classList.add('fas', 'fa-comment');
    const commentCount = document.createElement('span');
    commentCount.classList.add('comment-count');
    //swm-comment
    fetchCommentCount(rowData.id,commentCount);
    let commentSectionVisible = false;
    commentIcon.addEventListener('click', () => {
        if (!commentSectionVisible) {
            showCommentTemplate(rowData.id, post);
            loadExistingComments(rowData.id, post);
            // loadExistingReplies(rowData.id, post);
            fetchCommentCount(rowData.id,commentCount);
            commentSectionVisible = true;
        } else {
            // If the comment section is already visible, hide it
            fetchCommentCount(rowData.id,commentCount);
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
            const userId = document.getElementById('id1').value;
            const comment = messageBox.value.trim();
            if (comment.length > 0) {
                sendComment(contentId, userId, comment);
                subscribeToCommentTopic(contentId,post);
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
        stompClient3.send('/app/send-comment', {}, JSON.stringify(message));
    }
    //swm-comment-end
    //swm-like--start//

    const contentId = rowData.id;
    const userId = document.getElementById('id1') .value;
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
                const { liked } = await response.json();
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
            stompClient3.send(`/app/private-message`, {}, JSON.stringify(notification));
            console.log('Like notification sent to user:', ownerId);
        }
    }

    await updateLikeStatus();
    //swm-like-end


    postBottom.appendChild(heartIcon);
    postBottom.appendChild(likeCountSpan);
    postBottom.appendChild(commentIcon);
    postBottom.appendChild(commentCount);
    postBottom.appendChild(shareIcon);

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
    const postDiv = document.querySelector('.form-post');
    postDiv.appendChild(post);




    //  });
};

const deleteUser = async (id) => {
    const url = `/delete/${id}`;
    const deletedUser = await fetch(url, {
        method: 'PUT',
    });
    if (deletedUser.ok) {
        console.log("delete success");
        $('#deletePostModal').modal('hide');
    }
}
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

            clearPreviousPosts();
            await fetchData();
        } else {
            console.error('Failed to create share');
        }
//        setTimeout( () =>{
//            location.reload();
//        },1000);
    } catch (error) {
        console.error('Error:', error);
    }
});

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


    

