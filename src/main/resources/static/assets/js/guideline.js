// Char Char :3
function closeModal() {
    createGroupForm.reset();
    document.getElementById('image-preview').src = '';
    $('#groupModal').modal('hide');
}

const selectedUsers = new Set();

function previewImage(event) {
    const preview = document.getElementById('image-preview');
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


$(document).ready(function () {
    var guidelineId;
    $('.btn-see-more').click(function () {
        guidelineId = parseInt($(this).data('guideline-id'));
        var guidelineTitle = $(this).closest('.cta__text-column').find('h2').data('title');
        var guidelineDescription = $(this).closest('.cta__text-column').find('span').data('description');
        var guidelinePhotoUrl = $(this).closest('.cta__text-column').find('img.guideline-photo').data('photo');

        $('#updateGuidelineTitle').val(guidelineTitle);
        $('#updateGuidelineDescription').val(guidelineDescription.trim());
        $('#updateGuidelinePhotoPreview').attr('src', guidelinePhotoUrl);
        $('#updateGuidelineId').val(guidelineId);
        $('#updateGuidelineModal').modal('show');
    });


    // $('#updateGuidelineForm').submit(function (event) {
    //     event.preventDefault();
    //     var formData = new FormData(this);
    //     console.log('Form Data:', formData);
    //
    //     fetch(`/guideline/update/${guidelineId}`, {
    //         method: 'POST',
    //         body: formData,
    //     })
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error('Failed to update guideline');
    //             }
    //             console.log('Guideline updated successfully');
    //             $('#updateGuidelineModal').modal('hide');
    //             window.location.reload();
    //
    //         })
    //         .catch(error => {
    //             console.error('Error updating guideline:', error);
    //         });
    // });

    $('#updateGuidelineForm').submit(function (event) {
        event.preventDefault();
        var formData = new FormData(this);
        // Get the current date and time
        var currentDate = new Date().toISOString();
        // Append the current date to the form data
        formData.append('updatedDate', currentDate);
        var url = `/guideline/update/${guidelineId}`;

        fetch(url, {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update guideline');
                }
                console.log('Guideline updated successfully');
                $('#updateGuidelineModal').modal('hide');
                window.location.reload();
            })
            .catch(error => {
                console.error('Error updating guideline:', error);
                $('#updateGuidelineError').text('Failed to update guideline. Please try again.');
            });
    });


    $('#updateGuidelinePhoto').change(function () {
        var file = this.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#updateGuidelinePhotoPreview').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
});





$(document).ready(function () {
    function deleteList(button) {
        var guidelineId = button.getAttribute("data-guideline-id");
        $('#deleteConfirmationModal').modal('show');
        $('#confirmDeleteBtn').data('guideline-id', guidelineId);
    }

    $('.btn-delete').click(function () {
        deleteList(this);
    });
    $('#confirmDeleteBtn').click(function () {
        var guidelineId = $(this).data('guideline-id');
        console.log(guidelineId)
        $.ajax({
            url: '/guideline/delete/' + guidelineId,
            type: 'POST',
            success: function (response) {
                $('#deleteConfirmationModal').modal('hide');
                window.location.reload();
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    });
});




document.addEventListener('DOMContentLoaded', function() {
    var paragraphs = document.querySelectorAll('.paragraph');
    paragraphs.forEach(function(paragraph) {
        var fullText = paragraph.innerHTML;
        var maxLength = 205;
        if (fullText.length > maxLength) {
            var truncatedText = fullText.substring(0, maxLength);
            paragraph.innerHTML = truncatedText;
            var readMoreSpan = paragraph.nextElementSibling;
            readMoreSpan.style.display = 'inline';
            readMoreSpan.addEventListener('click', function() {
                if (readMoreSpan.innerText === 'Read More...') {
                    paragraph.innerHTML = fullText;
                    readMoreSpan.innerText = 'Read Less...';
                } else {
                    paragraph.innerHTML = truncatedText;
                    readMoreSpan.innerText = 'Read More...';
                }
            });
        }
    });
});
// Char Char :3

//function viewHistory(button) {
//    var guidelineId = $(button).data('guideline-id');
//    $.ajax({
//        url: '/guideline/history/' + guidelineId,
//        type: 'GET',
//        success: function (response) {
//            var historyContent = '';
//            response.forEach(function (historyItem) {
//                var createdDate = new Date(historyItem.createdDate);
//                var updatedDate = historyItem.updatedDate ? new Date(historyItem.updatedDate) : null;
//
//                var createdDateStr = createdDate.toString() !== 'Invalid Date' ? formatDate(createdDate) : 'Invalid Date';
//                var updatedDateStr = updatedDate && updatedDate.toString() !== 'Invalid Date' ? formatDate(updatedDate) : 'Admin Does Not Update Yet !';
//
//                historyContent +=
//                    '<div><strong>Guideline Created By - </strong>' + historyItem.createdBy + '</div>' +
//                    '<div><strong>Guideline Created Date - </strong>' + historyItem.createdDate + '</div>' +
//                    '<div><strong>Updated Date - </strong>' + historyItem.updatedDate + '</div>' +
//                    '<div><strong>Updated By - </strong>' + historyItem.updatedBy + '</div>' +
//                    '<div><strong>Role - </strong>' + historyItem.role + '</div><br>';
//            });
//            $('#historyModalBody').html(historyContent);
//            $('#guidelineHistoryModal').modal('show');
//        },
//        error: function (xhr, status, error) {
//            console.error('Error fetching guideline history:', error);
//            $('#historyModalBody').html('Error fetching guideline history. Please try again later.');
//            $('#guidelineHistoryModal').modal('show');
//        }
//    });
//}

function viewHistory(button) {
    var guidelineId = $(button).data('guideline-id');
    $.ajax({
        url: '/guideline/history/' + guidelineId,
        type: 'GET',
        success: function (response) {
            var historyContent = '';
            response.forEach(function (historyItem) {
                console.log('historyItem :' + historyItem.createdDate);
                var createdDate = parseDate(historyItem.createdDate);
                var updatedDate = parseDate(historyItem.updatedDate);

                console.log('createdDate: ' + createdDate);

                var createdDateStr = createdDate ? formatCustomDate(createdDate) : 'Invalid Date';
                var updatedDateStr = updatedDate ? formatCustomDate(updatedDate) : 'Admin Does Not Update Yet !';

                historyContent +=
                    '<div><strong>Guideline Created By - </strong>' + historyItem.createdBy + '</div>' +
                    '<div><strong>Guideline Created Date - </strong>' + createdDateStr + '</div>' +
                    '<div><strong>Updated Date - </strong>' + updatedDateStr + '</div>' +
                    '<div><strong>Updated By - </strong>' + (historyItem.updatedBy || 'N/A') + '</div>' +
                    '<div><strong>Role - </strong>' + historyItem.role + '</div><br>';
            });
            $('#historyModalBody').html(historyContent);
            $('#guidelineHistoryModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.error('Error fetching guideline history:', error);
            $('#historyModalBody').html('Error fetching guideline history. Please try again later.');
            $('#guidelineHistoryModal').modal('show');
        }
    });
}

function parseDate(dateArray) {
    if (Array.isArray(dateArray) && dateArray.length === 7) {
        try {
            // Create date object from array components
            var date = new Date(
                dateArray[0],        // Year
                dateArray[1] - 1,    // Month (0-based in JavaScript)
                dateArray[2],        // Day
                dateArray[3],        // Hour
                dateArray[4],        // Minute
                dateArray[5],        // Second
                Math.floor(dateArray[6] / 1000) // Convert microseconds to milliseconds
            );

            if (isNaN(date.getTime())) {
                console.error('Invalid date object created:', dateArray);
                return null;
            }
            return date;
        } catch (error) {
            console.error('Error parsing date array:', dateArray, error);
            return null;
        }
    }

    console.error('Unrecognized date format:', dateArray);
    return null;
}

function formatCustomDate(date) {
    if (!(date instanceof Date)) {
        return 'Invalid Date';
    }

    var year = date.getFullYear();
    var month = date.toLocaleString('default', { month: 'short' });
    var day = String(date.getDate()).padStart(2, '0');
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year} ${month} ${day} ${hours}hr ${minutes}min`;
}







