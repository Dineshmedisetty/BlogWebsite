// Forms functionality - handles form validation and submission

// Initialize all forms
$(document).ready(function() {
    initializeLoginForm();
    initializeRegisterForm();
    initializePostForms();
    initializeCharacterCounters();
});

// Login form functionality
function initializeLoginForm() {
    const form = $('#login-form');
    if (!form.length) return;
    
    form.on('submit', function(e) {
        const rules = {
            username: { required: true, minLength: 3 },
            password: { required: true, minLength: 1 }
        };
        
        if (!validateForm('#login-form', rules)) {
            e.preventDefault();
            showFormError('Please fill in all required fields correctly.');
            return false;
        }
        
        // Add loading state
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Logging in...').prop('disabled', true);
        
        // Re-enable after 3 seconds (in case of redirect delay)
        setTimeout(() => {
            submitBtn.html(originalText).prop('disabled', false);
        }, 3000);
    });
}

// Register form functionality
function initializeRegisterForm() {
    const form = $('#register-form');
    if (!form.length) return;
    
    form.on('submit', function(e) {
        const password = $('#password').val();
        const confirmPassword = $('#confirm-password').val();
        const username = $('#username').val();
        const email = $('#email').val();
        
        // Validate password match
        if (password !== confirmPassword) {
            e.preventDefault();
            $('#confirm-password').addClass('is-invalid');
            showFormError('Passwords do not match!');
            return false;
        }
        
        // Validate username
        if (username.length < 3 || username.length > 20) {
            e.preventDefault();
            $('#username').addClass('is-invalid');
            showFormError('Username must be between 3 and 20 characters!');
            return false;
        }
        
        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            e.preventDefault();
            $('#email').addClass('is-invalid');
            showFormError('Please enter a valid email address!');
            return false;
        }
        
        // Validate password strength
        if (password.length < 6) {
            e.preventDefault();
            $('#password').addClass('is-invalid');
            showFormError('Password must be at least 6 characters long!');
            return false;
        }
        
        // Check for username/email availability (client-side check)
        if (!checkUsernameAvailability(username)) {
            e.preventDefault();
            $('#username').addClass('is-invalid');
            showFormError('Username contains invalid characters. Use only letters, numbers, and underscores.');
            return false;
        }
        
        // Add loading state
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Creating Account...').prop('disabled', true);
        
        // Re-enable after 5 seconds
        setTimeout(() => {
            submitBtn.html(originalText).prop('disabled', false);
        }, 5000);
    });
    
    // Real-time password confirmation
    $('#confirm-password').on('input', function() {
        const password = $('#password').val();
        const confirmPassword = $(this).val();
        
        if (confirmPassword && password !== confirmPassword) {
            $(this).addClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
            $(this).after('<div class="invalid-feedback">Passwords do not match</div>');
        } else {
            $(this).removeClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
        }
    });
    
    // Real-time username validation
    $('#username').on('input', function() {
        const username = $(this).val();
        
        if (username.length > 0 && username.length < 3) {
            $(this).addClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
            $(this).after('<div class="invalid-feedback">Username must be at least 3 characters</div>');
        } else if (username.length > 20) {
            $(this).addClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
            $(this).after('<div class="invalid-feedback">Username must be less than 20 characters</div>');
        } else if (username.length > 0 && !checkUsernameAvailability(username)) {
            $(this).addClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
            $(this).after('<div class="invalid-feedback">Username can only contain letters, numbers, and underscores</div>');
        } else {
            $(this).removeClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
        }
    });
}

