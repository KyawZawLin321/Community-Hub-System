document.addEventListener('DOMContentLoaded', function () {
    // Automatically fetch trending post data when the page loads
    fetchTrendingPost();
     const oneWeek = document.createElement('li');
     const oneMonth = document.createElement('li');
     const oneYear = document.createElement('li');

    // Function to fetch trending post data
    function fetchTrendingPost() {
        // Make an AJAX request to fetch trending post data
        fetch('/user/analysis')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Check if there's trending post data available
                if (data.mostPopularContent) {
                    displayTrendingPost(data.mostPopularContent);
                } else {
                    document.getElementById('trendingPost').innerHTML = 'No trending posts found.';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                document.getElementById('trendingPost').innerHTML = 'Error fetching trending posts.';
            });
    }

    // Function to display trending post
    function displayTrendingPost(contentId) {

        fetch(`/user/reportContent/${contentId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                return response.json();
            })
            .then(userData => {



                console.log(userData); // Log the user data
                // Proceed with populating the carousel with user data


                // Create a unique ID for the carousel
                const carouselId = `carousel-${Math.random().toString(36).substr(2, 9)}`;


                // Create a post element
                const post = document.createElement('div');
                post.classList.add('post');
                post.style.width = '550px';
                post.style.backgroundColor = 'white';
                post.style.marginRight = '300px';

                const info = document.createElement('div');
                info.classList.add('info');
                info.style.margin = '10px';

                const userIcon = document.createElement('i');
                const userIconImg = document.createElement('img'); // user data
                userIconImg.src = userData.photo;
                userIconImg.alt = userData.userId;
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
                usernameSpan.style.marginLeft = '10px';

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
                 const dropdownMenu = document.createElement('ul');
                                      dropdownMenu.classList.add('dropdown-menu');
                                      dropdownMenu.setAttribute('aria-labelledby', 'dropdownMenuButton');
                                      // Proceed with creating the update item
                                      oneWeek.innerHTML = `
                                      <button type="button" class="dropdown-item" >
                                      Week
                                     </button>`;
                                     oneYear.innerHTML = `
                                       <button type="button" class="dropdown-item" >
                                        Year
                                       </button>`;
                              // Create the delete item in the dropdown menu
                                      oneMonth.innerHTML = '<button class="dropdown-item" type="button" >Month</button>';
                              // Append the update and delete items to the dropdown menu
                                      dropdownMenu.appendChild(oneWeek);
                                      dropdownMenu.appendChild(oneMonth);
                                      dropdownMenu.appendChild(oneYear);
                              // Append the three dots button and dropdown menu to the dropdown container
                                      dropdownContainer.appendChild(threeDotsButton);
                                      dropdownContainer.appendChild(dropdownMenu);
// Create the dropdown menu
                const postInfoDiv = document.createElement('div');
                // postInfoDiv.style.marginTop = '10px';
                // postInfoDiv.style.marginBottom = '20px';
                // const publicSpan = document.createElement('span');
                // publicSpan.textContent = userData.isPublic;
                // const createDateSpan = document.createElement('span');
                // // createDateSpan.textContent = userData.createdDate;
                // createDateSpan.textContent = formatPostTime(userData.createdDate); // Format the time

                postInfoDiv.style.marginTop = '-24px';
                postInfoDiv.style.marginBottom = '20px';
                postInfoDiv.style.marginLeft = '53px';
                const publicSpan = document.createElement('span');
                // Check the value of isPublic and set the appropriate icon class
                if (userData.isPublic === 'public') {
                    publicSpan.className = 'fa-solid fa-earth-americas '; // Font Awesome globe icon for public
                } else if (userData.isPublic === 'private') {
                    publicSpan.className = 'fa fa-lock '; // Font Awesome lock icon for private
                }
                publicSpan.style.marginLeft='0.5%';
                const createDateSpan = document.createElement('span');
                createDateSpan.textContent = formatPostTime(userData.createdDate); // Format the time
                createDateSpan.style.fontSize='small';
                createDateSpan.style.marginLeft='21px';




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




                // postInfoDiv.appendChild(createDateSpan);
                // postInfoDiv.appendChild(publicSpan);
                // info.appendChild(userIcon);
                // info.appendChild(usernameSpan);
                // info.appendChild(dropdownContainer);
                // info.appendChild(postInfoDiv);
                postInfoDiv.appendChild(createDateSpan);
                postInfoDiv.appendChild(publicSpan);


                info.appendChild(userIcon);
                info.appendChild(usernameSpan);
                info.appendChild(dropdownContainer);
                info.appendChild(postInfoDiv);
                const postBody = document.createElement('div');
                postBody.classList.add('post-body');
                postBody.style.width = '100px'; // Adjust the width of the post body
                postBody.style.wordWrap = 'break-word'; // Allow text to wrap to the next line
                postBody.style.whiteSpace = 'normal'; // Allow normal whitespace behavior
                const postText = document.createElement('p');
                postText.textContent = userData.text;
                postText.style.marginTop = '5px';
                postText.style.width='485px';
                postBody.appendChild(postText);


                // carousel.appendChild(carouselInner);
                const carousel = document.createElement('div');
                carousel.classList.add('carousel', 'slide');
                carousel.setAttribute('id', carouselId); // Set the ID attribute
                carousel.setAttribute('data-bs-interval', 'false'); // Disable auto sliding

                const carouselInner = document.createElement('div');
                carouselInner.classList.add('carousel-inner');

// Check if there are any images or videos
                const hasImages = userData.imageUrls && userData.imageUrls.length > 0;
                const hasVideos = userData.videoUrls && userData.videoUrls.length > 0;

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

                    const totalSlides = (hasImages ? userData.imageUrls.length : 0) + (hasVideos ? userData.videoUrls.length : 0);
                    let currentSlide = 1;

                    const updateSlideIndicator = () => {
                        slideIndicator.innerText = `${currentSlide}/${totalSlides}`;
                    };

                    updateSlideIndicator();

                    userData.imageUrls.forEach((imageUrl, imgIndex) => {
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

                    userData.videoUrls.forEach((videoUrl, videoIndex) => {
                        const carouselItem = document.createElement('div');
                        carouselItem.classList.add('carousel-item');
                        if (videoIndex === 0 && userData.imageUrls.length === 0) {
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
                        } else if (count != 0) {
                            const newShareCountElement = $(`<span id="shareCount-${contentId}"> ${count}</span>`);
                            $(shareIcon).before().append(newShareCountElement); // Append to share icon's parent
                        }
                    } catch (error) {
                        console.error('Error updating share count:', error);
                    }
                };
                updateShareCount(userData.id); // Wait for the share count to be updated

                // Share icon click event listener
                const shareIcon = document.createElement('i');
                shareIcon.classList.add('fas', 'fa-share');
                shareIcon.addEventListener('click', async () => {
                    const contentId = userData.id;
                    const userId = userData.id;

                    $('#contentId').val(contentId);
                    $('#userId').val(userId);
                    $('#exampleModal1').modal('show');

                    await updateShareCount(contentId); // Wait for the share count to be updated
                });
                //swm//
                const likeCountSpan = document.createElement('span');
                likeCountSpan.textContent = userData.likeCount;
                //swm

                const commentIcon = document.createElement('i');
                commentIcon.classList.add('fas', 'fa-comment');
                const commentCount = document.createElement('span');

                //swm-comment
                fetchCommentCount(userData.id, commentCount);


                /*STRM*/

                function fetchCommentCount(contentId, commentCountElement) {
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

                function showCommentTemplate(contentId, postElement) {
                    const commentSection = document.createElement('div');
                    commentSection.classList.add('comment-section');

                    const commentInput = document.createElement('textarea');
                    commentInput.setAttribute('placeholder', 'Write your comment here...');
                    commentInput.classList.add('comment-input');

                    const submitButton = document.createElement('button');
                    submitButton.textContent = 'Submit';
                    submitButton.classList.add('comment-submit-button');
                    submitButton.addEventListener('click', () => {
                        const userId = document.getElementById('id').value;
                        const comment = commentInput.value.trim();

                        if (comment.length > 0) {
                            sendComment(contentId, userId, comment);
                            subscribeToCommentTopic(contentId, post);
                            commentInput.value = ''; // Clear the input field after submitting the comment
                        }
                    });

                    commentSection.appendChild(commentInput);
                    commentSection.appendChild(submitButton);
                    post.appendChild(commentSection);
                }



                 async  function getLikeCount(contentId) {
                        const response = await fetch(`/api/content/${userData.id}/like-count`);
                        if (response.ok) {
                            return response.json();
                        }
                        throw new Error('Failed to fetch like count');
                    }

                 async   function getLikeStatus(contentId) {
                        const response = await fetch(`/api/content/${contentId}/like/status`);
                        if (response.ok) {
                            const data = await response.json();
                            return data.liked;
                        }
                        throw new Error('Failed to fetch like status');
                    }

                 async  function updateLikeStatus() {
                        likeCountSpan.textContent = await getLikeCount(userData.id);
                        console.log("likecount :"+likeCountSpan)
                        const liked = await getLikeStatus(contentId);
                        if (liked) {
                            heartIcon.classList.add('liked');
                        } else {
                            heartIcon.classList.remove('liked');
                        }
                    }


                  updateLikeStatus();
                //swm-comment-end
                postBottom.appendChild(heartIcon);
                postBottom.appendChild(likeCountSpan);
                postBottom.appendChild(commentIcon);
                postBottom.appendChild(commentCount);
                postBottom.appendChild(shareIcon);
                //swm-like--start//
                heartIcon.addEventListener('click', async () => {
                    const contentId = userData.id; // Assuming contentId is available in rowData
                    let currentLikeCount = await getLikeCount(contentId);

                    try {
                        const response = await fetch(`/api/content/${contentId}/like`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            // Liked successfully, update UI
                            currentLikeCount = await getLikeCount(contentId);
                            likeCountSpan.textContent = currentLikeCount;
                            // Optionally toggle like button style
                            heartIcon.classList.toggle('liked');

                            sendLikeNotification(userData.userId, true, currentLikeCount);

                        } else {
                            throw new Error('Failed to like post');
                        }
                    } catch (error) {
                        console.error('Error liking post:', error);
                    }
                });

                // Function to send like notification
                function sendLikeNotification(ownerId, isLiked, currentLikeCount) {
                    const contentId = userData.id;
                    const userId = document.getElementById('id1').value;
                    // Check if the like action was successful and if the like count was incremented before sending the notification
                    if (isLiked && currentLikeCount < getLikeCount(contentId)) {
                        const notification = {
                            ownerId: ownerId,
                            message: 'Your post has been liked by ! ' + userId
                            // Add any additional data you want to send with the notification
                        };

                        // Send notification via WebSocket
                        stompClient2.send(`/app/private-message`, {}, JSON.stringify(notification));
                        console.log('Like notification sent to user:', ownerId);
                    }
                }
// Function to get like count
                async function getLikeCount(contentId) {
                    const response = await fetch(`/api/content/${contentId}/like-count`);
                    return response.json();
                }
                //swm-like--end
                // Create next and previous buttons
                if ((userData.imageUrls && userData.imageUrls.length) + (userData.videoUrls && userData.videoUrls.length) > 1) {
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
                    carousel.appendChild(nextButton);
                    carousel.appendChild(prevButton);
                }
                post.appendChild(info);
                post.appendChild(postBody);
                post.appendChild(carousel); // Append carousel to post
                post.appendChild(postBottom);
                const postDiv = document.querySelector('.most-trending-post');
                postDiv.appendChild(post);
            })
    }

// Add event listeners to the dropdown items
oneWeek.addEventListener('click', () => fetchTrendingPostsByInterval('week'));
oneMonth.addEventListener('click', () => fetchTrendingPostsByInterval('month'));
oneYear.addEventListener('click', () => fetchTrendingPostsByInterval('year'));
function clearPreviousPosts() {
        const postDiv = document.querySelector('.most-trending-post');
        postDiv.innerHTML = '';
    }

// Function to fetch trending post data by interval
function fetchTrendingPostsByInterval(interval) {
    fetch(`/user/trend-post?interval=${interval}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Check if there's trending post data available
            if (data.mostPopularContent) {
            clearPreviousPosts();
                displayTrendingPost(data.mostPopularContent);
            } else {
                document.getElementById('trendingPost').innerHTML = 'No trending posts found.';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('trendingPost').innerHTML = 'Error fetching trending posts.';
        });
}


});
