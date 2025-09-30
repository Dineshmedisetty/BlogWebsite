// Comments functionality - handles comment-related operations

// Add new comment
function addComment(postId, content) {
    if (!content.trim()) {
        alert('Comment cannot be empty');
        return;
    }
    
    $.ajax({
        url: '/api/add_comment',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            post_id: postId,
            content: content
        }),
        success: function(response) {
            if (response.success) {
                // Add comment to the list
                const commentHtml = createCommentHTML(response.comment);
                $('#comments-list').prepend(commentHtml);
                
                // Clear the form
                $('#comment-content').val('');
                
                // Update comment count
                updateCommentCount(1);
                
                // Hide "no comments" message if it exists
                $('.text-center.py-4').hide();
                
                // Scroll to the new comment with animation
                scrollToComment(response.comment.id);
                
                // Show success message
                showToast('Comment added successfully!', 'success');
                
                // Add animation to new comment
                $(`#comment-${response.comment.id}`).addClass('animate__animated animate__fadeInDown');
                
            } else {
                alert(response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Comment error:', error);
            alert('An error occurred while adding the comment.');
        }
    });
}

// Delete comment
function deleteComment(commentId) {
    confirmAction('Are you sure you want to delete this comment?', function() {
        $.ajax({
            url: `/api/delete_comment/${commentId}`,
            method: 'POST',
            success: function(response) {
                if (response.success) {
                    // Animate comment removal
                    $(`#comment-${commentId}`).addClass('animate__animated animate__fadeOut');
                    setTimeout(() => {
                        $(`#comment-${commentId}`).remove();
                    }, 300);
                    
                    // Update comment count
                    updateCommentCount(-1);
                    
                    // Show success message
                    showToast('Comment deleted successfully!', 'success');
                    
                } else {
                    alert(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Delete comment error:', error);
                alert('An error occurred while deleting the comment.');
            }
        });
    });
}

// Create comment HTML
function createCommentHTML(comment) {
    const createdAt = new Date(comment.created_at).toLocaleString();
    return `
        <div class="comment-item animate__animated animate__fadeInDown" id="comment-${comment.id}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="comment-content">
                    <div class="comment-header">
                        <strong class="comment-author">${escapeHtml(comment.author)}</strong>
                        <small class="text-muted ms-2 comment-time">${createdAt}</small>
                    </div>
                    <div class="comment-body">
                        <p class="mt-2 mb-0">${escapeHtml(comment.content).replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
                <div class="comment-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteComment(${comment.id})" title="Delete comment">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update comment count
function updateCommentCount(change) {
    const currentCount = parseInt($('.comment-count').text()) || 0;
    const newCount = Math.max(0, currentCount + change);
    $('.comment-count').text(newCount);
    
    // Update badge if exists
    $('.badge.bg-primary').text(newCount);
}

// Scroll to comment
function scrollToComment(commentId) {
    const comment = $(`#comment-${commentId}`);
    if (comment.length) {
        $('html, body').animate({
            scrollTop: comment.offset().top - 100
        }, 500);
    }
}

// Scroll to comments section
function scrollToComments() {
    scrollToElement('comments-section');
}

// Initialize comments functionality
$(document).ready(function() {
    // Handle comment form submission
    $('#comment-form').on('submit', function(e) {
        e.preventDefault();
        const content = $('#comment-content').val().trim();
        const postId = $(this).data('post-id') || getPostIdFromURL();
        
        if (content && postId) {
            addComment(postId, content);
        }
    });
    
    // Auto-resize comment textarea
    autoResizeTextarea('#comment-content');
    
    // Character counter for comment textarea
    setupCharacterCounter('#comment-content', '#comment-counter', 1000);
    
    // Add comment textarea counter if it doesn't exist
    if (!$('#comment-counter').length) {
        $('#comment-content').after('<div class="form-text"><span id="comment-counter">0</span>/1000 characters</div>');
    }
    
    // Handle comment textarea focus/blur
    $('#comment-content').on('focus', function() {
        $(this).closest('.card-body').addClass('comment-focused');
    }).on('blur', function() {
        if (!$(this).val().trim()) {
            $(this).closest('.card-body').removeClass('comment-focused');
        }
    });
    
    // Add reply functionality (can be extended)
    $(document).on('click', '.reply-btn', function() {
        const commentId = $(this).data('comment-id');
        const author = $(this).closest('.comment-item').find('.comment-author').text();
        
        // Create reply form
        const replyForm = `
            <div class="reply-form mt-3" id="reply-form-${commentId}">
                <div class="card">
                    <div class="card-body">
                        <h6>Reply to ${author}</h6>
                        <textarea class="form-control mb-2" placeholder="Write your reply..."></textarea>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary btn-sm" onclick="submitReply(${commentId})">Reply</button>
                            <button class="btn btn-secondary btn-sm" onclick="cancelReply(${commentId})">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $(this).closest('.comment-item').after(replyForm);
        $(this).hide();
    });
    
    // Add comment formatting helpers
    $('#comment-content').on('keydown', function(e) {
        // Bold formatting with Ctrl+B
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            wrapText('**', '**');
        }
        
        // Italic formatting with Ctrl+I
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            wrapText('*', '*');
        }
    });
});

// Utility functions
function getPostIdFromURL() {
    const path = window.location.pathname;
    const match = path.match(/\/post\/(\d+)/);
    return match ? match[1] : null;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function wrapText(before, after) {
    const textarea = document.getElementById('comment-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);
    
    textarea.value = beforeText + before + selectedText + after + afterText;
    
    // Restore selection
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = end + before.length;
    textarea.focus();
}

function showToast(message, type = 'info') {
    const toast = $(`
        <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'primary'} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `);
    
    $('.toast-container').append(toast);
    const bsToast = new bootstrap.Toast(toast[0]);
    bsToast.show();
    
    // Remove toast element after it's hidden
    toast.on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

// Reply functionality (extended feature)
function submitReply(commentId) {
    const replyText = $(`#reply-form-${commentId} textarea`).val().trim();
    if (replyText) {
        // This would need backend support for nested comments
        console.log('Reply to comment', commentId, ':', replyText);
        cancelReply(commentId);
    }
}

function cancelReply(commentId) {
    $(`#reply-form-${commentId}`).remove();
    $(`[data-comment-id="${commentId}"]`).show();
}