// Post forms functionality
function initializePostForms() {
    // Create post form
    const createForm = $('#create-post-form');
    if (createForm.length) {
        createForm.on('submit', function(e) {
            const title = $('#title').val().trim();
            const content = $('#content').val().trim();
            
            if (!title) {
                e.preventDefault();
                $('#title').addClass('is-invalid').focus();
                showFormError('Please enter a title for your post.');
                return false;
            }
            
            if (!content) {
                e.preventDefault();
                $('#content').addClass('is-invalid').focus();
                showFormError('Please enter content for your post.');
                return false;
            }
            
            if (title.length > 200) {
                e.preventDefault();
                $('#title').addClass('is-invalid').focus();
                showFormError('Title must be 200 characters or less.');
                return false;
            }
            
            if (content.length < 10) {
                e.preventDefault();
                $('#content').addClass('is-invalid').focus();
                showFormError('Post content should be at least 10 characters long.');
                return false;
            }
            
            // Add loading state
            const submitBtn = $(this).find('button[type="submit"]');
            const originalText = submitBtn.html();
            submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Publishing...').prop('disabled', true);
            
            setTimeout(() => {
                submitBtn.html(originalText).prop('disabled', false);
            }, 3000);
        });
    }
    
    // Edit post form
    const editForm = $('#edit-post-form');
    if (editForm.length) {
        editForm.on('submit', function(e) {
            const title = $('#title').val().trim();
            const content = $('#content').val().trim();
            
            if (!title) {
                e.preventDefault();
                $('#title').addClass('is-invalid').focus();
                showFormError('Please enter a title for your post.');
                return false;
            }
            
            if (!content) {
                e.preventDefault();
                $('#content').addClass('is-invalid').focus();
                showFormError('Please enter content for your post.');
                return false;
            }
            
            if (title.length > 200) {
                e.preventDefault();
                $('#title').addClass('is-invalid').focus();
                showFormError('Title must be 200 characters or less.');
                return false;
            }
            
            if (content.length < 10) {
                e.preventDefault();
                $('#content').addClass('is-invalid').focus();
                showFormError('Post content should be at least 10 characters long.');
                return false;
            }
            
            // Add loading state
            const submitBtn = $(this).find('button[type="submit"]');
            const originalText = submitBtn.html();
            submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Updating...').prop('disabled', true);
            
            setTimeout(() => {
                submitBtn.html(originalText).prop('disabled', false);
            }, 3000);
        });
    }
}

// Character counters
function initializeCharacterCounters() {
    // Title character counter
    if ($('#title').length) {
        setupCharacterCounter('#title', '#title-count', 200);
    }
    
    // Content character counter
    if ($('#content').length) {
        setupCharacterCounter('#content', '#content-count');
        autoResizeTextarea('#content');
    }
    
    // Comment character counter
    if ($('#comment-content').length) {
        setupCharacterCounter('#comment-content', '#comment-counter', 1000);
        autoResizeTextarea('#comment-content');
    }
}

// Utility functions
function checkUsernameAvailability(username) {
    // Basic client-side validation - only letters, numbers, underscores
    const pattern = /^[a-zA-Z0-9_]+$/;
    return pattern.test(username);
}

function showFormError(message) {
    // Remove existing error messages
    $('.form-error-message').remove();
    
    // Create and show error message
    const errorDiv = $(`
        <div class="alert alert-danger form-error-message mt-3" role="alert">
            <i class="fas fa-exclamation-triangle"></i> ${message}
        </div>
    `);
    
    $('form').first().prepend(errorDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.fadeOut(() => errorDiv.remove());
    }, 5000);
    
    // Scroll to error message
    $('html, body').animate({
        scrollTop: errorDiv.offset().top - 100
    }, 300);
}

// Demo account filler
function fillDemo() {
    $('#username').val('demo');
    $('#password').val('password');
    
    // Trigger validation
    $('#username').trigger('input');
    $('#password').trigger('input');
}

// Form field focus effects
$(document).ready(function() {
    // Add focus effects to form inputs
    $('.form-control').on('focus', function() {
        $(this).closest('.mb-3').addClass('focused');
    }).on('blur', function() {
        if (!$(this).val()) {
            $(this).closest('.mb-3').removeClass('focused');
        }
    });
    
    // Add floating label effect
    $('.form-control').each(function() {
        if ($(this).val()) {
            $(this).closest('.mb-3').addClass('focused');
        }
    });
});