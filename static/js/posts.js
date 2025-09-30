// Posts functionality - handles post-related operations

// Like/unlike post functionality
function toggleLike(postId) {
    $.ajax({
        url: '/api/like_post',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            post_id: postId
        }),
        success: function(response) {
            if (response.success) {
                const likeBtn = $(`[data-post-id="${postId}"]`);
                const likeCount = likeBtn.find('.like-count');
                
                if (response.liked) {
                    likeBtn.addClass('liked');
                    likeBtn.removeClass('btn-outline-danger').addClass('btn-danger');
                } else {
                    likeBtn.removeClass('liked');
                    likeBtn.removeClass('btn-danger').addClass('btn-outline-danger');
                }
                
                likeCount.text(response.like_count);
            } else {
                alert(response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Like error:', xhr.responseText || error);
            const response = xhr.responseJSON;
            if (response && response.message) {
                alert(response.message);
            } else {
                alert('An error occurred while liking the post.');
            }
        }
    });
}

// Delete post functionality
function deletePost(postId) {
    confirmAction('Are you sure you want to delete this post? This action cannot be undone.', function() {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/delete_post/${postId}`;
        document.body.appendChild(form);
        form.submit();
    });
}

// Initialize post-related functionality
$(document).ready(function() {
    // Set up like buttons with animation classes if available
    $('.like-btn').on('click', function() {
        const postId = $(this).data('post-id');
        if (postId) {
            toggleLike(postId);
        }
    });
    
    // Add hover effects for like buttons
    $('.like-btn').hover(
        function() {
            if (!$(this).hasClass('liked')) {
                $(this).addClass('text-danger');
            }
        },
        function() {
            if (!$(this).hasClass('liked')) {
                $(this).removeClass('text-danger');
            }
        }
    );
    
    // Handle delete post button clicks
    $('.delete-post-btn').on('click', function() {
        const postId = $(this).data('post-id');
        deletePost(postId);
    });
    
    // Lazy loading for post images (if any are added later)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Add reading progress indicator (if on post detail page)
    if ($('.post-content').length) {
        addReadingProgress();
    }
});

// Reading progress indicator
function addReadingProgress() {
    const progressBar = $('<div class="reading-progress"><div class="progress-bar"></div></div>');
    $('body').prepend(progressBar);
    
    $(window).on('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        $('.progress-bar').css('width', scrolled + '%');
    });
}

// Share post functionality (can be extended)
function sharePost(postId, title) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: 'Check out this blog post on BlogSphere!',
            url: window.location.origin + `/post/${postId}`
        });
    } else {
        // Fallback to copying URL to clipboard
        const url = window.location.origin + `/post/${postId}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Post URL copied to clipboard!');
        });
    }
}

// Bookmark functionality (can be extended)
function bookmarkPost(postId) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const index = bookmarks.indexOf(postId);
    
    if (index > -1) {
        bookmarks.splice(index, 1);
        alert('Post removed from bookmarks');
    } else {
        bookmarks.push(postId);
        alert('Post added to bookmarks');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarkUI(postId, index === -1);
}

// Update bookmark UI
function updateBookmarkUI(postId, isBookmarked) {
    const bookmarkBtn = $(`.bookmark-btn[data-post-id="${postId}"]`);
    if (isBookmarked) {
        bookmarkBtn.addClass('bookmarked').html('<i class="fas fa-bookmark"></i> Bookmarked');
    } else {
        bookmarkBtn.removeClass('bookmarked').html('<i class="far fa-bookmark"></i> Bookmark');
    }
}
