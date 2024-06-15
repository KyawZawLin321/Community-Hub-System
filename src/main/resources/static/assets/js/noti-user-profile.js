document.addEventListener("DOMContentLoaded", options => {
    let notificationCount = 0;
    let stompClient = null;

    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected);

    const notificationToggle = document.getElementById('notification-toggle');

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
                var notificationList = $('#notification-list');
                notificationList.empty(); // Clear the list before appending notifications
                if (notifications.length === 0) {
                    displayNoNotificationMessage();
                } else {
                    notifications.forEach(function (notification) {
                        displayNotification(notification);
                    });
                }
                if (notifications.some(noti => !noti.read)) {
                    // Play notification sound
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
                updateNotificationCount(0); // Initialize the count display
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

    function onConnected() {
        const userId = document.getElementById('id1').value;
        if (notificationsEnabled) {
            stompClient.subscribe(`/user/${userId}/private-message`, function (message) {
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
});

