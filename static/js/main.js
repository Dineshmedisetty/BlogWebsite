// Main JavaScript file for BlogSphere
// Handles common functionality across all pages

$(document).ready(function() {
    // Auto-hide flash messages after 5 seconds
    setTimeout(function() {
        $('.flash-message').fadeOut();
    }, 5000);
    
    // Initialize tooltips if Bootstrap tooltips are used
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Global form validation helper
    window.validateForm = function(formId, rules) {
        const form = $(formId);
        let isValid = true;
        
        form.find('.is-invalid').removeClass('is-invalid');
        
        Object.keys(rules).forEach(field => {
            const input = form.find(`[name="${field}"]`);
            const value = input.val().trim();
            const rule = rules[field];
            
            if (rule.required && !value) {
                input.addClass('is-invalid');
                isValid = false;
            }
            
            if (rule.minLength && value.length < rule.minLength) {
                input.addClass('is-invalid');
                isValid = false;
            }
            
            if (rule.maxLength && value.length > rule.maxLength) {
                input.addClass('is-invalid');
                isValid = false;
            }
            
            if (rule.pattern && value && !rule.pattern.test(value)) {
                input.addClass('is-invalid');
                isValid = false;
            }
        });
        
        return isValid;
    };
    
    // Global AJAX error handler
    $(document).ajaxError(function(event, xhr, settings, thrownError) {
        console.error('AJAX Error:', thrownError);
        if (xhr.status === 401) {
            alert('Please log in to perform this action.');
            window.location.href = '/login';
        } else if (xhr.status === 403) {
            alert('You do not have permission to perform this action.');
        } else {
            alert('An error occurred. Please try again.');
        }
    });
    
    // Character counter helper
    window.setupCharacterCounter = function(inputSelector, counterSelector, maxLength) {
        const input = $(inputSelector);
        const counter = $(counterSelector);
        
        input.on('input', function() {
            const count = $(this).val().length;
            counter.text(count);
            
            if (maxLength && count > maxLength) {
                $(this).addClass('is-invalid');
                counter.addClass('text-danger');
            } else {
                $(this).removeClass('is-invalid');
                counter.removeClass('text-danger');
            }
        });
        
        // Initialize counter
        counter.text(input.val().length);
    };
    
    // Auto-resize textarea helper
    window.autoResizeTextarea = function(textareaSelector) {
        $(textareaSelector).on('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        
        // Initial resize
        $(textareaSelector)[0].style.height = 'auto';
        $(textareaSelector)[0].style.height = ($(textareaSelector)[0].scrollHeight) + 'px';
    };
    
    // Smooth scroll to element
    window.scrollToElement = function(elementId) {
        document.getElementById(elementId).scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    };
    
    // Confirmation dialog helper
    window.confirmAction = function(message, callback) {
        if (confirm(message)) {
            callback();
        }
    };
});
